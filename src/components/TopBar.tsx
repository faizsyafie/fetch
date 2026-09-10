"use client";

import { useState } from "react";
import {
  ACCENT_PRESETS,
  ALL_INDUSTRY,
  ALL_LINKS_CATEGORY,
  WATCHLIST_INDUSTRY,
  getIndustryEmoji,
  industryPalette,
  TIME_FRAME_OPTIONS,
} from "@/lib/defaults";
import type {
  AccentColor,
  Company,
  Industry,
  NewsSource,
  TimeFrameDays,
} from "@/lib/types";
import type { AppMode } from "@/components/Sidebar";
import { UserMenu } from "@/components/UserMenu";

interface TopBarProps {
  mode: AppMode;
  profileName: string;
  onLogOut: () => void;
  activeIndustry: Industry;
  industries: Industry[];
  industryEmojis: Record<Industry, string>;
  companiesInIndustry: Company[];
  matchedCount: number;
  searchQuery: string;
  days: TimeFrameDays;
  sources: NewsSource[];
  selectedCount: number;
  batchRunning: boolean;
  loadingCount: number;
  editMode: boolean;
  accent: AccentColor;
  onSearch: (value: string) => void;
  onSetDays: (days: TimeFrameDays) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onFetchSelected: () => void;
  onFetchAll: () => void;
  onAddCompany: (name: string) => void;
  onRemoveCompany: (id: string) => void;
  onOpenCommandPalette: () => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  onCollapseAll: () => void;
  // News mode: the same time-range/refresh concept, bound to its own state
  // rather than the Companies preferences, since the two fetches are
  // independent.
  newsDays: TimeFrameDays;
  onSetNewsDays: (days: TimeFrameDays) => void;
  newsLoading: boolean;
  onRefreshNews: () => void;
  newsStatusLabel: string;
  // Saved links
  activeLinkCategory: string;
  visibleLinksCount: number;
}

