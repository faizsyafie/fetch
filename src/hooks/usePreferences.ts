"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_INDUSTRY_EMOJI,
  DEFAULT_SOURCES,
  INDUSTRIES,
  SAMPLE_COMPANIES,
  STORAGE_KEY,
  defaultIndustryEmojis,
} from "@/lib/defaults";
import type {
  AppPreferences,
  Company,
  Industry,
  NewsSource,
  TimeFrameDays,
} from "@/lib/types";

const DEFAULT_PREFERENCES: AppPreferences = {
  companies: SAMPLE_COMPANIES,
  sources: DEFAULT_SOURCES,
  days: 7,
  industries: INDUSTRIES,
  activeIndustry: INDUSTRIES[0],
  industryEmojis: defaultIndustryEmojis(INDUSTRIES),
};

function loadPreferences(): AppPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as AppPreferences;
    const industries = parsed.industries?.length
      ? parsed.industries
      : INDUSTRIES;
    const industryEmojis = { ...defaultIndustryEmojis(industries), ...parsed.industryEmojis };
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      sources: parsed.sources?.length ? parsed.sources : DEFAULT_SOURCES,
      industries,
      activeIndustry: industries.includes(parsed.activeIndustry)
        ? parsed.activeIndustry
        : industries[0],
      industryEmojis,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function usePreferences() {
  const [preferences, setPreferences] =
    useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreferences(loadPreferences());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences, hydrated]);

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
    if (!trimmed) return;
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
    setPreferences((prev) => {
      if (!trimmed || trimmed === oldName || prev.industries.includes(trimmed)) {
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
      const source: NewsSource = {
        id: `source-${Date.now()}`,
        name: trimmedName,
        domain: trimmedDomain,
        feedUrls,
        enabled: true,
      };
      setPreferences((prev) => ({
        ...prev,
        sources: [...prev.sources, source],
      }));
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

  return {
    preferences,
    hydrated,
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
    toggleSource,
    addSource,
    removeSource,
    updateSource,
    resetSources,
    loadSampleCompanies,
  };
}
