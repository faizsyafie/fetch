"use client";

import { useRef, useState } from "react";
import { ACCENT_PRESETS, COLLAPSED_SIDEBAR_WIDTH } from "@/lib/defaults";
import type { AccentColor, NewsSource, TimeFrameDays } from "@/lib/types";
import { Logo } from "@/components/Logo";
import type { Theme } from "@/hooks/useTheme";

export type AppMode = "companies" | "news" | "saved";

interface SidebarProps {
  theme: Theme;
  mode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  sources: NewsSource[];
  days: TimeFrameDays;
  editMode: boolean;
  sourcesOpen: boolean;
  lastUpdatedLabel: string | null;
  width: number;
  collapsed: boolean;
  accent: AccentColor;
  onToggleEditMode: () => void;
  onToggleSourcesPanel: () => void;
  onResizeWidth: (width: number) => void;
  onToggleCollapsed: () => void;
  // Saved links
  categoryEditMode: boolean;
  onToggleCategoryEditMode: () => void;
  // General page
  themesOpen: boolean;
  onToggleThemesPanel: () => void;
}

const NAV_ITEMS: { key: AppMode; label: string; emoji: string }[] = [
  { key: "news", label: "General", emoji: "📰" },
  { key: "companies", label: "Companies", emoji: "🏢" },
];

// The primary nav — General / Companies / Buried Bones — replaces the old
// two-way toggle pill. It's rendered identically regardless of which mode
// is active, so switching pages never rearranges this list. Industry and
// saved-link category browsing both live in the TabBar under the top bar
// now, not here — this sidebar is strictly navigation + management.
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
      {renderItem("saved", "Buried Bones", "🔖")}
    </div>
  );
}

export function Sidebar({
  theme,
  mode,
  onSelectMode,
  sources,
  days,
  editMode,
  sourcesOpen,
  lastUpdatedLabel,
  width,
  collapsed,
  accent,
  onToggleEditMode,
  onToggleSourcesPanel,
  onResizeWidth,
  onToggleCollapsed,
  categoryEditMode,
  onToggleCategoryEditMode,
  themesOpen,
  onToggleThemesPanel,
}: SidebarProps) {
  const [sourcesListExpanded, setSourcesListExpanded] = useState(false);
  const resizeState = useRef<{ startX: number; startWidth: number } | null>(
    null
  );

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

  const enabledSources = sources.filter((s) => s.enabled);
  const renderedWidth = collapsed ? COLLAPSED_SIDEBAR_WIDTH : width;
  const accentPreset = ACCENT_PRESETS[accent];

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

      <div className="flex-1" />

      {mode === "companies" && (
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
      )}

      {mode === "news" && (
        <div
          data-tour="sidebar-manage-themes"
          className={`border-t border-brand-200 dark:border-brand-800/80 ${
            collapsed ? "flex flex-col items-center gap-1 py-2" : "p-3"
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleThemesPanel}
              title="Edit Themes"
              className={`flex h-7 w-7 items-center justify-center rounded text-sm ${
                themesOpen
                  ? accentPreset.softBg
                  : "hover:bg-brand-100 dark:hover:bg-brand-800"
              }`}
            >
              🎛️
            </button>
          ) : (
            <>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
                Manage
              </p>
              <button
                type="button"
                onClick={onToggleThemesPanel}
                className={`w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                  themesOpen
                    ? `${accentPreset.softBg} ${accentPreset.text}`
                    : "bg-brand-100 text-brand-500 hover:bg-brand-200 dark:bg-brand-800/60 dark:text-brand-400 dark:hover:bg-brand-800"
                }`}
              >
                🎛️ Edit Themes
              </button>
            </>
          )}
        </div>
      )}

      {mode === "saved" && (
        <div
          data-tour="sidebar-manage-categories"
          className={`border-t border-brand-200 dark:border-brand-800/80 ${
            collapsed ? "flex flex-col items-center gap-1 py-2" : "p-3"
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={onToggleCategoryEditMode}
              title="Edit Categories"
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
                onClick={onToggleCategoryEditMode}
                className={`w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                  categoryEditMode
                    ? `${accentPreset.softBg} ${accentPreset.text}`
                    : "bg-brand-100 text-brand-500 hover:bg-brand-200 dark:bg-brand-800/60 dark:text-brand-400 dark:hover:bg-brand-800"
                }`}
              >
                ✏️ Edit Categories
              </button>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
