"use client";

import { formatDistanceToNow } from "date-fns";
import { ACCENT_PRESETS } from "@/lib/defaults";
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

// Splits `text` on every case-insensitive occurrence of `query`, wrapping
// matches in an accent-colored span. Returns `text` unchanged when there's
// no query or no match, so the common (non-searching) case stays cheap.
function highlightMatches(text: string, query: string, highlightClass: string) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const firstIndex = lower.indexOf(q);
  if (firstIndex === -1) return text;

  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let index = firstIndex;
  while (index !== -1) {
    if (index > cursor) parts.push(text.slice(cursor, index));
    parts.push(
      <span key={index} className={`rounded px-0.5 font-semibold ${highlightClass}`}>
        {text.slice(index, index + q.length)}
      </span>
    );
    cursor = index + q.length;
    index = lower.indexOf(q, cursor);
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
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
          <p className="pr-6 text-[10px] font-semibold uppercase tracking-wide text-brand-400 dark:text-brand-500">
            {article.source} ·{" "}
            {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
          </p>
          <p className="mt-1 pr-6 text-[13px] font-semibold leading-snug text-brand-900 dark:text-white">
            {highlightMatches(article.title, query, highlightClass)}
          </p>
          {article.summary && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-brand-500 dark:text-brand-400">
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
        className={`absolute right-1.5 top-1.5 rounded-md p-1 text-sm backdrop-blur-sm transition-opacity ${
          isSaved
            ? "bg-white/90 opacity-100 dark:bg-brand-900/90"
            : "bg-white/70 opacity-0 hover:bg-white group-hover:opacity-100 dark:bg-brand-900/70 dark:hover:bg-brand-900"
        }`}
      >
        {isSaved ? "🔖" : "📑"}
      </button>
    </div>
  );
}
