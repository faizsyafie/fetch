"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CommandPalette } from "@/components/CommandPalette";
import { CompanyList, type NewsCacheEntry } from "@/components/CompanyList";
import { Sidebar } from "@/components/Sidebar";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { SourcesPanel } from "@/components/SourcesPanel";
import { TopBar } from "@/components/TopBar";
import { TutorialModal } from "@/components/TutorialModal";
import { usePreferences } from "@/hooks/usePreferences";
import { useSeenArticles } from "@/hooks/useSeenArticles";
import { useTheme } from "@/hooks/useTheme";
import { readUiSettings, useUiSettings } from "@/hooks/useUiSettings";
import type { Company, FetchNewsResponse } from "@/lib/types";

const BATCH_SIZE = 3;

function sortWithPinned(companies: Company[]): Company[] {
  return companies
    .map((c, i) => ({ c, i }))
    .sort((a, b) => Number(!!b.c.pinned) - Number(!!a.c.pinned) || a.i - b.i)
    .map(({ c }) => c);
}

export default function Dashboard() {
  const {
    preferences,
    hydrated: prefsHydrated,
    addCompany,
    removeCompany,
    togglePinCompany,
    updateCompanyNotes,
    reorderCompaniesInIndustry,
    reorderIndustries,
    setActiveIndustry,
    addIndustry,
    renameIndustry,
    removeIndustry,
    setIndustryEmoji,
    setDays,
    addSource,
    removeSource,
    resetSources,
  } = usePreferences();
  const { theme, toggleTheme } = useTheme();
  const {
    settings: uiSettings,
    hydrated: uiHydrated,
    setSidebarWidth,
    toggleSidebarCollapsed,
    setDensity,
    markTutorialSeen,
  } = useUiSettings();
  const { hydrated: seenHydrated, markSeen, isSeen } = useSeenArticles();

  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newsCache, setNewsCache] = useState<Record<string, NewsCacheEntry>>(
    {}
  );
  const [loadingSet, setLoadingSet] = useState<Set<string>>(new Set());
  const [batchRunning, setBatchRunning] = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);

  const expandedRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    expandedRef.current = expanded;
  }, [expanded]);

  const hydrated = prefsHydrated && uiHydrated && seenHydrated;

  useEffect(() => {
    // A one-time, client-only check of persisted state after mount — keeping
    // this out of the render body avoids opening the modal in the SSR pass
    // (whose default "not seen" wouldn't match a returning visitor's client
    // storage) and the resulting hydration mismatch. Read the store's
    // synchronous getter directly rather than `uiSettings`: this effect can
    // run before useSyncExternalStore's post-hydration snapshot correction,
    // so the reactive value may still be the transient SSR default here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!readUiSettings().tutorialSeen) setTutorialOpen(true);
  }, []);

  const companiesInIndustry = useMemo(
    () =>
      sortWithPinned(
        preferences.companies.filter(
          (c) => c.industry === preferences.activeIndustry
        )
      ),
    [preferences.companies, preferences.activeIndustry]
  );

  const visibleCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return sortWithPinned(
        preferences.companies.filter((c) => c.name.toLowerCase().includes(q))
      );
    }
    return companiesInIndustry;
  }, [searchQuery, preferences.companies, companiesInIndustry]);

  const enabledSourceNames = useMemo(
    () => preferences.sources.filter((s) => s.enabled).map((s) => s.name),
    [preferences.sources]
  );

  const fetchCompanyNews = useCallback(
    async (company: Company) => {
      setLoadingSet((prev) => new Set(prev).add(company.id));
      try {
        const response = await fetch("/api/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companies: [company],
            sources: preferences.sources,
            days: preferences.days,
          }),
        });

        if (!response.ok) throw new Error("Failed to fetch news.");
        const data = (await response.json()) as FetchNewsResponse;
        setNewsCache((prev) => ({ ...prev, [company.id]: data.articles }));
        setLastFetchedAt(Date.now());
        if (expandedRef.current.has(company.id)) {
          markSeen(data.articles.map((a) => a.id));
        }
      } catch {
        setNewsCache((prev) => ({ ...prev, [company.id]: "error" }));
      } finally {
        setLoadingSet((prev) => {
          const next = new Set(prev);
          next.delete(company.id);
          return next;
        });
      }
    },
    [preferences.sources, preferences.days, markSeen]
  );

  const toggleExpand = useCallback(
    (company: Company) => {
      const willOpen = !expanded.has(company.id);
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(company.id)) {
          next.delete(company.id);
        } else {
          next.add(company.id);
        }
        return next;
      });
      if (!willOpen) return;
      const cached = newsCache[company.id];
      if (Array.isArray(cached)) {
        markSeen(cached.map((a) => a.id));
        return;
      }
      if (!loadingSet.has(company.id)) {
        void fetchCompanyNews(company);
      }
    },
    [expanded, newsCache, loadingSet, fetchCompanyNews, markSeen]
  );

  const openCompany = useCallback(
    (company: Company) => {
      setActiveIndustry(company.industry);
      setSearchQuery("");
      setSelected(new Set());
      setExpanded((prev) => new Set(prev).add(company.id));
      const cached = newsCache[company.id];
      if (Array.isArray(cached)) {
        markSeen(cached.map((a) => a.id));
      } else if (!loadingSet.has(company.id)) {
        void fetchCompanyNews(company);
      }
      requestAnimationFrame(() => {
        document
          .querySelector(`[data-company-row="${company.id}"]`)
          ?.scrollIntoView({ block: "center" });
      });
    },
    [setActiveIndustry, newsCache, loadingSet, fetchCompanyNews, markSeen]
  );

  const refreshCompany = useCallback(
    (company: Company) => {
      setNewsCache((prev) => {
        const next = { ...prev };
        delete next[company.id];
        return next;
      });
      void fetchCompanyNews(company);
    },
    [fetchCompanyNews]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      visibleCompanies.forEach((c) => next.add(c.id));
      return next;
    });
  }, [visibleCompanies]);

  const clearSelection = useCallback(() => setSelected(new Set()), []);

  const runBatchFetch = useCallback(
    async (targets: Company[]) => {
      if (targets.length === 0 || batchRunning) return;
      setBatchRunning(true);
      const toFetch = targets.filter((c) => !loadingSet.has(c.id));
      setExpanded((prev) => {
        const next = new Set(prev);
        toFetch.forEach((c) => next.add(c.id));
        return next;
      });

      for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
        const batch = toFetch.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map((company) => fetchCompanyNews(company)));
      }

      setBatchRunning(false);
    },
    [batchRunning, loadingSet, fetchCompanyNews]
  );

  const fetchSelected = useCallback(() => {
    const toFetch = preferences.companies.filter((c) => selected.has(c.id));
    void runBatchFetch(toFetch);
  }, [selected, preferences.companies, runBatchFetch]);

  const fetchAllInIndustry = useCallback(() => {
    void runBatchFetch(companiesInIndustry);
  }, [companiesInIndustry, runBatchFetch]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setSelected(new Set());
    setFocusedIndex(null);
  }, []);

  const handleSelectIndustry = useCallback(
    (industry: string) => {
      setActiveIndustry(industry);
      setSearchQuery("");
      setSelected(new Set());
      setFocusedIndex(null);
    },
    [setActiveIndustry]
  );

  const handleAddCompanyTag = useCallback(
    (name: string) => addCompany(name, preferences.activeIndustry),
    [addCompany, preferences.activeIndustry]
  );

  const clearCache = useCallback(() => setNewsCache({}), []);

  const handleReorderCompanies = useCallback(
    (orderedIds: string[]) => {
      if (searchQuery.trim()) return;
      reorderCompaniesInIndustry(preferences.activeIndustry, orderedIds);
    },
    [searchQuery, reorderCompaniesInIndustry, preferences.activeIndustry]
  );

  const lastUpdatedLabel = lastFetchedAt
    ? `Updated ${formatDistanceToNow(lastFetchedAt, { addSuffix: true })}`
    : null;

  // Keyboard shortcuts: "/" focuses search, j/k or arrows move the focused
  // row, Enter expands it, and Ctrl/Cmd+K opens the command palette.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
        return;
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
        setTutorialOpen(false);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" || target?.tagName === "TEXTAREA";
      if (isTyping) return;

      if (e.key === "/") {
        e.preventDefault();
        document.getElementById("company-search-input")?.focus();
        return;
      }
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((prev) =>
          Math.min((prev ?? -1) + 1, visibleCompanies.length - 1)
        );
      } else if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max((prev ?? 0) - 1, 0));
      } else if (e.key === "Enter") {
        setFocusedIndex((prev) => {
          if (prev != null && visibleCompanies[prev]) {
            toggleExpand(visibleCompanies[prev]);
          }
          return prev;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [visibleCompanies, toggleExpand]);

  useEffect(() => {
    if (focusedIndex == null) return;
    const company = visibleCompanies[focusedIndex];
    if (!company) return;
    document
      .querySelector(`[data-company-row="${company.id}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [focusedIndex, visibleCompanies]);

  if (!hydrated) {
    return <SkeletonLoader />;
  }

  const focusedId =
    focusedIndex != null ? visibleCompanies[focusedIndex]?.id ?? null : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden lg:flex-row">
      <Sidebar
        companies={preferences.companies}
        industries={preferences.industries}
        industryEmojis={preferences.industryEmojis}
        activeIndustry={preferences.activeIndustry}
        sources={preferences.sources}
        days={preferences.days}
        editMode={editMode}
        sourcesOpen={sourcesOpen}
        lastUpdatedLabel={lastUpdatedLabel}
        width={uiSettings.sidebarWidth}
        collapsed={uiSettings.sidebarCollapsed}
        onSelectIndustry={handleSelectIndustry}
        onAddIndustry={addIndustry}
        onRenameIndustry={renameIndustry}
        onRemoveIndustry={removeIndustry}
        onSetIndustryEmoji={setIndustryEmoji}
        onReorderIndustries={reorderIndustries}
        onToggleEditMode={() => setEditMode((v) => !v)}
        onToggleSourcesPanel={() => setSourcesOpen((v) => !v)}
        onResizeWidth={setSidebarWidth}
        onToggleCollapsed={toggleSidebarCollapsed}
      />

      <div className="flex min-h-0 flex-1 flex-col bg-slate-50 dark:bg-slate-950">
        <TopBar
          activeIndustry={preferences.activeIndustry}
          industries={preferences.industries}
          industryEmojis={preferences.industryEmojis}
          companiesInIndustry={companiesInIndustry}
          matchedCount={visibleCompanies.length}
          searchQuery={searchQuery}
          days={preferences.days}
          sources={preferences.sources}
          selectedCount={selected.size}
          batchRunning={batchRunning}
          loadingCount={loadingSet.size}
          editMode={editMode}
          theme={theme}
          density={uiSettings.density}
          onToggleTheme={toggleTheme}
          onToggleDensity={() =>
            setDensity(uiSettings.density === "compact" ? "comfortable" : "compact")
          }
          onSearch={handleSearch}
          onSetDays={setDays}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onFetchSelected={fetchSelected}
          onFetchAll={fetchAllInIndustry}
          onAddCompany={handleAddCompanyTag}
          onRemoveCompany={removeCompany}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenTutorial={() => setTutorialOpen(true)}
        />

        {sourcesOpen && (
          <SourcesPanel
            sources={preferences.sources}
            onAddSource={addSource}
            onRemoveSource={removeSource}
            onResetSources={resetSources}
            onClearCache={clearCache}
          />
        )}

        <CompanyList
          companies={visibleCompanies}
          industries={preferences.industries}
          showIndustryLabel={searchQuery.trim().length > 0}
          selected={selected}
          expanded={expanded}
          newsCache={newsCache}
          loadingSet={loadingSet}
          days={preferences.days}
          sourceNames={enabledSourceNames}
          density={uiSettings.density}
          focusedId={focusedId}
          isArticleSeen={isSeen}
          enableDrag={searchQuery.trim().length === 0}
          emptyMessage={
            searchQuery.trim()
              ? "No companies matched."
              : "No companies. Click ✏️ Edit Lists to add some."
          }
          onToggleSelect={toggleSelect}
          onToggleExpand={toggleExpand}
          onRefresh={refreshCompany}
          onTogglePin={togglePinCompany}
          onUpdateNotes={updateCompanyNotes}
          onReorder={handleReorderCompanies}
        />
      </div>

      {commandPaletteOpen && (
        <CommandPalette
          companies={preferences.companies}
          industries={preferences.industries}
          industryEmojis={preferences.industryEmojis}
          onSelectCompany={openCompany}
          onSelectIndustry={handleSelectIndustry}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}

      {tutorialOpen && (
        <TutorialModal
          onClose={() => {
            setTutorialOpen(false);
            markTutorialSeen();
          }}
        />
      )}
    </div>
  );
}
