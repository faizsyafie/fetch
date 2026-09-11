"use client";

import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

interface AboutModalProps {
  accent: AccentColor;
  onClose: () => void;
}

export function AboutModal({ accent, onClose }: AboutModalProps) {
  const accentPreset = ACCENT_PRESETS[accent];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-950/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-lg border border-brand-200 bg-white shadow-2xl dark:border-brand-700 dark:bg-brand-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-brand-200 px-4 py-3 dark:border-brand-800">
          <h2 className="text-sm font-bold text-brand-900 dark:text-white">
            ℹ️ About fetch
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

        <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-3 px-4 py-4 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/full-logo-dog-light.png"
            alt="fetch — Daily RSS"
            className="mx-auto block h-16 w-auto object-contain dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/full-logo-dog-dark.png"
            alt="fetch — Daily RSS"
            className="mx-auto hidden h-16 w-auto object-contain dark:block"
          />

          <p className="text-left text-sm leading-relaxed text-brand-600 dark:text-brand-300">
            Fetch tracks company news across industries as well as general
            thematic news, bringing updates from multiple RSS sources into a
            single feed. It helps your team monitor what matters without
            digging through countless news sites every day.
          </p>
          <p className="text-left text-sm leading-relaxed text-brand-600 dark:text-brand-300">
            The name comes from man&rsquo;s best friend. Dogs have long been
            valued for retrieving, delivering, and carrying messages when
            people needed information moved from one place to another. Fetch
            does the same for news. It goes out, finds what matters, and
            brings it back for you.
          </p>
          <p className="text-left text-sm font-semibold italic text-brand-700 dark:text-brand-200">
            A loyal retriever for the information age.
          </p>
          <p className="text-left text-xs leading-relaxed text-brand-500 dark:text-brand-400">
            Special thanks to my beta testers (you know who you are) for
            keeping me well fed with suggestions :)
          </p>
        </div>

        <div className="space-y-2 border-t border-brand-200 px-4 py-4 dark:border-brand-800">
          <p className="text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-500">
            Contact
          </p>
          <a
            href="mailto:faizsyafie5@gmail.com"
            className="flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-blue-600 dark:text-brand-200 dark:hover:text-blue-400"
          >
            <span aria-hidden="true">✉️</span>
            faizsyafie5@gmail.com
          </a>
          <a
            href="https://github.com/faizsyafie"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium text-brand-700 hover:text-blue-600 dark:text-brand-200 dark:hover:text-blue-400"
          >
            <span aria-hidden="true">🐙</span>
            github.com/faizsyafie
          </a>
        </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-brand-200 px-4 py-3 dark:border-brand-800">
          <button
            type="button"
            onClick={onClose}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold text-white ${accentPreset.solid} ${accentPreset.solidHover}`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
