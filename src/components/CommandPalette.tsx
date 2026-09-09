"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_INDUSTRY_EMOJI } from "@/lib/defaults";
import type { Company, Industry } from "@/lib/types";

interface CommandPaletteProps {
  companies: Company[];
  industries: Industry[];
  industryEmojis: Record<Industry, string>;
  onSelectCompany: (company: Company) => void;
  onSelectIndustry: (industry: Industry) => void;
  onClose: () => void;
}

interface Result {
  type: "company" | "industry";
  key: string;
  label: string;
  sublabel?: string;
  emoji: string;
}

export function CommandPalette({
  companies,
  industries,
  industryEmojis,
  onSelectCompany,
  onSelectIndustry,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [queryAtLastReset, setQueryAtLastReset] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Re-highlight the first result whenever the query changes, without a
  // dedicated effect (see https://react.dev/learn/you-might-not-need-an-effect).
  if (query !== queryAtLastReset) {
    setQueryAtLastReset(query);
    setActiveIndex(0);
  }

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    const industryResults: Result[] = industries
      .filter((i) => !q || i.toLowerCase().includes(q))
      .map((i) => ({
        type: "industry",
        key: `industry:${i}`,
        label: i,
        sublabel: "Industry",
        emoji: industryEmojis[i] ?? DEFAULT_INDUSTRY_EMOJI,
      }));
    const companyResults: Result[] = companies
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .map((c) => ({
        type: "company",
        key: `company:${c.id}`,
        label: c.name,
        sublabel: c.industry,
        emoji: industryEmojis[c.industry] ?? DEFAULT_INDUSTRY_EMOJI,
      }));
    return [...companyResults, ...industryResults].slice(0, 20);
  }, [query, companies, industries, industryEmojis]);

  function handleSelect(result: Result) {
    if (result.type === "industry") {
      onSelectIndustry(result.label);
    } else {
      const company = companies.find((c) => `company:${c.id}` === result.key);
      if (company) onSelectCompany(company);
    }
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const result = results[activeIndex];
      if (result) handleSelect(result);
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 pt-[12vh]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
          <span className="text-slate-400 dark:text-slate-500">🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Jump to a company or industry…"
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600"
          />
          <kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
            Esc
          </kbd>
        </div>
        <div className="max-h-80 overflow-y-auto py-1">
          {results.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
              No matches.
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={result.key}
              type="button"
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${
                i === activeIndex
                  ? "bg-blue-50 dark:bg-blue-500/10"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <span className="shrink-0 text-base">{result.emoji}</span>
              <span className="min-w-0 flex-1 truncate font-medium text-slate-900 dark:text-white">
                {result.label}
              </span>
              {result.sublabel && (
                <span className="shrink-0 text-[11px] text-slate-400 dark:text-slate-500">
                  {result.sublabel}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
