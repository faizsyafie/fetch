// Google News RSS article links (news.google.com/rss/articles/<id> or
// news.google.com/articles/<id>) aren't real article URLs — they're a
// redirect wrapper that only resolves to the actual publisher URL via
// client-side JavaScript in a real browser. A plain server-side fetch never
// reaches a real article through one of these; it just gets Google's
// near-empty interstitial page.
//
// This walks Google's own resolution protocol to get the real URL: pull a
// signed token out of the wrapper page, then ask Google's internal
// `batchexecute` RPC endpoint (the same one the wrapper page's own JS calls)
// what it decodes to. This is not a documented, stable API — it's
// reverse-engineered from the wrapper page's behavior, and Google can change
// the token format or endpoint without notice. When that happens, every step
// below is written to fail closed (return null) rather than throw, so a
// broken decode degrades to the existing "couldn't load" error path instead
// of crashing the route.

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export function isGoogleNewsArticleUrl(url: URL): boolean {
  return (
    url.hostname === "news.google.com" &&
    (url.pathname.startsWith("/rss/articles/") || url.pathname.startsWith("/articles/"))
  );
}

interface SignedToken {
  id: string;
  signature: string;
  timestamp: string;
}

// The wrapper page embeds this on a <div> whose attribute order isn't
// guaranteed, so each attribute is pulled independently rather than
// anchoring one regex to a fixed sequence.
function extractSignedToken(html: string): SignedToken | null {
  const divMatch = /<div[^>]*\sdata-n-a-sg="[^"]*"[^>]*>/i.exec(html);
  if (!divMatch) return null;
  const tag = divMatch[0];
  const id = /\sdata-n-a-id="([^"]*)"/i.exec(tag)?.[1];
  const signature = /\sdata-n-a-sg="([^"]*)"/i.exec(tag)?.[1];
  const timestamp = /\sdata-n-a-ts="([^"]*)"/i.exec(tag)?.[1];
  if (!id || !signature || !timestamp) return null;
  return { id, signature, timestamp };
}

function buildBatchExecuteBody(token: SignedToken): string {
  // Mirrors the payload the wrapper page's own JS sends to resolve itself —
  // the fixed "X"/0/1/null padding array is undocumented Google RPC
  // plumbing (locale/context padding), not meaningful data we control. Note
  // the argument order: article id, then timestamp (as a bare number, not a
  // string), then signature — getting this order or the number/string
  // distinction wrong makes Google reject the request outright.
  const innerArgs = JSON.stringify([
    "garturlreq",
    [
      ["X", "X", ["X", "X"], null, null, 1, 1, "US:en", null, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0],
      null, 0, 1, 1, null, 0, 0, 0, 0, 0,
    ],
    token.id,
    Number(token.timestamp),
    token.signature,
  ]);
  const freq = JSON.stringify([[["Fbv4je", innerArgs]]]);
  return `f.req=${encodeURIComponent(freq)}`;
}

// batchexecute responses are a `)]}'` anti-hijacking prefix followed by
// alternating length-prefix and JSON-array lines, not one clean JSON blob —
// scan every line for the one carrying our RPC's result rather than
// assuming a fixed line position.
function extractResolvedUrl(rpcText: string): string | null {
  for (const line of rpcText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("[")) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      continue;
    }
    if (!Array.isArray(parsed)) continue;
    for (const entry of parsed) {
      if (!Array.isArray(entry) || entry[0] !== "wrb.fr" || entry[1] !== "Fbv4je") continue;
      if (typeof entry[2] !== "string") continue;
      try {
        const inner = JSON.parse(entry[2]);
        const url = Array.isArray(inner) ? inner[1] : null;
        if (typeof url === "string" && /^https?:\/\//.test(url)) return url;
      } catch {
        continue;
      }
    }
  }
  return null;
}

/** Resolves a Google News wrapper URL to the real publisher URL, or null if
 *  any step of the (unofficial) decode fails. */
export async function resolveGoogleNewsUrl(
  wrapperUrl: string,
  signal: AbortSignal
): Promise<string | null> {
  try {
    const page = await fetch(wrapperUrl, {
      signal,
      headers: { "User-Agent": BROWSER_USER_AGENT },
    });
    if (!page.ok) return null;
    const html = await page.text();

    const token = extractSignedToken(html);
    if (!token) return null;

    const rpc = await fetch(
      "https://news.google.com/_/DotsSplashUi/data/batchexecute?rpcids=Fbv4je",
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Referer: "https://news.google.com/",
          "User-Agent": BROWSER_USER_AGENT,
        },
        body: buildBatchExecuteBody(token),
      }
    );
    if (!rpc.ok) return null;

    return extractResolvedUrl(await rpc.text());
  } catch {
    return null;
  }
}
