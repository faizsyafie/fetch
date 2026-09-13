import { NextRequest, NextResponse } from "next/server";
import { fetchTopicNews, MAX_ARTICLES_PER_TOPIC } from "@/lib/rss";
import { NEWS_TOPICS } from "@/lib/newsTopics";
import { DEFAULT_NEWS_ARTICLE_LIMIT } from "@/lib/defaults";
import type { NewsTimeFrame, NewsTopicId } from "@/lib/types";

const VALID_TIME_FRAMES: NewsTimeFrame[] = ["now", 1, 3, 7, 14];
const VALID_TOPIC_IDS = new Set(NEWS_TOPICS.map((t) => t.id));

// Loosely validated rather than schema-checked — a malformed entry for a
// topic just falls back to that topic's own hardcoded defaults, the same
// forgiving behavior fetchFeed already has for a dead feed URL.
function parseTopicSources(
  body: unknown
): Partial<Record<string, { name: string; feedUrl: string }[]>> | undefined {
  if (!body || typeof body !== "object") return undefined;
  const result: Partial<Record<string, { name: string; feedUrl: string }[]>> = {};
  for (const [topicId, sources] of Object.entries(body as Record<string, unknown>)) {
    if (!VALID_TOPIC_IDS.has(topicId as NewsTopicId) || !Array.isArray(sources)) continue;
    const valid = sources.filter(
      (s): s is { name: string; feedUrl: string } =>
        Boolean(s) &&
        typeof s === "object" &&
        typeof (s as Record<string, unknown>).name === "string" &&
        typeof (s as Record<string, unknown>).feedUrl === "string"
    );
    result[topicId] = valid;
  }
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const timeFrame = VALID_TIME_FRAMES.includes(body?.days)
      ? (body.days as NewsTimeFrame)
      : "now";
    // Only fetch the caller's enabled columns rather than the whole
    // catalog — most users won't have all of them turned on. Falls back to
    // everything if the request doesn't specify (or specifies nothing
    // valid), so this stays backward compatible.
    const requestedTopics: NewsTopicId[] = Array.isArray(body?.topics)
      ? body.topics.filter((id: unknown): id is NewsTopicId =>
          typeof id === "string" && VALID_TOPIC_IDS.has(id as NewsTopicId)
        )
      : [];
    const topicsToFetch =
      requestedTopics.length > 0
        ? NEWS_TOPICS.filter((t) => requestedTopics.includes(t.id))
        : NEWS_TOPICS;
    const limit =
      typeof body?.limit === "number" && Number.isFinite(body.limit)
        ? Math.min(Math.max(1, Math.trunc(body.limit)), MAX_ARTICLES_PER_TOPIC)
        : DEFAULT_NEWS_ARTICLE_LIMIT;

    const topicSources = parseTopicSources(body?.topicSources);
    const topics = await fetchTopicNews(topicsToFetch, timeFrame, limit, topicSources);

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
