"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

interface TimeFramePillsOption<T extends string | number> {
  label: string;
  value: T;
}

interface TimeFramePillsProps<T extends string | number> {
  dataTour?: string;
  options: TimeFramePillsOption<T>[];
  value: T;
  accent: AccentColor;
  onChange: (value: T) => void;
}

// Shared by both News's and Companies' time-range pills — a sliding accent
// pill glides between options (measured from the actual button so it works
// regardless of label width) instead of the highlight just jumping.
export function TimeFramePills<T extends string | number>({
  dataTour,
  options,
  value,
  accent,
  onChange,
}: TimeFramePillsProps<T>) {
  const accentPreset = ACCENT_PRESETS[accent];
  const buttonRefs = useRef(new Map<T, HTMLButtonElement>());
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const button = buttonRefs.current.get(value);
    if (button) {
      setThumb({ left: button.offsetLeft, width: button.offsetWidth });
    }
  }, [value, options]);

  return (
    <div
      data-tour={dataTour}
      className="relative flex shrink-0 items-center gap-0.5 rounded-lg border border-brand-200 bg-brand-50 p-0.5 dark:border-brand-800 dark:bg-brand-950/50"
    >
      {thumb && (
        <span
          aria-hidden="true"
          className={`absolute top-0.5 bottom-0.5 rounded-md shadow-sm transition-[left,width] duration-200 ease-out ${accentPreset.solid}`}
          style={{ left: thumb.left, width: thumb.width }}
        />
      )}
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          ref={(el) => {
            if (el) buttonRefs.current.set(opt.value, el);
            else buttonRefs.current.delete(opt.value);
          }}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`relative z-10 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
            value === opt.value
              ? "text-white"
              : "text-brand-500 hover:bg-brand-200/70 dark:text-brand-400 dark:hover:bg-brand-800"
          }`}
        >
          {opt.label.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
