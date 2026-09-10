"use client";

import { useEffect, useRef, useState } from "react";
import {
  ACCENT_PRESETS,
  ALL_INDUSTRY,
  ALL_LINKS_CATEGORY,
  ALL_LINKS_EMOJI,
  COLLAPSED_SIDEBAR_WIDTH,
  DEFAULT_INDUSTRY_EMOJI,
  DEFAULT_LINK_CATEGORY_EMOJI,
  EMOJI_PICKER_OPTIONS,
  PINNED_LINKS_CATEGORY,
  PINNED_LINKS_EMOJI,
  UNCATEGORIZED_CATEGORY,
  UNCATEGORIZED_LINKS_EMOJI,
  WATCHLIST_INDUSTRY,
  getIndustryEmoji,
} from "@/lib/defaults";
import type {
  AccentColor,
  Company,
  Industry,
  NewsSource,
  SavedLink,
  TimeFrameDays,
} from "@/lib/types";
import { Logo } from "@/components/Logo";
import type { Theme } from "@/hooks/useTheme";

export type AppMode = "companies" | "news" | "saved";

interface SidebarProps {
  theme: Theme;
  mode: AppMode;
  onSelectMode: (mode: AppMode) => void;
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
  // Saved links
  links: SavedLink[];
  linkCategories: string[];
  activeLinkCategory: string;
  onSelectLinkCategory: (category: string) => void;
  onAddLinkCategory: (name: string) => void;
  onRenameLinkCategory: (oldName: string, newName: string) => void;
  onRemoveLinkCategory: (name: string) => void;
  onReorderLinkCategories: (ordered: string[]) => void;
}

const NAV_ITEMS: { key: AppMode; label: string; emoji: string }[] = [
  { key: "news", label: "General", emoji: "📰" },
  { key: "companies", label: "Companies", emoji: "🏢" },
];

