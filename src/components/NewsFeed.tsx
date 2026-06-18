"use client";

import { formatDistanceToNow } from "date-fns";
import type { NewsArticle } from "@/lib/types";

interface NewsFeedProps {
  articles: NewsArticle[];
  fetchedAt: string | null;
  errors: string[];
  loading: boolean;
  companyCount: number;
  sourceCount: number;
  days: number;
}

export function NewsFeed({
  articles,
  fetchedAt,
  errors,
  loading,
  companyCount,
  sourceCount,
  days,
}: NewsFeedProps) {
  return (
    <main className="flex min-h-0 flex-1 flex-col bg-slate-900">
      <header className="border-b border-slate-800 px-6 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white">News Feed</h2>
            <p className="mt-1 text-sm text-slate-400">
              {companyCount} companies · {sourceCount} sources · last {days}{" "}
              day{days === 1 ? "" : "s"}
            </p>
          </div>
          {fetchedAt && (
            <p className="text-xs text-slate-500">
              Updated{" "}
              {formatDistanceToNow(new Date(fetchedAt), { addSuffix: true })}
            </p>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-sm">Scanning RSS feeds for matching articles…</p>
          </div>
        )}

        {!loading && articles.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-16 text-center">
            <p className="text-lg font-medium text-slate-300">No articles yet</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Add companies to your watchlist, enable sources, choose a time
              frame, and click Fetch news to pull coverage from Bloomberg,
              Reuters, The Edge Singapore, and any custom feeds.
            </p>
          </div>
        )}

        {!loading && errors.length > 0 && (
          <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
            <p className="text-sm font-medium text-amber-200">
              Some feeds returned no results or failed
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-100/80">
              {errors.slice(0, 5).map((error) => (
                <li key={error}>{error}</li>
              ))}
              {errors.length > 5 && (
                <li>…and {errors.length - 5} more</li>
              )}
            </ul>
          </div>
        )}

        {!loading && articles.length > 0 && (
          <div className="space-y-4">
            {articles.map((article) => (
              <article
                key={article.id}
                className="rounded-xl border border-slate-800 bg-slate-950 p-5 transition hover:border-slate-700"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    {article.company}
                  </span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
                    {article.source}
                  </span>
                  <time
                    dateTime={article.pubDate}
                    className="text-xs text-slate-500"
                  >
                    {formatDistanceToNow(new Date(article.pubDate), {
                      addSuffix: true,
                    })}
                  </time>
                </div>
                <h3 className="text-lg font-semibold leading-snug text-white">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-300"
                  >
                    {article.title}
                  </a>
                </h3>
                {article.summary && (
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {article.summary}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
