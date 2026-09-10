import { NextRequest, NextResponse } from "next/server";
import { fetchTopicNews } from "@/lib/rss";
import { NEWS_TOPICS } from "@/lib/newsTopics";
import type { NewsTimeFrame } from "@/lib/types";

const VALID_TIME_FRAMES: NewsTimeFrame[] = ["now", 1, 3, 7, 14];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const timeFrame = VALID_TIME_FRAMES.includes(body?.days)
      ? (body.days as NewsTimeFrame)
      : "now";

    const topics = await fetchTopicNews(NEWS_TOPICS, timeFrame);

    return NextResponse.json({
      topics,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch news.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
