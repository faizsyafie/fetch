"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor, SidebarListItem } from "@/lib/types";

interface SidebarFlyoutProps {
  title: string;
  anchor: { top: number; left: number };
  pinnedItems: SidebarListItem[];
  items: SidebarListItem[];
  trailingItem?: SidebarListItem;
  activeKey: string;
  accent: AccentColor;
  onSelect: (key: string) => void;
  onClose: () => void;
}

// A read-only "jump to list" menu for switching Buried Bones categories or
// Pack Watch industries while the sidebar is collapsed, without needing to
// re-expand it first. Editing (rename/delete/reorder/emoji) still requires
// expanding — this is purely a shortcut for changing which list is active,
// same portal/positioning treatment as EmojiPicker/ColorPicker.
export function SidebarFlyout({
  title,
  anchor,
  pinnedItems,
  items,
  trailingItem,
  activeKey,
  accent,
  onSelect,
  onClose,
}: SidebarFlyoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const accentPreset = ACCENT_PRESETS[accent];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function handleScroll() {
      onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onClose]);

  const allItems = [
    ...pinnedItems,
    ...items,
    ...(trailingItem ? [trailingItem] : []),
  ];

  return createPortal(
    <div
      ref={ref}
      style={{ top: anchor.top, left: anchor.left }}
      className="fixed z-50 max-h-[70vh] w-56 overflow-y-auto rounded-md border border-brand-200 bg-white p-1.5 shadow-lg dark:border-brand-700 dark:bg-brand-800"
    >
      <p className="mb-1 px-2 pt-1 text-[0.625rem] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
        {title}
      </p>
      <div className="space-y-0.5">
        {allItems.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`flex w-full items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-left text-[0.75rem] font-medium transition-colors ${
                isActive
                  ? `${accentPreset.solid} text-white shadow-sm`
                  : "text-brand-600 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800"
              }`}
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
                className={`shrink-0 tabular-nums ${
                  isActive ? "text-white/80" : "text-brand-400 dark:text-brand-500"
                }`}
              >
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );
}
