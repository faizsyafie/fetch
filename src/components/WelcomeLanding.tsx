"use client";

import { useEffect, useState } from "react";
import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

const ROTATING_LINES = [
  "Let's see what moved the markets today.",
  "Your watchlist has been busy — time to catch up.",
  "A few minutes now can save a surprise later.",
  "Time to check in on your companies.",
];

interface WelcomeLandingProps {
  name: string;
  theme: "light" | "dark";
  accent: AccentColor;
  onOpenTutorial: () => void;
  onReadGeneralNews: () => void;
  onFetchCompanyNews: () => void;
}

export function WelcomeLanding({
  name,
  theme,
  accent,
  onOpenTutorial,
  onReadGeneralNews,
  onFetchCompanyNews,
}: WelcomeLandingProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const [lineIndex, setLineIndex] = useState(0);
  const fullLogoSrc =
    theme === "dark" ? "/full-logo-dog-dark.png" : "/full-logo-dog-light.png";

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % ROTATING_LINES.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-brand-50 px-4 text-center dark:bg-brand-900">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fullLogoSrc}
        alt="fetch — Daily RSS"
        className="h-40 w-auto max-w-full object-contain sm:h-52"
      />
      <h1 className="mt-6 text-3xl font-bold text-brand-900 dark:text-white">
        Welcome, {name}
      </h1>
      <p
        key={lineIndex}
        className="mt-3 h-5 text-sm text-brand-500 transition-opacity duration-500 dark:text-brand-400"
      >
        {ROTATING_LINES[lineIndex]}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onOpenTutorial}
          className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-200 dark:hover:bg-brand-700"
        >
          ❓ View the tutorial
        </button>
        <button
          type="button"
          onClick={onReadGeneralNews}
          className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:bg-brand-800 dark:text-brand-200 dark:hover:bg-brand-700"
        >
          📰 Read general news
        </button>
        <button
          type="button"
          onClick={onFetchCompanyNews}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${accentPreset.solid} ${accentPreset.solidHover}`}
        >
          🔍 Fetch company news →
        </button>
      </div>
    </div>
  );
}
