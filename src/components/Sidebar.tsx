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
import { Logo } from "@/components/Logo";
import type { Theme } from "@/hooks/useTheme";

interface SidebarProps {
  theme: Theme;
  mode: "companies" | "news";
  onLogoClick: () => void;
  logoTitle: string;
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

// Segmented pill switch between the Companies tracker and the General news
// board — a more discoverable second way to do what clicking the logo
// already does (same toggle handler either way).
function ModeSwitch({
  mode,
  accent,
  onToggle,
}: {
  mode: "companies" | "news";
  accent: AccentColor;
  onToggle: () => void;
}) {
  const isNews = mode === "news";
  const label = isNews ? "Switch to Companies" : "Switch to General news";

  return (
    <button
      type="button"
      data-tour="mode-toggle"
      onClick={onToggle}
      role="switch"
      aria-checked={isNews}
      title={label}
      aria-label={label}
      className="relative flex w-full items-center rounded-full border border-brand-200 bg-white p-0.5 dark:border-brand-700 dark:bg-brand-950/50"
    >
      <span
        aria-hidden="true"
        className={`absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full ${ACCENT_PRESETS[accent].solid} shadow-sm transition-all duration-300 ease-in-out ${
          isNews ? "left-[calc(50%+2px)]" : "left-0.5"
        }`}
      />
      <span
        className={`relative z-10 flex-1 rounded-full py-1 text-center text-[11px] font-semibold transition-colors ${
          isNews ? "text-brand-400 dark:text-brand-500" : "text-white"
        }`}
      >
        Companies
      </span>
      <span
        className={`relative z-10 flex-1 rounded-full py-1 text-center text-[11px] font-semibold transition-colors ${
          isNews ? "text-white" : "text-brand-400 dark:text-brand-500"
        }`}
      >
        General
      </span>
    </button>
  );
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
      className="absolute left-0 top-full z-20 mt-1 grid w-52 grid-cols-6 gap-0.5 rounded-md border border-brand-200 bg-white p-2 shadow-lg dark:border-brand-700 dark:bg-brand-800"
    >
      {EMOJI_PICKER_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onPick(emoji)}
          className="flex h-7 w-7 items-center justify-center rounded text-sm hover:bg-brand-100 dark:hover:bg-brand-700"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export function Sidebar({
  theme,
  mode,
  onLogoClick,
  logoTitle,
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
  const [sourcesListExpanded, setSourcesListExpanded] = useState(true);
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
      className="relative flex h-full shrink-0 flex-col overflow-hidden border-r border-brand-200 bg-brand-50 text-brand-900 transition-[width] duration-300 ease-in-out dark:border-brand-800/80 dark:bg-brand-900 dark:text-brand-100"
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
        data-tour="sidebar-header"
        className={`flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800/80`}
      >
        <button
          type="button"
          onClick={onLogoClick}
          title={logoTitle}
          aria-label={logoTitle}
          className="rounded-md transition-opacity hover:opacity-80"
        >
          <Logo theme={theme} compact={collapsed} />
        </button>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-brand-400 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
          >
            «
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label="Expand sidebar"
          title="Expand sidebar"
          className="mx-auto mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-brand-400 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
        >
          »
        </button>
      )}

      {!collapsed && (
        <div className="border-b border-brand-200 px-4 py-2.5 dark:border-brand-800/80">
          <ModeSwitch mode={mode} accent={accent} onToggle={onLogoClick} />
        </div>
      )}

      {mode === "companies" && (
        <>
          {!collapsed && (
            <div className="border-b border-brand-200 px-4 py-2 dark:border-brand-800/80">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-500">
                Industries
              </p>
              <p className="mt-0.5 text-[11px] text-brand-400 dark:text-brand-600">
                {companies.length} companies
              </p>
            </div>
          )}

          <div
            data-tour="sidebar-industries"
            className="flex-1 overflow-y-auto overflow-x-hidden py-1"
          >
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
                    ? `${accentPreset.border} bg-brand-100 dark:bg-brand-800/70`
                    : "border-transparent hover:bg-brand-50 dark:hover:bg-brand-800/40"
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
                  ? `${accentPreset.border} bg-brand-100 font-semibold text-brand-900 dark:bg-brand-800/70 dark:text-white`
                  : "border-transparent text-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-800/40 dark:hover:text-brand-200"
              }`}
            >
              <span className="shrink-0">{emoji}</span>
              <span className="flex-1 truncate">{key}</span>
              <span
                className={`shrink-0 tabular-nums ${
                  isActive
                    ? "text-brand-500 dark:text-brand-300"
                    : "text-brand-400 dark:text-brand-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        <div className="my-1 border-t border-brand-100 dark:border-brand-800/60" />

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
                    ? `${accentPreset.border} bg-brand-100 dark:bg-brand-800/70`
                    : "border-transparent hover:bg-brand-50 dark:hover:bg-brand-800/40"
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
                  className="w-full rounded border border-brand-300 bg-white px-1.5 py-0.5 text-xs text-brand-900 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-800 dark:text-white"
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
                  ? "scale-[0.98] bg-brand-50 opacity-60 shadow-inner dark:bg-brand-800/60"
                  : ""
              }`}
            >
              {editMode && (
                <span className="pl-1.5 text-[10px] text-brand-300 dark:text-brand-600">
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
                    className="rounded text-sm leading-none hover:bg-brand-100 dark:hover:bg-brand-800"
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
                    ? `${accentPreset.border} bg-brand-100 font-semibold text-brand-900 dark:bg-brand-800/70 dark:text-white`
                    : "border-transparent text-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-800/40 dark:hover:text-brand-200"
                }`}
              >
                {!editMode && <span className="shrink-0">{emoji}</span>}
                <span className="flex-1 truncate">{industry}</span>
                <span
                  className={`shrink-0 tabular-nums ${
                    isActive
                      ? "text-brand-500 dark:text-brand-300"
                      : "text-brand-400 dark:text-brand-600"
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
                    className="rounded px-1 py-1 text-xs text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
                    aria-label={`Rename ${industry}`}
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveIndustry(industry)}
                    className="rounded px-1 py-1 text-xs text-brand-400 hover:bg-brand-100 hover:text-red-500 dark:hover:bg-brand-800"
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
              className="w-full rounded border border-brand-300 bg-white px-1.5 py-1 text-xs text-brand-900 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-800 dark:text-white"
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
        data-tour="sidebar-manage"
        className={`border-t border-brand-200 dark:border-brand-800/80 ${
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
                  : "hover:bg-brand-100 dark:hover:bg-brand-800"
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
                  : "hover:bg-brand-100 dark:hover:bg-brand-800"
              }`}
            >
              🔗
            </button>
          </>
        ) : (
          <>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Manage
            </p>
            <button
              type="button"
              onClick={onToggleEditMode}
              className={`mb-1.5 w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                editMode
                  ? `${accentPreset.softBg} ${accentPreset.text}`
                  : "bg-brand-100 text-brand-500 hover:bg-brand-200 dark:bg-brand-800/60 dark:text-brand-400 dark:hover:bg-brand-800"
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
                  : "bg-brand-100 text-brand-500 hover:bg-brand-200 dark:bg-brand-800/60 dark:text-brand-400 dark:hover:bg-brand-800"
              }`}
            >
              🔗 Edit Sources
            </button>

            <button
              type="button"
              onClick={() => setSourcesListExpanded((v) => !v)}
              aria-expanded={sourcesListExpanded}
              className="mb-1.5 mt-3 flex w-full items-center justify-between text-[10px] font-bold uppercase tracking-widest text-brand-400 hover:text-brand-600 dark:text-brand-600 dark:hover:text-brand-400"
            >
              <span>Sources ({enabledSources.length})</span>
              <span
                aria-hidden="true"
                className={`transition-transform ${sourcesListExpanded ? "rotate-0" : "-rotate-90"}`}
              >
                ▾
              </span>
            </button>
            {sourcesListExpanded && (
              <div className="space-y-1">
                {enabledSources.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-1.5 text-[11px] text-brand-500 dark:text-brand-400"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span className="truncate">{s.name}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex items-center justify-between text-[10px] text-brand-400 dark:text-brand-600">
              <span>
                Last {days} day{days !== 1 ? "s" : ""}
              </span>
              {lastUpdatedLabel && <span>{lastUpdatedLabel}</span>}
            </div>
          </>
        )}
      </div>
        </>
      )}
    </aside>
  );
}
