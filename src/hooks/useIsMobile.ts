"use client";

import { useSyncExternalStore } from "react";

// Below this, the app switches from its desktop layout (fixed-width
// resizable sidebar, multi-pane views) to a mobile one (off-canvas drawer,
// single-pane stack+navigate) — see Sidebar, TopBar, and SavedView. Matches
// Tailwind's default `md` breakpoint so ad-hoc `md:` classes elsewhere stay
// in sync with this hook's structural branches.
export const MOBILE_MEDIA_QUERY = "(max-width: 767px)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MOBILE_MEDIA_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
}

// False on the server/first paint — matches desktop, the safer default for
// SSR (no layout shift for the common case) and avoids a hydration
// mismatch, at the cost of a brief flash of desktop layout on an actual
// mobile load before this hook's first client-side read takes over.
function getServerSnapshot() {
  return false;
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
