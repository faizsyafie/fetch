"use client";

import { formatDistanceToNow } from "date-fns";
import { ACCENT_PRESETS, industryPalette } from "@/lib/defaults";
import { openArticleLink } from "@/lib/resolveLinkClick";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useDragReorder } from "@/hooks/useDragReorder";
import { PullToRefreshIndicator } from "@/components/PullToRefreshIndicator";
import type { AccentColor, Company, Density, Industry, NewsArticle } from "@/lib/types";

// Fixed row surface — no longer configurable (see CustomizePanel).
const CARD_CLASS = "bg-white dark:bg-brand-900/70 dark:hover:bg-brand-800/40";

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
  density: Density;
  accent: AccentColor;
  focusedId: string | null;
  isArticleSeen: (articleId: string) => boolean;
  isLinkSaved: (url: string) => boolean;
  enableDrag: boolean;
  onToggleSelect: (id: string) => void;
  onToggleExpand: (company: Company) => void;
  onRefresh: (company: Company) => void;
  onTogglePin: (id: string) => void;
  onToggleStar: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onSaveArticle: (article: NewsArticle) => void;
  /** Touch-only pull-to-refresh (see usePullToRefresh) — same action as the
   *  TopBar's Fetch! button, just reachable by pulling down on the list
   *  too. Never the only way to refresh, purely additive. */
  onPullRefresh: () => void;
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
  density,
  accent,
  focusedId,
  isArticleSeen,
  isLinkSaved,
  enableDrag,
  onToggleSelect,
  onToggleExpand,
  onRefresh,
  onTogglePin,
  onToggleStar,
  onUpdateNotes,
  onReorder,
  onSaveArticle,
  onPullRefresh,
}: CompanyListProps) {
  const compact = density === "compact";
  const accentPreset = ACCENT_PRESETS[accent];
  const [pullRef, pullToRefresh] = usePullToRefresh<HTMLDivElement>(onPullRefresh);
  const dragReorder = useDragReorder(
    companies.map((c) => c.id),
    onReorder
  );

  if (companies.length === 0) {
    return (
      <div
        data-tour="company-list"
        className="mt-16 text-center text-sm text-brand-400 dark:text-brand-500"
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    // overscroll-y-contain is a backstop alongside usePullToRefresh's own
    // preventDefault() — some Android/Chrome versions can still trigger
    // their own native pull-to-refresh from this container even while the
    // custom gesture handles it, double-firing a refresh.
    <div
      ref={pullRef}
      data-tour="company-list"
      className={`flex-1 overflow-y-auto overscroll-y-contain px-4 py-3 ${compact ? "space-y-0.5" : "space-y-2.5"}`}
    >
      <PullToRefreshIndicator
        pullDistance={pullToRefresh.pullDistance}
        refreshing={pullToRefresh.refreshing}
        triggerDistance={pullToRefresh.triggerDistance}
      />
      {companies.map((company) => {
        const palette = industryPalette(company.industry, industries);
        const isOpen = expanded.has(company.id);
        const isSelected = selected.has(company.id);
        const isLoading = loadingSet.has(company.id);
        const isFocused = focusedId === company.id;
        const news = newsCache[company.id];
        const unseenCount =
          Array.isArray(news) && news.length > 0
            ? news.filter((a) => !isArticleSeen(a.id)).length
            : 0;

        return (
          <div
            key={company.id}
            ref={enableDrag ? dragReorder.registerItem(company.id) : undefined}
            data-company-row={company.id}
            className={`overflow-hidden rounded-md border transition-all duration-150 ${CARD_CLASS} ${
              isSelected
                ? `${accentPreset.border} ring-1 ${accentPreset.ring}`
                : isOpen
                  ? "border-brand-300 dark:border-brand-700"
                  : "border-brand-200 hover:border-brand-300 dark:border-brand-800 dark:hover:border-brand-700"
            } ${isFocused ? "ring-2 ring-amber-400/70 dark:ring-amber-400/50" : ""} ${
              dragReorder.dragOverId === company.id && dragReorder.draggingId !== company.id
                ? "border-t-2 border-t-blue-500"
                : ""
            } ${
              dragReorder.draggingId === company.id
                ? "scale-[0.98] opacity-70 shadow-xl"
                : dragReorder.draggingId
                  ? "shadow-none"
                  : ""
            }`}
          >
            <div
              className={`flex items-center ${compact ? "py-0.5 pl-3 pr-2.5" : "py-3 pl-4 pr-3.5"}`}
            >
              {enableDrag && (
                <span
                  {...dragReorder.dragHandleProps(company.id)}
                  className="mr-1 shrink-0 cursor-grab text-[0.625rem] text-brand-300 active:cursor-grabbing dark:text-brand-600"
                >
                  ⠿
                </span>
              )}
              <button
                type="button"
                onClick={() => onToggleSelect(company.id)}
                aria-label={`Select ${company.name}`}
                className={`mr-2.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[0.625rem] text-white transition-colors ${
                  isSelected
                    ? `${palette.accent} border-transparent`
                    : "border-brand-300 bg-white hover:border-brand-400 dark:border-brand-600 dark:bg-transparent dark:hover:border-brand-500"
                }`}
              >
                {isSelected ? "✓" : ""}
              </button>

              <div
                className={`mr-2.5 flex shrink-0 items-center justify-center rounded font-bold ${palette.badgeBg} ${palette.badgeText} ${
                  compact ? "h-5 w-5 text-[0.6875rem]" : "h-8 w-8 text-sm"
                }`}
              >
                {company.name.charAt(0)}
              </div>

              <button
                type="button"
                onClick={() => onToggleExpand(company)}
                className="min-w-0 flex-1 cursor-pointer py-0.5 text-left"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`truncate font-semibold leading-tight text-brand-900 dark:text-white ${
                      compact ? "text-xs" : "text-[0.9375rem]"
                    }`}
                  >
                    {company.name}
                    {showIndustryLabel && (
                      <span className="ml-1.5 font-normal text-brand-400 dark:text-brand-500">
                        — {company.industry}
                      </span>
                    )}
                  </span>
                  {unseenCount > 0 && (
                    <span
                      className={`inline-flex h-4 shrink-0 items-center rounded-full px-1.5 text-[0.5625rem] font-bold text-white ${accentPreset.swatch}`}
                      title={`${unseenCount} new article${unseenCount !== 1 ? "s" : ""}`}
                    >
                      {unseenCount}
                    </span>
                  )}
                </div>
              </button>

              <div
                className={`ml-2 flex shrink-0 items-center ${compact ? "gap-1.5" : "gap-2.5"}`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(company.id);
                  }}
                  aria-label={
                    company.starred
                      ? "Remove from Watchlist"
                      : "Add to Watchlist"
                  }
                  title={
                    company.starred ? "Remove from Watchlist" : "Add to Watchlist"
                  }
                  className={`rounded transition-opacity hover:bg-brand-100 dark:hover:bg-brand-800 ${
                    compact
                      ? "px-2 py-1.5 text-sm md:px-1 md:py-0.5 md:text-xs"
                      : "px-2 py-1.5 text-sm md:px-1.5 md:py-1"
                  } ${
                    company.starred
                      ? "opacity-100"
                      : "opacity-25 hover:opacity-60"
                  }`}
                >
                  ⭐
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTogglePin(company.id);
                  }}
                  aria-label={company.pinned ? "Unpin company" : "Pin company"}
                  title={company.pinned ? "Unpin" : "Pin to top"}
                  className={`rounded transition-opacity hover:bg-brand-100 dark:hover:bg-brand-800 ${
                    compact
                      ? "px-2 py-1.5 text-sm md:px-1 md:py-0.5 md:text-xs"
                      : "px-2 py-1.5 text-sm md:px-1.5 md:py-1"
                  } ${
                    company.pinned
                      ? "opacity-100"
                      : "opacity-25 hover:opacity-60"
                  }`}
                >
                  📌
                </button>
                {news && !isLoading && news !== "error" && (
                  <span className="text-[0.6875rem] tabular-nums text-brand-400 dark:text-brand-500">
                    {news.length === 0
                      ? "No results"
                      : `${news.length} article${news.length !== 1 ? "s" : ""}`}
                  </span>
                )}
                {news === "error" && (
                  <span className="text-[0.6875rem] text-red-500">Error</span>
                )}
                {news && !isLoading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefresh(company);
                    }}
                    className="rounded px-1 py-0.5 text-xs text-brand-400 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
                    aria-label={`Refresh ${company.name}`}
                  >
                    ↻
                  </button>
                )}
                {isLoading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-300 border-t-blue-500 dark:border-brand-700 dark:border-t-blue-400">
                    <span className="sr-only">Loading</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onToggleExpand(company)}
                    className={`flex items-center justify-center rounded text-brand-400 transition-colors hover:bg-brand-100 hover:text-brand-600 dark:hover:bg-brand-800 dark:hover:text-brand-300 ${
                      compact ? "h-8 w-8 md:h-5 md:w-5" : "h-8 w-8 md:h-6 md:w-6"
                    }`}
                    aria-label={isOpen ? "Collapse" : "Expand"}
                  >
                    <span
                      className={`inline-block text-[0.625rem] transition-transform duration-200 ${
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
                <div className="border-t border-brand-200 bg-brand-50 dark:border-brand-800 dark:bg-brand-950/40">
                  <div className={compact ? "px-3 py-1" : "px-4 py-2"}>
                    <input
                      value={company.notes ?? ""}
                      onChange={(e) => onUpdateNotes(company.id, e.target.value)}
                      placeholder="Add a private note…"
                      className={`w-full rounded border border-brand-200 bg-white text-brand-700 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-200 ${
                        compact ? "px-1.5 py-0.5 text-[0.625rem]" : "px-2 py-1 text-[0.6875rem]"
                      }`}
                    />
                  </div>
                  {isLoading && (
                    <div
                      className={`text-brand-500 dark:text-brand-400 ${compact ? "px-3 py-1.5 text-[0.6875rem]" : "px-4 py-2.5 text-xs"}`}
                    >
                      🔍 Searching {sourceNames.join(", ")}…
                    </div>
                  )}
                  {!isLoading && news === "error" && (
                    <div
                      className={`text-red-500 ${compact ? "px-3 py-1.5 text-[0.6875rem]" : "px-4 py-2.5 text-xs"}`}
                    >
                      Failed to fetch news for {company.name}.
                    </div>
                  )}
                  {!isLoading && Array.isArray(news) && news.length === 0 && (
                    <div
                      className={`text-brand-400 dark:text-brand-500 ${compact ? "px-3 py-1.5 text-[0.6875rem]" : "px-4 py-2.5 text-xs"}`}
                    >
                      No articles in the last {days} day{days !== 1 ? "s" : ""}{" "}
                      from configured sources.
                    </div>
                  )}
                  {!isLoading &&
                    Array.isArray(news) &&
                    news.map((article, i) => {
                      const saved = isLinkSaved(article.link);
                      return (
                        <div
                          key={article.id}
                          className={`group relative ${
                            i !== news.length - 1
                              ? "border-b border-brand-200 dark:border-brand-800"
                              : ""
                          }`}
                        >
                          <a
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              // Left-click, no modifier — intercept to
                              // resolve Google News wrapper links first.
                              // Middle-click / ctrl/cmd/shift-click fall
                              // through to the browser's native "open in
                              // new tab" on the href as-is.
                              if (
                                e.button !== 0 ||
                                e.metaKey ||
                                e.ctrlKey ||
                                e.shiftKey ||
                                e.altKey
                              ) {
                                return;
                              }
                              e.preventDefault();
                              openArticleLink(article.link);
                            }}
                            className={`block transition-colors hover:bg-brand-100 dark:hover:bg-brand-800/60 ${
                              compact ? "px-3 py-1 pr-7" : "px-4 py-2.5 pr-9"
                            } ${isArticleSeen(article.id) ? "opacity-70" : ""}`}
                          >
                            <div className="flex items-start gap-1.5">
                              <span
                                className={`shrink-0 rounded bg-brand-200 font-bold text-brand-600 dark:bg-brand-800 dark:text-brand-300 ${
                                  compact ? "px-1 py-0 text-[0.5625rem]" : "mt-0.5 px-1.5 py-0.5 text-[0.625rem]"
                                }`}
                              >
                                {article.source}
                              </span>
                              <div className="min-w-0">
                                <div
                                  className={`font-medium leading-snug text-brand-800 dark:text-brand-200 ${
                                    compact ? "text-[0.6875rem]" : "text-xs"
                                  }`}
                                >
                                  {article.title}
                                </div>
                                <div
                                  className={`text-brand-400 dark:text-brand-500 ${
                                    compact ? "text-[0.5625rem]" : "mt-0.5 text-[0.625rem]"
                                  }`}
                                >
                                  {formatDistanceToNow(new Date(article.pubDate), {
                                    addSuffix: true,
                                  })}{" "}
                                  ↗
                                </div>
                              </div>
                            </div>
                          </a>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onSaveArticle(article);
                            }}
                            aria-label={saved ? "Saved" : "Save link"}
                            title={saved ? "Saved" : "Save link"}
                            className={`absolute rounded text-xs transition-opacity ${
                              compact
                                ? "right-1 top-0.5 p-2 md:right-1.5 md:top-1 md:p-0.5"
                                : "right-1 top-1 p-2 md:right-2 md:top-2 md:p-1"
                            } ${
                              saved
                                ? "opacity-100"
                                : // Always visible on mobile — :hover doesn't
                                  // fire reliably on touch, so hover-reveal
                                  // is desktop-only (md+).
                                  "opacity-60 hover:bg-brand-200 hover:!opacity-100 dark:hover:bg-brand-700 md:opacity-0 md:group-hover:opacity-60"
                            }`}
                          >
                            {saved ? "🔖" : "📑"}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
