import { NextRequest, NextResponse } from "next/server";
import { parseSafeFetchUrl } from "@/lib/urlSafety";
import { isGoogleNewsArticleUrl, resolveGoogleNewsUrl } from "@/lib/googleNewsUrl";

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

  try {
    const resolution = await resolveGoogleNewsUrl(parsed.toString());
    if (!resolution.ok) {
      return NextResponse.json({ error: resolution.reason }, { status: 422 });
    }
    return NextResponse.json({ url: resolution.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unexpected error" },
      { status: 502 }
    );
  }
}
