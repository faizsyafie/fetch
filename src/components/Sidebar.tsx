"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCENT_PRESETS,
  ALL_INDUSTRY,
  COLLAPSED_SIDEBAR_WIDTH,
  DEFAULT_INDUSTRY_EMOJI,
  EMOJI_PICKER_OPTIONS,
  WATCHLIST_INDUSTRY,
  getIndustryEmoji,
} from "@/lib/defaults";
import type {
  AccentColor,
  Company,
  Industry,
  NewsSource,
  TimeFrameDays,
} from "@/lib/types";

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
  width: number;
  collapsed: boolean;
  accent: AccentColor;
  onSelectIndustry: (industry: Industry) => void;
  onAddIndustry: (name: string) => void;
  onRenameIndustry: (oldName: string, newName: string) => void;
  onRemoveIndustry: (name: string) => void;
  onSetIndustryEmoji: (industry: Industry, emoji: string) => void;
  onReorderIndustries: (ordered: Industry[]) => void;
  onToggleEditMode: () => void;
  onToggleSourcesPanel: () => void;
  onResizeWidth: (width: number) => void;
  onToggleCollapsed: () => void;
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
  width,
  collapsed,
  accent,
  onSelectIndustry,
  onAddIndustry,
  onRenameIndustry,
  onRemoveIndustry,
  onSetIndustryEmoji,
  onReorderIndustries,
  onToggleEditMode,
  onToggleSourcesPanel,
  onResizeWidth,
  onToggleCollapsed,
}: SidebarProps) {
  const [renaming, setRenaming] = useState<Industry | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [newIndustryName, setNewIndustryName] = useState("");
  const [emojiPickerFor, setEmojiPickerFor] = useState<Industry | null>(null);
  const [dragIndustry, setDragIndustry] = useState<Industry | null>(null);
  const [dragOverIndustry, setDragOverIndustry] = useState<Industry | null>(
    null
  );
  const resizeState = useRef<{ startX: number; startWidth: number } | null>(
    null
  );

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

  function handleResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    resizeState.current = { startX: e.clientX, startWidth: width };
    function handleMove(moveEvent: MouseEvent) {
      if (!resizeState.current) return;
      const delta = moveEvent.clientX - resizeState.current.startX;
      onResizeWidth(resizeState.current.startWidth + delta);
    }
    function handleUp() {
      resizeState.current = null;
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    }
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  }

  function handleDrop(target: Industry) {
    if (!dragIndustry || dragIndustry === target) {
      setDragIndustry(null);
      setDragOverIndustry(null);
      return;
    }
    const withoutDragged = industries.filter((i) => i !== dragIndustry);
    const targetIndex = withoutDragged.indexOf(target);
    const reordered = [
      ...withoutDragged.slice(0, targetIndex),
      dragIndustry,
      ...withoutDragged.slice(targetIndex),
    ];
    onReorderIndustries(reordered);
    setDragIndustry(null);
    setDragOverIndustry(null);
  }

  const enabledSources = sources.filter((s) => s.enabled);
  const starredCount = companies.filter((c) => c.starred).length;
  const renderedWidth = collapsed ? COLLAPSED_SIDEBAR_WIDTH : width;
  const accentPreset = ACCENT_PRESETS[accent];

  const pinnedRows: { key: Industry; emoji: string; count: number }[] = [
    {
      key: ALL_INDUSTRY,
      emoji: getIndustryEmoji(ALL_INDUSTRY, industryEmojis),
      count: companies.length,
    },
    {
      key: WATCHLIST_INDUSTRY,
      emoji: getIndustryEmoji(WATCHLIST_INDUSTRY, industryEmojis),
      count: starredCount,
    },
  ];

  return (
    <aside
      style={{ width: renderedWidth }}
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 transition-[width] duration-300 ease-in-out dark:border-slate-800/80 dark:bg-slate-900 dark:text-slate-100"
    >
      {!collapsed && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute right-0 top-0 z-10 h-full w-1 cursor-col-resize hover:bg-blue-500/40"
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
        />
      )}

      <div
        className={`flex items-center border-b border-slate-200 py-3 dark:border-slate-800/80 ${
          collapsed ? "justify-center px-2" : "justify-between px-4"
        }`}
      >
        {!collapsed && (
          <div className="min-w-0 overflow-hidden whitespace-nowrap">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Industries
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-600">
              {companies.length} companies
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {pinnedRows.map(({ key, emoji, count }) => {
          const isActive = key === activeIndustry;
          if (collapsed) {
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelectIndustry(key)}
                title={key}
                className={`mx-auto my-0.5 flex h-9 w-9 items-center justify-center rounded-md border-l-2 text-base transition-colors ${
                  isActive
                    ? `${accentPreset.border} bg-slate-100 dark:bg-slate-800/70`
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {emoji}
              </button>
            );
          }
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectIndustry(key)}
              className={`flex w-full items-center gap-2 whitespace-nowrap border-l-2 py-2 pl-3 pr-3 text-left text-[13px] transition-colors ${
                isActive
                  ? `${accentPreset.border} bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800/70 dark:text-white`
                  : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200"
              }`}
            >
              <span className="shrink-0">{emoji}</span>
              <span className="flex-1 truncate">{key}</span>
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
          );
        })}

        <div className="my-1 border-t border-slate-100 dark:border-slate-800/60" />

        {industries.map((industry) => {
          const count = companies.filter(
            (c) => c.industry === industry
          ).length;
          const isActive = industry === activeIndustry;
          const emoji = industryEmojis[industry] ?? DEFAULT_INDUSTRY_EMOJI;

          if (collapsed) {
            return (
              <button
                key={industry}
                type="button"
                onClick={() => onSelectIndustry(industry)}
                title={industry}
                className={`mx-auto my-0.5 flex h-9 w-9 items-center justify-center rounded-md border-l-2 text-base transition-colors ${
                  isActive
                    ? `${accentPreset.border} bg-slate-100 dark:bg-slate-800/70`
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
                }`}
              >
                {emoji}
              </button>
            );
          }

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
            <div
              key={industry}
              draggable={editMode}
              onDragStart={() => setDragIndustry(industry)}
              onDragOver={(e) => {
                if (!editMode) return;
                e.preventDefault();
                setDragOverIndustry(industry);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(industry);
              }}
              onDragEnd={() => {
                setDragIndustry(null);
                setDragOverIndustry(null);
              }}
              className={`group relative flex items-center transition-all duration-150 ${
                editMode ? "cursor-grab active:cursor-grabbing" : ""
              } ${
                dragOverIndustry === industry && dragIndustry !== industry
                  ? "border-t-2 border-blue-500"
                  : "border-t-2 border-transparent"
              } ${
                dragIndustry === industry
                  ? "scale-[0.98] bg-slate-50 opacity-60 shadow-inner dark:bg-slate-800/60"
                  : ""
              }`}
            >
              {editMode && (
                <span className="pl-1.5 text-[10px] text-slate-300 dark:text-slate-600">
                  ⠿
                </span>
              )}
              {editMode ? (
                <div className="relative ml-1.5 shrink-0">
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
                    ? `${accentPreset.border} bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800/70 dark:text-white`
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

        {editMode && !collapsed && (
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

      <div
        className={`border-t border-slate-200 dark:border-slate-800/80 ${
          collapsed ? "flex flex-col items-center gap-1 py-2" : "p-3"
        }`}
      >
        {collapsed ? (
          <>
            <button
              type="button"
              onClick={onToggleEditMode}
              title="Edit Lists"
              className={`flex h-7 w-7 items-center justify-center rounded text-sm ${
                editMode
                  ? accentPreset.softBg
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              ✏️
            </button>
            <button
              type="button"
              onClick={onToggleSourcesPanel}
              title="Edit Sources"
              className={`flex h-7 w-7 items-center justify-center rounded text-sm ${
                sourcesOpen
                  ? "bg-emerald-100 dark:bg-emerald-500/15"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              🔗
            </button>
          </>
        ) : (
          <>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600">
              Manage
            </p>
            <button
              type="button"
              onClick={onToggleEditMode}
              className={`mb-1.5 w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                editMode
                  ? `${accentPreset.softBg} ${accentPreset.text}`
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
          </>
        )}
      </div>
    </aside>
  );
}
