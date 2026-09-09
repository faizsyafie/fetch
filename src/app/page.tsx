"use client";

import { useCallback, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CompanyList, type NewsCacheEntry } from "@/components/CompanyList";
import { Sidebar } from "@/components/Sidebar";
import { SourcesPanel } from "@/components/SourcesPanel";
import { TopBar } from "@/components/TopBar";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme } from "@/hooks/useTheme";
import type { Company, FetchNewsResponse } from "@/lib/types";

const BATCH_SIZE = 3;

export default function Dashboard() {
  const {
    preferences,
    hydrated,
    addCompany,
    removeCompany,
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

  const companiesInIndustry = useMemo(
    () =>
      preferences.companies.filter(
        (c) => c.industry === preferences.activeIndustry
      ),
    [preferences.companies, preferences.activeIndustry]
  );

  const visibleCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return preferences.companies.filter((c) =>
        c.name.toLowerCase().includes(q)
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
    [preferences.sources, preferences.days]
  );

  const toggleExpand = useCallback(
    (company: Company) => {
      setExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(company.id)) {
          next.delete(company.id);
        } else {
          next.add(company.id);
        }
        return next;
      });
      if (!newsCache[company.id] && !loadingSet.has(company.id)) {
        void fetchCompanyNews(company);
      }
    },
    [newsCache, loadingSet, fetchCompanyNews]
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

  const fetchSelected = useCallback(async () => {
    if (selected.size === 0 || batchRunning) return;
    setBatchRunning(true);
    const toFetch = preferences.companies.filter(
      (c) => selected.has(c.id) && !loadingSet.has(c.id)
    );
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
  }, [selected, batchRunning, preferences.companies, loadingSet, fetchCompanyNews]);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setSelected(new Set());
  }, []);

  const handleSelectIndustry = useCallback(
    (industry: string) => {
      setActiveIndustry(industry);
      setSearchQuery("");
      setSelected(new Set());
    },
    [setActiveIndustry]
  );

  const handleAddCompanyTag = useCallback(
    (name: string) => addCompany(name, preferences.activeIndustry),
    [addCompany, preferences.activeIndustry]
  );

  const clearCache = useCallback(() => setNewsCache({}), []);

  const lastUpdatedLabel = lastFetchedAt
    ? `Updated ${formatDistanceToNow(lastFetchedAt, { addSuffix: true })}`
    : null;

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-950 dark:text-slate-500">
        Loading preferences…
      </div>
    );
  }

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
        onSelectIndustry={handleSelectIndustry}
        onAddIndustry={addIndustry}
        onRenameIndustry={renameIndustry}
        onRemoveIndustry={removeIndustry}
        onSetIndustryEmoji={setIndustryEmoji}
        onToggleEditMode={() => setEditMode((v) => !v)}
        onToggleSourcesPanel={() => setSourcesOpen((v) => !v)}
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
          onToggleTheme={toggleTheme}
          onSearch={handleSearch}
          onSetDays={setDays}
          onSelectAll={selectAll}
          onClearSelection={clearSelection}
          onFetchSelected={fetchSelected}
          onAddCompany={handleAddCompanyTag}
          onRemoveCompany={removeCompany}
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
          emptyMessage={
            searchQuery.trim()
              ? "No companies matched."
              : "No companies. Click ✏️ Edit Lists to add some."
          }
          onToggleSelect={toggleSelect}
          onToggleExpand={toggleExpand}
          onRefresh={refreshCompany}
        />
      </div>
    </div>
  );
}
