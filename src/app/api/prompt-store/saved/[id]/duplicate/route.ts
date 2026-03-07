import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { duplicateSavedPrompt } from "@/lib/prompt-store/server";
import { applyRateLimitHeaders, consumeRateLimit, createRateLimitError } from "@/lib/security/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted saved prompt duplication request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "prompt-store-saved-duplicate",
    limit: 30,
    windowMs: 10 * 60 * 1000,
    identifier: user.id,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many duplicate actions. Please wait a moment and try again.");
  }

  const { id } = await context.params;
  return applyRateLimitHeaders(NextResponse.json({ savedPrompts: duplicateSavedPrompt(user.id, id) }), rateLimit);
}
