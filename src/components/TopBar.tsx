"use client";

import { useEffect, useState } from "react";
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
import { CompanySelectionActions } from "@/components/CompanySelectionActions";
import { TimeFramePills } from "@/components/TimeFramePills";
import { BulkAddCompaniesModal } from "@/components/BulkAddCompaniesModal";

// TimeFramePills wants a flat {label, value}[] shape; TIME_FRAME_OPTIONS
// uses `days` instead of `value` for its own (non-UI) clarity elsewhere.
const companiesTimeFrameOptions = TIME_FRAME_OPTIONS.map((opt) => ({
  label: opt.label,
  value: opt.days,
}));

interface TopBarProps {
  mode: AppMode;
  profileName: string;
  onLogOut: () => void;
  onOpenFeedback: () => void;
  onOpenAbout: () => void;
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
  onAddCompanies: (names: string[]) => void;
  onRemoveCompany: (id: string) => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  // News mode: the same time-range/refresh concept, bound to its own state
  // rather than the Companies preferences, since the two fetches are
  // independent — and its own value set/semantics (NewsTimeFrame).
  newsDays: NewsTimeFrame;
  onSetNewsDays: (days: NewsTimeFrame) => void;
  newsLoading: boolean;
  onRefreshNews: () => void;
  // Companies mode: Fetch! sits right after the time-frame pills, in the
  // exact spot News's Re-fetch! occupies, so the blank-state bar matches.
  // Clear/Collapse only render (in CompanySelectionActions) once there's a
  // selection or an expanded row to act on.
  selectedCount: number;
  totalCount: number;
  expandedCount: number;
  batchRunning: boolean;
  loadingCount: number;
  onClearSelection: () => void;
  onCollapseAll: () => void;
  onFetchCompanies: () => void;
  // When on, Fetch! (with nothing manually selected) only fetches starred
  // companies in the active industry instead of the whole industry.
  starredOnly: boolean;
  onToggleStarredOnly: () => void;
  // Buried Bones' equivalent — when on, only pinned links show in the
  // current category instead of the whole thing.
  pinnedOnly: boolean;
  onTogglePinnedOnly: () => void;
  // Mobile-only — see useIsMobile/Sidebar.
  onOpenMobileNav: () => void;
  // Also drives which of the two (mobile-row / desktop-row) copies of each
  // shared control actually carries its data-tour attribute — see
  // renderModeControls/renderSearchInput/renderRightIcons below. Both rows
  // render unconditionally (CSS just hides one via `md:hidden`/`hidden
  // md:flex`), so without this, SpotlightTour's querySelector-based
  // targeting would always grab whichever copy happens to come first in the
  // DOM, regardless of which one is actually visible.
  isMobile: boolean;
}

