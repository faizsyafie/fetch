"use client";

import { useEffect, useRef, useState } from "react";

const TRIGGER_DISTANCE = 64; // px of pull before releasing triggers a refresh
const MAX_PULL_DISTANCE = 96; // visual cap — pulling further doesn't pull further
// Pulling feels better with resistance (each px of finger movement moves the
// indicator less the further it's already pulled) rather than a 1:1 drag.
const RESISTANCE = 0.5;

export interface PullToRefreshState {
  /** Current visual pull distance in px, 0 when idle. Drive the indicator's
   *  height/opacity/rotation from this. */
  pullDistance: number;
  /** True from release-past-threshold until the caller's onRefresh promise
   *  settles — keep the indicator's spinner state showing for this long. */
  refreshing: boolean;
}

/**
 * Native-touch-event-driven pull-to-refresh, additive to whatever explicit
 * refresh button already exists (Fetch!/Re-fetch!) — this never replaces
 * it, just gives touch users a second, gesture-based way to trigger the
 * same action. Purely event-driven (no viewport/device check): on a
 * non-touch device these listeners simply never fire, so there's nothing to
 * gate on desktop.
 *
 * Only engages when the container is scrolled to the very top — an
 * in-progress downward drag elsewhere in a scrolled list is a normal scroll
 * gesture, not a pull-to-refresh one.
 */
export function usePullToRefresh<T extends HTMLElement>(
  onRefresh: () => void | Promise<void>
) {
  const ref = useRef<T | null>(null);
  const [state, setState] = useState<PullToRefreshState>({
    pullDistance: 0,
    refreshing: false,
  });
  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function handleTouchStart(e: TouchEvent) {
      if (el!.scrollTop > 0) {
        startYRef.current = null;
        return;
      }
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = false;
    }

    function handleTouchMove(e: TouchEvent) {
      if (startYRef.current === null) return;
      const delta = e.touches[0].clientY - startYRef.current;
      if (delta <= 0) {
        // Scrolled back up past the start point (or never really pulled) —
        // not a pull gesture, let the browser handle it normally.
        setState((s) => (s.pullDistance === 0 ? s : { ...s, pullDistance: 0 }));
        return;
      }
      // Only now claim the gesture — this is the first move event that's
      // unambiguously "pulling down from the top", so it's safe to prevent
      // default (block the native overscroll bounce) from here on.
      pullingRef.current = true;
      e.preventDefault();
      const damped = Math.min(delta * RESISTANCE, MAX_PULL_DISTANCE);
      setState((s) => ({ ...s, pullDistance: damped }));
    }

    async function handleTouchEnd() {
      if (!pullingRef.current) {
        startYRef.current = null;
        return;
      }
      pullingRef.current = false;
      startYRef.current = null;

      // Read the release-time pull distance out via a plain variable rather
      // than deciding inside the setState updater — updaters must stay
      // pure, and calling onRefresh() there (which itself calls another
      // component's setState synchronously) triggered React's "Cannot
      // update a component while rendering a different component" warning.
      let releasedPastThreshold = false;
      setState((s) => {
        releasedPastThreshold = s.pullDistance >= TRIGGER_DISTANCE;
        return releasedPastThreshold
          ? { pullDistance: TRIGGER_DISTANCE, refreshing: true }
          : { pullDistance: 0, refreshing: false };
      });

      if (releasedPastThreshold) {
        try {
          await onRefresh();
        } finally {
          setState({ pullDistance: 0, refreshing: false });
        }
      }
    }

    // passive: false — handleTouchMove needs to call preventDefault() to
    // stop the native overscroll bounce while a pull is in progress.
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    el.addEventListener("touchcancel", handleTouchEnd);
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
      el.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [onRefresh]);

  // A tuple, not a merged { ref, ...state } object — the lint rule that
  // catches stale ref reads during render treats *any* property access on
  // an object containing a ref as suspect, even unrelated plain-value
  // properties alongside it. Destructuring `[ref, state]` keeps the ref
  // and the reactive state visibly separate at every call site.
  return [ref, { ...state, triggerDistance: TRIGGER_DISTANCE }] as const;
}
