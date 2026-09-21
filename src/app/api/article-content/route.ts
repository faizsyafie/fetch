import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import DOMPurify from "isomorphic-dompurify";
import { parseSafeFetchUrl } from "@/lib/urlSafety";
import { isGoogleNewsArticleUrl, resolveGoogleNewsUrl } from "@/lib/googleNewsUrl";

// Powers the Buried Bones inline reader: fetches a saved link's page
// server-side and extracts just the article (Readability, same engine
// Firefox's reader view uses), so it can render inline instead of only
// linking out. This is inherently best-effort — paywalled pages, JS-only
// rendering, or sites that block non-browser requests will all fail to
// extract, which is expected and surfaced as a plain error rather than a
// crash (see SavedView, which falls back to "open externally").
export const runtime = "nodejs";
// A Google News link now costs two extra round trips (resolving the
// wrapper, each on its own budget — see googleNewsUrl.ts) before the real
// article fetch below even starts, so the total worst case is higher than
// a single fetch's own timeout.
export const maxDuration = 25;

const FETCH_TIMEOUT_MS = 10_000;
const MAX_HTML_BYTES = 3_000_000;
// Below this, it's not a real article — a paywall stub, a login wall, a
// "please enable JavaScript" placeholder, etc.
const MIN_TEXT_LENGTH = 200;

// Only the first chunk needs scanning — <meta charset> / the http-equiv
// variant always appear early in <head>, well within a typical first read.
const META_CHARSET_SCAN_BYTES = 2048;

// Not every site declares a charset in the Content-Type header, and Node's
// fetch has no idea an ISO-8859-1 or Shift-JIS page isn't UTF-8 — decoding
// those as UTF-8 silently mangles the text instead of failing loudly. Sniff
// the real charset (header first, then a <meta charset> in the raw bytes)
// so this decodes each page as what it actually is.
function detectCharset(contentTypeHeader: string, firstChunk: Uint8Array): string {
  const headerMatch = /charset=["']?([\w-]+)/i.exec(contentTypeHeader);
  if (headerMatch) return headerMatch[1];

  // <meta> tags are themselves plain ASCII, so latin1 (a lossless 1-byte
  // decode) is safe here regardless of the page's real encoding.
  const head = Buffer.from(firstChunk.slice(0, META_CHARSET_SCAN_BYTES)).toString("latin1");
  const metaMatch =
    /<meta[^>]+charset=["']?([\w-]+)/i.exec(head) ??
    /<meta[^>]+http-equiv=["']content-type["'][^>]+content=["'][^"']*charset=([\w-]+)/i.exec(head);
  return metaMatch?.[1] ?? "utf-8";
}

function decodeHtml(chunks: Uint8Array[], contentTypeHeader: string): string {
  const buffer = Buffer.concat(chunks);
  const charset = detectCharset(contentTypeHeader, chunks[0] ?? new Uint8Array());
  try {
    return new TextDecoder(charset).decode(buffer);
  } catch {
    // Unrecognized/unsupported charset label — fall back rather than fail
    // the whole extraction over a decoding nicety.
    return buffer.toString("utf-8");
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body?.url === "string" ? body.url : "";

  let parsed = parseSafeFetchUrl(rawUrl);
  if (!parsed) {
    return NextResponse.json(
      { error: "That link isn't something we can open inline." },
      { status: 400 }
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    if (isGoogleNewsArticleUrl(parsed)) {
      const resolution = await resolveGoogleNewsUrl(parsed.toString());
      if (!resolution.ok) {
        return NextResponse.json(
          {
            error: `Couldn't resolve this Google News link (${resolution.reason}) — try opening it in your browser instead.`,
          },
          { status: 422 }
        );
      }
      const resolvedParsed = parseSafeFetchUrl(resolution.url);
      if (!resolvedParsed) {
        return NextResponse.json(
          {
            error:
              "Couldn't resolve this Google News link — try opening it in your browser instead.",
          },
          { status: 422 }
        );
      }
      parsed = resolvedParsed;
    }

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
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!response.ok || !response.body) {
      return NextResponse.json(
        { error: `The source site returned an error (${response.status}).` },
        { status: 502 }
      );
    }

    // Some servers omit Content-Type entirely rather than lie about it —
    // only hard-reject types we know for certain aren't a readable page
    // (images, PDFs, JSON APIs, etc.), rather than requiring an exact match.
    const contentType = response.headers.get("content-type") ?? "";
    const looksNonHtml =
      contentType.length > 0 &&
      !contentType.includes("text/html") &&
      !contentType.includes("xhtml") &&
      !contentType.includes("text/plain");
    if (looksNonHtml) {
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
    const html = decodeHtml(chunks, contentType);

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
