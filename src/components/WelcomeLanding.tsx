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
    <div className="flex h-screen flex-col items-center justify-center bg-slate-100 px-4 text-center dark:bg-slate-950">
      <p className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
        Credit News Analyst
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
        Welcome, {name}
      </h1>
      <p
        key={lineIndex}
        className="mt-3 h-5 text-sm text-slate-500 transition-opacity duration-500 dark:text-slate-400"
      >
        {ROTATING_LINES[lineIndex]}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={onOpenTutorial}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ❓ View the tutorial
        </button>
        <button
          type="button"
          onClick={onFetchNews}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
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
