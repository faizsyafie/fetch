"use client";

import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

interface CompanySelectionActionsProps {
  selectedCount: number;
  expandedCount: number;
  accent: AccentColor;
  onClear: () => void;
  onCollapse: () => void;
}

// Slides open next to the time-frame pills/Fetch! button — which stay put
// in the exact same spot The Yard's Re-fetch! occupies — only once there's
// something to act on: a checkbox selection (Clear) or an expanded row
// (Collapse). Blank state renders nothing so the two top bars match.
export function CompanySelectionActions({
  selectedCount,
  expandedCount,
  accent,
  onClear,
  onCollapse,
}: CompanySelectionActionsProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const visible = selectedCount > 0 || expandedCount > 0;

  return (
    <div
      className="grid transition-[grid-template-columns] duration-200 ease-out"
      style={{ gridTemplateColumns: visible ? "1fr" : "0fr" }}
    >
      <div className="overflow-hidden">
        <div
          className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border-l-2 py-1 pl-3 pr-1.5 ${accentPreset.border} ${accentPreset.softBg}`}
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
          {expandedCount > 0 && (
            <button
              type="button"
              onClick={onCollapse}
              className="rounded-md border border-brand-200 bg-white px-2.5 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-400 dark:hover:bg-brand-800"
            >
              Collapse
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
