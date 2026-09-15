"use client";

import { logDebug } from "@/lib/debugLog";

// The uploaded background photo lives in its own localStorage key — same
// mechanism as theme/customColor — rather than IndexedDB. IndexedDB looked
// like the "correct" choice for a binary asset, but in practice it can
// silently fail to persist across reloads in some browsers (notably
// private-browsing modes, which often drop IndexedDB writes between page
// loads while leaving localStorage untouched), which is exactly why the
// derived color theme would survive a refresh but the photo itself would
// vanish. localStorage is simpler and exactly as reliable as everything
// else this app already persists client-side.
//
// It's still kept out of the synced preferences (Postgres
// profiles.preferences JSONB) — a per-device asset that would bloat every
// save/load round-trip for the whole team if it rode along with the rest
// of preferences — so the photo does NOT sync across devices or
// teammates, unlike the rest of the app's preferences.
const STORAGE_KEY = "credit-news-analyst-bg-image";

export function saveBackgroundImage(dataUrl: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, dataUrl);
  } catch (err) {
    logDebug(
      `Failed to save background image: ${err instanceof Error ? err.message : String(err)}`
    );
    throw new Error(
      "Couldn't save that image — it may be too large for browser storage."
    );
  }
}

export function loadBackgroundImage(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function clearBackgroundImage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
