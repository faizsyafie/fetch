"use client";

import { useSyncExternalStore } from "react";
import { DEBUG_LOG_STORAGE_KEY } from "@/lib/defaults";

export interface DebugLogEntry {
  id: string;
  timestamp: string;
  level: "info" | "error";
  message: string;
}

const MAX_ENTRIES = 200;
const CHANGE_EVENT = "credit-news-analyst-debug-log-change";

// A lightweight, always-on record of the failures that otherwise only ever
// showed up as a silent state flag (syncError, "Couldn't load...") or a
// console.error nobody but a developer with devtools open would see — a
// non-technical teammate hitting a sync failure has no way to describe what
// went wrong beyond "it didn't work". Persisted so a log from just before a
// refresh isn't lost.
let cachedRaw: string | null = null;
let cachedEntries: DebugLogEntry[] = [];

function readEntries(): DebugLogEntry[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(DEBUG_LOG_STORAGE_KEY);
  } catch {
    return cachedEntries;
  }
  if (raw === cachedRaw) return cachedEntries;
  cachedRaw = raw;
  if (!raw) {
    cachedEntries = [];
    return cachedEntries;
  }
  try {
    const parsed = JSON.parse(raw);
    cachedEntries = Array.isArray(parsed) ? parsed : [];
  } catch {
    cachedEntries = [];
  }
  return cachedEntries;
}

function writeEntries(entries: DebugLogEntry[]) {
  cachedEntries = entries;
  try {
    cachedRaw = JSON.stringify(entries);
    localStorage.setItem(DEBUG_LOG_STORAGE_KEY, cachedRaw);
  } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function logDebug(message: string, level: DebugLogEntry["level"] = "error") {
  if (typeof window === "undefined") return;
  const entry: DebugLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    level,
    message,
  };
  const next = [entry, ...readEntries()].slice(0, MAX_ENTRIES);
  writeEntries(next);
}

export function clearDebugLog() {
  writeEntries([]);
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): DebugLogEntry[] {
  return [];
}

export function useDebugLog() {
  const entries = useSyncExternalStore(subscribe, readEntries, getServerSnapshot);
  return { entries, clear: clearDebugLog };
}
