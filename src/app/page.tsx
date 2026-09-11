"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ViewTransition,
} from "react";
import { formatDistanceToNow } from "date-fns";
import { CommandPalette } from "@/components/CommandPalette";
import { CompanyList, type NewsCacheEntry } from "@/components/CompanyList";
import { CustomizePanel } from "@/components/CustomizePanel";
import { EditThemesModal } from "@/components/EditThemesModal";
import { FeedbackModal } from "@/components/FeedbackModal";
import { DogWatermark } from "@/components/DogWatermark";
import { NewsBoard } from "@/components/NewsBoard";
import { ProfilePicker } from "@/components/ProfilePicker";
import { SaveLinkModal } from "@/components/SaveLinkModal";
import { SavedView } from "@/components/SavedView";
import { Sidebar, type AppMode } from "@/components/Sidebar";
import { SkeletonLoader } from "@/components/SkeletonLoader";
import { SourcesModal } from "@/components/SourcesModal";
import { SpotlightTour } from "@/components/SpotlightTour";
import { TopBar } from "@/components/TopBar";
import { useProfile } from "@/hooks/useProfile";
import { usePreferences } from "@/hooks/usePreferences";
import { useSeenArticles } from "@/hooks/useSeenArticles";
import { useTheme } from "@/hooks/useTheme";
import { readUiSettings, useUiSettings } from "@/hooks/useUiSettings";
import {
  ALL_INDUSTRY,
  ALL_LINKS_CATEGORY,
  ALL_LINKS_EMOJI,
  DEFAULT_INDUSTRY_EMOJI,
  FONT_FAMILY_PRESETS,
  FONT_SCALE_PRESETS,
  PINNED_LINKS_CATEGORY,
  PINNED_LINKS_EMOJI,
  UNCATEGORIZED_CATEGORY,
  UNCATEGORIZED_LINKS_EMOJI,
  WATCHLIST_INDUSTRY,
  getIndustryEmoji,
  linkCategoryColor,
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
  NewsTimeFrame,
  NewsTopicId,
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
    saveLink,
    findLinkByUrl,
    updateLink,
    deleteLink,
    toggleLinkPinned,
    setActiveLinkCategory,
    addLinkCategory,
    renameLinkCategory,
    removeLinkCategory,
    reorderLinkCategories,
    setLinkCategoryColor,
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
    setNewsTopicOrder,
  } = useUiSettings();
  const { hydrated: seenHydrated, markSeen, isSeen } = useSeenArticles();

  const [searchQuery, setSearchQuery] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [categoryEditMode, setCategoryEditMode] = useState(false);
  const [companiesListExpanded, setCompaniesListExpanded] = useState(false);
  const [savedListExpanded, setSavedListExpanded] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [themesOpen, setThemesOpen] = useState(false);
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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  // Lands on General (news) right after picking a profile — there's no
  // separate welcome screen anymore.
  const [mode, setModeState] = useState<AppMode>("news");
  // Wrapped in startTransition so the ViewTransition around the board content
  // (keyed on `mode`) actually activates — plain setState doesn't trigger it.
  const setMode = useCallback(
    (next: AppMode | ((prev: AppMode) => AppMode)) => {
      startTransition(() => {
        setModeState(next);
      });
    },
    []
  );
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [saveLinkModal, setSaveLinkModal] = useState<{
    url?: string;
    title?: string;
  } | null>(null);
  const [newsDays, setNewsDaysState] = useState<NewsTimeFrame>("now");
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsArticlesByTopic, setNewsArticlesByTopic] =
    useState<Record<NewsTopicId, TopicArticle[]>>(EMPTY_NEWS_ARTICLES);
  const [newsErrorsByTopic, setNewsErrorsByTopic] =
    useState<Record<NewsTopicId, string[]>>(EMPTY_NEWS_ERRORS);

  const selectMode = useCallback(
    (next: AppMode) => {
      setMode(next);
      setSearchQuery("");
      setSelected(new Set());
      setFocusedIndex(null);
    },
    [setMode]
  );

  // Edit Lists / Edit Categories are page-scoped toggles — leaving a page
  // (by any path: sidebar nav, selecting an industry/category, the
  // tutorial, the command palette) should never leave its edit affordances
  // switched on somewhere the user can't see them. Adjusted during render
  // (React's documented pattern for resetting state when a value changes)
  // rather than in an effect, so it takes effect in the same render as the
  // mode change instead of introducing an extra one.
  const [editModeResetForMode, setEditModeResetForMode] = useState(mode);
  if (mode !== editModeResetForMode) {
    setEditModeResetForMode(mode);
    if (mode !== "companies") setEditMode(false);
    if (mode !== "saved") setCategoryEditMode(false);
  }

  // The tutorial walks through Companies-mode UI first, so always land there
  // before opening it — regardless of which mode (or screen) it was opened
  // from — and expand its sidebar sub-list so the industries step has
  // something to point at.
  const openTutorial = useCallback(() => {
    setMode("companies");
    setCompaniesListExpanded(true);
    setTutorialOpen(true);
  }, [setMode]);

  const fetchNewsBoard = useCallback(async (days: NewsTimeFrame, topics: NewsTopicId[]) => {
    setNewsLoading(true);
    try {
      const response = await fetch("/api/topic-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, topics }),
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
    } catch {
      setNewsErrorsByTopic(
        Object.fromEntries(
          NEWS_TOPICS.map((topic) => [topic.id, ["Failed to fetch news."]])
        ) as Record<NewsTopicId, string[]>
      );
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const setNewsDays = useCallback(
    (days: NewsTimeFrame) => {
      setNewsDaysState(days);
      void fetchNewsBoard(days, uiSettings.newsTopicOrder);
    },
    [fetchNewsBoard, uiSettings.newsTopicOrder]
  );

  // Refresh as soon as the board is switched into — i.e. every time the
  // user flips to News mode — with no background polling afterward.
  useEffect(() => {
    if (mode === "news") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void fetchNewsBoard(newsDays, uiSettings.newsTopicOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Enabling a topic should populate its column right away rather than
  // waiting for the next mode-switch or manual refresh.
  const handleToggleTopic = useCallback(
    (id: NewsTopicId, enabled: boolean) => {
      const next = enabled
        ? [...uiSettings.newsTopicOrder, id]
        : uiSettings.newsTopicOrder.filter((t) => t !== id);
      setNewsTopicOrder(next);
      void fetchNewsBoard(newsDays, next);
    },
    [uiSettings.newsTopicOrder, setNewsTopicOrder, fetchNewsBoard, newsDays]
  );

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
    if (!readUiSettings().tutorialSeen) openTutorial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const filtered: Record<NewsTopicId, TopicArticle[]> = { ...EMPTY_NEWS_ARTICLES };
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

  const visibleLinks = useMemo(() => {
    const { activeLinkCategory, linkCategories, links } = preferences;
    let base = links;
    if (activeLinkCategory === PINNED_LINKS_CATEGORY) {
      base = base.filter((l) => l.pinned);
    } else if (activeLinkCategory === UNCATEGORIZED_CATEGORY) {
      base = base.filter((l) => !linkCategories.includes(l.category));
    } else if (activeLinkCategory !== ALL_LINKS_CATEGORY) {
      base = base.filter((l) => l.category === activeLinkCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      base = base.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.notes.toLowerCase().includes(q)
      );
    }
    return base;
  }, [preferences, searchQuery]);

  const isLinkSaved = useCallback(
    (url: string) => preferences.links.some((l) => l.url === url),
    [preferences.links]
  );

  const industryTabPinnedItems = useMemo(
    () => [
      {
        key: ALL_INDUSTRY,
        emoji: getIndustryEmoji(ALL_INDUSTRY, preferences.industryEmojis),
        label: ALL_INDUSTRY,
        count: preferences.companies.length,
      },
      {
        key: WATCHLIST_INDUSTRY,
        emoji: getIndustryEmoji(WATCHLIST_INDUSTRY, preferences.industryEmojis),
        label: WATCHLIST_INDUSTRY,
        count: preferences.companies.filter((c) => c.starred).length,
      },
    ],
    [preferences.industryEmojis, preferences.companies]
  );

  const industryTabItems = useMemo(
    () =>
      preferences.industries.map((industry) => ({
        key: industry,
        emoji: preferences.industryEmojis[industry] ?? DEFAULT_INDUSTRY_EMOJI,
        label: industry,
        count: preferences.companies.filter((c) => c.industry === industry).length,
      })),
    [preferences.industries, preferences.industryEmojis, preferences.companies]
  );

  const categoryTabPinnedItems = useMemo(
    () => [
      {
        key: ALL_LINKS_CATEGORY,
        emoji: ALL_LINKS_EMOJI,
        label: ALL_LINKS_CATEGORY,
        count: preferences.links.length,
      },
      {
        key: PINNED_LINKS_CATEGORY,
        emoji: PINNED_LINKS_EMOJI,
        label: PINNED_LINKS_CATEGORY,
        count: preferences.links.filter((l) => l.pinned).length,
      },
    ],
    [preferences.links]
  );

  const categoryTabItems = useMemo(
    () =>
      preferences.linkCategories.map((category) => ({
        key: category,
        emoji: "",
        swatchColor: linkCategoryColor(
          category,
          preferences.linkCategories,
          preferences.linkCategoryColors
        ),
        label: category,
        count: preferences.links.filter((l) => l.category === category).length,
      })),
    [preferences.linkCategories, preferences.linkCategoryColors, preferences.links]
  );

  const uncategorizedTabItem = useMemo(
    () => ({
      key: UNCATEGORIZED_CATEGORY,
      emoji: UNCATEGORIZED_LINKS_EMOJI,
      label: UNCATEGORIZED_CATEGORY,
      count: preferences.links.filter(
        (l) => !preferences.linkCategories.includes(l.category)
      ).length,
    }),
    [preferences.links, preferences.linkCategories]
  );

  // Bookmark icon on an article card is a toggle: save it (opening the modal
  // to add a title/notes) or, if already saved, un-save it immediately.
  const handleArticleBookmarkClick = useCallback(
    (article: { link: string; title: string }) => {
      const existing = findLinkByUrl(article.link);
      if (existing) {
        deleteLink(existing.id);
      } else {
        setSaveLinkModal({ url: article.link, title: article.title });
      }
    },
    [findLinkByUrl, deleteLink]
  );

  const defaultSaveCategory =
    mode === "saved" &&
    preferences.activeLinkCategory !== ALL_LINKS_CATEGORY &&
    preferences.activeLinkCategory !== PINNED_LINKS_CATEGORY
      ? preferences.activeLinkCategory
      : UNCATEGORIZED_CATEGORY;

  // saveLink no-ops (and just returns the existing id) when the URL is
  // already saved, so a re-save never clobbers an existing note.
  const handleSaveLinkSubmit = useCallback(
    (input: { url: string; title: string; notes: string; category: string }) => {
      const id = saveLink(input);
      if (id) setSelectedLinkId(id);
      setSaveLinkModal(null);
    },
    [saveLink]
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
    [setMode, setActiveIndustry, newsCache, loadingSet, fetchCompanyNews, markSeen]
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

  // "Fetch!" is a single smart action: fetch just the checkbox selection
  // when one exists, otherwise the whole active industry.
  const fetchSmart = useCallback(() => {
    const toFetch =
      selected.size > 0
        ? preferences.companies.filter((c) => selected.has(c.id))
        : companiesInIndustry;
    void runBatchFetch(toFetch);
  }, [selected, preferences.companies, companiesInIndustry, runBatchFetch]);

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
    [setMode, setActiveIndustry]
  );

  // The category sub-list lives in the sidebar now, reachable regardless of
  // which page is currently active — so selecting a category, like selecting
  // an industry above, needs to switch the page itself rather than assuming
  // Buried Bones is already showing.
  const handleSelectLinkCategory = useCallback(
    (category: string) => {
      setMode("saved");
      setActiveLinkCategory(category);
      setSearchQuery("");
    },
    [setMode, setActiveLinkCategory]
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
        setSourcesOpen(false);
        setFeedbackOpen(false);
        setThemesOpen(false);
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
        onSelectMode={selectMode}
        sources={preferences.sources}
        days={preferences.days}
        editMode={editMode}
        sourcesOpen={sourcesOpen}
        lastUpdatedLabel={lastUpdatedLabel}
        width={uiSettings.sidebarWidth}
        collapsed={uiSettings.sidebarCollapsed}
        accent={uiSettings.accent}
        onToggleEditMode={() => setEditMode((v) => !v)}
        onToggleSourcesPanel={() => setSourcesOpen((v) => !v)}
        onResizeWidth={setSidebarWidth}
        onToggleCollapsed={toggleSidebarCollapsed}
        categoryEditMode={categoryEditMode}
        onToggleCategoryEditMode={() => setCategoryEditMode((v) => !v)}
        themesOpen={themesOpen}
        onToggleThemesPanel={() => setThemesOpen((v) => !v)}
        companiesListExpanded={companiesListExpanded}
        onToggleCompaniesListExpanded={() => setCompaniesListExpanded((v) => !v)}
        activeIndustry={preferences.activeIndustry}
        industryPinnedItems={industryTabPinnedItems}
        industryItems={industryTabItems}
        onSelectIndustry={handleSelectIndustry}
        onAddIndustry={addIndustry}
        onRenameIndustry={renameIndustry}
        onRemoveIndustry={removeIndustry}
        onReorderIndustries={reorderIndustries}
        onSetIndustryEmoji={setIndustryEmoji}
        savedListExpanded={savedListExpanded}
        onToggleSavedListExpanded={() => setSavedListExpanded((v) => !v)}
        activeLinkCategory={preferences.activeLinkCategory}
        categoryPinnedItems={categoryTabPinnedItems}
        categoryItems={categoryTabItems}
        uncategorizedItem={uncategorizedTabItem}
        onSelectLinkCategory={handleSelectLinkCategory}
        onAddLinkCategory={addLinkCategory}
        onRenameLinkCategory={renameLinkCategory}
        onRemoveLinkCategory={removeLinkCategory}
        onReorderLinkCategories={reorderLinkCategories}
        onSetLinkCategoryColor={setLinkCategoryColor}
      />

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col bg-brand-100 dark:bg-brand-950">
        <DogWatermark theme={theme} />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <TopBar
          mode={mode}
          profileName={profileName}
          onLogOut={onLogOut}
          onOpenFeedback={() => setFeedbackOpen(true)}
          activeIndustry={preferences.activeIndustry}
          industries={preferences.industries}
          companiesInIndustry={companiesInIndustry}
          searchQuery={searchQuery}
          days={preferences.days}
          editMode={editMode}
          accent={uiSettings.accent}
          onSearch={handleSearch}
          onSetDays={setDays}
          onAddCompany={handleAddCompanyTag}
          onRemoveCompany={removeCompany}
          onOpenTutorial={openTutorial}
          onOpenSettings={() => setCustomizeOpen(true)}
          newsDays={newsDays}
          onSetNewsDays={setNewsDays}
          newsLoading={newsLoading}
          onRefreshNews={() => void fetchNewsBoard(newsDays, uiSettings.newsTopicOrder)}
          selectedCount={selected.size}
          totalCount={companiesInIndustry.length}
          batchRunning={batchRunning}
          loadingCount={loadingSet.size}
          onClearSelection={clearSelection}
          onCollapseAll={collapseAll}
          onFetchCompanies={fetchSmart}
        />

        <ViewTransition key={mode} enter="board-fade" exit="board-fade" default="none">
        {mode === "news" ? (
          <NewsBoard
            articlesByTopic={visibleNewsArticlesByTopic}
            errorsByTopic={newsErrorsByTopic}
            loading={newsLoading}
            topicOrder={uiSettings.newsTopicOrder}
            onReorderTopics={setNewsTopicOrder}
            isLinkSaved={isLinkSaved}
            onSaveArticle={handleArticleBookmarkClick}
            accent={uiSettings.accent}
            showCategoryPromo={preferences.linkCategories.length === 0}
            onCreateCategory={() => selectMode("saved")}
            showCompanyPromo={preferences.companies.length === 0}
            onGoToCompanies={() => selectMode("companies")}
          />
        ) : mode === "saved" ? (
          <SavedView
            links={visibleLinks}
            linkCategories={preferences.linkCategories}
            accent={uiSettings.accent}
            onAddLink={() => setSaveLinkModal({})}
            onSelectLink={setSelectedLinkId}
            selectedId={selectedLinkId}
            onUpdateLink={(id, updates) => updateLink(id, updates)}
            onTogglePinned={toggleLinkPinned}
            onDeleteLink={(id) => {
              deleteLink(id);
              setSelectedLinkId((prev) => (prev === id ? null : prev));
            }}
          />
        ) : (
          <>
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
              accent={uiSettings.accent}
              focusedId={focusedId}
              isArticleSeen={isSeen}
              isLinkSaved={isLinkSaved}
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
              onSaveArticle={handleArticleBookmarkClick}
            />
          </>
        )}
        </ViewTransition>
        </div>
      </div>

      {commandPaletteOpen && (
        <CommandPalette
          companies={preferences.companies}
          industries={preferences.industries}
          industryEmojis={preferences.industryEmojis}
          accent={uiSettings.accent}
          onSelectCompany={openCompany}
          onSelectIndustry={handleSelectIndustry}
          onClose={() => setCommandPaletteOpen(false)}
        />
      )}

      {tutorialOpen && (
        <SpotlightTour
          steps={TOUR_STEPS}
          accent={uiSettings.accent}
          onClose={() => {
            setTutorialOpen(false);
            markTutorialSeen();
          }}
        />
      )}

      {customizeOpen && (
        <CustomizePanel
          theme={theme}
          accent={uiSettings.accent}
          fontFamily={uiSettings.fontFamily}
          fontScale={uiSettings.fontScale}
          density={uiSettings.density}
          onToggleTheme={toggleTheme}
          onSetAccent={setAccent}
          onSetFontFamily={setFontFamily}
          onSetFontScale={setFontScale}
          onSetDensity={setDensity}
          onClose={() => setCustomizeOpen(false)}
        />
      )}

      {feedbackOpen && (
        <FeedbackModal
          accent={uiSettings.accent}
          onClose={() => setFeedbackOpen(false)}
        />
      )}

      {themesOpen && (
        <EditThemesModal
          enabledTopics={uiSettings.newsTopicOrder}
          accent={uiSettings.accent}
          onToggle={handleToggleTopic}
          onClose={() => setThemesOpen(false)}
        />
      )}

      {saveLinkModal && (
        <SaveLinkModal
          initialUrl={saveLinkModal.url}
          initialTitle={saveLinkModal.title}
          categories={preferences.linkCategories}
          defaultCategory={defaultSaveCategory}
          accent={uiSettings.accent}
          onSave={handleSaveLinkSubmit}
          onClose={() => setSaveLinkModal(null)}
        />
      )}

      {sourcesOpen && (
        <SourcesModal
          sources={preferences.sources}
          accent={uiSettings.accent}
          onAdd={addSource}
          onRemove={removeSource}
          onResetDefaults={resetSources}
          onClearCache={clearCache}
          onClose={() => setSourcesOpen(false)}
        />
      )}
    </div>
  );
}
