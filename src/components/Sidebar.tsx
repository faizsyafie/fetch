"use client";

import { useRef, useState } from "react";
import { ACCENT_PRESETS, COLLAPSED_SIDEBAR_WIDTH } from "@/lib/defaults";
import type { AccentColor, NewsSource, SidebarListItem, TimeFrameDays } from "@/lib/types";
import { Logo } from "@/components/Logo";
import { SidebarFlyout } from "@/components/SidebarFlyout";
import { SidebarSubList } from "@/components/SidebarSubList";
import type { Theme } from "@/hooks/useTheme";

// "home" is the post-login landing hub (HomeHub) — reachable by clicking
// the logo, but not a persistent nav row like the other three.
export type AppMode = "companies" | "news" | "saved" | "home";

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
  // General page
  themesOpen: boolean;
  onToggleThemesPanel: () => void;
  topicSourcesOpen: boolean;
  onToggleTopicSourcesPanel: () => void;
  onOpenDebugLog: () => void;

  // Companies sub-list ("subfolder" under the Companies nav item) — same
  // pinned/reorderable/add shape the old horizontal TabBar used.
  companiesListExpanded: boolean;
  onToggleCompaniesListExpanded: () => void;
  activeIndustry: string;
  industryPinnedItems: SidebarListItem[];
  industryItems: SidebarListItem[];
  onSelectIndustry: (key: string) => void;
  onAddIndustry: (name: string) => void;
  onRenameIndustry: (oldKey: string, newKey: string) => void;
  onRemoveIndustry: (key: string) => void;
  onReorderIndustries: (ordered: string[]) => void;
  onSetIndustryEmoji: (key: string, emoji: string) => void;

  // Buried Bones sub-list, same idea, categories instead of industries.
  savedListExpanded: boolean;
  onToggleSavedListExpanded: () => void;
  activeLinkCategory: string;
  categoryPinnedItems: SidebarListItem[];
  categoryItems: SidebarListItem[];
  uncategorizedItem: SidebarListItem;
  onSelectLinkCategory: (key: string) => void;
  onAddLinkCategory: (name: string) => void;
  onRenameLinkCategory: (oldKey: string, newKey: string) => void;
  onRemoveLinkCategory: (key: string) => void;
  onReorderLinkCategories: (ordered: string[]) => void;
  onSetLinkCategoryColor: (key: string, color: AccentColor) => void;
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
  themesOpen,
  onToggleThemesPanel,
  topicSourcesOpen,
  onToggleTopicSourcesPanel,
  onOpenDebugLog,
  companiesListExpanded,
  onToggleCompaniesListExpanded,
  activeIndustry,
  industryPinnedItems,
  industryItems,
  onSelectIndustry,
  onAddIndustry,
  onRenameIndustry,
  onRemoveIndustry,
  onReorderIndustries,
  onSetIndustryEmoji,
  savedListExpanded,
  onToggleSavedListExpanded,
  activeLinkCategory,
  categoryPinnedItems,
  categoryItems,
  uncategorizedItem,
  onSelectLinkCategory,
  onAddLinkCategory,
  onRenameLinkCategory,
  onRemoveLinkCategory,
  onReorderLinkCategories,
  onSetLinkCategoryColor,
}: SidebarProps) {
  const [sourcesListExpanded, setSourcesListExpanded] = useState(false);
  // Click-triggered "jump to list" flyout for switching Buried Bones
  // categories or Pack Watch industries while collapsed, without needing
  // to re-expand the sidebar first — see SidebarFlyout.
  const [openFlyout, setOpenFlyout] = useState<"saved" | "companies" | null>(
    null
  );
  const [flyoutAnchor, setFlyoutAnchor] = useState<{ top: number; left: number } | null>(
    null
  );
  const resizeState = useRef<{ startX: number; startWidth: number } | null>(
    null
  );

  // Reset during render (same pattern page.tsx uses for its own
  // mode-tracked state) rather than in an effect, so expanding the sidebar
  // never leaves a stale flyout that reopens on the very next collapse.
  const [collapsedTrackedFor, setCollapsedTrackedFor] = useState(collapsed);
  if (collapsed !== collapsedTrackedFor) {
    setCollapsedTrackedFor(collapsed);
    if (!collapsed) setOpenFlyout(null);
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

  const enabledSources = sources.filter((s) => s.enabled);
  const renderedWidth = collapsed ? COLLAPSED_SIDEBAR_WIDTH : width;
  const accentPreset = ACCENT_PRESETS[accent];

  function renderNavRow({
    isActive,
    label,
    subtitle,
    emoji,
    dataTour,
    onClick,
    expanded,
    onToggleExpanded,
    flyoutKey,
  }: {
    isActive: boolean;
    label: string;
    // Plain-language translation shown on hover — the themed names are fun,
    // but shouldn't be the only way a first-time user finds out what a nav
    // item actually does.
    subtitle: string;
    emoji: string;
    dataTour?: string;
    onClick: () => void;
    expanded?: boolean;
    onToggleExpanded?: () => void;
    // When set, clicking this row while collapsed also opens a flyout menu
    // (see SidebarFlyout) for jumping straight to one of its sub-items.
    flyoutKey?: "saved" | "companies";
  }) {
    if (collapsed) {
      return (
        <button
          type="button"
          onClick={(e) => {
            onClick();
            if (!flyoutKey) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setFlyoutAnchor({ top: rect.top, left: rect.right + 8 });
            setOpenFlyout((prev) => (prev === flyoutKey ? null : flyoutKey));
          }}
          title={`${label} — ${subtitle}`}
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
      <div
        className={`flex w-full items-center border-l-2 pr-1 transition-colors ${
          isActive
            ? `${accentPreset.border} bg-brand-100 dark:bg-brand-800/70`
            : "border-transparent hover:bg-brand-50 dark:hover:bg-brand-800/40"
        }`}
      >
        <button
          type="button"
          data-tour={dataTour}
          onClick={onClick}
          title={subtitle}
          className={`flex min-w-0 flex-1 items-center gap-2 whitespace-nowrap py-2 pl-3 pr-1 text-left text-[0.8125rem] font-semibold transition-colors ${
            isActive
              ? "text-brand-900 dark:text-white"
              : "text-brand-500 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-200"
          }`}
        >
          <span className="shrink-0">{emoji}</span>
          <span className="flex-1 truncate">{label}</span>
        </button>
        {onToggleExpanded && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded();
            }}
            aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}
            aria-expanded={expanded}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[0.625rem] text-brand-400 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
          >
            <span
              aria-hidden="true"
              className={`inline-block transition-transform ${expanded ? "rotate-0" : "-rotate-90"}`}
            >
              ▾
            </span>
          </button>
        )}
      </div>
    );
  }

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
        className={`flex h-14 items-center justify-between border-b border-brand-200 px-4 dark:border-brand-800/80`}
      >
        <button
          type="button"
          onClick={() => onSelectMode("home")}
          title="fetch"
          aria-label="Go home"
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

      <div
        data-tour="nav-list"
        className="overflow-y-auto border-b border-brand-200 py-1 dark:border-brand-800/80"
      >
        {renderNavRow({
          isActive: mode === "saved",
          label: "Buried Bones",
          subtitle: "Saved Articles and Notes",
          emoji: "🔖",
          dataTour: "nav-saved",
          onClick: () => onSelectMode("saved"),
          expanded: savedListExpanded,
          onToggleExpanded: collapsed ? undefined : onToggleSavedListExpanded,
          flyoutKey: "saved",
        })}
        {!collapsed && (
          <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: savedListExpanded ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <SidebarSubList
                dataTour="category-sub-list"
                pinnedItems={categoryPinnedItems}
                items={categoryItems}
                trailingItem={uncategorizedItem}
                activeKey={activeLinkCategory}
                isModeActive={mode === "saved"}
                accent={accent}
                addPlaceholder="New category…"
                onSelect={onSelectLinkCategory}
                onAdd={onAddLinkCategory}
                onRename={onRenameLinkCategory}
                onRemove={onRemoveLinkCategory}
                onReorder={onReorderLinkCategories}
                onSetColor={onSetLinkCategoryColor}
              />
            </div>
          </div>
        )}

        <div className="my-1 border-t border-brand-100 dark:border-brand-800/60" />

        {renderNavRow({
          isActive: mode === "news",
          label: "The Yard",
          subtitle: "General News",
          emoji: "📰",
          dataTour: "nav-news",
          onClick: () => onSelectMode("news"),
        })}
        {renderNavRow({
          isActive: mode === "companies",
          label: "Pack Watch",
          subtitle: "Company News",
          emoji: "🏢",
          dataTour: "nav-companies",
          onClick: () => onSelectMode("companies"),
          expanded: companiesListExpanded,
          onToggleExpanded: collapsed ? undefined : onToggleCompaniesListExpanded,
          flyoutKey: "companies",
        })}
        {!collapsed && (
          <div
            className="grid transition-[grid-template-rows] duration-200 ease-out"
            style={{ gridTemplateRows: companiesListExpanded ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <SidebarSubList
                dataTour="industry-sub-list"
                pinnedItems={industryPinnedItems}
                items={industryItems}
                activeKey={activeIndustry}
                isModeActive={mode === "companies"}
                accent={accent}
                addPlaceholder="New industry…"
                onSelect={onSelectIndustry}
                onAdd={onAddIndustry}
                onRename={onRenameIndustry}
                onRemove={onRemoveIndustry}
                onReorder={onReorderIndustries}
                onSetEmoji={onSetIndustryEmoji}
              />
            </div>
          </div>
        )}
      </div>

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
              <p className="mb-1.5 text-[0.625rem] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
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
                className="mb-1.5 mt-3 flex w-full items-center justify-between text-[0.625rem] font-bold uppercase tracking-widest text-brand-400 hover:text-brand-600 dark:text-brand-600 dark:hover:text-brand-400"
              >
                <span>Sources ({enabledSources.length})</span>
                <span
                  aria-hidden="true"
                  className={`transition-transform ${sourcesListExpanded ? "rotate-0" : "-rotate-90"}`}
                >
                  ▾
                </span>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-200 ease-out"
                style={{ gridTemplateRows: sourcesListExpanded ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="space-y-1">
                    {enabledSources.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-1.5 text-[0.6875rem] text-brand-500 dark:text-brand-400"
                      >
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span className="truncate">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[0.625rem] text-brand-400 dark:text-brand-600">
                <span>
                  Last {days} day{days !== 1 ? "s" : ""}
                </span>
                {lastUpdatedLabel && <span>{lastUpdatedLabel}</span>}
              </div>
              <button
                type="button"
                onClick={onOpenDebugLog}
                className="mt-2 text-[0.625rem] font-bold uppercase tracking-widest text-brand-400 hover:text-brand-600 dark:text-brand-600 dark:hover:text-brand-400"
              >
                Debug Log
              </button>
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
            <>
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
                ✏️
              </button>
              <button
                type="button"
                onClick={onToggleTopicSourcesPanel}
                title="Edit Sources"
                className={`flex h-7 w-7 items-center justify-center rounded text-sm ${
                  topicSourcesOpen
                    ? "bg-emerald-100 dark:bg-emerald-500/15"
                    : "hover:bg-brand-100 dark:hover:bg-brand-800"
                }`}
              >
                🔗
              </button>
            </>
          ) : (
            <>
              <p className="mb-1.5 text-[0.625rem] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
                Manage
              </p>
              <button
                type="button"
                onClick={onToggleThemesPanel}
                className={`mb-1.5 w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                  themesOpen
                    ? `${accentPreset.softBg} ${accentPreset.text}`
                    : "bg-brand-100 text-brand-500 hover:bg-brand-200 dark:bg-brand-800/60 dark:text-brand-400 dark:hover:bg-brand-800"
                }`}
              >
                ✏️ Edit Themes
              </button>
              <button
                type="button"
                onClick={onToggleTopicSourcesPanel}
                className={`w-full rounded-md px-2 py-1.5 text-left text-xs font-semibold transition-colors ${
                  topicSourcesOpen
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                    : "bg-brand-100 text-brand-500 hover:bg-brand-200 dark:bg-brand-800/60 dark:text-brand-400 dark:hover:bg-brand-800"
                }`}
              >
                🔗 Edit Sources
              </button>
              <button
                type="button"
                onClick={onOpenDebugLog}
                className="mt-2 text-[0.625rem] font-bold uppercase tracking-widest text-brand-400 hover:text-brand-600 dark:text-brand-600 dark:hover:text-brand-400"
              >
                Debug Log
              </button>
            </>
          )}
        </div>
      )}

      {collapsed && openFlyout === "saved" && flyoutAnchor && (
        <SidebarFlyout
          title="Buried Bones"
          anchor={flyoutAnchor}
          pinnedItems={categoryPinnedItems}
          items={categoryItems}
          trailingItem={uncategorizedItem}
          activeKey={activeLinkCategory}
          accent={accent}
          onSelect={(key) => {
            onSelectLinkCategory(key);
            setOpenFlyout(null);
          }}
          onClose={() => setOpenFlyout(null)}
        />
      )}
      {collapsed && openFlyout === "companies" && flyoutAnchor && (
        <SidebarFlyout
          title="Pack Watch"
          anchor={flyoutAnchor}
          pinnedItems={industryPinnedItems}
          items={industryItems}
          activeKey={activeIndustry}
          accent={accent}
          onSelect={(key) => {
            onSelectIndustry(key);
            setOpenFlyout(null);
          }}
          onClose={() => setOpenFlyout(null)}
        />
      )}
    </aside>
  );
}
