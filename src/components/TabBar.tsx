"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACCENT_PRESETS, EMOJI_PICKER_OPTIONS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

export interface TabBarItem {
  key: string;
  emoji: string;
  label: string;
  count: number;
  /** When set, renders a colored circle instead of `emoji` — used by
   *  saved-link categories (see onSetColor) instead of per-item emoji. */
  swatchColor?: AccentColor;
}

interface TabBarProps {
  /** For the guided tour to anchor a spotlight step to this instance. */
  dataTour?: string;
  /** Rendered right-aligned, outside the scrollable pill row (e.g. the
   *  Companies page's Clear/Collapse/Fetch! actions). */
  actions?: React.ReactNode;
  /** Protected virtual views (e.g. All, Watchlist) — always first, never
   *  editable/reorderable/deletable. */
  pinnedItems: TabBarItem[];
  /** The user-managed list — reorderable, renamable, deletable in edit mode. */
  items: TabBarItem[];
  /** A protected fallback view rendered last (e.g. Uncategorized) — selectable
   *  only, never editable. */
  trailingItem?: TabBarItem;
  activeKey: string;
  accent: AccentColor;
  editMode: boolean;
  addPlaceholder: string;
  onSelect: (key: string) => void;
  onAdd: (name: string) => void;
  onRename: (oldKey: string, newKey: string) => void;
  onRemove: (key: string) => void;
  onReorder: (ordered: string[]) => void;
  onSetEmoji?: (key: string, emoji: string) => void;
  /** Mutually exclusive with onSetEmoji — swaps the edit-mode popover from
   *  an emoji grid to a color-swatch grid (see TabBarItem.swatchColor). */
  onSetColor?: (key: string, color: AccentColor) => void;
}

const SWATCH_COLOR_OPTIONS: AccentColor[] = [
  "blue",
  "teal",
  "emerald",
  "violet",
  "pink",
  "rose",
  "amber",
];

// Rendered via a portal at a fixed screen position (see anchor below) rather
// than absolutely inside the pill, so it isn't clipped by the tab row's
// overflow-x-auto — which, per CSS's overflow-x/y coupling rule, also
// clips vertical overflow once any axis is non-"visible".
function EmojiPicker({
  anchor,
  onPick,
  onClose,
}: {
  anchor: { top: number; left: number };
  onPick: (emoji: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleScroll() {
      onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{ top: anchor.top, left: anchor.left }}
      className="fixed z-50 grid w-52 grid-cols-6 gap-0.5 rounded-md border border-brand-200 bg-white p-2 shadow-lg dark:border-brand-700 dark:bg-brand-800"
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
    </div>,
    document.body
  );
}

// Same portal/positioning treatment as EmojiPicker, for saved-link
// categories (which pick a color swatch instead of an emoji glyph).
function ColorPicker({
  anchor,
  current,
  onPick,
  onClose,
}: {
  anchor: { top: number; left: number };
  current?: AccentColor;
  onPick: (color: AccentColor) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleScroll() {
      onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={ref}
      style={{ top: anchor.top, left: anchor.left }}
      className="fixed z-50 grid grid-cols-4 gap-1.5 rounded-md border border-brand-200 bg-white p-2.5 shadow-lg dark:border-brand-700 dark:bg-brand-800"
    >
      {SWATCH_COLOR_OPTIONS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onPick(color)}
          aria-label={color}
          title={color}
          className={`flex h-6 w-6 items-center justify-center rounded-full ${ACCENT_PRESETS[color].swatch} ${
            current === color ? "ring-2 ring-offset-2 ring-brand-400 dark:ring-offset-brand-800" : ""
          }`}
        />
      ))}
    </div>,
    document.body
  );
}

