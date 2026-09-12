"use client";

import { useEffect, useState } from "react";

// Must match the longest -out animation duration in globals.css so the
// element unmounts right as the exit animation finishes, not before.
const EXIT_DURATION_MS = 180;

/**
 * Keeps a modal in the DOM for one exit-animation tick after `open` flips
 * to false, so its CSS close animation gets a chance to play instead of
 * the element just vanishing. Callers should render nothing while
 * `mounted` is false, and switch to the "-out" animation classes while
 * `closing` is true.
 */
export function useAnimatedModal(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);
  const [openTrackedFor, setOpenTrackedFor] = useState(open);

  if (open !== openTrackedFor) {
    setOpenTrackedFor(open);
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
    }
  }

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  return { mounted, closing };
}
