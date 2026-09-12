"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/defaults";

export type Theme = "light" | "dark" | "coral" | "midnight";

const VALID_THEMES: Theme[] = ["light", "dark", "coral", "midnight"];

// "dark" and "midnight" are both dark-leaning (deserve the .dark class and
// the dark dog-logo assets); "light" and "coral" are light-leaning.
export function isDarkTheme(theme: Theme): boolean {
  return theme === "dark" || theme === "midnight";
}

const THEME_EVENT = "credit-news-analyst-theme-change";

function readTheme(): Theme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && (VALID_THEMES as string[]).includes(stored)) {
    return stored as Theme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): Theme {
  return "light";
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkTheme(theme));
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return { theme, setTheme };
}
