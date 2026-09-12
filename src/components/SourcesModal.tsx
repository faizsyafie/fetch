"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import { ACCENT_PRESETS, SUGGESTED_SOURCES } from "@/lib/defaults";
import type { AccentColor, NewsSource, SourceRegion } from "@/lib/types";
import { useAnimatedModal } from "@/hooks/useAnimatedModal";

interface SourcesModalProps {
  open: boolean;
  sources: NewsSource[];
  accent: AccentColor;
  onAdd: (name: string, domain: string, feedUrls: string[]) => void;
  onRemove: (id: string) => void;
  onResetDefaults: () => void;
  onClearCache: () => void;
  onClose: () => void;
}

const REGION_ORDER: SourceRegion[] = [
  "Recommended",
  "US",
  "UK/EU",
  "Asia-Pacific",
  "Malaysia",
];

const REGION_LABEL: Record<SourceRegion, string> = {
  Recommended: "⭐ Recommended",
  US: "US",
  "UK/EU": "UK/EU",
  "Asia-Pacific": "Asia-Pacific",
  Malaysia: "Malaysia",
};

// A stable, CSS-safe view-transition-name shared by a source's row whether
// it's rendered in "Your Sources" or in a suggestion list — since a domain
// only ever appears in exactly one of those places at a time, this is what
// lets the browser glide the same row between them on add/remove.
function transitionName(domain: string): string {
  return `src-${domain.replace(/[^a-zA-Z0-9]/g, "-")}`;
}

// Wraps a state-changing action in a View Transition (native browser API,
// not React's experimental component) so the row appears to glide from its
// suggestion bucket up into "Your Sources", or back down on removal.
// flushSync forces the resulting re-render to happen synchronously, which
// the View Transitions API requires to capture the "after" snapshot
// correctly. Falls back to a plain update on browsers without support.
function withGlide(update: () => void) {
  const doc = document as Document & {
    startViewTransition?: (callback: () => void) => void;
  };
  if (doc.startViewTransition) {
    doc.startViewTransition(() => flushSync(update));
  } else {
    update();
  }
}

export function SourcesModal({
  open,
  sources,
  accent,
  onAdd,
  onRemove,
  onResetDefaults,
  onClearCache,
  onClose,
}: SourcesModalProps) {
  const { mounted, closing } = useAnimatedModal(open);
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const accentPreset = ACCENT_PRESETS[accent];
  const existingByDomain = new Map(sources.map((s) => [s.domain, s]));

  function handleAdd(sourceName: string, sourceDomain: string, feedUrls: string[]) {
    withGlide(() => onAdd(sourceName, sourceDomain, feedUrls));
  }

  function handleRemove(id: string) {
    withGlide(() => onRemove(id));
  }

  function handleCustomAdd() {
    const trimmedDomain = domain
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!name.trim() || !trimmedDomain) return;
    handleAdd(name.trim(), trimmedDomain, []);
    setName("");
    setDomain("");
  }

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
              News Sources
            </h2>
            <p className="text-[11px] text-brand-400 dark:text-brand-600">
              Pick which outlets get searched — add any with one click.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={onResetDefaults}
              className="text-[11px] text-brand-400 transition-colors hover:text-brand-700 dark:hover:text-brand-200"
            >
              Reset defaults
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sources"
              className="rounded px-1.5 py-0.5 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
            >
              ✕
            </button>
          </div>
        </div>

        <div className={`overflow-y-auto px-4 pb-3 ${sources.length > 0 ? "" : "pt-3"}`}>
          {sources.length > 0 && (
            <div className="sticky top-0 z-10 -mx-4 mb-4 border-b border-brand-200 bg-white px-4 pb-3 dark:border-brand-800 dark:bg-brand-900">
              <p className="mb-1.5 pt-3 text-[11px] font-bold uppercase tracking-widest text-brand-500 dark:text-brand-400">
                ⭐ Your Sources ({sources.length})
              </p>
              <div className="max-h-40 space-y-1.5 overflow-y-auto">
                {sources.map((source) => (
                  <div
                    key={source.id}
                    style={{ viewTransitionName: transitionName(source.domain) }}
                    className="flex items-center justify-between gap-3 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 dark:border-brand-700 dark:bg-brand-800/50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-brand-900 dark:text-white">
                          {source.name}
                        </span>
                        <span className="text-[10px] text-brand-400 dark:text-brand-500">
                          ({source.domain})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(source.id)}
                      className="shrink-0 rounded-md border border-brand-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-brand-600 dark:bg-brand-900 dark:text-brand-300 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {REGION_ORDER.map((region) => {
            const regionSources = SUGGESTED_SOURCES.filter(
              (s) => s.region === region && !existingByDomain.has(s.domain)
            );
            if (regionSources.length === 0) return null;
            const isRecommended = region === "Recommended";
            return (
              <div
                key={region}
                className={`mb-4 rounded-lg ${isRecommended ? `${accentPreset.softBg} p-3` : ""}`}
              >
                <p
                  className={`mb-1.5 text-[11px] font-bold uppercase tracking-widest ${
                    isRecommended
                      ? accentPreset.text
                      : "text-brand-400 dark:text-brand-600"
                  }`}
                >
                  {REGION_LABEL[region]}
                </p>
                <div className="space-y-1.5">
                  {regionSources.map((source) => (
                    <div
                      key={source.domain + source.name}
                      style={{ viewTransitionName: transitionName(source.domain) }}
                      className="flex items-center justify-between gap-3 rounded-md border border-brand-200 bg-white px-3 py-2 dark:border-brand-800 dark:bg-brand-900"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-brand-900 dark:text-white">
                            {source.name}
                          </span>
                          <span className="text-[10px] text-brand-400 dark:text-brand-500">
                            ({source.domain})
                          </span>
                          {!source.feedUrl && (
                            <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[9px] font-semibold text-brand-500 dark:bg-brand-800 dark:text-brand-400">
                              site: filter only
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-brand-500 dark:text-brand-400">
                          {source.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleAdd(
                            source.name,
                            source.domain,
                            source.feedUrl ? [source.feedUrl] : []
                          )
                        }
                        className={`shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover}`}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mb-3">
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Other
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Display name (e.g. Reuters)"
                className="w-36 rounded-md border border-brand-200 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-blue-500 dark:border-brand-700 dark:bg-brand-800/70 dark:text-white"
              />
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomAdd()}
                placeholder="Domain (e.g. reuters.com)"
                className="w-44 rounded-md border border-brand-200 px-2.5 py-1.5 text-xs outline-none transition-colors focus:border-blue-500 dark:border-brand-700 dark:bg-brand-800/70 dark:text-white"
              />
              <button
                type="button"
                onClick={handleCustomAdd}
                className={`rounded-md px-3 py-1.5 text-[11px] font-semibold text-white ${accentPreset.solid} ${accentPreset.solidHover}`}
              >
                + Add
              </button>
            </div>
          </div>

          <p className="text-[10px] text-brand-400 dark:text-brand-600">
            Sources are matched by domain and used as feed filters. Feed URLs
            were compiled via research, not live-tested against this
            deployment&rsquo;s network — if one stops returning results, it
            still works as a site: filter through Google News.{" "}
            <button
              type="button"
              onClick={onClearCache}
              className="text-blue-600 underline hover:text-blue-500 dark:text-blue-400"
            >
              Clear cache
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
