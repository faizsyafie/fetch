"use client";

import { useState } from "react";
import { ACCENT_PRESETS } from "@/lib/defaults";
import { NEWS_TOPICS, resolveTopicSources } from "@/lib/newsTopics";
import type { AccentColor, NewsTopicId, NewsTopicSourceState } from "@/lib/types";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";

interface TopicSourcesModalProps {
  open: boolean;
  /** Only the columns currently shown on The Yard are editable here — add
   *  a column via Edit Themes first if it isn't in this list yet. */
  enabledTopics: NewsTopicId[];
  topicSources: Partial<Record<NewsTopicId, NewsTopicSourceState[]>>;
  accent: AccentColor;
  onAdd: (topicId: NewsTopicId, name: string, feedUrl: string) => void;
  onRemove: (topicId: NewsTopicId, sourceId: string) => void;
  onResetDefaults: (topicId: NewsTopicId) => void;
  onClose: () => void;
}

// The Yard's per-topic counterpart to SourcesModal (Pack Watch's source
// editor) — same "your sources" list + remove + add-your-own shape, just
// scoped to one column at a time via the pill row up top, since each
// column's feeds are curated to match that column specifically (see
// NEWS_TOPICS's comment in newsTopics.ts) rather than shared globally.
export function TopicSourcesModal({
  open,
  enabledTopics,
  topicSources,
  accent,
  onAdd,
  onRemove,
  onResetDefaults,
  onClose,
}: TopicSourcesModalProps) {
  const { mounted, closing } = useAnimatedModal(open);
  const accentPreset = ACCENT_PRESETS[accent];
  const [selectedTopicId, setSelectedTopicId] = useState<NewsTopicId | null>(
    enabledTopics[0] ?? null
  );
  const [name, setName] = useState("");
  const [feedUrl, setFeedUrl] = useState("");

  // Adjusted during render rather than in an effect (same pattern as
  // page.tsx's modeTrackedFor) — falls back to the first enabled topic
  // whenever the current selection stops being valid, e.g. the modal just
  // opened or that topic got disabled via Edit Themes while this was open.
  if (open && (!selectedTopicId || !enabledTopics.includes(selectedTopicId))) {
    setSelectedTopicId(enabledTopics[0] ?? null);
  }

  if (!mounted) return null;

  const topics = enabledTopics
    .map((id) => NEWS_TOPICS.find((t) => t.id === id))
    .filter((t): t is (typeof NEWS_TOPICS)[number] => Boolean(t));
  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null;
  const sources = selectedTopic ? resolveTopicSources(selectedTopic, topicSources) : [];

  function handleAdd() {
    if (!selectedTopicId) return;
    const trimmedFeedUrl = feedUrl.trim();
    if (!name.trim() || !trimmedFeedUrl) return;
    onAdd(selectedTopicId, name.trim(), trimmedFeedUrl);
    setName("");
    setFeedUrl("");
  }

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
              Edit Sources
            </h2>
            <p className="text-[0.6875rem] text-brand-400 dark:text-brand-600">
              Pick a column, then add or remove its feeds.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => selectedTopicId && onResetDefaults(selectedTopicId)}
              disabled={!selectedTopicId}
              className="text-[0.6875rem] text-brand-400 transition-colors hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:text-brand-200"
            >
              Reset defaults
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sources"
              className="rounded p-2 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200 md:px-1.5 md:py-0.5"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          {topics.map((topic) => (
            <button
              key={topic.id}
              type="button"
              onClick={() => setSelectedTopicId(topic.id)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                topic.id === selectedTopicId
                  ? `border-brand-900 bg-brand-100 text-brand-900 dark:border-white dark:bg-brand-800 dark:text-white`
                  : "border-brand-200 text-brand-600 hover:bg-brand-50 dark:border-brand-700 dark:text-brand-300 dark:hover:bg-brand-800"
              }`}
            >
              <span aria-hidden="true">{topic.emoji}</span>
              {topic.label}
            </button>
          ))}
        </div>

        <div className={`overflow-y-auto px-4 pb-3 ${sources.length > 0 ? "" : "pt-3"}`}>
          {sources.length > 0 && (
            <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-brand-200 bg-white px-4 pb-3 dark:border-brand-800 dark:bg-brand-900">
              <p className="mb-1.5 pt-3 text-[0.6875rem] font-bold uppercase tracking-widest text-brand-500 dark:text-brand-400">
                {selectedTopic?.label} sources ({sources.length})
              </p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 dark:border-brand-700 dark:bg-brand-800/50"
                  >
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-brand-900 dark:text-white">
                        {source.name}
                      </span>
                      <p className="truncate text-[0.625rem] text-brand-400 dark:text-brand-500">
                        {source.feedUrl}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => selectedTopicId && onRemove(selectedTopicId, source.id)}
                      className="shrink-0 rounded-md border border-brand-300 bg-white px-2.5 py-1 text-[0.6875rem] font-semibold text-brand-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-brand-600 dark:bg-brand-900 dark:text-brand-300 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-3">
            <p className="mb-1.5 text-[0.6875rem] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Add a feed to {selectedTopic?.label ?? "this column"}
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name (e.g. Reuters)"
                className="w-36 rounded-md border border-brand-200 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-blue-500 dark:border-brand-700 dark:bg-brand-800/70 dark:text-white"
              />
              <input
                value={feedUrl}
                onChange={(e) => setFeedUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="RSS feed URL"
                className="w-64 rounded-md border border-brand-200 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-blue-500 dark:border-brand-700 dark:bg-brand-800/70 dark:text-white"
              />
              <button
                type="button"
                onClick={handleAdd}
                className={`rounded-md px-3 py-1.5 text-[0.6875rem] font-semibold text-white ${accentPreset.solid} ${accentPreset.solidHover}`}
              >
                + Add
              </button>
            </div>
          </div>

          <p className="text-[0.625rem] text-brand-400 dark:text-brand-600">
            Each column pulls every recent item from its own feeds directly —
            no keyword matching — so a feed added here should already be
            scoped to {selectedTopic?.label ?? "this column"}&rsquo;s topic
            rather than a general wire feed. Changes take effect next time
            you hit Re-fetch! or switch back to The Yard.
          </p>
        </div>
      </div>
    </div>
  );
}
