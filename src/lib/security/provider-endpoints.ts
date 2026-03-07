function normalizeHostname(hostname: string) {
  return hostname.replace(/^\[/, "").replace(/\]$/, "").toLowerCase();
}

function isIpv4(hostname: string) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
}

function isPrivateIpv4(hostname: string) {
  if (!isIpv4(hostname)) {
    return false;
  }

  const parts = hostname.split(".").map((part) => Number(part));
  if (parts.some((part) => Number.isNaN(part) || part < 0 || part > 255)) {
    return false;
  }

  const [first, second] = parts;
  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

function isPrivateIpv6(hostname: string) {
  const normalized = normalizeHostname(hostname);
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized === "0:0:0:0:0:0:0:1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function isBlockedHostname(hostname: string) {
  const normalized = normalizeHostname(hostname);
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal") ||
    normalized === "metadata.google.internal" ||
    isPrivateIpv4(normalized) ||
    isPrivateIpv6(normalized)
  );
}

type BaseUrlValidationResult =
  | { ok: true; value: string }
  | { ok: false; error: string };

export function validateOpenAICompatibleBaseUrl(input: string): BaseUrlValidationResult {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return { ok: false as const, error: "Enter a valid OpenAI-compatible base URL." };
  }

  if (url.protocol !== "https:") {
    return { ok: false as const, error: "Only public HTTPS provider endpoints are allowed." };
  }

  if (url.username || url.password) {
    return { ok: false as const, error: "Provider base URLs cannot include embedded credentials." };
  }

  if (url.search || url.hash) {
    return { ok: false as const, error: "Provider base URLs must not include query strings or fragments." };
  }

  if (isBlockedHostname(url.hostname)) {
    return { ok: false as const, error: "Local, private-network, and metadata hosts are not allowed." };
  }

  return { ok: true as const, value: url.toString().replace(/\/+$/, "") };
}
