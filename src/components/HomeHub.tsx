"use client";

import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";
import type { AppMode } from "@/components/Sidebar";
import type { Theme } from "@/hooks/useTheme";

interface HomeHubProps {
  theme: Theme;
  profileName: string;
  accent: AccentColor;
  sourcesCount: number;
  companiesCount: number;
  savedCount: number;
  onSelectMode: (mode: AppMode) => void;
  onOpenTour: () => void;
}

export function HomeHub({
  theme,
  profileName,
  accent,
  sourcesCount,
  companiesCount,
  savedCount,
  onSelectMode,
  onOpenTour,
}: HomeHubProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const iconSrc = theme === "dark" ? "/icon-dog-dark-new.png" : "/icon-dog-light-new.png";

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-10">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconSrc}
            alt="fetch"
            className="h-16 w-16 shrink-0 rounded-2xl object-cover shadow-sm"
          />
          <div>
            <h1 className="text-2xl font-bold text-brand-900 dark:text-white">
              Welcome back, {profileName}
            </h1>
            <p className="text-sm text-brand-500 dark:text-brand-400">
              How would you like to fetch today? Pick a mode to start sniffing
              around.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div
            className={`flex flex-col rounded-xl border-2 p-5 shadow-sm ${accentPreset.border} bg-white dark:bg-brand-900`}
          >
            <div
              className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full text-xl text-white ${accentPreset.solid}`}
            >
              📰
            </div>
            <h2 className="text-lg font-bold text-brand-900 dark:text-white">
              The Yard
            </h2>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              General news, multi-column
            </p>
            <p className="mb-5 flex-1 text-sm leading-relaxed text-brand-600 dark:text-brand-300">
              A curated stream of headlines from World, Markets, Tech and
              whatever else you let off the leash — best for a quick sniff
              around at what&rsquo;s new.
            </p>
            <button
              type="button"
              onClick={() => onSelectMode("news")}
              className={`w-full rounded-lg py-2 text-sm font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover}`}
            >
              Head to The Yard 🐕
            </button>
          </div>

          <div className="flex flex-col rounded-xl border-2 border-brand-200 bg-white p-5 shadow-sm dark:border-brand-700 dark:bg-brand-900">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-xl dark:bg-brand-800">
              🏢
            </div>
            <h2 className="text-lg font-bold text-brand-900 dark:text-white">
              Pack Watch
            </h2>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
              Company news, your watchlist
            </p>
            <p className="mb-5 flex-1 text-sm leading-relaxed text-brand-600 dark:text-brand-300">
              Track the companies in your pack, organized by industry. Tick a
              few and fetch just those, or leave the leash off to grab a
              whole industry at once.
            </p>
            <button
              type="button"
              onClick={() => onSelectMode("companies")}
              className="w-full rounded-lg border border-brand-300 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-600 dark:text-brand-200 dark:hover:bg-brand-800"
            >
              Check on the Pack 🐾
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenTour}
            className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-100 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-300 dark:hover:bg-brand-800"
          >
            🎓 New here? Take the tour
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-brand-400 dark:text-brand-600">
          <span>🔗 {sourcesCount} sources feeding The Yard</span>
          <span aria-hidden="true">•</span>
          <span>🏢 {companiesCount} companies in your Pack</span>
          <span aria-hidden="true">•</span>
          <span>🦴 {savedCount} bones buried</span>
        </div>
      </div>
    </div>
  );
}
