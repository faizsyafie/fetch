"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CommandPalette } from "@/components/CommandPalette";
import { CompanyList, type NewsCacheEntry } from "@/components/CompanyList";
import { CustomizePanel } from "@/components/CustomizePanel";
import { DogWatermark } from "@/components/DogWatermark";
import { NewsBoard } from "@/components/NewsBoard";
import { ProfilePicker } from "@/components/ProfilePicker";
import { Sidebar } from "@/components/Sidebar";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { SourcesPanel } from "@/components/SourcesPanel";
import { SuggestedSources } from "@/components/SuggestedSources";
import { SpotlightTour } from "@/components/SpotlightTour";
import { TopBar } from "@/components/TopBar";
import { WelcomeLanding } from "@/components/WelcomeLanding";
import { useProfile } from "@/hooks/useProfile";
import { usePreferences } from "@/hooks/usePreferences";
import { useSeenArticles } from "@/hooks/useSeenArticles";
import { useTheme } from "@/hooks/useTheme";
import { readUiSettings, useUiSettings } from "@/hooks/useUiSettings";
import {
  ALL_INDUSTRY,
  BACKGROUND_PRESETS,
  FONT_FAMILY_PRESETS,
  FONT_SCALE_PRESETS,
  WATCHLIST_INDUSTRY,
} from "@/lib/defaults";
import {
  EMPTY_NEWS_ARTICLES,
  EMPTY_NEWS_ERRORS,
  NEWS_TOPICS,
} from "@/lib/newsTopics";
import { TOUR_STEPS } from "@/lib/tourSteps";
import type {
  Company,
  FetchNewsResponse,
  NewsTopicId,
  TimeFrameDays,
  TopicArticle,
} from "@/lib/types";

const BATCH_SIZE = 3;

function sortWithPinned(companies: Company[]): Company[] {
  return companies
    .map((c, i) => ({ c, i }))
    .sort((a, b) => Number(!!b.c.pinned) - Number(!!a.c.pinned) || a.i - b.i)
    .map(({ c }) => c);
}

export default function Dashboard() {
  const {
    profileName,
    hydrated: profileHydrated,
    setProfileName,
    clearProfile,
  } = useProfile();

  if (!profileHydrated) {
    return <SkeletonLoader />;
  }

  if (!profileName) {
    return <ProfilePicker onPick={setProfileName} />;
  }

  return (
    <DashboardForProfile profileName={profileName} onLogOut={clearProfile} />
  );
}

