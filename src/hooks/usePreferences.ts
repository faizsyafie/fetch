"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ALL_LINKS_CATEGORY,
  DEFAULT_INDUSTRY_EMOJI,
  DEFAULT_SOURCES,
  INDUSTRIES,
  SAMPLE_COMPANIES,
  defaultIndustryEmojis,
  isReservedIndustryName,
  isReservedLinkCategoryName,
} from "@/lib/defaults";
import type {
  AppPreferences,
  Company,
  Industry,
  NewsSource,
  SavedLink,
  TimeFrameDays,
} from "@/lib/types";

const DEFAULT_PREFERENCES: AppPreferences = {
  companies: SAMPLE_COMPANIES,
  sources: DEFAULT_SOURCES,
  days: 7,
  industries: INDUSTRIES,
  activeIndustry: INDUSTRIES[0],
  industryEmojis: defaultIndustryEmojis(INDUSTRIES),
  links: [],
  linkCategories: [],
  activeLinkCategory: ALL_LINKS_CATEGORY,
};

function normalizePreferences(
  parsed: Partial<AppPreferences> | null
): AppPreferences {
  if (!parsed) return DEFAULT_PREFERENCES;
  const industries = parsed.industries?.length ? parsed.industries : INDUSTRIES;
  const industryEmojis = {
    ...defaultIndustryEmojis(industries),
    ...parsed.industryEmojis,
  };
  return {
    ...DEFAULT_PREFERENCES,
    ...parsed,
    sources: parsed.sources?.length ? parsed.sources : DEFAULT_SOURCES,
    industries,
    activeIndustry: parsed.activeIndustry ?? industries[0],
    industryEmojis,
    links: parsed.links ?? [],
    linkCategories: parsed.linkCategories ?? [],
    activeLinkCategory: parsed.activeLinkCategory ?? ALL_LINKS_CATEGORY,
  };
}

const SAVE_DEBOUNCE_MS = 600;

