"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_SOURCES,
  SAMPLE_COMPANIES,
  STORAGE_KEY,
} from "@/lib/defaults";
import type {
  AppPreferences,
  Company,
  Industry,
  NewsSource,
  TimeFrameDays,
} from "@/lib/types";

const DEFAULT_PREFERENCES: AppPreferences = {
  companies: SAMPLE_COMPANIES.slice(0, 6),
  sources: DEFAULT_SOURCES,
  days: 10,
  selectedIndustries: [
    "Consumer",
    "Energy",
    "Information Technology",
    "Communications",
  ],
};

function loadPreferences(): AppPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as AppPreferences;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      sources: parsed.sources?.length ? parsed.sources : DEFAULT_SOURCES,
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

  const toggleIndustry = useCallback((industry: Industry) => {
    setPreferences((prev) => {
      const selected = prev.selectedIndustries.includes(industry)
        ? prev.selectedIndustries.filter((i) => i !== industry)
        : [...prev.selectedIndustries, industry];
      return { ...prev, selectedIndustries: selected };
    });
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
    toggleIndustry,
    setDays,
    toggleSource,
    addSource,
    removeSource,
    updateSource,
    resetSources,
    loadSampleCompanies,
  };
}