export function TopBar({
  mode,
  profileName,
  onLogOut,
  activeIndustry,
  industries,
  industryEmojis,
  companiesInIndustry,
  matchedCount,
  searchQuery,
  days,
  sources,
  selectedCount,
  batchRunning,
  loadingCount,
  editMode,
  accent,
  onSearch,
  onSetDays,
  onSelectAll,
  onClearSelection,
  onFetchSelected,
  onFetchAll,
  onAddCompany,
  onRemoveCompany,
  onOpenCommandPalette,
  onOpenTutorial,
  onOpenSettings,
  onCollapseAll,
  newsDays,
  onSetNewsDays,
  newsLoading,
  onRefreshNews,
  newsStatusLabel,
  activeLinkCategory,
  visibleLinksCount,
}: TopBarProps) {
  const [tagInput, setTagInput] = useState("");
  const isNews = mode === "news";
  const isCompanies = mode === "companies";
  const isSaved = mode === "saved";
  const isSearching = searchQuery.trim().length > 0;
  const isVirtualIndustry =
    activeIndustry === ALL_INDUSTRY || activeIndustry === WATCHLIST_INDUSTRY;
  const palette = industryPalette(activeIndustry, industries);
  const enabledSources = sources.filter((s) => s.enabled);
  const emoji = getIndustryEmoji(activeIndustry, industryEmojis);
  const accentPreset = ACCENT_PRESETS[accent];
  const activeDays = isNews ? newsDays : days;
  const handleSetDays = isNews ? onSetNewsDays : onSetDays;

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const value = tagInput.trim();
    if (value) onAddCompany(value);
    setTagInput("");
  }

  return (
    <div className="border-b border-brand-200 bg-white px-5 py-3 dark:border-brand-800/80 dark:bg-brand-900">
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {!isSaved && (
            <div
              data-tour="topbar-timerange"
              className="flex shrink-0 items-center gap-0.5 rounded-lg border border-brand-200 bg-brand-50 p-0.5 dark:border-brand-800 dark:bg-brand-950/50"
            >
              {TIME_FRAME_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => handleSetDays(opt.days)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    activeDays === opt.days
                      ? `${accentPreset.solid} text-white shadow-sm`
                      : "text-brand-500 hover:bg-brand-200/70 dark:text-brand-400 dark:hover:bg-brand-800"
                  }`}
                >
                  {opt.label.toUpperCase()}
                </button>
              ))}
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[15px] font-bold uppercase tracking-wide text-brand-900 dark:text-white">
              {isNews ? (
                <>
                  <span className="text-base" aria-hidden="true">
                    📰
                  </span>
                  {isSearching ? "Search Results" : "News"}
                </>
              ) : isSaved ? (
                <>
                  <span className="text-base" aria-hidden="true">
                    🔖
                  </span>
                  {activeLinkCategory === ALL_LINKS_CATEGORY
                    ? "Saved News"
                    : activeLinkCategory}
                </>
              ) : isSearching ? (
                "Search Results"
              ) : (
                <>
                  <span className="text-base">{emoji}</span>
                  {activeIndustry}
                </>
              )}
            </div>
            <div
              className="mt-0.5 truncate text-[11px] text-brand-500 dark:text-brand-500"
              title={
                isNews || isSaved || isSearching
                  ? undefined
                  : `Sources: ${enabledSources.map((s) => s.name).join(", ")}`
              }
            >
              {isNews
                ? isSearching
                  ? `Filtering articles for "${searchQuery.trim()}"`
                  : newsStatusLabel
                : isSaved
                  ? isSearching
                    ? `${visibleLinksCount} matched`
                    : `${visibleLinksCount} link${visibleLinksCount !== 1 ? "s" : ""}`
                  : isSearching
                    ? `${matchedCount} matched`
                    : `${companiesInIndustry.length} compan${
                        companiesInIndustry.length !== 1 ? "ies" : "y"
                      } · ${enabledSources.length} source${
                        enabledSources.length !== 1 ? "s" : ""
                      } · last ${days}d`}
            </div>
          </div>
        </div>

        <div data-tour="topbar-search" className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-400 dark:text-brand-500">
            🔍
          </span>
          <input
            id="company-search-input"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={
              isNews
                ? "Search articles…"
                : isSaved
                  ? "Search saved links…"
                  : "Search companies…"
            }
            className={`w-80 max-w-full rounded-lg border border-brand-200 bg-brand-50 py-1.5 pl-8 pr-3 text-xs text-brand-900 outline-none transition-colors placeholder:text-brand-400 focus:${accentPreset.border} focus:bg-white dark:border-brand-800 dark:bg-brand-950/50 dark:text-white dark:placeholder:text-brand-600 dark:focus:bg-brand-950`}
          />
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            data-tour="topbar-command-palette"
            onClick={onOpenCommandPalette}
            title="Command palette (Ctrl/Cmd+K)"
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
          >
            <kbd className="text-[10px]">⌘K</kbd>
          </button>

          <button
            type="button"
            onClick={onOpenTutorial}
            title="Open tutorial"
            aria-label="Open tutorial"
            className="flex shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
          >
            <span aria-hidden="true">❓</span>
          </button>

          <button
            type="button"
            data-tour="topbar-settings"
            onClick={onOpenSettings}
            title="Settings"
            aria-label="Settings"
            className="flex shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
          >
            <span aria-hidden="true">⚙️</span>
          </button>

          <div data-tour="topbar-user">
            <UserMenu name={profileName} onLogOut={onLogOut} />
          </div>
        </div>
      </div>

      {isNews && (
        <div data-tour="topbar-fetch" className="mt-2 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={onRefreshNews}
            disabled={newsLoading}
            className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-400 dark:hover:bg-brand-800"
          >
            {newsLoading ? "Refreshing…" : "↻ Refresh"}
          </button>
        </div>
      )}

      {isCompanies && (
        <div data-tour="topbar-fetch" className="mt-2 flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-lg border border-brand-200 bg-brand-50 p-0.5 dark:border-brand-800 dark:bg-brand-950/50">
            <button
              type="button"
              onClick={onSelectAll}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-200/70 dark:text-brand-400 dark:hover:bg-brand-800"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-200/70 dark:text-brand-400 dark:hover:bg-brand-800"
            >
              Clear
            </button>
          </div>
          <button
            type="button"
            onClick={onCollapseAll}
            className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-400 dark:hover:bg-brand-800"
          >
            Collapse all
          </button>
          {!isSearching && (
            <button
              type="button"
              onClick={onFetchAll}
              disabled={batchRunning || companiesInIndustry.length === 0}
              className="rounded-md border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-brand-800 dark:bg-brand-950/50 dark:text-brand-400 dark:hover:bg-brand-800"
            >
              Fetch all
            </button>
          )}
          {selectedCount > 0 && (
            <button
              type="button"
              onClick={onFetchSelected}
              disabled={batchRunning}
              className={`rounded-md ${accentPreset.solid} px-3 py-1 text-[11px] font-semibold text-white transition-colors ${accentPreset.solidHover} disabled:cursor-not-allowed disabled:bg-brand-400`}
            >
              {batchRunning
                ? `Fetching… (${loadingCount} active)`
                : `🔍 Fetch News (${selectedCount})`}
            </button>
          )}
        </div>
      )}

      {isCompanies && editMode && !isSearching && !isVirtualIndustry && (
        <div
          className={`mt-2 rounded-lg border px-3 py-2 ${palette.badgeBg} border-current/10`}
        >
          <div className={`mb-1.5 text-[11px] font-bold ${palette.badgeText}`}>
            Editing: {activeIndustry}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {companiesInIndustry.map((company) => (
              <span
                key={company.id}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${palette.badgeBg} ${palette.badgeText}`}
              >
                {company.name}
                <button
                  type="button"
                  onClick={() => onRemoveCompany(company.id)}
                  className="text-sm leading-none opacity-60 hover:opacity-100"
                  aria-label={`Remove ${company.name}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKey}
              placeholder="+ Add company"
              className={`w-28 bg-transparent text-xs outline-none ${palette.badgeText}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
