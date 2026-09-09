"use client";

import { useState } from "react";
import { industryIcon, industryPalette, TIME_FRAME_OPTIONS } from "@/lib/defaults";
import type { Company, Industry, NewsSource, TimeFrameDays } from "@/lib/types";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Theme } from "@/hooks/useTheme";

interface TopBarProps {
  activeIndustry: Industry;
  industries: Industry[];
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
  onToggleTheme: () => void;
  onSearch: (value: string) => void;
  onSetDays: (days: TimeFrameDays) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onFetchSelected: () => void;
  onAddCompany: (name: string) => void;
  onRemoveCompany: (id: string) => void;
}

export function TopBar({
  activeIndustry,
  industries,
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
  onToggleTheme,
  onSearch,
  onSetDays,
  onSelectAll,
  onClearSelection,
  onFetchSelected,
  onAddCompany,
  onRemoveCompany,
}: TopBarProps) {
  const [tagInput, setTagInput] = useState("");
  const isSearching = searchQuery.trim().length > 0;
  const palette = industryPalette(activeIndustry, industries);

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const value = tagInput.trim();
    if (value) onAddCompany(value);
    setTagInput("");
  }

  return (
    <div className="border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <div className="text-base font-bold text-slate-900 dark:text-white">
            {isSearching
              ? "Search Results"
              : `${industryIcon(activeIndustry)} ${activeIndustry}`}
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {isSearching
              ? `${matchedCount} matched`
              : `${companiesInIndustry.length} companies · ${sources
                  .filter((s) => s.enabled)
                  .map((s) => s.name)
                  .join(", ")} · last ${days}d`}
          </div>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 px-1.5 py-1 dark:bg-slate-900">
          <span className="mr-0.5 text-[11px] text-slate-400 dark:text-slate-500">
            ⏱
          </span>
          {TIME_FRAME_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              type="button"
              onClick={() => onSetDays(opt.days)}
              className={`rounded px-2 py-1 text-[11px] transition ${
                days === opt.days
                  ? "bg-blue-600 font-bold text-white"
                  : "text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <input
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search companies…"
          className="w-44 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onSelectAll}
          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Select All
        </button>
        <button
          type="button"
          onClick={onClearSelection}
          className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Clear
        </button>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={onFetchSelected}
            disabled={batchRunning}
            className="rounded-md bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-400"
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
