"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ACCENT_PRESETS, UNCATEGORIZED_CATEGORY } from "@/lib/defaults";
import { highlightMatches } from "@/lib/highlight";
import type { AccentColor, SavedLink } from "@/lib/types";

interface ArticleData {
  title: string | null;
  byline: string | null;
  siteName: string | null;
  content: string;
}

interface SavedViewProps {
  links: SavedLink[];
  linkCategories: string[];
  accent: AccentColor;
  /** Active search term, if any — matches get highlighted in the title and
   *  notes preview below (see highlightMatches). */
  searchQuery?: string;
  onAddLink: () => void;
  onSelectLink: (id: string) => void;
  selectedId: string | null;
  onUpdateLink: (
    id: string,
    updates: { title?: string; notes?: string; category?: string }
  ) => void;
  onTogglePinned: (id: string) => void;
  onDeleteLink: (id: string) => void;
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function SavedView({
  links,
  linkCategories,
  accent,
  searchQuery,
  onAddLink,
  onSelectLink,
  selectedId,
  onUpdateLink,
  onTogglePinned,
  onDeleteLink,
}: SavedViewProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const highlightClass = `${accentPreset.softBg} ${accentPreset.text}`;
  const query = searchQuery?.trim() ?? "";
  const selected = links.find((l) => l.id === selectedId) ?? null;
  const [titleDraft, setTitleDraft] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<string | null>(null);

  // Inline reader — Buried Bones only, best-effort (see /api/article-content).
  // Result is keyed by link id (rather than resetting state synchronously at
  // the top of the effect) so a stale response for a link the user has since
  // navigated away from never gets rendered, and "loading" is simply "no
  // result yet for the currently selected link" — derived at render time.
  const [articleResult, setArticleResult] = useState<
    { id: string; status: "loaded"; data: ArticleData } | { id: string; status: "error"; error: string } | null
  >(null);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    const id = selected.id;

    fetch("/api/article-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: selected.url }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || data.error) {
          setArticleResult({ id, status: "error", error: data.error || "Couldn't load this article." });
          return;
        }
        setArticleResult({ id, status: "loaded", data });
      })
      .catch(() => {
        if (!cancelled) {
          setArticleResult({ id, status: "error", error: "Couldn't reach that page." });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selected]);

  const articleForSelected = selected && articleResult?.id === selected.id ? articleResult : null;
  const articleLoading = Boolean(selected) && !articleForSelected;
  const articleLoaded = articleForSelected?.status === "loaded" ? articleForSelected.data : null;
  const articleErrorMessage = articleForSelected?.status === "error" ? articleForSelected.error : null;

  if (links.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <button
          type="button"
          data-tour="saved-add-link"
          onClick={onAddLink}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover}`}
        >
          + Save link
        </button>
      </div>
    );
  }

  const activeTitle = titleDraft ?? selected?.title ?? "";
  const activeNotes = notesDraft ?? selected?.notes ?? "";

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex w-full max-w-sm shrink-0 flex-col overflow-hidden border-r border-brand-200 dark:border-brand-800">
        <div className="flex items-center justify-between border-b border-brand-200 p-3 dark:border-brand-800">
          <span className="text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
            {links.length} saved
          </span>
          <button
            type="button"
            data-tour="saved-add-link"
            onClick={onAddLink}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover}`}
          >
            + Save link
          </button>
        </div>
        <div data-tour="saved-links-list" className="flex-1 space-y-1 overflow-y-auto p-2">
          {links.map((link) => {
            const isActive = link.id === selectedId;
            return (
              <button
                key={link.id}
                type="button"
                onClick={() => {
                  onSelectLink(link.id);
                  setTitleDraft(null);
                  setNotesDraft(null);
                }}
                className={`block w-full rounded-md border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? `${accentPreset.border} ${accentPreset.softBg}`
                    : "border-transparent hover:bg-brand-50 dark:hover:bg-brand-800/40"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {link.pinned && <span className="shrink-0 text-xs">⭐</span>}
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-brand-900 dark:text-white">
                    {highlightMatches(link.title, query, highlightClass)}
                  </span>
                </div>
                <div className="mt-0.5 truncate text-[11px] text-brand-400 dark:text-brand-500">
                  {domainOf(link.url)} ·{" "}
                  {formatDistanceToNow(new Date(link.savedAt), { addSuffix: true })}
                </div>
                {link.notes && (
                  <div className="mt-1 truncate text-[11px] text-brand-500 dark:text-brand-400">
                    {highlightMatches(link.notes, query, highlightClass)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!selected ? (
        <div className="flex min-w-0 flex-1 items-center justify-center text-sm text-brand-400 dark:text-brand-500">
          Select a link to see its notes.
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 overflow-hidden">
          {articleLoaded && (
            <article className="min-w-0 flex-1 overflow-y-auto border-r border-brand-200 p-6 dark:border-brand-800">
              {articleLoaded.siteName && (
                <div className="text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
                  {articleLoaded.siteName}
                </div>
              )}
              <h1 className="mt-1 text-2xl font-bold text-brand-900 dark:text-white">
                {articleLoaded.title ?? selected.title}
              </h1>
              {articleLoaded.byline && (
                <div className="mt-1 text-xs text-brand-400 dark:text-brand-500">
                  {articleLoaded.byline}
                </div>
              )}
              <div
                className="article-body mt-4"
                dangerouslySetInnerHTML={{ __html: articleLoaded.content }}
              />
            </article>
          )}

          <div
            className={`flex min-w-0 flex-col overflow-y-auto p-5 ${
              articleLoaded ? "w-80 shrink-0" : "flex-1"
            }`}
          >
            <div className={articleLoaded ? "w-full" : "mx-auto w-full max-w-xl"}>
              <div className="flex items-start justify-between gap-2">
                <input
                  value={activeTitle}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={() => {
                    if (titleDraft !== null && titleDraft !== selected.title) {
                      onUpdateLink(selected.id, { title: titleDraft.trim() || selected.url });
                    }
                    setTitleDraft(null);
                  }}
                  className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-1 text-xl font-bold text-brand-900 outline-none hover:border-brand-200 focus:border-brand-300 focus:bg-white dark:text-white dark:hover:border-brand-700 dark:focus:bg-brand-900"
                />
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onTogglePinned(selected.id)}
                    aria-label={selected.pinned ? "Unpin" : "Pin"}
                    title={selected.pinned ? "Unpin" : "Pin"}
                    className={`rounded px-1.5 py-1 text-sm transition-opacity hover:bg-brand-100 dark:hover:bg-brand-800 ${
                      selected.pinned ? "opacity-100" : "opacity-30 hover:opacity-70"
                    }`}
                  >
                    ⭐
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteLink(selected.id)}
                    aria-label="Delete"
                    title="Delete"
                    className="rounded px-1.5 py-1 text-sm text-brand-400 opacity-60 transition-opacity hover:bg-brand-100 hover:text-red-500 hover:opacity-100 dark:hover:bg-brand-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-1 block truncate text-xs ${accentPreset.text} hover:underline`}
              >
                {selected.url}
              </a>

              {articleLoading && (
                <div className="mt-2 flex items-center gap-1.5 text-[11px] text-brand-400 dark:text-brand-500">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-300 border-t-blue-500 dark:border-brand-700 dark:border-t-blue-400" />
                  Loading inline reader…
                </div>
              )}
              {articleErrorMessage && (
                <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[11px] text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400">
                  {articleErrorMessage} You can still{" "}
                  <a
                    href={selected.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    open the original ↗
                  </a>
                  .
                </div>
              )}

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] text-brand-400 dark:text-brand-600">
                <select
                  value={
                    linkCategories.includes(selected.category)
                      ? selected.category
                      : UNCATEGORIZED_CATEGORY
                  }
                  onChange={(e) => onUpdateLink(selected.id, { category: e.target.value })}
                  className="rounded border border-brand-200 bg-transparent px-1.5 py-0.5 text-[11px] font-medium text-brand-600 outline-none dark:border-brand-700 dark:text-brand-300"
                >
                  <option value={UNCATEGORIZED_CATEGORY}>{UNCATEGORIZED_CATEGORY}</option>
                  {linkCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span>
                  · saved{" "}
                  {formatDistanceToNow(new Date(selected.savedAt), { addSuffix: true })}
                  {selected.editedAt !== selected.savedAt &&
                    ` · edited ${formatDistanceToNow(new Date(selected.editedAt), { addSuffix: true })}`}
                </span>
              </div>

              <textarea
                value={activeNotes}
                onChange={(e) => setNotesDraft(e.target.value)}
                onBlur={() => {
                  if (notesDraft !== null && notesDraft !== selected.notes) {
                    onUpdateLink(selected.id, { notes: notesDraft });
                  }
                  setNotesDraft(null);
                }}
                placeholder="Add a note…"
                className="mt-4 h-64 w-full resize-none rounded-lg border border-brand-200 bg-white p-3 text-sm text-brand-800 outline-none focus:border-brand-300 dark:border-brand-800 dark:bg-brand-900 dark:text-brand-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
