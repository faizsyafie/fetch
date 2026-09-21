import { NextRequest, NextResponse } from "next/server";
import { parseSafeFetchUrl } from "@/lib/urlSafety";
import { isGoogleNewsArticleUrl } from "@/lib/googleNewsUrl";
import { resolveGoogleNewsUrl } from "@/lib/googleNewsResolve";
import { getCachedResolution, setCachedResolution } from "@/lib/db";

// Resolves a Google News wrapper link to its real publisher URL at save
// time, so a bookmark stores (and the inline reader later fetches) the
// actual article rather than Google's redirect page — see the call site in
// page.tsx's handleSaveLinkSubmit, which patches a just-saved link's url in
// the background once this resolves.
//
// Deliberately does NOT fetch or parse the resolved page itself (that's
// /api/article-content's job, run later, only if the user opens the link) —
// keeping this endpoint to just the Google News resolve step, with no
// JSDOM/Readability involved, keeps its failure surface far smaller than
// the full inline-reader pipeline.
//
// Checks a shared, team-independent cache before attempting a live resolve
// — a given Google News wrapper link always points at the same real URL, so
// once anyone on any team resolves it, everyone else gets it instantly with
// no headless-browser cost at all. Only successes get cached (see db.ts) —
// a failure never blocks a future attempt from succeeding.
export const runtime = "nodejs";
// A headless browser launch + page navigation + waiting for Google's own
// client-side redirect to fire can legitimately take several seconds —
// see googleNewsResolve.ts's own timeouts for the worst-case budget.
export const maxDuration = 45;

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