function DashboardForProfile({
  profileName,
  onLogOut,
}: {
  profileName: string;
  onLogOut: () => void;
}) {
  const {
    preferences,
    hydrated: prefsHydrated,
    addCompany,
    removeCompany,
    togglePinCompany,
    toggleStarCompany,
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
  } = usePreferences(profileName);
  const { theme, toggleTheme } = useTheme();
  const {
    settings: uiSettings,
    hydrated: uiHydrated,
    setSidebarWidth,
    toggleSidebarCollapsed,
    setDensity,
    markTutorialSeen,
    setAccent,
    setFontFamily,
    setFontScale,
    setBackground,
    setNewsTopicOrder,
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
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [mode, setMode] = useState<"companies" | "news">("companies");
  const [newsDays, setNewsDaysState] = useState<TimeFrameDays>(7);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsArticlesByTopic, setNewsArticlesByTopic] =
    useState<Record<NewsTopicId, TopicArticle[]>>(EMPTY_NEWS_ARTICLES);
  const [newsErrorsByTopic, setNewsErrorsByTopic] =
    useState<Record<NewsTopicId, string[]>>(EMPTY_NEWS_ERRORS);
  const [newsFetchedAt, setNewsFetchedAt] = useState<number | null>(null);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === "companies" ? "news" : "companies"));
    setSearchQuery("");
    setSelected(new Set());
    setFocusedIndex(null);
  }, []);

  const fetchNewsBoard = useCallback(async (days: TimeFrameDays) => {
    setNewsLoading(true);
    try {
      const response = await fetch("/api/topic-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (!response.ok) throw new Error("Failed to fetch news.");
      const data = await response.json();

      const nextArticles = { ...EMPTY_NEWS_ARTICLES };
      const nextErrors = { ...EMPTY_NEWS_ERRORS };
      for (const topic of NEWS_TOPICS) {
        const result = data.topics?.[topic.id];
        nextArticles[topic.id] = result?.articles ?? [];
        nextErrors[topic.id] = result?.errors ?? [];
      }
      setNewsArticlesByTopic(nextArticles);
      setNewsErrorsByTopic(nextErrors);
      setNewsFetchedAt(Date.now());
    } catch {
      setNewsErrorsByTopic({
        world: ["Failed to fetch news."],
        malaysia: ["Failed to fetch news."],
        economy: ["Failed to fetch news."],
        tech: ["Failed to fetch news."],
      });
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const setNewsDays = useCallback(
    (days: TimeFrameDays) => {
      setNewsDaysState(days);
      void fetchNewsBoard(days);
    },
    [fetchNewsBoard]
  );

  // Refresh as soon as the board is switched into — i.e. every time the
  // user flips to News mode — with no background polling afterward.
  useEffect(() => {
    if (mode === "news") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchNewsBoard(newsDays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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

  const isVirtualIndustry =
    preferences.activeIndustry === ALL_INDUSTRY ||
    preferences.activeIndustry === WATCHLIST_INDUSTRY;

  const companiesInIndustry = useMemo(() => {
    if (preferences.activeIndustry === ALL_INDUSTRY) {
      return sortWithPinned(preferences.companies);
    }
    if (preferences.activeIndustry === WATCHLIST_INDUSTRY) {
      return sortWithPinned(preferences.companies.filter((c) => c.starred));
    }
    return sortWithPinned(
      preferences.companies.filter(
        (c) => c.industry === preferences.activeIndustry
      )
    );
  }, [preferences.companies, preferences.activeIndustry]);

  const visibleCompanies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return sortWithPinned(
        preferences.companies.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q) ||
            (c.ticker?.toLowerCase().includes(q) ?? false) ||
            (c.notes?.toLowerCase().includes(q) ?? false)
        )
      );
    }
    return companiesInIndustry;
  }, [searchQuery, preferences.companies, companiesInIndustry]);

  // "Search the whole page" for News mode: filter each column's articles by
  // title, summary or source rather than restricting to company names.
  const visibleNewsArticlesByTopic = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return newsArticlesByTopic;
    const filtered: Record<NewsTopicId, TopicArticle[]> = {
      world: [],
      malaysia: [],
      economy: [],
      tech: [],
    };
    for (const topic of NEWS_TOPICS) {
      filtered[topic.id] = newsArticlesByTopic[topic.id].filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [searchQuery, newsArticlesByTopic]);

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
      setMode("companies");
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
  const collapseAll = useCallback(() => setExpanded(new Set()), []);

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
      setMode("companies");
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
      if (searchQuery.trim() || isVirtualIndustry) return;
      reorderCompaniesInIndustry(preferences.activeIndustry, orderedIds);
    },
    [
      searchQuery,
      isVirtualIndustry,
      reorderCompaniesInIndustry,
      preferences.activeIndustry,
    ]
  );

  const lastUpdatedLabel = lastFetchedAt
    ? `Updated ${formatDistanceToNow(lastFetchedAt, { addSuffix: true })}`
    : null;

  const newsStatusLabel = newsFetchedAt
    ? `Updated ${formatDistanceToNow(newsFetchedAt, { addSuffix: true })}`
    : "World, Malaysia, Economy and Tech headlines";

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
        setCustomizeOpen(false);
        setSuggestionsOpen(false);
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

  if (showWelcome) {
    return (
      <WelcomeLanding
        name={profileName}
        theme={theme}
        onOpenTutorial={() => {
          setShowWelcome(false);
          setTutorialOpen(true);
        }}
        onReadGeneralNews={() => {
          setShowWelcome(false);
          setMode("news");
        }}
        onFetchCompanyNews={() => {
          setShowWelcome(false);
          setMode("companies");
          fetchAllInIndustry();
        }}
      />
    );
  }

  const focusedId =
    focusedIndex != null ? visibleCompanies[focusedIndex]?.id ?? null : null;

  const fontStyle: React.CSSProperties = {
    fontFamily: FONT_FAMILY_PRESETS[uiSettings.fontFamily].stack,
  };
  (fontStyle as Record<string, string | number>).zoom =
    FONT_SCALE_PRESETS[uiSettings.fontScale].value;

  return (
    <div
      style={fontStyle}
      className="flex h-screen flex-col overflow-hidden lg:flex-row"
    >
      <Sidebar
        theme={theme}
        mode={mode}
        onLogoClick={toggleMode}
        logoTitle={mode === "companies" ? "Switch to News" : "Switch to Companies"}
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
        accent={uiSettings.accent}
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

      <div
        className={`relative flex min-h-0 flex-1 flex-col ${BACKGROUND_PRESETS[uiSettings.background].pageClass}`}
      >
        <DogWatermark theme={theme} />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <TopBar
          mode={mode}
          profileName={profileName}
          onLogOut={onLogOut}
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
          accent={uiSettings.accent}
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
          onOpenCustomize={() => setCustomizeOpen(true)}
          onCollapseAll={collapseAll}
          newsDays={newsDays}
          onSetNewsDays={setNewsDays}
          newsLoading={newsLoading}
          onRefreshNews={() => void fetchNewsBoard(newsDays)}
          newsStatusLabel={newsStatusLabel}
        />

        {mode === "news" ? (
          <NewsBoard
            articlesByTopic={visibleNewsArticlesByTopic}
            errorsByTopic={newsErrorsByTopic}
            loading={newsLoading}
            topicOrder={uiSettings.newsTopicOrder}
            onReorderTopics={setNewsTopicOrder}
          />
        ) : (
          <>
            {sourcesOpen && (
              <SourcesPanel
                sources={preferences.sources}
                onAddSource={addSource}
                onRemoveSource={removeSource}
                onResetSources={resetSources}
                onClearCache={clearCache}
                onOpenSuggestions={() => setSuggestionsOpen(true)}
              />
            )}

            <CompanyList
              companies={visibleCompanies}
              industries={preferences.industries}
              showIndustryLabel={
                searchQuery.trim().length > 0 || isVirtualIndustry
              }
              selected={selected}
              expanded={expanded}
              newsCache={newsCache}
              loadingSet={loadingSet}
              days={preferences.days}
              sourceNames={enabledSourceNames}
              density={uiSettings.density}
              background={uiSettings.background}
              focusedId={focusedId}
              isArticleSeen={isSeen}
              enableDrag={searchQuery.trim().length === 0 && !isVirtualIndustry}
              emptyMessage={
                searchQuery.trim()
                  ? "No companies matched."
                  : preferences.activeIndustry === WATCHLIST_INDUSTRY
                    ? "No companies starred yet. Click ⭐ on a company to add it here."
                    : "No companies. Click ✏️ Edit Lists to add some."
              }
              onToggleSelect={toggleSelect}
              onToggleExpand={toggleExpand}
              onRefresh={refreshCompany}
              onTogglePin={togglePinCompany}
              onToggleStar={toggleStarCompany}
              onUpdateNotes={updateCompanyNotes}
              onReorder={handleReorderCompanies}
            />
          </>
        )}
        </div>
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
        <SpotlightTour
          steps={TOUR_STEPS}
          onClose={() => {
            setTutorialOpen(false);
            markTutorialSeen();
          }}
        />
      )}

      {customizeOpen && (
        <CustomizePanel
          accent={uiSettings.accent}
          fontFamily={uiSettings.fontFamily}
          fontScale={uiSettings.fontScale}
          background={uiSettings.background}
          onSetAccent={setAccent}
          onSetFontFamily={setFontFamily}
          onSetFontScale={setFontScale}
          onSetBackground={setBackground}
          onClose={() => setCustomizeOpen(false)}
        />
      )}

      {suggestionsOpen && (
        <SuggestedSources
          existingSources={preferences.sources}
          onAdd={addSource}
          onClose={() => setSuggestionsOpen(false)}
        />
      )}
    </div>
  );
}
