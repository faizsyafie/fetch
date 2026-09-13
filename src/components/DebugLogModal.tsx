"use client";

import { useDebugLog } from "@/lib/debugLog";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";

interface DebugLogModalProps {
  open: boolean;
  onClose: () => void;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

// A plain, unstyled record of sync/fetch failures (see debugLog.ts) — not a
// feature anyone needs day-to-day, so this stays deliberately minimal
// rather than matching the polish of the app's other modals.
export function DebugLogModal({ open, onClose }: DebugLogModalProps) {
  const { mounted, closing } = useAnimatedModal(open);
  const { entries, clear } = useDebugLog();

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4 ${closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop"}`}
      onClick={onClose}
    >
      <div
        className={`flex max-h-[75vh] w-full max-w-lg flex-col rounded-lg border border-brand-200 bg-white shadow-2xl dark:border-brand-700 dark:bg-brand-900 ${closing ? "animate-modal-panel-out" : "animate-modal-panel"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          <div>
            <h2 className="text-sm font-bold text-brand-900 dark:text-white">
              Debug Log
            </h2>
            <p className="text-[0.6875rem] text-brand-400 dark:text-brand-600">
              Local record of sync/fetch failures — nothing is sent anywhere.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={clear}
              disabled={entries.length === 0}
              className="text-[0.6875rem] text-brand-400 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-brand-200"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close debug log"
              className="rounded px-1.5 py-0.5 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto px-4 py-3">
          {entries.length === 0 ? (
            <p className="py-6 text-center text-xs text-brand-400 dark:text-brand-600">
              Nothing logged yet.
            </p>
          ) : (
            <div className="space-y-1.5 font-mono text-[0.6875rem]">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`rounded border px-2 py-1.5 ${
                    entry.level === "error"
                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
                      : "border-brand-200 bg-brand-50 text-brand-600 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
                  }`}
                >
                  <span className="text-brand-400 dark:text-brand-600">
                    {formatTimestamp(entry.timestamp)}
                  </span>{" "}
                  {entry.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
