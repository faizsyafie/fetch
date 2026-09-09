import { NextRequest, NextResponse } from "next/server";
import { fetchTopicNews } from "@/lib/rss";
import { NEWS_TOPICS } from "@/lib/newsTopics";
import type { TimeFrameDays } from "@/lib/types";

const VALID_DAYS: TimeFrameDays[] = [1, 3, 7, 14, 30];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const days = VALID_DAYS.includes(body?.days) ? (body.days as TimeFrameDays) : 7;

    const topics = await fetchTopicNews(NEWS_TOPICS, days);

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
