import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/server";
import { patchSavedPrompt, removeSavedPrompt } from "@/lib/prompt-store/server";
import { applyRateLimitHeaders, consumeRateLimit, createRateLimitError } from "@/lib/security/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/security/request-origin";
import { savedPromptPatchSchema } from "@/lib/validation/prompt-store";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted saved prompt update request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "prompt-store-saved-update",
    limit: 60,
    windowMs: 10 * 60 * 1000,
    identifier: user.id,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many saved prompt edits. Please wait before trying again.");
  }

  const { id } = await context.params;
  const parsed = savedPromptPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return applyRateLimitHeaders(NextResponse.json({ error: "Invalid prompt update." }, { status: 400 }), rateLimit);
  }

  return applyRateLimitHeaders(
    NextResponse.json({
      savedPrompts: patchSavedPrompt(user.id, id, {
        ...parsed.data,
        folder: parsed.data.folder ?? undefined,
      }),
    }),
    rateLimit,
  );
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted saved prompt delete request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "prompt-store-saved-delete",
    limit: 60,
    windowMs: 10 * 60 * 1000,
    identifier: user.id,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many delete actions. Please wait before trying again.");
  }

  const { id } = await context.params;
  return applyRateLimitHeaders(NextResponse.json({ savedPrompts: removeSavedPrompt(user.id, id) }), rateLimit);
}
