import { NextResponse } from "next/server";
import { clearSessionCookie, invalidateSession, sessionCookieName } from "@/lib/auth/server";
import { rejectUntrustedOrigin } from "@/lib/security/request-origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const invalidOrigin = rejectUntrustedOrigin(request, "Untrusted sign-out request.");
  if (invalidOrigin) {
    return invalidOrigin;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split("; ")
    .find((entry) => entry.startsWith(`${sessionCookieName()}=`))
    ?.split("=")
    .slice(1)
    .join("=") ?? null;

  const response = NextResponse.json({ ok: true });
  invalidateSession(token);
  clearSessionCookie(response, request);
  return response;
}
