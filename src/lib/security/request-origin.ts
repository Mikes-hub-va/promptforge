import { NextResponse } from "next/server";
import { APP_DOMAIN } from "@/data/constants";

function normalizeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function buildForwardedOrigin(request: Request) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.trim();
  if (!forwardedHost) {
    return null;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto")?.trim() || "https";
  return normalizeOrigin(`${forwardedProto}://${forwardedHost}`);
}

function allowedOrigins(request: Request) {
  const configuredOrigins = (process.env.PROMPTIFY_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((item) => normalizeOrigin(item.trim()))
    .filter((item): item is string => Boolean(item));

  return new Set(
    [
      normalizeOrigin(request.url),
      normalizeOrigin(APP_DOMAIN),
      buildForwardedOrigin(request),
      ...configuredOrigins,
    ].filter((item): item is string => Boolean(item)),
  );
}

export function rejectUntrustedOrigin(request: Request, message = "Request origin could not be verified.") {
  const trustedOrigins = allowedOrigins(request);
  const origin = normalizeOrigin(request.headers.get("origin"));
  const referer = normalizeOrigin(request.headers.get("referer"));
  const fetchSite = request.headers.get("sec-fetch-site");

  if (origin && trustedOrigins.has(origin)) {
    return null;
  }

  if (!origin && referer && trustedOrigins.has(referer)) {
    return null;
  }

  if (!origin && !referer && fetchSite === "same-origin") {
    return null;
  }

  return NextResponse.json({ error: message }, { status: 403 });
}
