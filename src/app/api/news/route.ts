import { NextRequest, NextResponse } from "next/server";
import { fetchNewsForWatchlist } from "@/lib/rss";
import type { FetchNewsRequest, TimeFrameDays } from "@/lib/types";

const VALID_DAYS: TimeFrameDays[] = [1, 3, 10, 15, 30];

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as FetchNewsRequest;

    if (!body.companies?.length) {
      return NextResponse.json(
        { error: "At least one company is required." },
        { status: 400 }
      );
    }

    if (!body.sources?.length) {
      return NextResponse.json(
        { error: "At least one source is required." },
        { status: 400 }
      );
    }

    const days = VALID_DAYS.includes(body.days) ? body.days : 10;

    const { articles, errors } = await fetchNewsForWatchlist(
      body.companies,
      body.sources,
      days as TimeFrameDays
    );

    return NextResponse.json({
      articles,
      fetchedAt: new Date().toISOString(),
      errors,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch news.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
