"use client";

import { useState } from "react";
import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";

interface BulkAddCompaniesModalProps {
  open: boolean;
  industry: string;
  accent: AccentColor;
  onClose: () => void;
  onAdd: (names: string[]) => void;
}

export function BulkAddCompaniesModal({
  open,
  industry,
  accent,
  onClose,
  onAdd,
}: BulkAddCompaniesModalProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const { mounted, closing } = useAnimatedModal(open);
  const [text, setText] = useState("");

  const [openTrackedFor, setOpenTrackedFor] = useState(open);
  if (open !== openTrackedFor) {
    setOpenTrackedFor(open);
    if (open) setText("");
  }

  if (!mounted) return null;

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;
    onAdd(lines);
    onClose();
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4 ${closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop"}`}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg rounded-lg border border-brand-200 bg-white shadow-2xl dark:border-brand-700 dark:bg-brand-900 ${closing ? "animate-modal-panel-out" : "animate-modal-panel"}`}
      >
        <div className="flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          <h2 className="text-sm font-bold text-brand-900 dark:text-white">
            📋 Paste a list of companies
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-1.5 py-0.5 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 px-4 py-4">
          <p className="text-xs text-brand-500 dark:text-brand-400">
            Each line becomes a new company in{" "}
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              {industry}
            </span>
            . Paste a single column from Excel or Sheets and it&rsquo;ll
            already be formatted this way — one company name per line.
          </p>

          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              "Exxon Mobil Corporation\nFirst Abu Dhabi Bank PJSC\nFonterra Co-operative Group Limited\nFranklin Resources, Inc.\nGeberit AG\nGeneral Electric Company"
            }
            rows={10}
            className={`w-full resize-none rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 font-mono text-xs text-brand-900 outline-none focus:${accentPreset.border} dark:border-brand-700 dark:bg-brand-950 dark:text-white`}
          />

          <p className="text-[0.6875rem] text-brand-400 dark:text-brand-600">
            {lines.length > 0
              ? `${lines.length} compan${lines.length === 1 ? "y" : "ies"} detected. Duplicates already in this industry are skipped automatically.`
              : "Nothing pasted yet."}
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-brand-200 px-4 py-3 dark:border-brand-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-100 dark:text-brand-300 dark:hover:bg-brand-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={lines.length === 0}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Add {lines.length > 0 ? lines.length : ""} compan
            {lines.length === 1 ? "y" : "ies"}
          </button>
        </div>
      </form>
    </div>
  );
}
