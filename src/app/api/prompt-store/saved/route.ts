import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { upsertSavedPrompt } from "@/lib/prompt-store/server";
import { applyRateLimitHeaders, consumeRateLimit, createRateLimitError } from "@/lib/security/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/security/request-origin";
import { savedPromptSchema } from "@/lib/validation/prompt-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted saved prompt request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "prompt-store-saved-create",
    limit: 40,
    windowMs: 10 * 60 * 1000,
    identifier: user.id,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many saved prompt updates. Please wait a moment and try again.");
  }

  const parsed = savedPromptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return applyRateLimitHeaders(NextResponse.json({ error: "Invalid saved prompt payload." }, { status: 400 }), rateLimit);
  }

  return applyRateLimitHeaders(NextResponse.json({ savedPrompts: upsertSavedPrompt(user.id, parsed.data) }), rateLimit);
}
