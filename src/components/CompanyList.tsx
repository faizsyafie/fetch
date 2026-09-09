"use client";

import { formatDistanceToNow } from "date-fns";
import { industryPalette } from "@/lib/defaults";
import type { Company, Industry, NewsArticle } from "@/lib/types";

export type NewsCacheEntry = NewsArticle[] | "error";

interface CompanyListProps {
  companies: Company[];
  industries: Industry[];
  showIndustryLabel: boolean;
  selected: Set<string>;
  expanded: Set<string>;
  newsCache: Record<string, NewsCacheEntry>;
  loadingSet: Set<string>;
  days: number;
  sourceNames: string[];
  emptyMessage: string;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (company: Company) => void;
  onRefresh: (company: Company) => void;
}

export function CompanyList({
  companies,
  industries,
  showIndustryLabel,
  selected,
  expanded,
  newsCache,
  loadingSet,
  days,
  sourceNames,
  emptyMessage,
  onToggleSelect,
  onToggleExpand,
  onRefresh,
}: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="mt-16 text-center text-sm text-slate-400 dark:text-slate-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-1.5 overflow-y-auto px-5 py-4">
      {companies.map((company) => {
        const palette = industryPalette(company.industry, industries);
        const isOpen = expanded.has(company.id);
        const isSelected = selected.has(company.id);
        const isLoading = loadingSet.has(company.id);
        const news = newsCache[company.id];

        return (
          <div
            key={company.id}
            className={`overflow-hidden rounded-lg border bg-white dark:bg-slate-950 ${
              isSelected
                ? "border-2 border-blue-500"
                : "border-slate-200 dark:border-slate-800"
            }`}
          >
            <div
              className={`flex items-center px-3 py-2 ${
                isOpen ? "border-b border-slate-200 dark:border-slate-800" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleSelect(company.id)}
                aria-label={`Select ${company.name}`}
                className={`mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 text-[10px] text-white ${
                  isSelected
                    ? `${palette.accent} border-transparent`
                    : "border-slate-300 bg-white dark:border-slate-600 dark:bg-transparent"
                }`}
              >
                {isSelected ? "✓" : ""}
              </button>

              <div
                className={`mr-2.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${palette.badgeBg} ${palette.badgeText}`}
              >
                {company.name.charAt(0)}
              </div>

              <button
                type="button"
                onClick={() => onToggleExpand(company)}
                className="min-w-0 flex-1 cursor-pointer text-left"
              >
                <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {company.name}
                </div>
                {showIndustryLabel && (
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {company.industry}
                  </div>
                )}
              </button>

              <div className="ml-2 flex shrink-0 items-center gap-1.5">
                {news && !isLoading && news !== "error" && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {news.length === 0
                      ? "No results"
                      : `${news.length} article${news.length !== 1 ? "s" : ""}`}
                  </span>
                )}
                {news === "error" && (
                  <span className="text-[11px] text-red-500">Error</span>
                )}
                {news && !isLoading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefresh(company);
                    }}
                    className="px-0.5 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label={`Refresh ${company.name}`}
                  >
                    ↻
                  </button>
                )}
                {isLoading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500 dark:border-slate-700 dark:border-t-blue-400">
                    <span className="sr-only">Loading</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggleExpand(company)}
                    className="text-[11px] text-slate-400"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    {isOpen ? "▲" : "▼"}
                  </button>
                )}
              </div>
            </div>

            {isOpen && (
              <div className="bg-slate-50 dark:bg-slate-900/40">
                {isLoading && (
                  <div className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                    🔍 Searching {sourceNames.join(", ")}…
                  </div>
                )}
                {!isLoading && news === "error" && (
                  <div className="px-4 py-2.5 text-xs text-red-500">
                    Failed to fetch news for {company.name}.
                  </div>
                )}
                {!isLoading && Array.isArray(news) && news.length === 0 && (
                  <div className="px-4 py-2.5 text-xs text-slate-400 dark:text-slate-500">
                    No articles in the last {days} day{days !== 1 ? "s" : ""}{" "}
                    from configured sources.
                  </div>
                )}
                {!isLoading &&
                  Array.isArray(news) &&
                  news.map((article, i) => (
                    <a
                      key={article.id}
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800/60 ${
                        i !== news.length - 1
                          ? "border-b border-slate-200 dark:border-slate-800"
                          : ""
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <span className="mt-0.5 shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {article.source}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-medium leading-snug text-slate-800 dark:text-slate-200">
                            {article.title}
                          </div>
                          <div className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                            {formatDistanceToNow(new Date(article.pubDate), {
                              addSuffix: true,
                            })}{" "}
                            ↗
                          </div>
                        </div>
                      </div>
                    </a>
                  ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