// Preferences are synced to a shared profile on the server (see
// /api/preferences/[name]) instead of localStorage, so every team member
// using the same profile name sees the same watchlist/industries/sources.
export function usePreferences(profileName: string | null) {
  const [preferences, setPreferences] =
    useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextSave = useRef(false);

  useEffect(() => {
    if (!profileName) {
      setHydrated(false);
      return;
    }
    let cancelled = false;
    setHydrated(false);
    setSyncError(false);

    fetch(`/api/preferences/${encodeURIComponent(profileName)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load preferences.");
        return res.json();
      })
      .then((data: { preferences: Partial<AppPreferences> | null }) => {
        if (cancelled) return;
        skipNextSave.current = true;
        setPreferences(normalizePreferences(data.preferences));
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        skipNextSave.current = true;
        setPreferences(DEFAULT_PREFERENCES);
        setSyncError(true);
        setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [profileName]);

  useEffect(() => {
    if (!hydrated || !profileName) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch(`/api/preferences/${encodeURIComponent(profileName)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to save.");
          setSyncError(false);
        })
        .catch(() => setSyncError(true));
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [preferences, hydrated, profileName]);

  const addCompany = useCallback((name: string, industry: Industry) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPreferences((prev) => {
      if (
        prev.companies.some(
          (c) => c.name.toLowerCase() === trimmed.toLowerCase()
        )
      ) {
        return prev;
      }
      const company: Company = {
        id: `custom-${Date.now()}`,
        name: trimmed,
        industry,
      };
      return { ...prev, companies: [...prev.companies, company] };
    });
  }, []);

  const removeCompany = useCallback((id: string) => {
    setPreferences((prev) => ({
      ...prev,
      companies: prev.companies.filter((c) => c.id !== id),
    }));
  }, []);

  const togglePinCompany = useCallback((id: string) => {
    setPreferences((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === id ? { ...c, pinned: !c.pinned } : c
      ),
    }));
  }, []);

  const toggleStarCompany = useCallback((id: string) => {
    setPreferences((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === id ? { ...c, starred: !c.starred } : c
      ),
    }));
  }, []);

  const updateCompanyNotes = useCallback((id: string, notes: string) => {
    setPreferences((prev) => ({
      ...prev,
      companies: prev.companies.map((c) =>
        c.id === id ? { ...c, notes } : c
      ),
    }));
  }, []);

  const reorderCompaniesInIndustry = useCallback(
    (industry: Industry, orderedIds: string[]) => {
      setPreferences((prev) => {
        const byId = new Map(prev.companies.map((c) => [c.id, c]));
        const reordered = orderedIds
          .map((id) => byId.get(id))
          .filter((c): c is Company => Boolean(c));
        const firstIndex = prev.companies.findIndex(
          (c) => c.industry === industry
        );
        if (firstIndex === -1) return prev;
        const others = prev.companies.filter((c) => c.industry !== industry);
        const precedingOthers = prev.companies
          .slice(0, firstIndex)
          .filter((c) => c.industry !== industry).length;
        const companies = [
          ...others.slice(0, precedingOthers),
          ...reordered,
          ...others.slice(precedingOthers),
        ];
        return { ...prev, companies };
      });
    },
    []
  );

  const reorderIndustries = useCallback((orderedIndustries: Industry[]) => {
    setPreferences((prev) => {
      if (
        orderedIndustries.length !== prev.industries.length ||
        !orderedIndustries.every((i) => prev.industries.includes(i))
      ) {
        return prev;
      }
      return { ...prev, industries: orderedIndustries };
    });
  }, []);

  const setActiveIndustry = useCallback((industry: Industry) => {
    setPreferences((prev) => ({ ...prev, activeIndustry: industry }));
  }, []);

  const addIndustry = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed || isReservedIndustryName(trimmed)) return;
    setPreferences((prev) => {
      if (prev.industries.includes(trimmed)) return prev;
      return {
        ...prev,
        industries: [...prev.industries, trimmed],
        activeIndustry: trimmed,
        industryEmojis: {
          ...prev.industryEmojis,
          [trimmed]: DEFAULT_INDUSTRY_EMOJI,
        },
      };
    });
  }, []);

  const renameIndustry = useCallback((oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (isReservedIndustryName(oldName)) return;
    setPreferences((prev) => {
      if (
        !trimmed ||
        trimmed === oldName ||
        isReservedIndustryName(trimmed) ||
        prev.industries.includes(trimmed)
      ) {
        return prev;
      }
      const { [oldName]: emoji, ...restEmojis } = prev.industryEmojis;
      return {
        ...prev,
        industries: prev.industries.map((i) => (i === oldName ? trimmed : i)),
        companies: prev.companies.map((c) =>
          c.industry === oldName ? { ...c, industry: trimmed } : c
        ),
        activeIndustry:
          prev.activeIndustry === oldName ? trimmed : prev.activeIndustry,
        industryEmojis: {
          ...restEmojis,
          [trimmed]: emoji ?? DEFAULT_INDUSTRY_EMOJI,
        },
      };
    });
  }, []);

  const removeIndustry = useCallback((name: string) => {
    if (isReservedIndustryName(name)) return;
    setPreferences((prev) => {
      const industries = prev.industries.filter((i) => i !== name);
      if (industries.length === 0) return prev;
      const industryEmojis = Object.fromEntries(
        Object.entries(prev.industryEmojis).filter(([key]) => key !== name)
      );
      return {
        ...prev,
        industries,
        companies: prev.companies.filter((c) => c.industry !== name),
        activeIndustry:
          prev.activeIndustry === name ? industries[0] : prev.activeIndustry,
        industryEmojis,
      };
    });
  }, []);

  const setIndustryEmoji = useCallback((industry: Industry, emoji: string) => {
    const trimmed = emoji.trim();
    if (!trimmed) return;
    setPreferences((prev) => ({
      ...prev,
      industryEmojis: { ...prev.industryEmojis, [industry]: trimmed },
    }));
  }, []);

  const setDays = useCallback((days: TimeFrameDays) => {
    setPreferences((prev) => ({ ...prev, days }));
  }, []);

  const toggleSource = useCallback((id: string) => {
    setPreferences((prev) => ({
      ...prev,
      sources: prev.sources.map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  }, []);

  const addSource = useCallback(
    (name: string, domain: string, feedUrls: string[]) => {
      const trimmedName = name.trim();
      const trimmedDomain = domain.trim();
      if (!trimmedName || !trimmedDomain) return;
      setPreferences((prev) => {
        if (prev.sources.some((s) => s.domain === trimmedDomain)) return prev;
        const source: NewsSource = {
          id: `source-${Date.now()}`,
          name: trimmedName,
          domain: trimmedDomain,
          feedUrls,
          enabled: true,
        };
        return { ...prev, sources: [...prev.sources, source] };
      });
    },
    []
  );

  const removeSource = useCallback((id: string) => {
    setPreferences((prev) => ({
      ...prev,
      sources: prev.sources.filter((s) => s.id !== id),
    }));
  }, []);

  const updateSource = useCallback(
    (id: string, updates: Partial<NewsSource>) => {
      setPreferences((prev) => ({
        ...prev,
        sources: prev.sources.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      }));
    },
    []
  );

  const resetSources = useCallback(() => {
    setPreferences((prev) => ({ ...prev, sources: DEFAULT_SOURCES }));
  }, []);

  const loadSampleCompanies = useCallback(() => {
    setPreferences((prev) => ({ ...prev, companies: SAMPLE_COMPANIES }));
  }, []);

  const saveLink = useCallback(
    (input: { url: string; title: string; notes: string; category: string }) => {
      const url = input.url.trim();
      if (!url) return null;
      const now = new Date().toISOString();
      let resultId: string | null = null;
      setPreferences((prev) => {
        const existing = prev.links.find((l) => l.url === url);
        if (existing) {
          resultId = existing.id;
          return prev;
        }
        const link: SavedLink = {
          id: `link-${Date.now()}`,
          url,
          title: input.title.trim() || url,
          notes: input.notes,
          category: input.category,
          pinned: false,
          savedAt: now,
          editedAt: now,
        };
        resultId = link.id;
        return { ...prev, links: [link, ...prev.links] };
      });
      return resultId;
    },
    []
  );

  const findLinkByUrl = useCallback(
    (url: string) => preferences.links.find((l) => l.url === url.trim()) ?? null,
    [preferences.links]
  );

  const updateLink = useCallback(
    (id: string, updates: Partial<Pick<SavedLink, "title" | "notes" | "category">>) => {
      setPreferences((prev) => ({
        ...prev,
        links: prev.links.map((l) =>
          l.id === id
            ? { ...l, ...updates, editedAt: new Date().toISOString() }
            : l
        ),
      }));
    },
    []
  );

  const deleteLink = useCallback((id: string) => {
    setPreferences((prev) => ({
      ...prev,
      links: prev.links.filter((l) => l.id !== id),
    }));
  }, []);

  const toggleLinkPinned = useCallback((id: string) => {
    setPreferences((prev) => ({
      ...prev,
      links: prev.links.map((l) =>
        l.id === id ? { ...l, pinned: !l.pinned } : l
      ),
    }));
  }, []);

  const setActiveLinkCategory = useCallback((category: string) => {
    setPreferences((prev) => ({ ...prev, activeLinkCategory: category }));
  }, []);

  const addLinkCategory = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed || isReservedLinkCategoryName(trimmed)) return;
    setPreferences((prev) => {
      if (prev.linkCategories.includes(trimmed)) return prev;
      return {
        ...prev,
        linkCategories: [...prev.linkCategories, trimmed],
        activeLinkCategory: trimmed,
      };
    });
  }, []);

  const renameLinkCategory = useCallback((oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (isReservedLinkCategoryName(oldName)) return;
    setPreferences((prev) => {
      if (
        !trimmed ||
        trimmed === oldName ||
        isReservedLinkCategoryName(trimmed) ||
        prev.linkCategories.includes(trimmed)
      ) {
        return prev;
      }
      return {
        ...prev,
        linkCategories: prev.linkCategories.map((c) =>
          c === oldName ? trimmed : c
        ),
        links: prev.links.map((l) =>
          l.category === oldName ? { ...l, category: trimmed } : l
        ),
        activeLinkCategory:
          prev.activeLinkCategory === oldName ? trimmed : prev.activeLinkCategory,
      };
    });
  }, []);

  // Links in a removed category simply fall back to Uncategorized — see the
  // comment on RESERVED_LINK_CATEGORY_NAMES, nothing needs to touch `links`.
  const removeLinkCategory = useCallback((name: string) => {
    if (isReservedLinkCategoryName(name)) return;
    setPreferences((prev) => ({
      ...prev,
      linkCategories: prev.linkCategories.filter((c) => c !== name),
      activeLinkCategory:
        prev.activeLinkCategory === name
          ? ALL_LINKS_CATEGORY
          : prev.activeLinkCategory,
    }));
  }, []);

  const reorderLinkCategories = useCallback((ordered: string[]) => {
    setPreferences((prev) => {
      if (
        ordered.length !== prev.linkCategories.length ||
        !ordered.every((c) => prev.linkCategories.includes(c))
      ) {
        return prev;
      }
      return { ...prev, linkCategories: ordered };
    });
  }, []);

  return {
    preferences,
    hydrated,
    syncError,
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
    toggleSource,
    addSource,
    removeSource,
    updateSource,
    resetSources,
    loadSampleCompanies,
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
  };
}
