"use client";

import { NewsColumn } from "@/components/NewsColumn";
import { PigeonWatermark } from "@/components/PigeonWatermark";
import { NEWS_TOPICS } from "@/lib/newsTopics";
import type { NewsTopicId, TopicArticle } from "@/lib/types";
import type { Theme } from "@/hooks/useTheme";

interface NewsBoardProps {
  theme: Theme;
  articlesByTopic: Record<NewsTopicId, TopicArticle[]>;
  errorsByTopic: Record<NewsTopicId, string[]>;
  loading: boolean;
}

// Purely presentational — fetching, the time-range control and the refresh
// button all live in the shared TopBar/page state now, the same way
// CompanyList doesn't fetch its own news either.
export function NewsBoard({
  theme,
  articlesByTopic,
  errorsByTopic,
  loading,
}: NewsBoardProps) {
  return (
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

      <PigeonWatermark theme={theme} />
    </div>
  );
}
