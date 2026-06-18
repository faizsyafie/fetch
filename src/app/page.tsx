"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { NewsFeed } from "@/components/NewsFeed";
import { Sidebar } from "@/components/Sidebar";
import { usePreferences } from "@/hooks/usePreferences";
import type { FetchNewsResponse, NewsArticle } from "@/lib/types";

export default function Dashboard() {
  const {
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
  } = usePreferences();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const visibleCompanies = useMemo(
    () =>
      preferences.companies.filter((c) =>
        preferences.selectedIndustries.includes(c.industry)
      ),
    [preferences.companies, preferences.selectedIndustries]
  );

  const enabledSources = useMemo(
    () => preferences.sources.filter((s) => s.enabled),
    [preferences.sources]
  );

  const fetchNews = useCallback(async () => {
    if (visibleCompanies.length === 0) return;

    setLoading(true);
    setErrors([]);

    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companies: visibleCompanies,
          sources: preferences.sources,
          days: preferences.days,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Failed to fetch news.");
      }

      const data = (await response.json()) as FetchNewsResponse;
      setArticles(data.articles);
      setErrors(data.errors);
      setFetchedAt(data.fetchedAt);
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Unexpected error occurred.",
      ]);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [visibleCompanies, preferences.sources, preferences.days]);

  useEffect(() => {
    if (!hydrated || visibleCompanies.length === 0) return;
    void fetchNews();
  }, [hydrated, fetchNews, visibleCompanies.length]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading preferences…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar
        companies={preferences.companies}
        sources={preferences.sources}
        days={preferences.days}
        selectedIndustries={preferences.selectedIndustries}
        onAddCompany={addCompany}
        onRemoveCompany={removeCompany}
        onToggleIndustry={toggleIndustry}
        onSetDays={setDays}
        onToggleSource={toggleSource}
        onAddSource={addSource}
        onRemoveSource={removeSource}
        onUpdateSource={updateSource}
        onResetSources={resetSources}
        onLoadSamples={loadSampleCompanies}
        onFetch={fetchNews}
        loading={loading}
      />
      <NewsFeed
        articles={articles}
        fetchedAt={fetchedAt}
        errors={errors}
        loading={loading}
        companyCount={visibleCompanies.length}
        sourceCount={enabledSources.length}
        days={preferences.days}
      />
    </div>
  );
}
