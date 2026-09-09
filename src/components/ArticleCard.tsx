"use client";

import { formatDistanceToNow } from "date-fns";
import type { TopicArticle } from "@/lib/types";

interface ArticleCardProps {
  article: TopicArticle;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-md border border-brand-200 bg-white transition-colors hover:border-brand-300 dark:border-brand-800 dark:bg-brand-900 dark:hover:border-brand-700"
    >
      {article.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.imageUrl}
          alt=""
          className="h-28 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="p-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-400 dark:text-brand-500">
          {article.source} ·{" "}
          {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
        </p>
        <p className="mt-1 text-[13px] font-semibold leading-snug text-brand-900 dark:text-white">
          {article.title}
        </p>
        {article.summary && (
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-brand-500 dark:text-brand-400">
            {article.summary}
          </p>
        )}
      </div>
    </a>
  );
}
