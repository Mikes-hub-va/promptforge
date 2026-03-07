import { NextResponse } from "next/server";

type RateLimitOptions = {
  bucket: string;
  limit: number;
  windowMs: number;
  identifier?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export type RateLimitResult = {
  ok: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
};

declare global {
  var __promptifyRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

function getStore() {
  if (!global.__promptifyRateLimitStore) {
    global.__promptifyRateLimitStore = new Map<string, RateLimitEntry>();
  }

  return global.__promptifyRateLimitStore;
}

function cleanupExpiredEntries(store: Map<string, RateLimitEntry>, now: number) {
  if (store.size < 512) {
    return;
  }

  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }
}

function getRequestIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const connectingIp = request.headers.get("cf-connecting-ip")?.trim();
  const userAgent = request.headers.get("user-agent")?.trim();

  return connectingIp || realIp || forwardedFor || userAgent || "anonymous";
}

export function consumeRateLimit(request: Request, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  cleanupExpiredEntries(store, now);

  const identifier = options.identifier?.trim() || getRequestIdentifier(request);
  const key = `${options.bucket}:${identifier}`;
  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      ok: true,
      limit: options.limit,
      remaining: Math.max(0, options.limit - 1),
      resetAt,
      retryAfterSeconds: Math.max(1, Math.ceil(options.windowMs / 1000)),
    };
  }

  existing.count += 1;
  store.set(key, existing);

  const remaining = Math.max(0, options.limit - existing.count);
  return {
    ok: existing.count <= options.limit,
    limit: options.limit,
    remaining,
    resetAt: existing.resetAt,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function applyRateLimitHeaders(response: NextResponse, result: RateLimitResult) {
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  response.headers.set("X-RateLimit-Reset", String(Math.ceil(result.resetAt / 1000)));
  return response;
}

export function createRateLimitError(result: RateLimitResult, message: string) {
  const response = NextResponse.json(
    { error: message, retryAfterSeconds: result.retryAfterSeconds },
    { status: 429 },
  );
  response.headers.set("Retry-After", String(result.retryAfterSeconds));
  return applyRateLimitHeaders(response, result);
}
