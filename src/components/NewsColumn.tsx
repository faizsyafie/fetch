"use client";

import { ArticleCard } from "@/components/ArticleCard";
import type { NewsTopic } from "@/lib/newsTopics";
import type { AccentColor, TopicArticle } from "@/lib/types";

interface NewsColumnProps {
  topic: NewsTopic;
  articles: TopicArticle[];
  errors: string[];
  loading: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
  isLinkSaved: (url: string) => boolean;
  onSaveArticle: (article: TopicArticle) => void;
  searchQuery: string;
  accent: AccentColor;
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
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isLinkSaved,
  onSaveArticle,
  searchQuery,
  accent,
}: NewsColumnProps) {
  const showSkeletons = loading && articles.length === 0;
  const showEmpty = !loading && articles.length === 0;
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        onDrop();
      }}
      onDragEnd={onDragEnd}
      className={`flex h-full min-w-[280px] max-w-sm flex-1 flex-col overflow-hidden rounded-lg border bg-white/70 transition-all duration-150 dark:bg-brand-900/70 ${
        isDragOver
          ? "border-l-2 border-l-blue-500 border-t-brand-200 border-r-brand-200 border-b-brand-200 dark:border-t-brand-800 dark:border-r-brand-800 dark:border-b-brand-800"
          : "border-brand-200 dark:border-brand-800"
      } ${isDragging ? "scale-[0.98] opacity-70 shadow-xl" : ""}`}
    >
      <div className="flex items-center justify-between border-b border-brand-200 px-3 py-2.5 dark:border-brand-800">
        <div className="flex items-center gap-1.5 text-sm font-bold text-brand-900 dark:text-white">
          <span className="cursor-grab text-[10px] text-brand-300 active:cursor-grabbing dark:text-brand-600">
            ⠿
          </span>
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
