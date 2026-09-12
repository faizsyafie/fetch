import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import DOMPurify from "isomorphic-dompurify";
import { parseSafeFetchUrl } from "@/lib/urlSafety";

// Powers the Buried Bones inline reader: fetches a saved link's page
// server-side and extracts just the article (Readability, same engine
// Firefox's reader view uses), so it can render inline instead of only
// linking out. This is inherently best-effort — paywalled pages, JS-only
// rendering, or sites that block non-browser requests will all fail to
// extract, which is expected and surfaced as a plain error rather than a
// crash (see SavedView, which falls back to "open externally").
export const runtime = "nodejs";

const FETCH_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 3_000_000;
// Below this, it's not a real article — a paywall stub, a login wall, a
// "please enable JavaScript" placeholder, etc.
const MIN_TEXT_LENGTH = 200;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body?.url === "string" ? body.url : "";

  const parsed = parseSafeFetchUrl(rawUrl);
  if (!parsed) {
    return NextResponse.json(
      { error: "That link isn't something we can open inline." },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        // A generic bot UA gets blocked outright by a lot of publishers
        // (Wikipedia, BBC, and most paywalled sites among them) — a
        // realistic browser UA is what actually gets a normal article
        // response instead of an immediate 403.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });

    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: `The source site returned an error (${response.status}).` },
        { status: 502 }
      );
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return NextResponse.json(
        { error: "That link isn't a readable web page." },
        { status: 422 }
      );
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (total < MAX_HTML_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
    }
    reader.cancel().catch(() => {});
    const html = Buffer.concat(chunks).toString("utf-8");

    const dom = new JSDOM(html, { url: parsed.toString() });
    const article = new Readability(dom.window.document).parse();

    if (!article?.content || (article.textContent ?? "").trim().length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Couldn't extract this article — it may be behind a paywall, need JavaScript, or block automated access.",
        },
        { status: 422 }
      );
    }

    const cleanContent = DOMPurify.sanitize(article.content, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "b", "i", "u", "a", "ul", "ol", "li",
        "blockquote", "h1", "h2", "h3", "h4", "h5", "h6", "img", "figure",
        "figcaption", "pre", "code", "hr", "span", "div", "table", "thead",
        "tbody", "tr", "th", "td",
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "title"],
    });

    return NextResponse.json({
      title: article.title || null,
      byline: article.byline || null,
      siteName: article.siteName || null,
      content: cleanContent,
    });
  } catch (err) {
    const timedOut = err instanceof Error && err.name === "AbortError";
    return NextResponse.json(
      {
        error: timedOut
          ? "That page took too long to load."
          : "Couldn't reach that page.",
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
