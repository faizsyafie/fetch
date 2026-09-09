"use client";

import { useCallback, useSyncExternalStore } from "react";
import { PROFILE_STORAGE_KEY } from "@/lib/defaults";

const PROFILE_EVENT = "credit-news-analyst-profile-change";

function readProfileName(): string | null {
  try {
    return localStorage.getItem(PROFILE_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeProfileName(name: string | null) {
  try {
    if (name) localStorage.setItem(PROFILE_STORAGE_KEY, name);
    else localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch {}
  window.dispatchEvent(new Event(PROFILE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(PROFILE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PROFILE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): string | null {
  return null;
}

export function useProfile() {
  const profileName = useSyncExternalStore(
    subscribe,
    readProfileName,
    getServerSnapshot
  );

  const setProfileName = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    writeProfileName(trimmed);
  }, []);

  const clearProfile = useCallback(() => {
    writeProfileName(null);
  }, []);

  return { profileName, hydrated: true, setProfileName, clearProfile };
}
