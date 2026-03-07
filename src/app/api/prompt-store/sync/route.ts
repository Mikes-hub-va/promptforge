import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { syncPromptStore } from "@/lib/prompt-store/server";
import { applyRateLimitHeaders, consumeRateLimit, createRateLimitError } from "@/lib/security/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/security/request-origin";
import { promptStoreSyncSchema } from "@/lib/validation/prompt-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted prompt sync request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "prompt-store-sync",
    limit: 18,
    windowMs: 10 * 60 * 1000,
    identifier: user.id,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many sync requests. Please wait before trying again.");
  }

  const parsed = promptStoreSyncSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return applyRateLimitHeaders(NextResponse.json({ error: "Invalid sync payload." }, { status: 400 }), rateLimit);
  }

  return applyRateLimitHeaders(NextResponse.json(syncPromptStore(user.id, parsed.data)), rateLimit);
}
