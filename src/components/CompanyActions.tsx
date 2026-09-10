"use client";

import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";
import { BoneIcon } from "@/components/icons/BoneIcon";

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
        className={`group flex items-center gap-1 rounded-md ${accentPreset.solid} px-3 py-1 text-[11px] font-semibold text-white transition-colors ${accentPreset.solidHover} disabled:cursor-not-allowed disabled:bg-brand-400`}
      >
        <span aria-hidden="true" className="text-[13px] leading-none">
          🐾
        </span>
        <span className="grid h-3 w-3 scale-0 place-items-center opacity-0 transition-[transform,opacity] duration-150 group-hover:scale-100 group-hover:opacity-100">
          <BoneIcon className="h-3 w-3 text-white group-hover:animate-bone-wiggle" />
        </span>
        {batchRunning
          ? `Fetching… (${loadingCount})`
          : selectedCount > 0
            ? `Fetch! (${selectedCount})`
            : "Fetch!"}
      </button>
    </div>
  );
}
