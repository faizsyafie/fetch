"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  UI_STORAGE_KEY,
} from "@/lib/defaults";
import type { Density, UiSettings } from "@/lib/types";

const DEFAULT_UI_SETTINGS: UiSettings = {
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  sidebarCollapsed: false,
  density: "comfortable",
  tutorialSeen: false,
};

const UI_SETTINGS_EVENT = "credit-news-analyst-ui-change";

function clampWidth(width: number): number {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));
}

// getSnapshot must return a referentially stable value when nothing has
// changed, or useSyncExternalStore will re-render (and re-subscribe) forever.
// Cache the parsed settings object alongside the raw string it came from.
let cachedRaw: string | null = null;
let cachedSettings: UiSettings = DEFAULT_UI_SETTINGS;

function readUiSettings(): UiSettings {
  let raw: string | null;
  try {
    raw = localStorage.getItem(UI_STORAGE_KEY);
  } catch {
    return cachedSettings;
  }
  if (raw === cachedRaw) return cachedSettings;
  cachedRaw = raw;
  if (!raw) {
    cachedSettings = DEFAULT_UI_SETTINGS;
    return cachedSettings;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<UiSettings>;
    cachedSettings = {
      ...DEFAULT_UI_SETTINGS,
      ...parsed,
      sidebarWidth: clampWidth(
        parsed.sidebarWidth ?? DEFAULT_UI_SETTINGS.sidebarWidth
      ),
    };
  } catch {
    cachedSettings = DEFAULT_UI_SETTINGS;
  }
  return cachedSettings;
}

function writeUiSettings(settings: UiSettings) {
  const raw = JSON.stringify(settings);
  try {
    localStorage.setItem(UI_STORAGE_KEY, raw);
  } catch {}
  cachedRaw = raw;
  cachedSettings = settings;
  window.dispatchEvent(new Event(UI_SETTINGS_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(UI_SETTINGS_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(UI_SETTINGS_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): UiSettings {
  return DEFAULT_UI_SETTINGS;
}

// Exposed for one-off, non-reactive reads (e.g. a mount effect deciding
// whether to show something) where waiting for a React re-render to pick up
// the post-hydration snapshot would read a stale default value.
export { readUiSettings };

export function useUiSettings() {
  const settings = useSyncExternalStore(
    subscribe,
    readUiSettings,
    getServerSnapshot
  );

  const update = useCallback((updater: (prev: UiSettings) => UiSettings) => {
    writeUiSettings(updater(readUiSettings()));
  }, []);

  const setSidebarWidth = useCallback(
    (width: number) => {
      update((prev) => ({ ...prev, sidebarWidth: clampWidth(width) }));
    },
    [update]
  );

  const toggleSidebarCollapsed = useCallback(() => {
    update((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, [update]);

  const setDensity = useCallback(
    (density: Density) => {
      update((prev) => ({ ...prev, density }));
    },
    [update]
  );

  const markTutorialSeen = useCallback(() => {
    update((prev) => ({ ...prev, tutorialSeen: true }));
  }, [update]);

  return {
    settings,
    hydrated: true,
    setSidebarWidth,
    toggleSidebarCollapsed,
    setDensity,
    markTutorialSeen,
  };
}
