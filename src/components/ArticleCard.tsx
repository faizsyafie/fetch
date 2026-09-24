"use client";

import { formatDistanceToNow } from "date-fns";
import { ACCENT_PRESETS } from "@/lib/defaults";
import { highlightMatches } from "@/lib/highlight";
import type { AccentColor, TopicArticle } from "@/lib/types";

interface ArticleCardProps {
  article: TopicArticle;
  isSaved: boolean;
  onSave: () => void;
  /** Active General-page search term, if any — matches get highlighted in
   *  the title/summary below (see highlightMatches). */
  searchQuery?: string;
  accent: AccentColor;
}

export function ArticleCard({ article, isSaved, onSave, searchQuery, accent }: ArticleCardProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const highlightClass = `${accentPreset.softBg} ${accentPreset.text}`;
  const query = searchQuery?.trim() ?? "";

  return (
    <div className="group relative overflow-hidden rounded-md border border-brand-200 bg-white transition-colors hover:border-brand-300 dark:border-brand-800 dark:bg-brand-900 dark:hover:border-brand-700">
      <a
        href={article.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
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
          <p className="pr-6 text-[0.625rem] font-semibold uppercase tracking-wide text-brand-400 dark:text-brand-500">
            {article.source} ·{" "}
            {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
          </p>
          <p className="mt-1 pr-6 text-[0.8125rem] font-semibold leading-snug text-brand-900 dark:text-white">
            {highlightMatches(article.title, query, highlightClass)}
          </p>
          {article.summary && (
            <p className="mt-1 line-clamp-2 text-[0.6875rem] leading-snug text-brand-500 dark:text-brand-400">
              {highlightMatches(article.summary, query, highlightClass)}
            </p>
          )}
        </div>
      </a>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSave();
        }}
        aria-label={isSaved ? "Saved" : "Save link"}
        title={isSaved ? "Saved" : "Save link"}
        className={`absolute right-1 top-1 rounded-md p-2 text-sm backdrop-blur-sm transition-opacity md:right-1.5 md:top-1.5 md:p-1 ${
          isSaved
            ? "bg-white/90 opacity-100 dark:bg-brand-900/90"
            : // Always visible on mobile — :hover doesn't fire reliably on
              // touch, so hiding this behind group-hover there would make it
              // effectively undiscoverable. Hover-reveal is desktop-only.
              "bg-white/70 opacity-100 hover:bg-white dark:bg-brand-900/70 dark:hover:bg-brand-900 md:opacity-0 md:group-hover:opacity-100"
        }`}
      >
        {isSaved ? "🔖" : "📑"}
      </button>
    </div>
  );
}