// The primary nav — General / Companies / Saved News — replaces the old
// two-way toggle pill. It's rendered identically regardless of which mode
// is active, so switching pages never rearranges this list.
function NavList({
  mode,
  accent,
  collapsed,
  onSelectMode,
}: {
  mode: AppMode;
  accent: AccentColor;
  collapsed: boolean;
  onSelectMode: (mode: AppMode) => void;
}) {
  const accentPreset = ACCENT_PRESETS[accent];

  function renderItem(key: AppMode, label: string, emoji: string) {
    const isActive = mode === key;
    if (collapsed) {
      return (
        <button
          key={key}
          type="button"
          onClick={() => onSelectMode(key)}
          title={label}
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
        data-tour={key === "news" ? "mode-toggle" : undefined}
        onClick={() => onSelectMode(key)}
        className={`flex w-full items-center gap-2 whitespace-nowrap border-l-2 py-2 pl-3 pr-3 text-left text-[13px] font-semibold transition-colors ${
          isActive
            ? `${accentPreset.border} bg-brand-100 text-brand-900 dark:bg-brand-800/70 dark:text-white`
            : "border-transparent text-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-800/40 dark:hover:text-brand-200"
        }`}
      >
        <span className="shrink-0">{emoji}</span>
        <span className="flex-1 truncate">{label}</span>
      </button>
    );
  }

  return (
    <div
      data-tour="nav-list"
      className="border-b border-brand-200 py-1 dark:border-brand-800/80"
    >
      {NAV_ITEMS.map((item) => renderItem(item.key, item.label, item.emoji))}
      <div className="my-1 border-t border-brand-100 dark:border-brand-800/60" />
      {renderItem("saved", "Saved News", "🔖")}
    </div>
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
  onSelectMode,
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
  links,
  linkCategories,
  activeLinkCategory,
  onSelectLinkCategory,
  onAddLinkCategory,
  onRenameLinkCategory,
  onRemoveLinkCategory,
  onReorderLinkCategories,
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

  const [categoryEditMode, setCategoryEditMode] = useState(false);
  const [renamingCategory, setRenamingCategory] = useState<string | null>(
    null
  );
  const [renameCategoryValue, setRenameCategoryValue] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [dragCategory, setDragCategory] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(
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

  function startRenameCategory(category: string) {
    setRenamingCategory(category);
    setRenameCategoryValue(category);
  }

  function confirmRenameCategory() {
    if (renamingCategory) onRenameLinkCategory(renamingCategory, renameCategoryValue);
    setRenamingCategory(null);
  }

  function handleAddCategory() {
    onAddLinkCategory(newCategoryName);
    setNewCategoryName("");
  }

  function handleCategoryDrop(target: string) {
    if (!dragCategory || dragCategory === target) {
      setDragCategory(null);
      setDragOverCategory(null);
      return;
    }
    const withoutDragged = linkCategories.filter((c) => c !== dragCategory);
    const targetIndex = withoutDragged.indexOf(target);
    const reordered = [
      ...withoutDragged.slice(0, targetIndex),
      dragCategory,
      ...withoutDragged.slice(targetIndex),
    ];
    onReorderLinkCategories(reordered);
    setDragCategory(null);
    setDragOverCategory(null);
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

  const pinnedLinksCount = links.filter((l) => l.pinned).length;
  const uncategorizedLinksCount = links.filter(
    (l) => !linkCategories.includes(l.category)
  ).length;
  const pinnedCategoryRows: { key: string; emoji: string; count: number }[] = [
    { key: ALL_LINKS_CATEGORY, emoji: ALL_LINKS_EMOJI, count: links.length },
    {
      key: PINNED_LINKS_CATEGORY,
      emoji: PINNED_LINKS_EMOJI,
      count: pinnedLinksCount,
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
          onClick={() => onSelectMode("news")}
          title="fetch"
          aria-label="Go to General"
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

      <NavList
        mode={mode}
        accent={accent}
        collapsed={collapsed}
        onSelectMode={onSelectMode}
      />

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

      {mode === "saved" && (
        <>
          {!collapsed && (
            <div className="border-b border-brand-200 px-4 py-2 dark:border-brand-800/80">
              <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-500">
                Categories
              </p>
              <p className="mt-0.5 text-[11px] text-brand-400 dark:text-brand-600">
                {links.length} saved link{links.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}

          <div
            data-tour="sidebar-categories"
            className="flex-1 overflow-y-auto overflow-x-hidden py-1"
          >
            {pinnedCategoryRows.map(({ key, emoji, count }) => {
              const isActive = key === activeLinkCategory;
              if (collapsed) {
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectLinkCategory(key)}
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
                  onClick={() => onSelectLinkCategory(key)}
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

            {linkCategories.map((category) => {
              const count = links.filter((l) => l.category === category).length;
              const isActive = category === activeLinkCategory;

              if (collapsed) {
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onSelectLinkCategory(category)}
                    title={category}
                    className={`mx-auto my-0.5 flex h-9 w-9 items-center justify-center rounded-md border-l-2 text-base transition-colors ${
                      isActive
                        ? `${accentPreset.border} bg-brand-100 dark:bg-brand-800/70`
                        : "border-transparent hover:bg-brand-50 dark:hover:bg-brand-800/40"
                    }`}
                  >
                    {DEFAULT_LINK_CATEGORY_EMOJI}
                  </button>
                );
              }

              if (renamingCategory === category) {
                return (
                  <div
                    key={category}
                    className="flex items-center gap-1 px-2 py-1.5"
                  >
                    <input
                      autoFocus
                      value={renameCategoryValue}
                      onChange={(e) => setRenameCategoryValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmRenameCategory();
                        if (e.key === "Escape") setRenamingCategory(null);
                      }}
                      className="w-full rounded border border-brand-300 bg-white px-1.5 py-0.5 text-xs text-brand-900 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={confirmRenameCategory}
                      className="shrink-0 rounded bg-blue-600 px-1.5 py-0.5 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      ✓
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={category}
                  draggable={categoryEditMode}
                  onDragStart={() => setDragCategory(category)}
                  onDragOver={(e) => {
                    if (!categoryEditMode) return;
                    e.preventDefault();
                    setDragOverCategory(category);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleCategoryDrop(category);
                  }}
                  onDragEnd={() => {
                    setDragCategory(null);
                    setDragOverCategory(null);
                  }}
                  className={`group relative flex items-center transition-all duration-150 ${
                    categoryEditMode ? "cursor-grab active:cursor-grabbing" : ""
                  } ${
                    dragOverCategory === category && dragCategory !== category
                      ? "border-t-2 border-blue-500"
                      : "border-t-2 border-transparent"
                  } ${
                    dragCategory === category
                      ? "scale-[0.98] bg-brand-50 opacity-60 shadow-inner dark:bg-brand-800/60"
                      : ""
                  }`}
                >
                  {categoryEditMode && (
                    <span className="pl-1.5 text-[10px] text-brand-300 dark:text-brand-600">
                      ⠿
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectLinkCategory(category)}
                    className={`flex flex-1 items-center gap-2 border-l-2 py-2 pr-3 text-left text-[13px] transition-colors ${
                      categoryEditMode ? "pl-2" : "pl-3"
                    } ${
                      isActive
                        ? `${accentPreset.border} bg-brand-100 font-semibold text-brand-900 dark:bg-brand-800/70 dark:text-white`
                        : "border-transparent text-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-800/40 dark:hover:text-brand-200"
                    }`}
                  >
                    <span className="shrink-0">{DEFAULT_LINK_CATEGORY_EMOJI}</span>
                    <span className="flex-1 truncate">{category}</span>
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
                  {categoryEditMode && (
                    <div className="flex shrink-0 items-center pr-2">
                      <button
                        type="button"
                        onClick={() => startRenameCategory(category)}
                        className="rounded px-1 py-1 text-xs text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
                        aria-label={`Rename ${category}`}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveLinkCategory(category)}
                        className="rounded px-1 py-1 text-xs text-brand-400 hover:bg-brand-100 hover:text-red-500 dark:hover:bg-brand-800"
                        aria-label={`Delete ${category}`}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => onSelectLinkCategory(UNCATEGORIZED_CATEGORY)}
              className={`flex w-full items-center gap-2 whitespace-nowrap border-l-2 py-2 pl-3 pr-3 text-left text-[13px] transition-colors ${
                activeLinkCategory === UNCATEGORIZED_CATEGORY
                  ? `${accentPreset.border} bg-brand-100 font-semibold text-brand-900 dark:bg-brand-800/70 dark:text-white`
                  : "border-transparent text-brand-500 hover:bg-brand-50 hover:text-brand-700 dark:text-brand-400 dark:hover:bg-brand-800/40 dark:hover:text-brand-200"
              }`}
            >
              <span className="shrink-0">{UNCATEGORIZED_LINKS_EMOJI}</span>
              <span className="flex-1 truncate">{UNCATEGORIZED_CATEGORY}</span>
              <span
                className={`shrink-0 tabular-nums ${
                  activeLinkCategory === UNCATEGORIZED_CATEGORY
                    ? "text-brand-500 dark:text-brand-300"
                    : "text-brand-400 dark:text-brand-600"
                }`}
              >
                {uncategorizedLinksCount}
              </span>
            </button>

            {categoryEditMode && !collapsed && (
              <div className="flex items-center gap-1 px-3 py-2">
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
                  placeholder="New category…"
                  className="w-full rounded border border-brand-300 bg-white px-1.5 py-1 text-xs text-brand-900 outline-none focus:border-blue-500 dark:border-brand-700 dark:bg-brand-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="shrink-0 rounded bg-blue-600 px-1.5 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  +
                </button>
              </div>
            )}
          </div>

          <div
            data-tour="sidebar-manage-categories"
            className={`border-t border-brand-200 dark:border-brand-800/80 ${
              collapsed ? "flex flex-col items-center gap-1 py-2" : "p-3"
            }`}
          >
            {collapsed ? (
              <button
                type="button"
                onClick={() => setCategoryEditMode((v) => !v)}
                title="Manage Categories"
                className={`flex h-7 w-7 items-center justify-center rounded text-sm ${
                  categoryEditMode
                    ? accentPreset.softBg
                    : "hover:bg-brand-100 dark:hover:bg-brand-800"
                }`}
              >
                ✏️
              </button>
            ) : (
              <>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
                  Manage
                </p>
                <button
                  type="button"
                  onClick={() => setCategoryEditMode((v) => !v)}
                  className={`w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                    categoryEditMode
                      ? `${accentPreset.softBg} ${accentPreset.text}`
                      : "bg-brand-100 text-brand-500 hover:bg-brand-200 dark:bg-brand-800/60 dark:text-brand-400 dark:hover:bg-brand-800"
                  }`}
                >
                  ✏️ Manage Categories
                </button>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
