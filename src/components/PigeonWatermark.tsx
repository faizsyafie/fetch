"use client";

import type { Theme } from "@/hooks/useTheme";

interface PigeonWatermarkProps {
  theme: Theme;
}

// A fun little easter egg, not a focal point — decorative only, so it's
// pointer-events-none and pinned flush to the pane's bottom-right corner
// (no gap) to look like it's peeking in from the edge.
//
// To stay behind real content (news cards, company rows) rather than ever
// covering text, this is pinned at z-0 while its sibling content wrapper in
// page.tsx is given `relative z-10` — an explicit stacking context beats
// same-level DOM order, which doesn't reliably win against descendants that
// pick up their own stacking context (e.g. rows with a `transition` on
// transform/opacity).
export function PigeonWatermark({ theme }: PigeonWatermarkProps) {
  const src = theme === "dark" ? "/bg-pigeon-dark2.png" : "/bg-pigeon-light2.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 z-0 h-48 w-48 select-none opacity-40"
    />
  );
}
