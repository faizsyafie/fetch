// Shared team access gate — not per-user auth. One passphrase for the
// whole team, set as the APP_ACCESS_CODE env var. Deliberately edge
// -runtime-safe (Web Crypto only, no Node `crypto` module) since this is
// used from both middleware (edge) and the /api/access route handler.

export const ACCESS_COOKIE_NAME = "fetch-access";

/**
 * The cookie never stores the raw passphrase — only a deterministic hash
 * of it, computed the same way here and in middleware, so a stolen cookie
 * only proves "knew the code once", not the code itself.
 */
export async function hashAccessCode(code: string): Promise<string> {
  const bytes = new TextEncoder().encode(code);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
