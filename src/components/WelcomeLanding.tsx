"use client";

import { useEffect, useState } from "react";

const ROTATING_LINES = [
  "Let's see what moved the markets today.",
  "Your watchlist has been busy — time to catch up.",
  "A few minutes now can save a surprise later.",
  "Time to check in on your companies.",
];

interface WelcomeLandingProps {
  name: string;
  onDismiss: () => void;
  onOpenTutorial: () => void;
  onFetchNews: () => void;
}

export function WelcomeLanding({
  name,
  onDismiss,
  onOpenTutorial,
  onFetchNews,
}: WelcomeLandingProps) {
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIndex((i) => (i + 1) % ROTATING_LINES.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-brand-100 px-4 text-center dark:bg-brand-950">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
        Credit News Analyst
      </p>
      <h1 className="mt-2 text-3xl font-bold text-brand-900 dark:text-white">
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
          className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-200 dark:hover:bg-brand-800"
        >
          ❓ View the tutorial
        </button>
        <button
          type="button"
          onClick={onFetchNews}
          className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-200 dark:hover:bg-brand-800"
        >
          🔍 Fetch some news
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Go to dashboard →
        </button>
      </div>
    </div>
  );
}
