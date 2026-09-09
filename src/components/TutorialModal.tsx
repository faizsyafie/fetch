"use client";

import { useState } from "react";

interface Slide {
  title: string;
  points: string[];
}

const SLIDES: Slide[] = [
  {
    title: "Welcome to the news tracker",
    points: [
      "Companies are organized into industries in the left sidebar.",
      "Click an industry to see its companies; use the search box to find a company across every industry.",
      "Drag the right edge of the sidebar to resize it, or collapse it with the « button.",
    ],
  },
  {
    title: "Fetching news",
    points: [
      "Click a company row to expand it and fetch its latest news.",
      "Check the boxes next to companies, then use Fetch News to pull several at once.",
      "Use Fetch All to pull news for every company in the current industry.",
      "The time-range control (1D–30D) limits how far back articles are pulled.",
    ],
  },
  {
    title: "Staying organized",
    points: [
      "📌 Pin important companies to keep them at the top of their industry.",
      "A dot badge shows articles you haven't opened yet — it clears once you expand the card.",
      "Add a private note to any company from its expanded card.",
    ],
  },
  {
    title: "Editing lists & sources",
    points: [
      "Edit Lists lets you add, rename, delete, and reorder industries and companies, and set a custom emoji per industry.",
      "Edit Sources controls which news domains are searched.",
      "Drag rows by their handle to reorder companies or industries.",
    ],
  },
  {
    title: "Shortcuts & navigation",
    points: [
      "Press / to jump to the search box.",
      "Press ⌘K / Ctrl+K to open the command palette and jump straight to any company or industry.",
      "Use ↑/↓ or j/k to move through the list, and Enter to expand the highlighted row.",
      "Toggle Compact density from the top bar to fit more rows on screen.",
    ],
  },
];

interface TutorialModalProps {
  onClose: () => void;
}

export function TutorialModal({ onClose }: TutorialModalProps) {
  const [page, setPage] = useState(0);
  const slide = SLIDES[page];
  const isLast = page === SLIDES.length - 1;
  const isFirst = page === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Tutorial · {page + 1}/{SLIDES.length}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close tutorial"
            className="rounded px-1.5 py-0.5 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="px-5 py-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {slide.title}
          </h2>
          <ul className="mt-3 space-y-2">
            {slide.points.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-sm leading-snug text-slate-600 dark:text-slate-300"
              >
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-1">
            {SLIDES.map((s, i) => (
              <span
                key={s.title}
                className={`h-1.5 w-1.5 rounded-full ${
                  i === page
                    ? "bg-blue-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? onClose() : setPage((p) => p + 1))}
              className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
