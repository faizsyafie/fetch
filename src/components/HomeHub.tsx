"use client";

import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";
import type { AppMode } from "@/components/Sidebar";
import type { Theme } from "@/hooks/useTheme";

interface HomeHubProps {
  theme: Theme;
  profileName: string;
  accent: AccentColor;
  /** Whichever of the two cards was most recently visited gets the accent
   *  highlight — neither one is permanently favored over the other. */
  activeMode: "news" | "companies";
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
  activeMode,
  sourcesCount,
  companiesCount,
  savedCount,
  onSelectMode,
  onOpenTour,
}: HomeHubProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const iconSrc = theme === "dark" ? "/icon-dog-dark-new.png" : "/icon-dog-light-new.png";

  function modeCard({
    mode,
    emoji,
    title,
    tagline,
    description,
    ctaLabel,
  }: {
    mode: "news" | "companies";
    emoji: string;
    title: string;
    tagline: string;
    description: string;
    ctaLabel: string;
  }) {
    const isActive = mode === activeMode;
    return (
      <div
        className={`flex flex-col rounded-xl border-2 p-5 shadow-sm transition-colors ${
          isActive
            ? `${accentPreset.border} bg-white dark:bg-brand-900`
            : "border-brand-200 bg-white dark:border-brand-700 dark:bg-brand-900"
        }`}
      >
        <div
          className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors ${
            isActive
              ? `text-white ${accentPreset.solid}`
              : "bg-brand-100 dark:bg-brand-800"
          }`}
        >
          {emoji}
        </div>
        <h2 className="text-lg font-bold text-brand-900 dark:text-white">
          {title}
        </h2>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-brand-400 dark:text-brand-600">
          {tagline}
        </p>
        <p className="mb-5 flex-1 text-sm leading-relaxed text-brand-600 dark:text-brand-300">
          {description}
        </p>
        <button
          type="button"
          onClick={() => onSelectMode(mode)}
          className={`w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
            isActive
              ? `text-white ${accentPreset.solid} ${accentPreset.solidHover}`
              : "border border-brand-300 text-brand-700 hover:bg-brand-100 dark:border-brand-600 dark:text-brand-200 dark:hover:bg-brand-800"
          }`}
        >
          {ctaLabel}
        </button>
      </div>
    );
  }

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
          {modeCard({
            mode: "news",
            emoji: "📰",
            title: "The Yard",
            tagline: "General news, multi-column",
            description:
              "A curated stream of headlines from World, Markets, Tech and whatever else you let off the leash — best for a quick sniff around at what's new.",
            ctaLabel: "Head to The Yard 🐕",
          })}
          {modeCard({
            mode: "companies",
            emoji: "🏢",
            title: "Pack Watch",
            tagline: "Company news, your watchlist",
            description:
              "Track the companies in your pack, organized by industry. Tick a few and fetch just those, or leave the leash off to grab a whole industry at once.",
            ctaLabel: "Check on the Pack 🐾",
          })}
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
