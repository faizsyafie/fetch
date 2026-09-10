"use client";

import { useState } from "react";
import {
  ACCENT_PRESETS,
  ALL_INDUSTRY,
  WATCHLIST_INDUSTRY,
  industryPalette,
  NEWS_TIME_FRAME_OPTIONS,
  TIME_FRAME_OPTIONS,
} from "@/lib/defaults";
import type {
  AccentColor,
  Company,
  Industry,
  NewsTimeFrame,
  TimeFrameDays,
} from "@/lib/types";
import type { AppMode } from "@/components/Sidebar";
import { UserMenu } from "@/components/UserMenu";
import { BoneButton } from "@/components/BoneButton";

interface TopBarProps {
  mode: AppMode;
  profileName: string;
  onLogOut: () => void;
  onOpenFeedback: () => void;
  activeIndustry: Industry;
  industries: Industry[];
  companiesInIndustry: Company[];
  searchQuery: string;
  days: TimeFrameDays;
  editMode: boolean;
  accent: AccentColor;
  onSearch: (value: string) => void;
  onSetDays: (days: TimeFrameDays) => void;
  onAddCompany: (name: string) => void;
  onRemoveCompany: (id: string) => void;
  onOpenTutorial: () => void;
  onOpenSettings: () => void;
  // News mode: the same time-range/refresh concept, bound to its own state
  // rather than the Companies preferences, since the two fetches are
  // independent — and its own value set/semantics (NewsTimeFrame).
  newsDays: NewsTimeFrame;
  onSetNewsDays: (days: NewsTimeFrame) => void;
  newsLoading: boolean;
  onRefreshNews: () => void;
}

export function TopBar({
  mode,
  profileName,
  onLogOut,
  onOpenFeedback,
  activeIndustry,
  industries,
  companiesInIndustry,
  searchQuery,
  days,
  editMode,
  accent,
  onSearch,
  onSetDays,
  onAddCompany,
  onRemoveCompany,
  onOpenTutorial,
  onOpenSettings,
  newsDays,
  onSetNewsDays,
  newsLoading,
  onRefreshNews,
}: TopBarProps) {
  const [tagInput, setTagInput] = useState("");
  const isNews = mode === "news";
  const isCompanies = mode === "companies";
  const isSaved = mode === "saved";
  const isSearching = searchQuery.trim().length > 0;
  const isVirtualIndustry =
    activeIndustry === ALL_INDUSTRY || activeIndustry === WATCHLIST_INDUSTRY;
  const palette = industryPalette(activeIndustry, industries);
  const accentPreset = ACCENT_PRESETS[accent];

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const value = tagInput.trim();
    if (value) onAddCompany(value);
    setTagInput("");
  }

  return (
    <div className="border-b border-brand-200 bg-white px-5 py-3 dark:border-brand-800/80 dark:bg-brand-900">
      <div className="flex items-center gap-3">
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {isNews && (
            <div className="flex shrink-0 items-center gap-2">
              <div
                data-tour="topbar-timerange"
                className="flex shrink-0 items-center gap-0.5 rounded-lg border border-brand-200 bg-brand-50 p-0.5 dark:border-brand-800 dark:bg-brand-950/50"
              >
                {NEWS_TIME_FRAME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSetNewsDays(opt.value)}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                      newsDays === opt.value
                        ? `${accentPreset.solid} text-white shadow-sm`
                        : "text-brand-500 hover:bg-brand-200/70 dark:text-brand-400 dark:hover:bg-brand-800"
                    }`}
                  >
                    {opt.label.toUpperCase()}
                  </button>
                ))}
              </div>
              <div data-tour="topbar-fetch">
                <BoneButton onClick={onRefreshNews} disabled={newsLoading} accent={accent}>
                  {newsLoading ? "Refreshing…" : "Re-fetch!"}
                </BoneButton>
              </div>
            </div>
          )}
          {isCompanies && (
            <div
              data-tour="topbar-timerange"
              className="flex shrink-0 items-center gap-0.5 rounded-lg border border-brand-200 bg-brand-50 p-0.5 dark:border-brand-800 dark:bg-brand-950/50"
            >
              {TIME_FRAME_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => onSetDays(opt.days)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                    days === opt.days
                      ? `${accentPreset.solid} text-white shadow-sm`
                      : "text-brand-500 hover:bg-brand-200/70 dark:text-brand-400 dark:hover:bg-brand-800"
                  }`}
                >
                  {opt.label.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 justify-center">
          <div data-tour="topbar-search" className="relative min-w-0 w-80 max-w-full">
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
              className={`w-full min-w-0 rounded-lg border border-brand-200 bg-brand-50 py-1.5 pl-8 pr-3 text-xs text-brand-900 outline-none transition-colors placeholder:text-brand-400 focus:${accentPreset.border} focus:bg-white dark:border-brand-800 dark:bg-brand-950/50 dark:text-white dark:placeholder:text-brand-600 dark:focus:bg-brand-950`}
            />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
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
            <UserMenu
              name={profileName}
              onLogOut={onLogOut}
              onOpenFeedback={onOpenFeedback}
            />
          </div>
        </div>
      </div>

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
