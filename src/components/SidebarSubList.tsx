"use client";

import { useState } from "react";
import { ACCENT_PRESETS } from "@/lib/defaults";
import { EmojiPicker, ColorPicker } from "@/components/PickerPopovers";
import type { AccentColor, SidebarListItem } from "@/lib/types";

interface SidebarSubListProps {
  dataTour?: string;
  /** Protected virtual views (e.g. All, Watchlist) — always first, never
   *  editable/reorderable/deletable. */
  pinnedItems: SidebarListItem[];
  /** The user-managed list — reorderable, renamable, deletable in edit mode. */
  items: SidebarListItem[];
  /** A protected fallback view rendered last (e.g. Uncategorized) — selectable
   *  only, never editable. */
  trailingItem?: SidebarListItem;
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
   *  an emoji grid to a color-swatch grid (see SidebarListItem.swatchColor). */
  onSetColor?: (key: string, color: AccentColor) => void;
}

// The vertical, indented counterpart to the old horizontal TabBar pill row —
// same pinned/reorderable/trailing/add structure and edit-mode affordances,
// just rendered as a "subfolder" list under a sidebar nav item instead of a
// row under the top bar. Shared by Companies (industries) and Buried Bones
// (categories).
export function SidebarSubList({
  dataTour,
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
}: SidebarSubListProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null);
  const [emojiAnchor, setEmojiAnchor] = useState<{ top: number; left: number } | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addValue, setAddValue] = useState("");

  function startRename(item: SidebarListItem) {
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

  function renderRow(item: SidebarListItem, editable: boolean) {
    const isActive = item.key === activeKey;
    const baseClass = `flex min-w-0 flex-1 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-left text-[12px] font-medium transition-colors ${
      isActive
        ? `${accentPreset.solid} text-white shadow-sm`
        : "text-brand-600 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800"
    }`;

    if (renaming === item.key) {
      return (
        <div
          key={item.key}
          className="flex items-center gap-1 rounded-md border border-brand-300 bg-white px-1.5 py-1 dark:border-brand-700 dark:bg-brand-900"
        >
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmRename();
              if (e.key === "Escape") setRenaming(null);
            }}
            className="w-full min-w-0 bg-transparent text-xs text-brand-900 outline-none dark:text-white"
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
        className={`group relative flex items-center gap-1 ${
          editable && editMode ? "cursor-grab active:cursor-grabbing" : ""
        } ${
          editable && dragOverKey === item.key && dragKey !== item.key
            ? "rounded-md ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-brand-900"
            : ""
        } ${editable && dragKey === item.key ? "opacity-50" : ""}`}
      >
        <button
          type="button"
          onClick={(e) => {
            if (editable && editMode && (onSetEmoji || onSetColor)) {
              const rect = e.currentTarget.getBoundingClientRect();
              setEmojiAnchor({ top: rect.top, left: rect.right + 6 });
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
              className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${ACCENT_PRESETS[item.swatchColor].swatch}`}
            />
          ) : (
            <span aria-hidden="true" className="shrink-0">
              {item.emoji}
            </span>
          )}
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          <span
            className={`shrink-0 tabular-nums ${isActive ? "text-white/80" : "text-brand-400 dark:text-brand-500"}`}
          >
            {item.count}
          </span>
        </button>
        {editable && editMode && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => startRename(item)}
              aria-label={`Rename ${item.label}`}
              title="Rename"
              className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] text-white shadow hover:bg-brand-600"
            >
              ✏
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.key)}
              aria-label={`Delete ${item.label}`}
              title="Delete"
              className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white shadow hover:bg-red-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div data-tour={dataTour} className="space-y-0.5 py-1 pl-6 pr-2">
      {pinnedItems.map((item) => renderRow(item, false))}
      {items.map((item) => renderRow(item, true))}
      {trailingItem && renderRow(trailingItem, false)}

      {adding ? (
        <div className="flex items-center gap-1 rounded-md border border-brand-300 bg-white px-1.5 py-1 dark:border-brand-700 dark:bg-brand-900">
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
            className="w-full min-w-0 bg-transparent text-xs text-brand-900 outline-none placeholder:text-brand-400 dark:text-white"
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
          className="flex w-full items-center justify-center rounded-md border border-dashed border-brand-300 px-2 py-1 text-[12px] font-medium text-brand-500 transition-colors hover:border-brand-400 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-400 dark:hover:bg-brand-800"
        >
          +
        </button>
      )}

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
