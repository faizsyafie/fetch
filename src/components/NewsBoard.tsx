"use client";

import { useState } from "react";
import { NewsColumn } from "@/components/NewsColumn";
import { ACCENT_PRESETS } from "@/lib/defaults";
import { NEWS_TOPICS } from "@/lib/newsTopics";
import type { AccentColor, NewsTopicId, TopicArticle } from "@/lib/types";

interface NewsBoardProps {
  articlesByTopic: Record<NewsTopicId, TopicArticle[]>;
  errorsByTopic: Record<NewsTopicId, string[]>;
  loading: boolean;
  topicOrder: NewsTopicId[];
  onReorderTopics: (order: NewsTopicId[]) => void;
  isLinkSaved: (url: string) => boolean;
  onSaveArticle: (article: TopicArticle) => void;
  accent: AccentColor;
  searchQuery: string;
  showCategoryPromo: boolean;
  onCreateCategory: () => void;
  showCompanyPromo: boolean;
  onGoToCompanies: () => void;
}

// Purely presentational — fetching, the time-range control and the refresh
// button all live in the shared TopBar/page state now, the same way
// CompanyList doesn't fetch its own news either. The dog watermark is
// rendered once by the parent page for both modes, not duplicated here.
export function NewsBoard({
  articlesByTopic,
  errorsByTopic,
  loading,
  topicOrder,
  onReorderTopics,
  isLinkSaved,
  onSaveArticle,
  accent,
  searchQuery,
  showCategoryPromo,
  onCreateCategory,
  showCompanyPromo,
  onGoToCompanies,
}: NewsBoardProps) {
  const [dragId, setDragId] = useState<NewsTopicId | null>(null);
  const [dragOverId, setDragOverId] = useState<NewsTopicId | null>(null);
  const accentPreset = ACCENT_PRESETS[accent];

  const orderedTopics = topicOrder
    .map((id) => NEWS_TOPICS.find((topic) => topic.id === id))
    .filter((topic): topic is (typeof NEWS_TOPICS)[number] => Boolean(topic));
  // topicOrder is the user's enabled/ordered subset (see Edit Themes) — not
  // necessarily the full catalog, so only fall back to everything if it's
  // completely empty (corrupted state), never based on a length mismatch.
  const columns = orderedTopics.length > 0 ? orderedTopics : NEWS_TOPICS;

  function handleDrop(targetId: NewsTopicId) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDragOverId(null);
      return;
    }
    const ids = columns.map((topic) => topic.id);
    const withoutDragged = ids.filter((id) => id !== dragId);
    const targetIndex = withoutDragged.indexOf(targetId);
    const reordered = [
      ...withoutDragged.slice(0, targetIndex),
      dragId,
      ...withoutDragged.slice(targetIndex),
    ];
    onReorderTopics(reordered);
    setDragId(null);
    setDragOverId(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {(showCategoryPromo || showCompanyPromo) && (
        <div className="mx-4 mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-brand-200 bg-white px-4 py-2.5 dark:border-brand-800 dark:bg-brand-900">
          {showCategoryPromo && (
            <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-brand-600 dark:text-brand-300">
                💡 Saving articles? Create a category to keep your saved
                links organized by topic.
              </p>
              <button
                type="button"
                onClick={onCreateCategory}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover}`}
              >
                + Create a category
              </button>
            </div>
          )}
          {showCategoryPromo && showCompanyPromo && (
            <div className="hidden h-8 w-px shrink-0 bg-brand-200 dark:bg-brand-800 sm:block" />
          )}
          {showCompanyPromo && (
            <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-brand-600 dark:text-brand-300">
                🏢 Have a company to track? Create an industry list to fetch
                specific company news.
              </p>
              <button
                type="button"
                onClick={onGoToCompanies}
                className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover}`}
              >
                + Track a company
              </button>
            </div>
          )}
        </div>
      )}
      <div data-tour="news-columns" className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
        {columns.map((topic) => (
          <NewsColumn
            key={topic.id}
            topic={topic}
            articles={articlesByTopic[topic.id]}
            errors={errorsByTopic[topic.id]}
            loading={loading}
            isDragging={dragId === topic.id}
            isDragOver={dragOverId === topic.id && dragId !== topic.id}
            onDragStart={() => setDragId(topic.id)}
            onDragOver={() => setDragOverId(topic.id)}
            onDrop={() => handleDrop(topic.id)}
            onDragEnd={() => {
              setDragId(null);
              setDragOverId(null);
            }}
            isLinkSaved={isLinkSaved}
            onSaveArticle={onSaveArticle}
            searchQuery={searchQuery}
            accent={accent}
          />
        ))}
      </div>
    </div>
  );
}
