"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  CUSTOM_THEME_COLOR_STORAGE_KEY,
  DEFAULT_CUSTOM_THEME_COLOR,
  THEME_STORAGE_KEY,
} from "@/lib/defaults";
import { generateThemeFromColor, isColorDark, type RampStep } from "@/lib/colorRamp";

// "image" is "custom" with a photo behind it instead of a flat color — the
// ramp is still generated from a color (the photo's extracted dominant
// color rather than a hand-picked one), so it reuses the same storage key
// and ramp machinery as "custom" throughout this file.
export type Theme =
  | "light"
  | "dark"
  | "coral"
  | "midnight"
  | "sage"
  | "custom"
  | "image";

const VALID_THEMES: Theme[] = [
  "light",
  "dark",
  "coral",
  "midnight",
  "sage",
  "custom",
  "image",
];

// "dark" and "midnight" are both dark-leaning (deserve the .dark class and
// the dark dog-logo assets); "light", "coral" and "sage" are light-leaning.
// "custom"/"image" have no fixed leaning — they read the user's own (or
// photo-derived) color straight out of localStorage (readCustomColor below
// reads the same key), which keeps every existing isDarkTheme(theme) call
// site working unchanged instead of having to thread a new prop everywhere.
export function isDarkTheme(theme: Theme): boolean {
  if (theme === "custom" || theme === "image") {
    if (typeof window === "undefined") return false;
    try {
      const stored = localStorage.getItem(CUSTOM_THEME_COLOR_STORAGE_KEY);
      return stored ? isColorDark(stored) : false;
    } catch {
      return false;
    }
  }
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

function readCustomColor(): string {
  return (
    localStorage.getItem(CUSTOM_THEME_COLOR_STORAGE_KEY) ??
    DEFAULT_CUSTOM_THEME_COLOR
  );
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

function getCustomColorServerSnapshot(): string {
  return DEFAULT_CUSTOM_THEME_COLOR;
}

const RAMP_STEPS: RampStep[] = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
];

function applyCustomRamp(root: HTMLElement, color: string) {
  const generated = generateThemeFromColor(color);
  root.style.setProperty("--background", generated.background);
  root.style.setProperty("--foreground", generated.foreground);
  RAMP_STEPS.forEach((step) => {
    root.style.setProperty(`--brand-${step}`, generated.ramp[step]);
  });
  root.classList.toggle("dark", generated.isDark);
}

function clearCustomRamp(root: HTMLElement) {
  root.style.removeProperty("--background");
  root.style.removeProperty("--foreground");
  RAMP_STEPS.forEach((step) => root.style.removeProperty(`--brand-${step}`));
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readTheme, getServerSnapshot);
  const customColor = useSyncExternalStore(
    subscribe,
    readCustomColor,
    getCustomColorServerSnapshot
  );

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    if (theme === "custom" || theme === "image") {
      applyCustomRamp(root, customColor);
    } else {
      clearCustomRamp(root);
      root.classList.toggle("dark", isDarkTheme(theme));
    }
  }, [theme, customColor]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  // targetTheme defaults to "custom" (a hand-picked flat color); the
  // background-image upload flow passes "image" instead so the ramp
  // updates to the photo's dominant color without losing the "show the
  // photo" theme it just set.
  const setCustomColor = useCallback((hex: string, targetTheme: Theme = "custom") => {
    try {
      localStorage.setItem(CUSTOM_THEME_COLOR_STORAGE_KEY, hex);
      localStorage.setItem(THEME_STORAGE_KEY, targetTheme);
    } catch {}
    window.dispatchEvent(new Event(THEME_EVENT));
  }, []);

  return { theme, setTheme, customColor, setCustomColor };
}
