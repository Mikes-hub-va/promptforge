import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { addHistoryEntry, replaceHistoryEntries } from "@/lib/prompt-store/server";
import { applyRateLimitHeaders, consumeRateLimit, createRateLimitError } from "@/lib/security/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/security/request-origin";
import { historyEntriesSchema, historyEntrySchema } from "@/lib/validation/prompt-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted history request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "prompt-store-history-add",
    limit: 100,
    windowMs: 10 * 60 * 1000,
    identifier: user.id,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many history writes. Please wait a moment and try again.");
  }

  const parsed = historyEntrySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return applyRateLimitHeaders(NextResponse.json({ error: "Invalid history payload." }, { status: 400 }), rateLimit);
  }

  return applyRateLimitHeaders(NextResponse.json({ history: addHistoryEntry(user.id, parsed.data) }), rateLimit);
}

export async function PUT(request: Request) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted history sync request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "prompt-store-history-replace",
    limit: 24,
    windowMs: 10 * 60 * 1000,
    identifier: user.id,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many history sync attempts. Please wait before trying again.");
  }

  const parsed = historyEntriesSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return applyRateLimitHeaders(NextResponse.json({ error: "Invalid history list." }, { status: 400 }), rateLimit);
  }

  return applyRateLimitHeaders(
    NextResponse.json({ history: replaceHistoryEntries(user.id, parsed.data.entries) }),
    rateLimit,
  );
}
