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
      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      <span aria-hidden="true">{isCompact ? "☰" : "▦"}</span>
      {isCompact ? "Compact" : "Comfortable"}
    </button>
  );
}
