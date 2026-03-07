import { NextResponse } from "next/server";
import { z } from "zod";
import { attachSessionCookie, authenticateUser, clearSessionCookie, createSession } from "@/lib/auth/server";
import { applyRateLimitHeaders, consumeRateLimit, createRateLimitError } from "@/lib/security/rate-limit";
import { rejectUntrustedOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted sign-in request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const rateLimit = consumeRateLimit(request, {
    bucket: "auth-login",
    limit: 12,
    windowMs: 10 * 60 * 1000,
  });
  if (!rateLimit.ok) {
    return createRateLimitError(rateLimit, "Too many sign-in attempts. Please wait a few minutes.");
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 }),
      rateLimit,
    );
  }

  const user = authenticateUser(parsed.data.email, parsed.data.password);
  if (!user) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: "Incorrect email or password." }, { status: 401 }),
      rateLimit,
    );
  }

  const session = createSession(user.id);
  const response = NextResponse.json({ user });
  clearSessionCookie(response, request);
  attachSessionCookie(response, session, request);
  return applyRateLimitHeaders(response, rateLimit);
}
