"use client";

import type { Density } from "@/lib/types";

interface DensityToggleProps {
  density: Density;
  onToggle: () => void;
}

export function DensityToggle({ density, onToggle }: DensityToggleProps) {
  const isCompact = density === "compact";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isCompact ? "comfortable" : "compact"} density`}
      title={`Switch to ${isCompact ? "comfortable" : "compact"} density`}
      className="flex shrink-0 items-center justify-center rounded-lg border border-brand-200 bg-brand-50 px-2.5 py-1.5 text-xs font-medium text-brand-600 transition hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-300 dark:hover:bg-brand-700"
    >
      <span aria-hidden="true">{isCompact ? "☰" : "▦"}</span>
    </button>
  );
}
