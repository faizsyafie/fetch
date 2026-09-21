// Pure, browser-safe helpers for Google News wrapper links — kept separate
// from googleNewsResolve.ts (which does the actual resolving via a headless
// browser, a Node-only dependency) specifically so page.tsx, a client
// component, can check a URL's shape without pulling that in.

export function isGoogleNewsArticleUrl(url: URL): boolean {
  return (
    url.hostname === "news.google.com" &&
    (url.pathname.startsWith("/rss/articles/") || url.pathname.startsWith("/articles/"))
  );
}

export type GoogleNewsResolveResult =
  | { ok: true; url: string }
  | { ok: false; reason: string };
