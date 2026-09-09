"use client";

import { SUGGESTED_SOURCES } from "@/lib/defaults";
import type { NewsSource } from "@/lib/types";

interface SuggestedSourcesProps {
  existingSources: NewsSource[];
  onAdd: (name: string, domain: string, feedUrls: string[]) => void;
  onClose: () => void;
}

export function SuggestedSources({
  existingSources,
  onAdd,
  onClose,
}: SuggestedSourcesProps) {
  const existingDomains = new Set(existingSources.map((s) => s.domain));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-brand-200 bg-white shadow-2xl dark:border-brand-700 dark:bg-brand-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          <div>
            <h2 className="text-sm font-bold text-brand-900 dark:text-white">
              Suggested sources
            </h2>
            <p className="text-[11px] text-brand-400 dark:text-brand-600">
              Reputable financial/business outlets — add any with one click.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close suggested sources"
            className="rounded px-1.5 py-0.5 text-sm text-brand-400 hover:bg-brand-100 hover:text-brand-700 dark:hover:bg-brand-800 dark:hover:text-brand-200"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3">
          {(["US", "UK/EU", "Asia-Pacific"] as const).map((region) => {
            const sources = SUGGESTED_SOURCES.filter(
              (s) => s.region === region
            );
            if (sources.length === 0) return null;
            return (
              <div key={region} className="mb-4">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
                  {region}
                </p>
                <div className="space-y-1.5">
                  {sources.map((source) => {
                    const added = existingDomains.has(source.domain);
                    return (
                      <div
                        key={source.domain + source.name}
                        className="flex items-center justify-between gap-3 rounded-md border border-brand-200 px-3 py-2 dark:border-brand-800"
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
                          disabled={added}
                          onClick={() =>
                            onAdd(
                              source.name,
                              source.domain,
                              source.feedUrl ? [source.feedUrl] : []
                            )
                          }
                          className="shrink-0 rounded-md bg-blue-600 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-brand-300 dark:disabled:bg-brand-700"
                        >
                          {added ? "Added" : "+ Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <p className="text-[10px] text-brand-400 dark:text-brand-600">
            Feed URLs were compiled via research, not live-tested against
            this deployment&rsquo;s network — if one stops returning results, it
            still works as a site: filter through Google News.
          </p>
        </div>
      </div>
    </div>
  );
}
