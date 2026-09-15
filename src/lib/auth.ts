// Shared team access gates — not per-user auth. Each team has its own
// passphrase (stored hashed in the `teams` table); a completely separate
// ADMIN_ACCESS_CODE env var gates /team-admin, which can see and move
// every team's data. Deliberately edge-runtime-safe (Web Crypto only, no
// Node `crypto` module) since this is used from both middleware (edge)
// and Node route handlers.

export const ACCESS_COOKIE_NAME = "fetch-access";
export const ADMIN_ACCESS_COOKIE_NAME = "fetch-admin-access";

/**
 * The cookie never stores the raw passphrase — only a deterministic hash
 * of it, computed the same way here and in middleware, so a stolen cookie
 * only proves "knew the code once", not the code itself. Also used to hash
 * team passphrases before they're stored in the database, so the raw
 * passphrase is never persisted anywhere.
 */
export async function hashAccessCode(code: string): Promise<string> {
  const bytes = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * The team session cookie is "<teamId>.<hmac>" rather than a DB-backed
 * session token — proxy.ts runs on the edge runtime and can't hit Postgres
 * on every request, so instead it verifies the HMAC signature (Web Crypto,
 * edge-safe) using SESSION_SECRET, which only the server knows. A valid
 * signature proves the teamId wasn't tampered with, without any DB
 * round-trip; the verified teamId is then forwarded as an x-team-id header
 * so downstream Node routes can scope profiles/preferences by team.
 */
export async function signTeamCookie(
  teamId: string,
  secret: string
): Promise<string> {
  return `${teamId}.${await hmac(secret, teamId)}`;
}

export async function verifyTeamCookie(
  cookieValue: string,
  secret: string
): Promise<string | null> {
  const separatorIndex = cookieValue.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const teamId = cookieValue.slice(0, separatorIndex);
  const signature = cookieValue.slice(separatorIndex + 1);
  const expected = await hmac(secret, teamId);
  return signature === expected ? teamId : null;
}
