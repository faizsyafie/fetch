"use client";

import { isGoogleNewsArticleUrl } from "@/lib/googleNewsUrl";

const RESOLVE_TIMEOUT_MS = 12_000;

// Google News RSS never gives back the real publisher URL, only its own
// news.google.com redirect link (see googleNewsResolve.ts) — so a Companies
// page article that came from Google News search would otherwise send
// people to Google's wrapper instead of the actual article. Resolves it to
// the real URL on click instead, reusing the same headless-browser resolver
// (and its shared cache) already built for the Buried Bones save flow, so a
// link only pays the resolve cost once, ever, across every team.
export function openArticleLink(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  if (!isGoogleNewsArticleUrl(parsed)) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }

  // Opened synchronously, in the same tick as the click, so popup blockers
  // see it as a direct response to user action — its destination is filled
  // in below once resolution finishes (or falls back to the wrapper link).
  // Can't pass "noopener" here (that makes window.open return null, and we
  // need the handle to set its location) — nulling .opener afterward gets
  // the same protection against the opened tab reaching back into this one.
  const tab = window.open("", "_blank");
  if (tab) tab.opener = null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RESOLVE_TIMEOUT_MS);

  fetch("/api/resolve-news-link", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
    signal: controller.signal,
  })
    .then((res) => res.json())
    .then((data) => {
      const resolved = typeof data?.url === "string" ? data.url : url;
      if (tab && !tab.closed) tab.location.href = resolved;
    })
    .catch(() => {
      if (tab && !tab.closed) tab.location.href = url;
    })
    .finally(() => clearTimeout(timeout));
}
