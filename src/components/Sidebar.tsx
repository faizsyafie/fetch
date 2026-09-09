"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_INDUSTRY_EMOJI, EMOJI_PICKER_OPTIONS } from "@/lib/defaults";
import type { Company, Industry, NewsSource, TimeFrameDays } from "@/lib/types";

interface SidebarProps {
  companies: Company[];
  industries: Industry[];
  industryEmojis: Record<Industry, string>;
  activeIndustry: Industry;
  sources: NewsSource[];
  days: TimeFrameDays;
  editMode: boolean;
  sourcesOpen: boolean;
  lastUpdatedLabel: string | null;
  onSelectIndustry: (industry: Industry) => void;
  onAddIndustry: (name: string) => void;
  onRenameIndustry: (oldName: string, newName: string) => void;
  onRemoveIndustry: (name: string) => void;
  onSetIndustryEmoji: (industry: Industry, emoji: string) => void;
  onToggleEditMode: () => void;
  onToggleSourcesPanel: () => void;
}

function EmojiPicker({
  onPick,
  onClose,
}: {
  onPick: (emoji: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-20 mt-1 grid w-52 grid-cols-6 gap-0.5 rounded-md border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-800"
    >
      {EMOJI_PICKER_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onPick(emoji)}
          className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function Sidebar({
  companies,
  industries,
  industryEmojis,
  activeIndustry,
  sources,
  days,
  editMode,
  sourcesOpen,
  lastUpdatedLabel,
  onSelectIndustry,
  onAddIndustry,
  onRenameIndustry,
  onRemoveIndustry,
  onSetIndustryEmoji,
  onToggleEditMode,
  onToggleSourcesPanel,
}: SidebarProps) {
  const [renaming, setRenaming] = useState<Industry | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newIndustryName, setNewIndustryName] = useState("");
  const [emojiPickerFor, setEmojiPickerFor] = useState<Industry | null>(null);

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

  const enabledSources = sources.filter((s) => s.enabled);

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white text-slate-900 lg:w-56 lg:shrink-0 dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-100">
      <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800/80">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          Industries
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-600">
          {companies.length} companies
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {industries.map((industry) => {
          const count = companies.filter(
            (c) => c.industry === industry
          ).length;
          const isActive = industry === activeIndustry;
          const emoji = industryEmojis[industry] ?? DEFAULT_INDUSTRY_EMOJI;

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
                  className="w-full rounded border border-slate-300 bg-white px-1.5 py-0.5 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={confirmRename}
                  className="shrink-0 rounded bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  ✓
                </button>
              </div>
            );
          }

          return (
            <div key={industry} className="group relative flex items-center">
              {editMode ? (
                <div className="relative ml-3 shrink-0">
                  <button
                    type="button"
                    onClick={() =>
                      setEmojiPickerFor((prev) =>
                        prev === industry ? null : industry
                      )
                    }
                    className="rounded text-sm leading-none hover:bg-slate-100 dark:hover:bg-slate-800"
                    aria-label={`Change emoji for ${industry}`}
                    title="Change emoji"
                  >
                    <span className="flex h-6 w-6 items-center justify-center">
                      {emoji}
                    </span>
                  </button>
                  {emojiPickerFor === industry && (
                    <EmojiPicker
                      onPick={(picked) => {
                        onSetIndustryEmoji(industry, picked);
                        setEmojiPickerFor(null);
                      }}
                      onClose={() => setEmojiPickerFor(null)}
                    />
                  )}
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => onSelectIndustry(industry)}
                className={`flex flex-1 items-center gap-2 border-l-2 py-2 pr-3 text-left text-[13px] transition-colors ${
                  editMode ? "pl-2" : "pl-3"
                } ${
                  isActive
                    ? "border-blue-500 bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800/70 dark:text-white"
                    : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
                }`}
              >
                {!editMode && <span className="shrink-0">{emoji}</span>}
                <span className="flex-1 truncate">{industry}</span>
                <span
                  className={`shrink-0 tabular-nums ${
                    isActive
                      ? "text-slate-500 dark:text-slate-300"
                      : "text-slate-400 dark:text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
              {editMode && (
                <div className="flex shrink-0 items-center pr-2">
                  <button
                    type="button"
                    onClick={() => startRename(industry)}
                    className="rounded px-1 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label={`Rename ${industry}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveIndustry(industry)}
                    className="rounded px-1 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-800"
                    aria-label={`Delete ${industry}`}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {editMode && (
          <div className="flex items-center gap-1 px-3 py-2">
            <input
              value={newIndustryName}
              onChange={(e) => setNewIndustryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddIndustry()}
              placeholder="New industry…"
              className="w-full rounded border border-slate-300 bg-white px-1.5 py-1 text-xs text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddIndustry}
              className="shrink-0 rounded bg-blue-600 px-1.5 py-1 text-xs font-semibold text-white hover:bg-blue-500"
            >
              +
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800/80">
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Manage
        </p>
        <button
          type="button"
          onClick={onToggleEditMode}
          className={`mb-1.5 w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
            editMode
              ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          ✏️ Edit Lists
        </button>
        <button
          type="button"
          onClick={onToggleSourcesPanel}
          className={`w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
            sourcesOpen
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          🔗 Edit Sources
        </button>

        <p className="mb-1.5 mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
          Sources
        </p>
        <div className="space-y-1">
          {enabledSources.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="truncate">{s.name}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-600">
          <span>
            Last {days} day{days !== 1 ? "s" : ""}
          </span>
          {lastUpdatedLabel && <span>{lastUpdatedLabel}</span>}
        </div>
      </div>
    </aside>
  );
}
