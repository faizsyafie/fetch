"use client";

import { ArticleCard } from "@/components/ArticleCard";
import type { NewsTopic } from "@/lib/newsTopics";
import type { TopicArticle } from "@/lib/types";

interface NewsColumnProps {
  topic: NewsTopic;
  articles: TopicArticle[];
  errors: string[];
  loading: boolean;
}

function SkeletonCard() {
  return (
    <div className="h-16 animate-pulse rounded-md border border-brand-200 bg-brand-100 dark:border-brand-800 dark:bg-brand-800/60" />
  );
}

export function NewsColumn({ topic, articles, errors, loading }: NewsColumnProps) {
  const showSkeletons = loading && articles.length === 0;
  const showEmpty = !loading && articles.length === 0;

  return (
    <div className="flex h-full min-w-[280px] flex-1 flex-col overflow-hidden rounded-lg border border-brand-200 bg-white/70 dark:border-brand-800 dark:bg-brand-900/70">
      <div className="flex items-center justify-between border-b border-brand-200 px-3 py-2.5 dark:border-brand-800">
        <div className="flex items-center gap-1.5 text-sm font-bold text-brand-900 dark:text-white">
          <span aria-hidden="true">{topic.emoji}</span>
          {topic.label}
        </div>
        <span className="text-[11px] tabular-nums text-brand-400 dark:text-brand-500">
          {articles.length}
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-2.5">
        {showSkeletons &&
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}

        {showEmpty && errors.length > 0 && (
          <p className="mt-6 text-center text-xs text-brand-400 dark:text-brand-500">
            Couldn&apos;t load {topic.label} news right now.
          </p>
        )}
        {showEmpty && errors.length === 0 && (
          <p className="mt-6 text-center text-xs text-brand-400 dark:text-brand-500">
            No recent articles.
          </p>
        )}

        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  );
}
