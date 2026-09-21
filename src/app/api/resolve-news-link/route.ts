import { NextRequest, NextResponse } from "next/server";
import { parseSafeFetchUrl } from "@/lib/urlSafety";
import { isGoogleNewsArticleUrl, resolveGoogleNewsUrl } from "@/lib/googleNewsUrl";
import { getCachedResolution, setCachedResolution } from "@/lib/db";

// Resolves a Google News wrapper link to its real publisher URL at save
// time, so a bookmark stores (and the inline reader later fetches) the
// actual article rather than Google's redirect page — see the call site in
// page.tsx's handleSaveLinkSubmit, which patches a just-saved link's url in
// the background once this resolves.
//
// Deliberately does NOT fetch or parse the resolved page itself (that's
// /api/article-content's job, run later, only if the user opens the link) —
// keeping this endpoint to just the Google News decode step, with no
// JSDOM/Readability involved, keeps its failure surface far smaller than
// the full inline-reader pipeline.
//
// Checks a shared, team-independent cache before attempting a live resolve
// — a given Google News wrapper link always points at the same real URL, so
// once anyone on any team resolves it, everyone else gets it instantly with
// no Google traffic at all. Only successes get cached (see db.ts) — a
// failure right now (e.g. the decode RPC issue still being tracked down)
// never blocks a future attempt from succeeding once it's fixed.
export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const rawUrl = typeof body?.url === "string" ? body.url : "";

  const parsed = parseSafeFetchUrl(rawUrl);
  if (!parsed || !isGoogleNewsArticleUrl(parsed)) {
    return NextResponse.json(
      { error: "Not a Google News link." },
      { status: 400 }
    );
  }

  const wrapperUrl = parsed.toString();

  try {
    const cached = await getCachedResolution(wrapperUrl).catch(() => null);
    if (cached) {
      return NextResponse.json({ url: cached, cached: true });
    }

    const resolution = await resolveGoogleNewsUrl(wrapperUrl);
    if (!resolution.ok) {
      return NextResponse.json({ error: resolution.reason }, { status: 422 });
    }

    await setCachedResolution(wrapperUrl, resolution.url).catch(() => {});
    return NextResponse.json({ url: resolution.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unexpected error" },
      { status: 502 }
    );
  }
}
