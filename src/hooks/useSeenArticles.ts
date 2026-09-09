"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SEEN_ARTICLES_STORAGE_KEY } from "@/lib/defaults";

const SEEN_ARTICLES_EVENT = "credit-news-analyst-seen-articles-change";
const EMPTY_SET: ReadonlySet<string> = new Set();

// getSnapshot must return a referentially stable value when nothing has
// changed, or useSyncExternalStore will re-render (and re-subscribe) forever.
// Cache the parsed Set alongside the raw string it came from.
let cachedRaw: string | null = null;
let cachedSet: Set<string> = new Set();

function readSeenIds(): Set<string> {
  let raw: string | null;
  try {
    raw = localStorage.getItem(SEEN_ARTICLES_STORAGE_KEY);
  } catch {
    return cachedSet;
  }
  if (raw === cachedRaw) return cachedSet;
  cachedRaw = raw;
  try {
    cachedSet = raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    cachedSet = new Set();
  }
  return cachedSet;
}

function writeSeenIds(ids: Set<string>) {
  const raw = JSON.stringify([...ids]);
  try {
    localStorage.setItem(SEEN_ARTICLES_STORAGE_KEY, raw);
  } catch {}
  cachedRaw = raw;
  cachedSet = ids;
  window.dispatchEvent(new Event(SEEN_ARTICLES_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(SEEN_ARTICLES_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(SEEN_ARTICLES_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): ReadonlySet<string> {
  return EMPTY_SET;
}

export function useSeenArticles() {
  const seenIds = useSyncExternalStore(subscribe, readSeenIds, getServerSnapshot);

  const markSeen = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const current = readSeenIds();
    let changed = false;
    for (const id of ids) {
      if (!current.has(id)) {
        current.add(id);
        changed = true;
      }
    }
    if (changed) writeSeenIds(current);
  }, []);

  const isSeen = useCallback((id: string) => seenIds.has(id), [seenIds]);

  return { seenIds, hydrated: true, markSeen, isSeen };
}
