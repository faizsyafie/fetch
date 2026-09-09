"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { NewsColumn } from "@/components/NewsColumn";
import { TIME_FRAME_OPTIONS } from "@/lib/defaults";
import { NEWS_TOPICS } from "@/lib/newsTopics";
import type { NewsTopicId, TimeFrameDays, TopicArticle } from "@/lib/types";
import type { Theme } from "@/hooks/useTheme";

interface NewsBoardProps {
  theme: Theme;
}

type ArticlesByTopic = Record<NewsTopicId, TopicArticle[]>;
type ErrorsByTopic = Record<NewsTopicId, string[]>;

const EMPTY_ARTICLES: ArticlesByTopic = { world: [], malaysia: [], economy: [] };
const EMPTY_ERRORS: ErrorsByTopic = { world: [], malaysia: [], economy: [] };

export function NewsBoard({ theme }: NewsBoardProps) {
  const [days, setDays] = useState<TimeFrameDays>(7);
  const [loading, setLoading] = useState(false);
  const [articlesByTopic, setArticlesByTopic] =
    useState<ArticlesByTopic>(EMPTY_ARTICLES);
  const [errorsByTopic, setErrorsByTopic] = useState<ErrorsByTopic>(EMPTY_ERRORS);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  const fetchNews = useCallback(async (selectedDays: TimeFrameDays) => {
    setLoading(true);
    try {
      const response = await fetch("/api/topic-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: selectedDays }),
      });
      if (!response.ok) throw new Error("Failed to fetch news.");
      const data = await response.json();

      const nextArticles = { ...EMPTY_ARTICLES };
      const nextErrors = { ...EMPTY_ERRORS };
      for (const topic of NEWS_TOPICS) {
        const result = data.topics?.[topic.id];
        nextArticles[topic.id] = result?.articles ?? [];
        nextErrors[topic.id] = result?.errors ?? [];
      }
      setArticlesByTopic(nextArticles);
      setErrorsByTopic(nextErrors);
      setFetchedAt(data.fetchedAt ?? new Date().toISOString());
    } catch {
      setErrorsByTopic({
        world: ["Failed to fetch news."],
        malaysia: ["Failed to fetch news."],
        economy: ["Failed to fetch news."],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh as soon as the board mounts — i.e. every time the user switches
  // into News mode via the logo — with no background polling afterward.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchNews(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pigeonSrc = theme === "dark" ? "/bg-pigeon-dark.png" : "/bg-pigeon-light.png";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-brand-200 bg-white px-5 py-3 dark:border-brand-800/80 dark:bg-brand-900">
        <div>
          <div className="flex items-center gap-1.5 text-[15px] font-bold uppercase tracking-wide text-brand-900 dark:text-white">
            <span aria-hidden="true">📰</span>
            News
          </div>
          <p className="mt-0.5 text-[11px] text-brand-500 dark:text-brand-500">
            {fetchedAt
              ? `Updated ${formatDistanceToNow(new Date(fetchedAt), { addSuffix: true })}`
              : "World, Malaysia and Economy headlines"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-center gap-0.5 rounded-lg border border-brand-200 bg-brand-50 p-0.5 dark:border-brand-800 dark:bg-brand-950/50">
            {TIME_FRAME_OPTIONS.map((opt) => (
              <button
                key={opt.days}
                type="button"
                onClick={() => {
                  setDays(opt.days);
                  void fetchNews(opt.days);
                }}
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                  days === opt.days
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-brand-500 hover:bg-brand-200/70 dark:text-brand-400 dark:hover:bg-brand-800"
                }`}
              >
                {opt.label.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => void fetchNews(days)}
            disabled={loading}
            className="rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
          >
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
        {NEWS_TOPICS.map((topic) => (
          <NewsColumn
            key={topic.id}
            topic={topic}
            articles={articlesByTopic[topic.id]}
            errors={errorsByTopic[topic.id]}
            loading={loading}
          />
        ))}

        {/* A fun little easter egg, not a focal point — faded out via a
            radial mask so its flat corners never show a hard edge against
            the page background in either theme. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pigeonSrc}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 right-2 h-48 w-48 select-none opacity-[0.12]"
          style={{
            maskImage:
              "radial-gradient(circle at 65% 65%, black 0%, black 35%, transparent 72%)",
            WebkitMaskImage:
              "radial-gradient(circle at 65% 65%, black 0%, black 35%, transparent 72%)",
          }}
        />
      </div>
    </div>
  );
}
