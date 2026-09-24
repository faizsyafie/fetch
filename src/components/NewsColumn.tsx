"use client";

import { ArticleCard } from "@/components/ArticleCard";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import type { NewsTopic } from "@/lib/newsTopics";
import type { AccentColor, TopicArticle } from "@/lib/types";

interface NewsColumnProps {
  topic: NewsTopic;
  articles: TopicArticle[];
  errors: string[];
  loading: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  /** Attaches this column to the drag-reorder hit-testing — see
   *  useDragReorder in NewsBoard. */
  registerItem: (el: HTMLElement | null) => void;
  /** Spread onto the ⠿ handle — starts a drag on pointerdown+move past a
   *  small threshold (see useDragReorder); a plain tap still works
   *  normally. Replaces native HTML5 drag-and-drop, which mobile browsers
   *  don't support via touch at all. */
  dragHandleProps: React.HTMLAttributes<HTMLElement>;
  isLinkSaved: (url: string) => boolean;
  onSaveArticle: (article: TopicArticle) => void;
  searchQuery: string;
  accent: AccentColor;
  /** Touch-only pull-to-refresh (see usePullToRefresh) — same action as the
   *  TopBar's Re-fetch! button (refreshes every column, not just this one),
   *  just reachable by pulling down on any one column's list too. */
  onPullRefresh: () => void;
}

function SkeletonCard() {
  return (
    <div className="h-16 animate-pulse rounded-md border border-brand-200 bg-brand-100 dark:border-brand-800 dark:bg-brand-800/60" />
  );
}

export function NewsColumn({
  topic,
  articles,
  errors,
  loading,
  isDragging,
  isDragOver,
  registerItem,
  dragHandleProps,
  isLinkSaved,
  onSaveArticle,
  searchQuery,
  accent,
  onPullRefresh,
}: NewsColumnProps) {
  const showSkeletons = loading && articles.length === 0;
  const showEmpty = !loading && articles.length === 0;
  const isSearching = searchQuery.trim().length > 0;
  const [pullRef, pullToRefresh] = usePullToRefresh<HTMLDivElement>(onPullRefresh);

  return (
    <div
      ref={registerItem}
      className={`flex h-full min-w-[280px] max-w-sm flex-1 flex-col overflow-hidden rounded-lg border bg-white/70 transition-all duration-150 dark:bg-brand-900/70 ${
        isDragOver
          ? "border-l-2 border-l-blue-500 border-t-brand-200 border-r-brand-200 border-b-brand-200 dark:border-t-brand-800 dark:border-r-brand-800 dark:border-b-brand-800"
          : "border-brand-200 dark:border-brand-800"
      } ${isDragging ? "scale-[0.98] opacity-70 shadow-xl" : ""}`}
    >
      <div className="flex items-center justify-between border-b border-brand-200 px-3 py-2.5 dark:border-brand-800">
        <div className="flex items-center gap-1.5 text-sm font-bold text-brand-900 dark:text-white">
          <span
            {...dragHandleProps}
            className="cursor-grab text-[0.625rem] text-brand-300 active:cursor-grabbing dark:text-brand-600"
          >
            ⠿
          </span>
          <span aria-hidden="true">{topic.emoji}</span>
          {topic.label}
        </div>
        <span className="text-[0.6875rem] tabular-nums text-brand-400 dark:text-brand-500">
          {articles.length}
        </span>
      </div>

      <div ref={pullRef} className="flex-1 space-y-2 overflow-y-auto p-2.5">
        <PullToRefreshIndicator
          pullDistance={pullToRefresh.pullDistance}
          refreshing={pullToRefresh.refreshing}
          triggerDistance={pullToRefresh.triggerDistance}
        />
        {showSkeletons &&
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}

        {showEmpty && errors.length > 0 && (
          <p className="mt-6 text-center text-xs text-brand-400 dark:text-brand-500">
            Couldn&apos;t load {topic.label} news right now.
          </p>
        )}
        {showEmpty && errors.length === 0 && (
          <p className="mt-6 text-center text-xs text-brand-400 dark:text-brand-500">
            {isSearching ? "No articles match your search." : "No recent articles."}
          </p>
        )}

        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            isSaved={isLinkSaved(article.link)}
            onSave={() => onSaveArticle(article)}
            searchQuery={searchQuery}
            accent={accent}
          />
        ))}
      </div>
    </div>
  );
}
