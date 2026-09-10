"use client";

import { useState } from "react";
import { NewsColumn } from "@/components/NewsColumn";
import { NEWS_TOPICS } from "@/lib/newsTopics";
import type { NewsTopicId, TopicArticle } from "@/lib/types";

interface NewsBoardProps {
  articlesByTopic: Record<NewsTopicId, TopicArticle[]>;
  errorsByTopic: Record<NewsTopicId, string[]>;
  loading: boolean;
  topicOrder: NewsTopicId[];
  onReorderTopics: (order: NewsTopicId[]) => void;
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
}: NewsBoardProps) {
  const [dragId, setDragId] = useState<NewsTopicId | null>(null);
  const [dragOverId, setDragOverId] = useState<NewsTopicId | null>(null);

  const orderedTopics = topicOrder
    .map((id) => NEWS_TOPICS.find((topic) => topic.id === id))
    .filter((topic): topic is (typeof NEWS_TOPICS)[number] => Boolean(topic));
  // Guard against a stale/incomplete stored order (e.g. a topic added after
  // the order was saved) rather than silently dropping a column.
  const columns = orderedTopics.length === NEWS_TOPICS.length ? orderedTopics : NEWS_TOPICS;

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
    <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto p-4">
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
        />
      ))}
    </div>
  );
}
