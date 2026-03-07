import { NextResponse } from "next/server";
import { getCurrentUser, updateUserProfile } from "@/lib/auth/server";
import { applyRateLimitHeaders, consumeRateLimit, createRateLimitError } from "@/lib/security/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/security/request-origin";
import { profileUpdateSchema } from "@/lib/validation/auth";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted profile update request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "auth-profile",
    limit: 20,
    windowMs: 10 * 60 * 1000,
    identifier: user.id,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many profile updates. Please wait a moment and try again.");
  }

  const parsed = profileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return applyRateLimitHeaders(
      NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Enter a valid display name." },
        { status: 400 },
      ),
      rateLimit,
    );
  }

  const nextUser = updateUserProfile(user.id, parsed.data);
  if (!nextUser) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: "Unable to update this profile right now." }, { status: 404 }),
      rateLimit,
    );
  }

  return applyRateLimitHeaders(NextResponse.json({ user: nextUser }), rateLimit);
}
