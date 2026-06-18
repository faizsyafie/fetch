"use client";

import { useState } from "react";
import { INDUSTRIES, TIME_FRAME_OPTIONS } from "@/lib/defaults";
import type { Company, Industry, NewsSource, TimeFrameDays } from "@/lib/types";

interface SidebarProps {
  companies: Company[];
  sources: NewsSource[];
  days: TimeFrameDays;
  selectedIndustries: Industry[];
  onAddCompany: (name: string, industry: Industry) => void;
  onRemoveCompany: (id: string) => void;
  onToggleIndustry: (industry: Industry) => void;
  onSetDays: (days: TimeFrameDays) => void;
  onToggleSource: (id: string) => void;
  onAddSource: (name: string, domain: string, feedUrls: string[]) => void;
  onRemoveSource: (id: string) => void;
  onUpdateSource: (id: string, updates: Partial<NewsSource>) => void;
  onResetSources: () => void;
  onLoadSamples: () => void;
  onFetch: () => void;
  loading: boolean;
}

export function Sidebar({
  companies,
  sources,
  days,
  selectedIndustries,
  onAddCompany,
  onRemoveCompany,
  onToggleIndustry,
  onSetDays,
  onToggleSource,
  onAddSource,
  onRemoveSource,
  onUpdateSource,
  onResetSources,
  onLoadSamples,
  onFetch,
  loading,
}: SidebarProps) {
  const [companyName, setCompanyName] = useState("");
  const [companyIndustry, setCompanyIndustry] =
    useState<Industry>("Consumer");
  const [sourceName, setSourceName] = useState("");
  const [sourceDomain, setSourceDomain] = useState("");
  const [sourceFeeds, setSourceFeeds] = useState("");
  const [showSourceForm, setShowSourceForm] = useState(false);

  const visibleCompanies = companies.filter((c) =>
    selectedIndustries.includes(c.industry)
  );

  function handleAddCompany(e: React.FormEvent) {
    e.preventDefault();
    onAddCompany(companyName, companyIndustry);
    setCompanyName("");
  }

  function handleAddSource(e: React.FormEvent) {
    e.preventDefault();
    const feeds = sourceFeeds
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    onAddSource(sourceName, sourceDomain, feeds);
    setSourceName("");
    setSourceDomain("");
    setSourceFeeds("");
    setShowSourceForm(false);
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-800 bg-slate-950 text-slate-100 lg:w-96 lg:shrink-0">
      <div className="border-b border-slate-800 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Credit News Analyst
        </p>
        <h1 className="mt-1 text-lg font-semibold text-white">
          Company Watchlist
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Monitor RSS coverage across industries and sources.
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Industries
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {INDUSTRIES.map((industry) => {
              const active = selectedIndustries.includes(industry);
              return (
                <button
                  key={industry}
                  type="button"
                  onClick={() => onToggleIndustry(industry)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    active
                      ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                  }`}
                >
                  {industry}
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Time Frame
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIME_FRAME_OPTIONS.map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => onSetDays(option.days)}
                className={`rounded-lg px-3 py-2 text-left text-sm transition ${
                  days === option.days
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Companies ({visibleCompanies.length})
            </h2>
            <button
              type="button"
              onClick={onLoadSamples}
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              Load samples
            </button>
          </div>

          <form onSubmit={handleAddCompany} className="mb-3 space-y-2">
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name (e.g. Apple)"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <select
              value={companyIndustry}
              onChange={(e) =>
                setCompanyIndustry(e.target.value as Industry)
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              {INDUSTRIES.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Add to watchlist
            </button>
          </form>

          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {visibleCompanies.length === 0 ? (
              <li className="rounded-lg border border-dashed border-slate-700 px-3 py-4 text-center text-sm text-slate-500">
                No companies in selected industries.
              </li>
            ) : (
              visibleCompanies.map((company) => (
                <li
                  key={company.id}
                  className="flex items-center justify-between rounded-lg bg-slate-900 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {company.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {company.industry}
                      {company.ticker ? ` · ${company.ticker}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveCompany(company.id)}
                    className="text-xs text-slate-500 hover:text-red-400"
                    aria-label={`Remove ${company.name}`}
                  >
                    Remove
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              News Sources
            </h2>
            <button
              type="button"
              onClick={onResetSources}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              Reset defaults
            </button>
          </div>

          <ul className="space-y-2">
            {sources.map((source) => (
              <li
                key={source.id}
                className="rounded-lg border border-slate-800 bg-slate-900 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={source.enabled}
                      onChange={() => onToggleSource(source.id)}
                      className="mt-1 rounded border-slate-600 bg-slate-800 text-emerald-500"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">
                        {source.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {source.domain}
                      </span>
                    </span>
                  </label>
                  {!source.isDefault && (
                    <button
                      type="button"
                      onClick={() => onRemoveSource(source.id)}
                      className="text-xs text-slate-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  )}
                </div>
                {source.feedUrls.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-slate-500">
                      {source.feedUrls.length} direct RSS feed
                      {source.feedUrls.length > 1 ? "s" : ""}
                    </summary>
                    <textarea
                      value={source.feedUrls.join("\n")}
                      onChange={(e) =>
                        onUpdateSource(source.id, {
                          feedUrls: e.target.value
                            .split("\n")
                            .map((f) => f.trim())
                            .filter(Boolean),
                        })
                      }
                      rows={3}
                      className="mt-2 w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300"
                    />
                  </details>
                )}
              </li>
            ))}
          </ul>

          {showSourceForm ? (
            <form onSubmit={handleAddSource} className="mt-3 space-y-2">
              <input
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Source name"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <input
                value={sourceDomain}
                onChange={(e) => setSourceDomain(e.target.value)}
                placeholder="Domain (e.g. ft.com)"
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <textarea
                value={sourceFeeds}
                onChange={(e) => setSourceFeeds(e.target.value)}
                placeholder="Optional direct RSS URLs (one per line)"
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-600"
                >
                  Save source
                </button>
                <button
                  type="button"
                  onClick={() => setShowSourceForm(false)}
                  className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowSourceForm(true)}
              className="mt-3 w-full rounded-lg border border-dashed border-slate-700 px-3 py-2 text-sm text-slate-400 hover:border-slate-600 hover:text-slate-200"
            >
              + Add custom source
            </button>
          )}
        </section>
      </div>

      <div className="border-t border-slate-800 p-5">
        <button
          type="button"
          onClick={onFetch}
          disabled={loading || visibleCompanies.length === 0}
          className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Fetching news…" : "Fetch news"}
        </button>
      </div>
    </aside>
  );
}
