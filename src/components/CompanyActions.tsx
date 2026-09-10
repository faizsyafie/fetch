"use client";

import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

interface CompanyActionsProps {
  dataTour?: string;
  selectedCount: number;
  totalCount: number;
  batchRunning: boolean;
  loadingCount: number;
  accent: AccentColor;
  onClear: () => void;
  onCollapse: () => void;
  onFetch: () => void;
}

// Lives at the right edge of the industry TabBar row, set off from the tab
// pills by an accent-tinted chip so it doesn't get lost among them.
// "Fetch!" is a single smart action: it fetches just the checkbox selection
// when one exists, otherwise the whole active industry — no separate
// "select all" needed.
export function CompanyActions({
  dataTour,
  selectedCount,
  totalCount,
  batchRunning,
  loadingCount,
  accent,
  onClear,
  onCollapse,
  onFetch,
}: CompanyActionsProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const fetchDisabled = batchRunning || (selectedCount === 0 && totalCount === 0);

  return (
    <div
      data-tour={dataTour}
      className={`flex shrink-0 items-center gap-1.5 rounded-lg border-l-2 py-1 pl-3 pr-1.5 ${accentPreset.border} ${accentPreset.softBg}`}
    >
      {selectedCount > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-brand-200 bg-white px-2.5 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-400 dark:hover:bg-brand-800"
        >
          Clear
        </button>
      )}
      <button
        type="button"
        onClick={onCollapse}
        className="rounded-md border border-brand-200 bg-white px-2.5 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-400 dark:hover:bg-brand-800"
      >
        Collapse
      </button>
      <button
        type="button"
        onClick={onFetch}
        disabled={fetchDisabled}
        className={`relative isolate rounded-full px-4 py-1.5 text-[11px] font-semibold text-white transition-transform ${
          fetchDisabled ? "cursor-not-allowed bg-brand-400" : `${accentPreset.solid} hover:animate-bone-jump`
        }`}
      >
        {/* Four corner knobs turn the pill into a bone silhouette — bg
            matches the bar exactly, so the shape reads as one solid bone
            regardless of how wide the label text makes the bar. */}
        {(["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"] as const).map(
          (pos) => (
            <span
              key={pos}
              aria-hidden="true"
              className={`absolute -z-10 h-3 w-3 rounded-full ${pos} ${
                fetchDisabled ? "bg-brand-400" : accentPreset.solid
              }`}
            />
          )
        )}
        {batchRunning
          ? `Fetching… (${loadingCount})`
          : selectedCount > 0
            ? `Fetch! (${selectedCount})`
            : "Fetch!"}
      </button>
    </div>
  );
}
