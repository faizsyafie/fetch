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
// covering text, this relies on DOM order, not a negative z-index: render
// it as the FIRST child of its `relative` container, before its flex-item
// siblings, with no z-index override. Flex items paint like z-index:0
// positioned elements regardless of their own z-index, so a same-level
// (auto) sibling that comes later in the DOM always paints on top of one
// that comes earlier — a negative z-index here instead sits behind that
// container's own compositing layer entirely and disappears, even over
// empty space, in some browsers.
export function PigeonWatermark({ theme }: PigeonWatermarkProps) {
  const src = theme === "dark" ? "/bg-pigeon-dark2.png" : "/bg-pigeon-light2.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 select-none opacity-70"
    />
  );
}