export function TopBar({
  mode,
  profileName,
  onLogOut,
  onOpenFeedback,
  onOpenAbout,
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
  onAddCompanies,
  onRemoveCompany,
  onOpenHelp,
  onOpenSettings,
  newsDays,
  onSetNewsDays,
  newsLoading,
  onRefreshNews,
  selectedCount,
  totalCount,
  expandedCount,
  batchRunning,
  loadingCount,
  onClearSelection,
  onCollapseAll,
  onFetchCompanies,
  starredOnly,
  onToggleStarredOnly,
  pinnedOnly,
  onTogglePinnedOnly,
  onOpenMobileNav,
  isMobile,
}: TopBarProps) {
  const [tagInput, setTagInput] = useState("");
  const [bulkAddOpen, setBulkAddOpen] = useState(false);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!duplicateNotice) return;
    const timer = setTimeout(() => setDuplicateNotice(null), 2500);
    return () => clearTimeout(timer);
  }, [duplicateNotice]);
  // Committed only on Enter (see the input below) — a local draft that only
  // resets to match `searchQuery` when something ELSE clears it externally
  // (switching pages, etc.), adjusted during render rather than in an
  // effect per React's docs on syncing state to a changing prop.
  const [draftQuery, setDraftQuery] = useState(searchQuery);
  const [draftSyncedFor, setDraftSyncedFor] = useState(searchQuery);
  if (searchQuery !== draftSyncedFor) {
    setDraftSyncedFor(searchQuery);
    setDraftQuery(searchQuery);
  }
  const isNews = mode === "news";
  const isCompanies = mode === "companies";
  const isSaved = mode === "saved";
  const isHome = mode === "home";
  const isSearching = searchQuery.trim().length > 0;
  const isVirtualIndustry =
    activeIndustry === ALL_INDUSTRY || activeIndustry === WATCHLIST_INDUSTRY;
  const palette = industryPalette(activeIndustry, industries);
  const accentPreset = ACCENT_PRESETS[accent];

  function handleTagKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const value = tagInput.trim();
    if (!value) return;
    const isDuplicate = companiesInIndustry.some(
      (c) => c.name.toLowerCase() === value.toLowerCase()
    );
    if (isDuplicate) {
      setDuplicateNotice("This name has already been put in this list.");
      return;
    }
    onAddCompany(value);
    setTagInput("");
  }

  // Shared between the desktop row (unchanged) and the mobile-only
  // horizontal-scroll row below it — same controls, just laid out
  // differently per viewport, so this is built once rather than duplicated.
  function renderModeControls(withTour: boolean) {
    return (
    <>
      {isNews && (
            <div className="flex shrink-0 items-center gap-2">
              <TimeFramePills
                dataTour={withTour ? "topbar-timerange" : undefined}
                options={NEWS_TIME_FRAME_OPTIONS}
                value={newsDays}
                accent={accent}
                onChange={onSetNewsDays}
              />
              <div data-tour={withTour ? "topbar-fetch" : undefined}>
                <BoneButton onClick={onRefreshNews} disabled={newsLoading} accent={accent}>
                  {newsLoading ? "Refreshing…" : "Re-fetch!"}
                </BoneButton>
              </div>
            </div>
          )}
          {isCompanies && (
            <div className="flex shrink-0 items-center gap-2">
              <TimeFramePills
                dataTour={withTour ? "topbar-timerange" : undefined}
                options={companiesTimeFrameOptions}
                value={days}
                accent={accent}
                onChange={onSetDays}
              />
              <button
                type="button"
                data-tour={withTour ? "topbar-star-toggle" : undefined}
                onClick={onToggleStarredOnly}
                title={
                  starredOnly
                    ? "Fetching starred companies only — click to fetch the whole industry"
                    : "Fetch starred companies only"
                }
                aria-pressed={starredOnly}
                className={`flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-sm transition-all ${
                  starredOnly
                    ? "border-amber-300 bg-amber-50 drop-shadow-[0_0_5px_rgba(251,191,36,0.65)] dark:border-amber-400/40 dark:bg-amber-400/10"
                    : "border-brand-200 bg-brand-50 opacity-40 grayscale hover:opacity-70 dark:border-brand-700 dark:bg-brand-800"
                }`}
              >
                <span aria-hidden="true">⭐</span>
              </button>
              <div data-tour={withTour ? "topbar-fetch" : undefined}>
                <BoneButton
                  onClick={onFetchCompanies}
                  disabled={batchRunning || (selectedCount === 0 && totalCount === 0)}
                  accent={accent}
                >
                  {batchRunning
                    ? `Fetching… (${loadingCount})`
                    : selectedCount > 0
                      ? `Fetch! (${selectedCount})`
                      : "Fetch!"}
                </BoneButton>
              </div>
              <CompanySelectionActions
                selectedCount={selectedCount}
                expandedCount={expandedCount}
                accent={accent}
                onClear={onClearSelection}
                onCollapse={onCollapseAll}
              />
            </div>
          )}
          {isSaved && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                data-tour={withTour ? "topbar-star-toggle" : undefined}
                onClick={onTogglePinnedOnly}
                title={
                  pinnedOnly
                    ? "Showing pinned links only — click to show all"
                    : "Show pinned links only"
                }
                aria-pressed={pinnedOnly}
                className={`flex shrink-0 items-center justify-center rounded-lg border px-2.5 py-1.5 text-sm transition-all ${
                  pinnedOnly
                    ? "border-amber-300 bg-amber-50 drop-shadow-[0_0_5px_rgba(251,191,36,0.65)] dark:border-amber-400/40 dark:bg-amber-400/10"
                    : "border-brand-200 bg-brand-50 opacity-40 grayscale hover:opacity-70 dark:border-brand-700 dark:bg-brand-800"
                }`}
              >
                <span aria-hidden="true">⭐</span>
              </button>
            </div>
          )}
    </>
    );
  }

  function renderSearchInput(withTour: boolean) {
    return !isHome && (
    <div data-tour={withTour ? "topbar-search" : undefined} className="relative min-w-0 w-full md:w-80 md:max-w-full">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-brand-400 dark:text-brand-500">
        🔍
      </span>
      <input
        id="company-search-input"
        value={draftQuery}
        onChange={(e) => {
          const next = e.target.value;
          setDraftQuery(next);
          // Companies search just filters an in-memory list (no
          // highlight spans, no per-keystroke RSS work), so it's safe
          // — and nicer — to search live here. News stays Enter-gated;
          // see the commit that introduced draftQuery for why.
          if (isCompanies) onSearch(next);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !isCompanies) onSearch(draftQuery);
        }}
        placeholder={
          isNews
            ? "Search articles… (Enter)"
            : isSaved
              ? "Search saved links… (Enter)"
              : "Search companies…"
        }
        className={`w-full min-w-0 rounded-lg border border-brand-200 bg-brand-50 py-1.5 pl-8 pr-3 text-xs text-brand-900 outline-none transition-colors placeholder:text-brand-400 focus:${accentPreset.border} focus:bg-white dark:border-brand-800 dark:bg-brand-950/50 dark:text-white dark:placeholder:text-brand-600 dark:focus:bg-brand-950`}
      />
    </div>
    );
  }

  function renderRightIcons(withTour: boolean) {
    return (
    <>
      <button
        type="button"
        data-tour={withTour ? "topbar-help" : undefined}
        onClick={onOpenHelp}
        title="Help"
        aria-label="Help"
        className="flex shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
      >
        <span aria-hidden="true">❓</span>
      </button>

      <button
        type="button"
        data-tour={withTour ? "topbar-settings" : undefined}
        onClick={onOpenSettings}
        title="Settings"
        aria-label="Settings"
        className="flex shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
      >
        <span aria-hidden="true">⚙️</span>
      </button>

      <div data-tour={withTour ? "topbar-user" : undefined}>
        <UserMenu
          name={profileName}
          onLogOut={onLogOut}
          onOpenFeedback={onOpenFeedback}
          onOpenAbout={onOpenAbout}
        />
      </div>
    </>
    );
  }

  return (
    <div className="bg-white dark:bg-brand-900">
      {/* Mobile header — hamburger + right icons; search and mode controls
         get their own full-width rows below since they don't fit here.
         min-h (not h-) plus a safe-area top pad, so a notch/Dynamic Island
         adds extra height instead of squeezing the existing 56px row. */}
      <div className="flex min-h-14 items-center gap-2 border-b border-brand-200 px-3 pt-[env(safe-area-inset-top)] md:hidden dark:border-brand-800/80">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Open menu"
          title="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 text-base text-brand-600 transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
        >
          <span aria-hidden="true">☰</span>
        </button>
        <div className="min-w-0 flex-1" />
        <div className="flex shrink-0 items-center gap-2">{renderRightIcons(isMobile)}</div>
      </div>
      {!isHome && (
        <div className="border-b border-brand-200 px-3 py-2 md:hidden dark:border-brand-800/80">
          {renderSearchInput(isMobile)}
        </div>
      )}
      {(isNews || isCompanies || isSaved) && (
        <div className="flex items-center gap-2 overflow-x-auto border-b border-brand-200 px-3 py-2 md:hidden dark:border-brand-800/80">
          {renderModeControls(isMobile)}
        </div>
      )}

      {/* Desktop header — unchanged from before mobile support. */}
      <div className="hidden h-14 items-center gap-3 border-b border-brand-200 px-5 md:flex dark:border-brand-800/80">
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {renderModeControls(!isMobile)}
        </div>

        <div className="flex min-w-0 flex-1 justify-center">{renderSearchInput(!isMobile)}</div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          {renderRightIcons(!isMobile)}
        </div>
      </div>

      {isCompanies && !isSearching && !isVirtualIndustry && (
        <div
          className="grid transition-[grid-template-rows] duration-200 ease-out"
          style={{ gridTemplateRows: editMode ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div
              className={`rounded-lg border px-3 py-2 mx-5 mb-3 mt-2 ${palette.badgeBg} border-current/10`}
            >
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className={`text-[0.6875rem] font-bold ${palette.badgeText}`}>
                  Editing: {activeIndustry}
                </span>
                <button
                  type="button"
                  data-tour="topbar-paste-list"
                  onClick={() => setBulkAddOpen(true)}
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold opacity-70 transition-opacity hover:opacity-100 ${palette.badgeBg} ${palette.badgeText}`}
                >
                  📋 Paste list
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {companiesInIndustry.map((company) => (
                  <span
                    key={company.id}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${palette.badgeBg} ${palette.badgeText}`}
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
                <div className="relative">
                  <input
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      if (duplicateNotice) setDuplicateNotice(null);
                    }}
                    onKeyDown={handleTagKey}
                    placeholder="+ Add company"
                    className={`w-28 bg-transparent text-xs outline-none ${palette.badgeText}`}
                  />
                  {duplicateNotice && (
                    <div className="animate-dropdown absolute left-0 top-full z-10 mt-1.5 w-max max-w-[14rem] rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-[0.6875rem] font-medium text-red-600 shadow-lg dark:border-red-500/30 dark:bg-brand-800 dark:text-red-400">
                      ⚠️ {duplicateNotice}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <BulkAddCompaniesModal
        open={bulkAddOpen}
        industry={activeIndustry}
        existingNames={companiesInIndustry.map((c) => c.name)}
        accent={accent}
        onClose={() => setBulkAddOpen(false)}
        onAdd={onAddCompanies}
      />
    </div>
  );
}
