"use client";

import { ACCENT_PRESETS } from "@/lib/defaults";
import { NEWS_TOPICS } from "@/lib/newsTopics";
import type { AccentColor, NewsTopicId } from "@/lib/types";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";

interface EditThemesModalProps {
  open: boolean;
  enabledTopics: NewsTopicId[];
  accent: AccentColor;
  onToggle: (id: NewsTopicId, enabled: boolean) => void;
  onClose: () => void;
}

// Same visual pattern as SourcesModal (sticky "enabled" list up top, the
// rest below to add) — General-page columns are opt-in/out the same way
// news sources are, just without regions to group the "more" list by.
export function EditThemesModal({
  open,
  enabledTopics,
  accent,
  onToggle,
  onClose,
}: EditThemesModalProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const { mounted, closing } = useAnimatedModal(open);
  const enabledSet = new Set(enabledTopics);
  const yourTopics = enabledTopics
    .map((id) => NEWS_TOPICS.find((t) => t.id === id))
    .filter((t): t is (typeof NEWS_TOPICS)[number] => Boolean(t));
  const moreTopics = NEWS_TOPICS.filter((t) => !enabledSet.has(t.id));

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4 ${closing ? "animate-modal-backdrop-out" : "animate-modal-backdrop"}`}
      onClick={onClose}
    >
      <div
        className={`flex max-h-[85vh] w-full max-w-2xl flex-col rounded-lg border border-brand-200 bg-white shadow-2xl dark:border-brand-700 dark:bg-brand-900 ${closing ? "animate-modal-panel-out" : "animate-modal-panel"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          <div>
            <h2 className="text-sm font-bold text-brand-900 dark:text-white">
              Edit Themes
            </h2>
            <p className="text-[11px] text-brand-400 dark:text-brand-600">
              Pick which columns show up on The Yard — drag a
              column&rsquo;s ⠿ handle on the board itself to reorder.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded px-1.5 py-0.5 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
          >
            ✕
          </button>
        </div>

        <div className={`overflow-y-auto px-4 pb-3 ${yourTopics.length > 0 ? "" : "pt-3"}`}>
          {yourTopics.length > 0 && (
            <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-brand-200 bg-white px-4 pb-3 dark:border-brand-800 dark:bg-brand-900">
              <p className="mb-1.5 pt-3 text-[11px] font-bold uppercase tracking-widest text-brand-500 dark:text-brand-400">
                ⭐ Your Themes ({yourTopics.length})
              </p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {yourTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 dark:border-brand-700 dark:bg-brand-800/50"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-900 dark:text-white">
                      <span aria-hidden="true">{topic.emoji}</span>
                      {topic.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggle(topic.id, false)}
                      disabled={yourTopics.length <= 1}
                      title={
                        yourTopics.length <= 1
                          ? "At least one theme must stay enabled"
                          : undefined
                      }
                      className="shrink-0 rounded-md border border-brand-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-brand-300 disabled:hover:bg-white disabled:hover:text-brand-600 dark:border-brand-600 dark:bg-brand-900 dark:text-brand-300 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {moreTopics.length > 0 && (
            <div className="mb-2">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
                More Themes
              </p>
              <div className="space-y-1.5">
                {moreTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-brand-200 bg-white px-3 py-2 dark:border-brand-800 dark:bg-brand-900"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-semibold text-brand-900 dark:text-white">
                      <span aria-hidden="true">{topic.emoji}</span>
                      {topic.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggle(topic.id, true)}
                      className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover}`}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
