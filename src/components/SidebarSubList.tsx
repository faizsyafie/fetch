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
  /** The user-managed list — always reorderable/renamable/deletable, no
   *  separate edit mode required (see renderRow's hover popover). */
  items: SidebarListItem[];
  /** A protected fallback view rendered last (e.g. Uncategorized) — selectable
   *  only, never editable. */
  trailingItem?: SidebarListItem;
  activeKey: string;
  accent: AccentColor;
  addPlaceholder: string;
  onSelect: (key: string) => void;
  onAdd: (name: string) => void;
  onRename: (oldKey: string, newKey: string) => void;
  onRemove: (key: string) => void;
  onReorder: (ordered: string[]) => void;
  onSetEmoji?: (key: string, emoji: string) => void;
  /** Mutually exclusive with onSetEmoji — swaps the icon popover from an
   *  emoji grid to a color-swatch grid (see SidebarListItem.swatchColor). */
  onSetColor?: (key: string, color: AccentColor) => void;
}

// The vertical, indented counterpart to the old horizontal TabBar pill row —
// rendered as a "subfolder" list under a sidebar nav item instead of a row
// under the top bar. Shared by Companies (industries) and Buried Bones
// (categories). No separate edit-mode toggle: hovering a row always reveals
// a small rename/delete popover, dragging always works, and clicking a
// row's own emoji/swatch icon opens its picker — one less mode to track.
export function SidebarSubList({
  dataTour,
  pinnedItems,
  items,
  trailingItem,
  activeKey,
  accent,
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
        draggable={editable}
        onDragStart={() => setDragKey(item.key)}
        onDragOver={(e) => {
          if (!editable) return;
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
        className={`group relative flex items-center ${editable ? "cursor-grab active:cursor-grabbing" : ""} ${
          editable && dragOverKey === item.key && dragKey !== item.key
            ? "rounded-md ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-brand-900"
            : ""
        } ${editable && dragKey === item.key ? "opacity-50" : ""}`}
      >
        <button
          type="button"
          onClick={() => onSelect(item.key)}
          className={baseClass}
        >
          {editable && (onSetEmoji || onSetColor) ? (
            <span
              role="button"
              tabIndex={0}
              aria-label={`Change ${item.label}'s ${item.swatchColor ? "color" : "emoji"}`}
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                setEmojiAnchor({ top: rect.bottom + 4, left: rect.left });
                setEmojiPickerFor((prev) => (prev === item.key ? null : item.key));
              }}
              className="shrink-0 rounded hover:ring-2 hover:ring-white/60"
            >
              {item.swatchColor ? (
                <span
                  aria-hidden="true"
                  className={`inline-block h-2.5 w-2.5 rounded-full ${ACCENT_PRESETS[item.swatchColor].swatch}`}
                />
              ) : (
                item.emoji
              )}
            </span>
          ) : item.swatchColor ? (
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
            className={`shrink-0 tabular-nums transition-opacity ${
              editable ? "group-hover:opacity-0" : ""
            } ${isActive ? "text-white/80" : "text-brand-400 dark:text-brand-500"}`}
          >
            {item.count}
          </span>
        </button>
        {editable && (
          <div className="pointer-events-none absolute right-1.5 flex shrink-0 items-center gap-1 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                startRename(item);
              }}
              aria-label={`Rename ${item.label}`}
              title="Rename"
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white shadow ${accentPreset.solid} ${accentPreset.solidHover}`}
            >
              ✏
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item.key);
              }}
              aria-label={`Delete ${item.label}`}
              title="Delete"
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white shadow ${accentPreset.solid} ${accentPreset.solidHover}`}
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
