"use client";

import { useState } from "react";
import { DEFAULT_INDUSTRY_EMOJI, industryPalette, TIME_FRAME_OPTIONS } from "@/lib/defaults";
import type { Company, Density, Industry, NewsSource, TimeFrameDays } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DensityToggle } from "@/components/DensityToggle";
import type { Theme } from "@/hooks/useTheme";

interface TopBarProps {
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
  theme: Theme;
  density: Density;
  onToggleTheme: () => void;
  onToggleDensity: () => void;
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
}

export function TopBar({
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
  theme,
  density,
  onToggleTheme,
  onToggleDensity,
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
}: TopBarProps) {
  const [tagInput, setTagInput] = useState("");
  const isSearching = searchQuery.trim().length > 0;
  const palette = industryPalette(activeIndustry, industries);
  const enabledSources = sources.filter((s) => s.enabled);
  const emoji = industryEmojis[activeIndustry] ?? DEFAULT_INDUSTRY_EMOJI;

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const value = tagInput.trim();
    if (value) onAddCompany(value);
    setTagInput("");
  }

  return (
    <div className="border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800/80 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[15px] font-bold uppercase tracking-wide text-slate-900 dark:text-white">
            {isSearching ? (
              "Search Results"
            ) : (
              <>
                <span className="text-base">{emoji}</span>
                {activeIndustry}
              </>
            )}
          </div>
          <div
            className="mt-0.5 truncate text-[11px] text-slate-500 dark:text-slate-500"
            title={
              isSearching
                ? undefined
                : `Sources: ${enabledSources.map((s) => s.name).join(", ")}`
            }
          >
            {isSearching
              ? `${matchedCount} matched`
              : `${companiesInIndustry.length} companies · ${enabledSources.length} source${
                  enabledSources.length !== 1 ? "s" : ""
                } · last ${days}d`}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-950/50">
          {TIME_FRAME_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              type="button"
              onClick={() => onSetDays(opt.days)}
              className={`rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                days === opt.days
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {opt.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 dark:text-slate-500">
            🔍
          </span>
          <input
            id="company-search-input"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search companies…"
            className="w-44 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-3 text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-600 dark:focus:bg-slate-950"
          />
        </div>

        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Command palette (Ctrl/Cmd+K)"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <kbd className="text-[10px]">⌘K</kbd>
        </button>

        <DensityToggle density={density} onToggle={onToggleDensity} />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />

        <button
          type="button"
          onClick={onOpenTutorial}
          title="Open tutorial"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <span aria-hidden="true">❓</span>
          Tutorial
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-950/50">
          <button
            type="button"
            onClick={onSelectAll}
            className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-md px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        </div>
        {!isSearching && (
          <button
            type="button"
            onClick={onFetchAll}
            disabled={batchRunning || companiesInIndustry.length === 0}
            className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Fetch all
          </button>
        )}
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onFetchSelected}
            disabled={batchRunning}
            className="rounded-md bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {batchRunning
              ? `Fetching… (${loadingCount} active)`
              : `🔍 Fetch News (${selectedCount})`}
          </button>
        )}
      </div>

      {editMode && !isSearching && (
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
