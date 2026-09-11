import { NextRequest, NextResponse } from "next/server";
import { parseSafeFetchUrl } from "@/lib/urlSafety";

// Best-effort title fetch for the Save Link modal — never blocks saving if
// it fails, so errors here just mean the user types their own title.
const FETCH_TIMEOUT_MS = 8000;
const MAX_HTML_BYTES = 200_000; // enough for <head>; avoids reading huge pages fully

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function extractTitle(html: string): string | null {
  const ogMatch = html.match(
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogMatch?.[1]) return decodeEntities(ogMatch[1]).trim();

  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch?.[1]) return decodeEntities(titleMatch[1]).trim();

  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body?.url === "string" ? body.url : "";

  const parsed = parseSafeFetchUrl(rawUrl);
  if (!parsed) {
    return NextResponse.json({ title: null });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; fetchLinkPreview/1.0)",
        Accept: "text/html",
      },
    });
    if (!response.ok || !response.body) {
      return NextResponse.json({ title: null });
    }

    // Read only enough bytes to find <title>/<meta og:title> — a page's
    // <head> is always well within this cap in practice.
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

    return NextResponse.json({ title: extractTitle(html) });
  } catch {
    return NextResponse.json({ title: null });
  } finally {
    clearTimeout(timeout);
  }
}