// A Google-News-style row of pills below the top bar: pinned virtual views,
// then the user's own managed list (reorderable/renamable/deletable in edit
// mode), then a protected trailing fallback, then a "+" to add a new one.
// Shared by Companies (industries) and Buried Bones (categories) for visual
// continuity between the two pages.
export function TabBar({
  dataTour,
  actions,
  pinnedItems,
  items,
  trailingItem,
  activeKey,
  accent,
  editMode,
  addPlaceholder,
  onSelect,
  onAdd,
  onRename,
  onRemove,
  onReorder,
  onSetEmoji,
  onSetColor,
}: TabBarProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const [emojiAnchor, setEmojiAnchor] = useState<{ top: number; left: number } | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addValue, setAddValue] = useState("");

  function startRename(item: TabBarItem) {
    setRenaming(item.key);
    setRenameValue(item.label);
  }

  function confirmRename() {
    if (renaming && renameValue.trim() && renameValue.trim() !== renaming) {
      onRename(renaming, renameValue.trim());
    }
    setRenaming(null);
  }

  function handleDrop(target: string) {
    if (!dragKey || dragKey === target) {
      setDragKey(null);
      setDragOverKey(null);
      return;
    }
    const keys = items.map((i) => i.key);
    const withoutDragged = keys.filter((k) => k !== dragKey);
    const targetIndex = withoutDragged.indexOf(target);
    const reordered = [
      ...withoutDragged.slice(0, targetIndex),
      dragKey,
      ...withoutDragged.slice(targetIndex),
    ];
    onReorder(reordered);
    setDragKey(null);
    setDragOverKey(null);
  }

  function confirmAdd() {
    const trimmed = addValue.trim();
    if (trimmed) onAdd(trimmed);
    setAddValue("");
    setAdding(false);
  }

  function renderPill(item: TabBarItem, editable: boolean) {
    const isActive = item.key === activeKey;
    const baseClass = `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
      isActive
        ? `${accentPreset.solid} text-white shadow-sm`
        : "text-brand-600 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800"
    }`;

    if (renaming === item.key) {
      return (
        <div
          key={item.key}
          className="flex shrink-0 items-center gap-1 rounded-full border border-brand-300 bg-white px-2 py-1 dark:border-brand-700 dark:bg-brand-900"
        >
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmRename();
              if (e.key === "Escape") setRenaming(null);
            }}
            className="w-28 bg-transparent text-xs text-brand-900 outline-none dark:text-white"
          />
          <button
            type="button"
            onClick={confirmRename}
            className="shrink-0 text-xs text-emerald-600 dark:text-emerald-400"
            aria-label="Confirm rename"
          >
            ✓
          </button>
        </div>
      );
    }

    return (
      <div
        key={item.key}
        draggable={editable && editMode}
        onDragStart={() => setDragKey(item.key)}
        onDragOver={(e) => {
          if (!editable || !editMode) return;
          e.preventDefault();
          setDragOverKey(item.key);
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleDrop(item.key);
        }}
        onDragEnd={() => {
          setDragKey(null);
          setDragOverKey(null);
        }}
        className={`relative shrink-0 ${
          editable && editMode ? "cursor-grab active:cursor-grabbing" : ""
        } ${
          editable && dragOverKey === item.key && dragKey !== item.key
            ? "rounded-full ring-2 ring-offset-1 ring-blue-500"
            : ""
        } ${editable && dragKey === item.key ? "opacity-50" : ""}`}
      >
        <button
          type="button"
          onClick={(e) => {
            if (editable && editMode && (onSetEmoji || onSetColor)) {
              const rect = e.currentTarget.getBoundingClientRect();
              setEmojiAnchor({ top: rect.bottom + 4, left: rect.left });
              setEmojiPickerFor((prev) => (prev === item.key ? null : item.key));
            } else {
              onSelect(item.key);
            }
          }}
          className={baseClass}
        >
          {item.swatchColor ? (
            <span
              aria-hidden="true"
              className={`inline-block h-2.5 w-2.5 rounded-full ${ACCENT_PRESETS[item.swatchColor].swatch}`}
            />
          ) : (
            <span aria-hidden="true">{item.emoji}</span>
          )}
          <span>{item.label}</span>
          <span
            className={`tabular-nums ${isActive ? "text-white/80" : "text-brand-400 dark:text-brand-500"}`}
          >
            {item.count}
          </span>
        </button>
        {editable && editMode && (
          <>
            <button
              type="button"
              onClick={() => startRename(item)}
              aria-label={`Rename ${item.label}`}
              title="Rename"
              className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] text-white shadow hover:bg-brand-600"
            >
              ✏
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.key)}
              aria-label={`Delete ${item.label}`}
              title="Delete"
              className="absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white shadow hover:bg-red-600"
            >
              ✕
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      data-tour={dataTour}
      className="flex min-w-0 items-center justify-between gap-3 border-b border-brand-200 bg-white px-5 py-2.5 dark:border-brand-800/80 dark:bg-brand-900"
    >
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 overflow-x-auto ${editMode ? "py-2" : ""}`}
      >
        {pinnedItems.map((item) => renderPill(item, false))}
        {pinnedItems.length > 0 && (items.length > 0 || trailingItem) && (
          <div className="h-5 shrink-0 border-l border-brand-200 dark:border-brand-700" />
        )}
        {items.map((item) => renderPill(item, true))}
        {trailingItem && renderPill(trailingItem, false)}

        {adding ? (
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-brand-300 bg-white px-2 py-1 dark:border-brand-700 dark:bg-brand-900">
            <input
              autoFocus
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmAdd();
                if (e.key === "Escape") {
                  setAdding(false);
                  setAddValue("");
                }
              }}
              onBlur={() => {
                if (!addValue.trim()) setAdding(false);
              }}
              placeholder={addPlaceholder}
              className="w-28 bg-transparent text-xs text-brand-900 outline-none placeholder:text-brand-400 dark:text-white"
            />
            <button
              type="button"
              onClick={confirmAdd}
              className="shrink-0 text-xs text-emerald-600 dark:text-emerald-400"
              aria-label="Confirm add"
            >
              ✓
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            aria-label="Add"
            title="Add"
            className="flex shrink-0 items-center justify-center rounded-full border border-dashed border-brand-300 px-3 py-1.5 text-[13px] font-medium text-brand-500 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-800"
          >
            +
          </button>
        )}
      </div>

      {actions}

      {emojiPickerFor && emojiAnchor && onSetEmoji && (
        <EmojiPicker
          anchor={emojiAnchor}
          onPick={(picked) => {
            onSetEmoji(emojiPickerFor, picked);
            setEmojiPickerFor(null);
          }}
          onClose={() => setEmojiPickerFor(null)}
        />
      )}
      {emojiPickerFor && emojiAnchor && onSetColor && (
        <ColorPicker
          anchor={emojiAnchor}
          current={items.find((i) => i.key === emojiPickerFor)?.swatchColor}
          onPick={(picked) => {
            onSetColor(emojiPickerFor, picked);
            setEmojiPickerFor(null);
          }}
          onClose={() => setEmojiPickerFor(null)}
        />
      )}
    </div>
  );
}
