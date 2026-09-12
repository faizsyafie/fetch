"use client";

import { useState } from "react";
import { ACCENT_PRESETS, UNCATEGORIZED_CATEGORY } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

interface SaveLinkModalProps {
  /** Prefilled + read-only when saving a known article; editable when the
   *  user is pasting an arbitrary URL via "+ Save link". */
  initialUrl?: string;
  initialTitle?: string;
  categories: string[];
  defaultCategory: string;
  accent: AccentColor;
  onSave: (input: { url: string; title: string; notes: string; category: string }) => void;
  onClose: () => void;
}

export function SaveLinkModal({
  initialUrl,
  initialTitle,
  categories,
  defaultCategory,
  accent,
  onSave,
  onClose,
}: SaveLinkModalProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const urlIsFixed = Boolean(initialUrl);
  const [url, setUrl] = useState(initialUrl ?? "");
  const [title, setTitle] = useState(initialTitle ?? "");
  const [titleTouched, setTitleTouched] = useState(Boolean(initialTitle));
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [fetchingTitle, setFetchingTitle] = useState(false);

  // Only arbitrary manually-pasted URLs need an auto-fetched title — a
  // known article already carries its own title from the RSS feed.
  async function fetchTitleFor(candidateUrl: string) {
    if (urlIsFixed || titleTouched) return;
    try {
      new URL(candidateUrl);
    } catch {
      return;
    }
    setFetchingTitle(true);
    try {
      const res = await fetch("/api/link-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: candidateUrl }),
      });
      const data = await res.json().catch(() => ({ title: null }));
      if (data?.title && !titleTouched) setTitle(data.title);
    } catch {
      // Best-effort — user can just type a title themselves.
    } finally {
      setFetchingTitle(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
    onSave({ url: trimmedUrl, title: title.trim() || trimmedUrl, notes, category });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4 animate-modal-backdrop"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-brand-200 bg-white shadow-2xl animate-modal-panel dark:border-brand-700 dark:bg-brand-900"
      >
        <div className="flex items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          <h2 className="text-sm font-bold text-brand-900 dark:text-white">
            🔖 Save link
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
          {urlIsFixed ? (
            <p className="truncate text-xs text-brand-500 dark:text-brand-400">
              {url}
            </p>
          ) : (
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
                URL
              </label>
              <input
                autoFocus
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={(e) => void fetchTitleFor(e.target.value)}
                placeholder="https://…"
                className={`w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:${accentPreset.border} dark:border-brand-700 dark:bg-brand-950 dark:text-white`}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Title {fetchingTitle && <span className="normal-case">(fetching…)</span>}
            </label>
            <input
              autoFocus={urlIsFixed}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleTouched(true);
              }}
              placeholder="Link title"
              className={`w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:${accentPreset.border} dark:border-brand-700 dark:bg-brand-950 dark:text-white`}
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:${accentPreset.border} dark:border-brand-700 dark:bg-brand-950 dark:text-white`}
            >
              <option value={UNCATEGORIZED_CATEGORY}>{UNCATEGORIZED_CATEGORY}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note…"
              rows={4}
              className={`w-full resize-none rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-900 outline-none focus:${accentPreset.border} dark:border-brand-700 dark:bg-brand-950 dark:text-white`}
            />
          </div>
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
            disabled={!url.trim()}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover} disabled:cursor-not-allowed disabled:opacity-50`}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
