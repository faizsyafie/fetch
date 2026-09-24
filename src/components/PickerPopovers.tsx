"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ACCENT_PRESETS, EMOJI_PICKER_OPTIONS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

const VIEWPORT_MARGIN = 8; // keep a small gap from the screen edge, not flush against it

// The anchor is just the trigger's own top-left corner — on a narrow phone
// viewport a trigger near the right/bottom edge would otherwise position the
// popover partially or fully off-screen. Measures the popover's own
// rendered size after mount (its width/height depend on content, e.g. how
// many emoji rows wrap) and nudges it back on-screen if it overflows.
function useClampedPosition(
  ref: React.RefObject<HTMLDivElement | null>,
  anchor: { top: number; left: number }
) {
  const [pos, setPos] = useState(anchor);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) {
      setPos(anchor);
      return;
    }
    const rect = el.getBoundingClientRect();
    const maxLeft = window.innerWidth - rect.width - VIEWPORT_MARGIN;
    const maxTop = window.innerHeight - rect.height - VIEWPORT_MARGIN;
    setPos({
      left: Math.max(VIEWPORT_MARGIN, Math.min(anchor.left, maxLeft)),
      top: Math.max(VIEWPORT_MARGIN, Math.min(anchor.top, maxTop)),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ref is stable
  }, [anchor.top, anchor.left]);

  return pos;
}

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
  const pos = useClampedPosition(ref, anchor);

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
      style={{ top: pos.top, left: pos.left }}
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
  const pos = useClampedPosition(ref, anchor);

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
      style={{ top: pos.top, left: pos.left }}
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
