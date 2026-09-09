"use client";

import { useState } from "react";
import type { NewsSource } from "@/lib/types";

interface SourcesPanelProps {
  sources: NewsSource[];
  onAddSource: (name: string, domain: string, feedUrls: string[]) => void;
  onRemoveSource: (id: string) => void;
  onResetSources: () => void;
  onClearCache: () => void;
  onOpenSuggestions: () => void;
}

export function SourcesPanel({
  sources,
  onAddSource,
  onRemoveSource,
  onResetSources,
  onClearCache,
  onOpenSuggestions,
}: SourcesPanelProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");

  function handleAdd() {
    const trimmedDomain = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!name.trim() || !trimmedDomain) return;
    onAddSource(name.trim(), trimmedDomain, []);
    setName("");
    setDomain("");
  }

  return (
    <div className="border-b border-slate-200 bg-white px-5 py-3 dark:border-slate-800/80 dark:bg-slate-900">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          News Sources
        </h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenSuggestions}
            className="text-[11px] text-blue-600 transition-colors hover:text-blue-500 dark:text-blue-400"
          >
            Browse suggestions
          </button>
          <button
            type="button"
            onClick={onResetSources}
            className="text-[11px] text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
          >
            Reset defaults
          </button>
        </div>
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {sources.map((source) => (
          <span
            key={source.id}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-slate-600"
          >
            {source.name}
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
              ({source.domain})
            </span>
            {!source.isDefault && (
              <button
                type="button"
                onClick={() => onRemoveSource(source.id)}
                className="text-sm leading-none opacity-50 hover:opacity-100"
                aria-label={`Remove ${source.name}`}
              >
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Display name (e.g. Reuters)"
          className="w-36 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
        />
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Domain (e.g. reuters.com)"
          className="w-44 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-blue-500"
        >
          + Add
        </button>
      </div>
      <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
        Sources are matched by domain and used as feed filters. Clearing the
        cache forces a re-fetch with the new source list.{" "}
        <button
          type="button"
          onClick={onClearCache}
          className="text-blue-600 underline hover:text-blue-500 dark:text-blue-400"
        >
          Clear cache
        </button>
      </p>
    </div>
  );
}
