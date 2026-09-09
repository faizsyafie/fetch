"use client";

import { useState } from "react";
import { industryIcon } from "@/lib/defaults";
import type { Company, Industry, NewsSource, TimeFrameDays } from "@/lib/types";

interface SidebarProps {
  companies: Company[];
  industries: Industry[];
  activeIndustry: Industry;
  sources: NewsSource[];
  days: TimeFrameDays;
  editMode: boolean;
  sourcesOpen: boolean;
  onSelectIndustry: (industry: Industry) => void;
  onAddIndustry: (name: string) => void;
  onRenameIndustry: (oldName: string, newName: string) => void;
  onRemoveIndustry: (name: string) => void;
  onToggleEditMode: () => void;
  onToggleSourcesPanel: () => void;
}

export function Sidebar({
  companies,
  industries,
  activeIndustry,
  sources,
  days,
  editMode,
  sourcesOpen,
  onSelectIndustry,
  onAddIndustry,
  onRenameIndustry,
  onRemoveIndustry,
  onToggleEditMode,
  onToggleSourcesPanel,
}: SidebarProps) {
  const [renaming, setRenaming] = useState<Industry | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newIndustryName, setNewIndustryName] = useState("");

  function startRename(industry: Industry) {
    setRenaming(industry);
    setRenameValue(industry);
  }

  function confirmRename() {
    if (renaming) onRenameIndustry(renaming, renameValue);
    setRenaming(null);
  }

  function handleAddIndustry() {
    onAddIndustry(newIndustryName);
    setNewIndustryName("");
  }

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white text-slate-900 lg:w-56 lg:shrink-0 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Industries
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-600">
          {companies.length} companies
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {industries.map((industry) => {
          const count = companies.filter(
            (c) => c.industry === industry
          ).length;
          const isActive = industry === activeIndustry;

          if (renaming === industry) {
            return (
              <div
                key={industry}
                className="flex items-center gap-1 px-2 py-1.5"
              >
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") confirmRename();
                    if (e.key === "Escape") setRenaming(null);
                  }}
                  className="w-full rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={confirmRename}
                  className="shrink-0 rounded bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white"
                >
                  ✓
                </button>
              </div>
            );
          }

          return (
            <div key={industry} className="flex items-center">
              <button
                type="button"
                onClick={() => onSelectIndustry(industry)}
                className={`flex flex-1 items-center gap-1.5 border-l-2 px-3 py-2 text-left text-xs transition ${
                  isActive
                    ? "border-blue-500 bg-slate-100 font-medium text-slate-900 dark:bg-slate-900 dark:text-white"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <span>{industryIcon(industry)}</span>
                <span className="flex-1 truncate">{industry}</span>
                <span className="text-slate-400 dark:text-slate-600">
                  {count}
                </span>
              </button>
              {editMode && (
                <>
                  <button
                    type="button"
                    onClick={() => startRename(industry)}
                    className="px-1 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label={`Rename ${industry}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveIndustry(industry)}
                    className="px-1.5 text-xs text-slate-400 hover:text-red-500"
                    aria-label={`Delete ${industry}`}
                  >
                    🗑️
                  </button>
                </>
              )}
            </div>
          );
        })}

        {editMode && (
          <div className="flex items-center gap-1 px-2 py-2">
            <input
              value={newIndustryName}
              onChange={(e) => setNewIndustryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddIndustry()}
              placeholder="New industry…"
              className="w-full rounded border border-slate-300 bg-white px-1.5 py-1 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddIndustry}
              className="shrink-0 rounded bg-blue-600 px-1.5 py-1 text-xs font-semibold text-white"
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`mb-1.5 w-full rounded-md px-2 py-1.5 text-xs font-semibold transition ${
            editMode
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          ✏️ Edit Lists
        </button>
        <button
          type="button"
          onClick={onToggleSourcesPanel}
          className={`w-full rounded-md px-2 py-1.5 text-xs font-semibold transition ${
            sourcesOpen
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          🔗 Edit Sources
        </button>
        <div className="mt-2 space-y-0.5 text-[10px] leading-relaxed text-slate-400 dark:text-slate-600">
          {sources
            .filter((s) => s.enabled)
            .map((s) => (
              <div key={s.id}>
                📰 <span className="text-blue-600 dark:text-blue-400">{s.name}</span>
              </div>
            ))}
          <div>
            Last {days} day{days !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    </aside>
  );
}
