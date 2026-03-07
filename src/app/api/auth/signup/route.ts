import { NextResponse } from "next/server";
import { attachSessionCookie, clearSessionCookie, createSession, createUser, findUserByEmail } from "@/lib/auth/server";
import { signupSchema } from "@/lib/validation/auth";
import { applyRateLimitHeaders, consumeRateLimit, createRateLimitError } from "@/lib/security/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted account creation request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "auth-signup",
    limit: 6,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many account creation attempts. Please wait a few minutes.");
  }

  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return applyRateLimitHeaders(
      NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Enter a valid name, email, and password." },
        { status: 400 },
      ),
      rateLimit,
    );
  }

  if (findUserByEmail(parsed.data.email)) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: "An account with that email already exists." }, { status: 409 }),
      rateLimit,
    );
  }

  const user = createUser(parsed.data);
  const session = createSession(user.id);
  const response = NextResponse.json({ user });
  clearSessionCookie(response, request);
  attachSessionCookie(response, session, request);
  return applyRateLimitHeaders(response, rateLimit);
}
