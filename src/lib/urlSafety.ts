// Shared SSRF guard for any route that fetches a URL supplied by the
// client (link-preview title fetch, article-content extraction) — blocks
// non-http(s) schemes and private/local hostnames before we ever issue a
// server-side fetch to them.
const PRIVATE_HOSTNAME_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^0\.0\.0\.0$/,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^\[?::1\]?$/,
  /\.local$/i,
];

function isBlockedHostname(hostname: string): boolean {
  return PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname));
}

/** Returns the parsed URL if it's safe to fetch server-side, else null. */
export function parseSafeFetchUrl(rawUrl: string): URL | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(parsed.protocol)) return null;
  if (isBlockedHostname(parsed.hostname)) return null;
  return parsed;
}
