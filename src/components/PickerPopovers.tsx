"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ACCENT_PRESETS, EMOJI_PICKER_OPTIONS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

export const SWATCH_COLOR_OPTIONS: AccentColor[] = [
  "blue",
  "teal",
  "emerald",
  "violet",
  "pink",
  "rose",
  "amber",
];

// Rendered via a portal at a fixed screen position (see anchor below) rather
// than absolutely inside the pill/row, so it isn't clipped by a scrollable
// ancestor's overflow — which, per CSS's overflow-x/y coupling rule, also
// clips the other axis once either is non-"visible". Shared by TabBar's
// horizontal pills and the sidebar's vertical sub-list rows.
export function EmojiPicker({
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
export function ColorPicker({
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
