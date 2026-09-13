"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_NEWS_ARTICLE_LIMIT,
  DEFAULT_SIDEBAR_WIDTH,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NEWS_ARTICLE_LIMIT_OPTIONS,
  UI_STORAGE_KEY,
} from "@/lib/defaults";
import { DEFAULT_NEWS_TOPIC_ORDER, NEWS_TOPICS } from "@/lib/newsTopics";
import type {
  AccentColor,
  Density,
  FontFamily,
  FontScale,
  NewsTopicId,
  UiSettings,
} from "@/lib/types";

const DEFAULT_UI_SETTINGS: UiSettings = {
  sidebarWidth: DEFAULT_SIDEBAR_WIDTH,
  sidebarCollapsed: false,
  density: "comfortable",
  toursSeen: {},
  accent: "blue",
  fontFamily: "system",
  fontScale: "md",
  newsTopicOrder: DEFAULT_NEWS_TOPIC_ORDER,
  newsArticleLimit: DEFAULT_NEWS_ARTICLE_LIMIT,
};

function sanitizeArticleLimit(value: unknown): number {
  return typeof value === "number" && (NEWS_ARTICLE_LIMIT_OPTIONS as readonly number[]).includes(value)
    ? value
    : DEFAULT_NEWS_ARTICLE_LIMIT;
}

// Replaces the old single `tutorialSeen` boolean with a per-page record.
// A returning user who'd already seen the old one-shot intro shouldn't
// suddenly get all four new tours thrown at them at once — treat that as
// every page already seen. A genuinely fresh install has neither field and
// starts with everything unseen.
function sanitizeToursSeen(
  toursSeen: unknown,
  legacyTutorialSeen: unknown
): Partial<Record<string, boolean>> {
  if (toursSeen && typeof toursSeen === "object") {
    return toursSeen as Partial<Record<string, boolean>>;
  }
  if (legacyTutorialSeen === true) {
    return { home: true, news: true, companies: true, saved: true };
  }
  return {};
}

const UI_SETTINGS_EVENT = "credit-news-analyst-ui-change";

function clampWidth(width: number): number {
  return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));
}

// Validates a stored order against the full topic catalog (not just the
// defaults — Edit Themes lets a user enable topics beyond, or disable ones
// within, DEFAULT_NEWS_TOPIC_ORDER, so a disabled default must NOT get
// silently re-added here). Migrates the pre-rename "economy" id, and only
// falls back to the defaults wholesale if nothing valid survives at all
// (corrupted storage, or a first read).
function sanitizeTopicOrder(order: unknown): NewsTopicId[] {
  const known = new Set(NEWS_TOPICS.map((t) => t.id));
  const migrated = Array.isArray(order)
    ? order.map((id) => (id === "economy" ? "generalEconomy" : id))
    : order;
  const kept = Array.isArray(migrated)
    ? migrated.filter(
        (id): id is NewsTopicId =>
          typeof id === "string" && known.has(id as NewsTopicId)
      )
    : [];
  return kept.length > 0 ? kept : DEFAULT_NEWS_TOPIC_ORDER;
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
    const parsed = JSON.parse(raw) as Partial<UiSettings> & {
      tutorialSeen?: boolean;
    };
    cachedSettings = {
      ...DEFAULT_UI_SETTINGS,
      ...parsed,
      sidebarWidth: clampWidth(
        parsed.sidebarWidth ?? DEFAULT_UI_SETTINGS.sidebarWidth
      ),
      newsTopicOrder: sanitizeTopicOrder(parsed.newsTopicOrder),
      newsArticleLimit: sanitizeArticleLimit(parsed.newsArticleLimit),
      toursSeen: sanitizeToursSeen(parsed.toursSeen, parsed.tutorialSeen),
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

  const markTourSeen = useCallback(
    (mode: string) => {
      update((prev) => ({ ...prev, toursSeen: { ...prev.toursSeen, [mode]: true } }));
    },
    [update]
  );

  const setAccent = useCallback(
    (accent: AccentColor) => {
      update((prev) => ({ ...prev, accent }));
    },
    [update]
  );

  const setFontFamily = useCallback(
    (fontFamily: FontFamily) => {
      update((prev) => ({ ...prev, fontFamily }));
    },
    [update]
  );

  const setFontScale = useCallback(
    (fontScale: FontScale) => {
      update((prev) => ({ ...prev, fontScale }));
    },
    [update]
  );

  const setNewsTopicOrder = useCallback(
    (newsTopicOrder: NewsTopicId[]) => {
      update((prev) => ({ ...prev, newsTopicOrder }));
    },
    [update]
  );

  const setNewsArticleLimit = useCallback(
    (newsArticleLimit: number) => {
      update((prev) => ({ ...prev, newsArticleLimit }));
    },
    [update]
  );

  return {
    settings,
    hydrated: true,
    setSidebarWidth,
    toggleSidebarCollapsed,
    setDensity,
    markTourSeen,
    setAccent,
    setFontFamily,
    setFontScale,
    setNewsTopicOrder,
    setNewsArticleLimit,
  };
}
