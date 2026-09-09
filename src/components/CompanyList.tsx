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
    <div className="flex-1 space-y-1 overflow-y-auto px-4 py-3">
      {companies.map((company) => {
        const palette = industryPalette(company.industry, industries);
        const isOpen = expanded.has(company.id);
        const isSelected = selected.has(company.id);
        const isLoading = loadingSet.has(company.id);
        const news = newsCache[company.id];

        return (
          <div
            key={company.id}
            className={`overflow-hidden rounded-md border transition-colors ${
              isSelected
                ? "border-blue-500/70 bg-white ring-1 ring-blue-500/40 dark:bg-slate-900"
                : isOpen
                  ? "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center py-1.5 pl-3 pr-2.5">
              <button
                type="button"
                onClick={() => onToggleSelect(company.id)}
                aria-label={`Select ${company.name}`}
                className={`mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] text-white transition-colors ${
                  isSelected
                    ? `${palette.accent} border-transparent`
                    : "border-slate-300 bg-white hover:border-slate-400 dark:border-slate-600 dark:bg-transparent dark:hover:border-slate-500"
                }`}
              >
                {isSelected ? "✓" : ""}
              </button>

              <div
                className={`mr-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-[11px] font-bold ${palette.badgeBg} ${palette.badgeText}`}
              >
                {company.name.charAt(0)}
              </div>

              <button
                type="button"
                onClick={() => onToggleExpand(company)}
                className="min-w-0 flex-1 cursor-pointer py-0.5 text-left"
              >
                <div className="truncate text-[13px] font-semibold leading-tight text-slate-900 dark:text-white">
                  {company.name}
                </div>
                {showIndustryLabel && (
                  <div className="text-[10.5px] leading-tight text-slate-500 dark:text-slate-500">
                    {company.industry}
                  </div>
                )}
              </button>

              <div className="ml-2 flex shrink-0 items-center gap-2">
                {news && !isLoading && news !== "error" && (
                  <span className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
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
                    className="rounded px-1 py-0.5 text-xs text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
                    className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    <span
                      className={`inline-block text-[10px] transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                )}
              </div>
            </div>

            <div
              className="grid transition-[grid-template-rows] duration-200 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40">
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
                        className={`block px-4 py-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60 ${
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
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
