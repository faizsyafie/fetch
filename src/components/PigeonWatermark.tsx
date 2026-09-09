"use client";

import type { Theme } from "@/hooks/useTheme";

interface PigeonWatermarkProps {
  theme: Theme;
}

// A fun little easter egg, not a focal point — decorative only, so it's
// pointer-events-none and z-20 to paint on top of whatever's underneath
// rather than depending on empty space that may not exist (three equal
// -width News columns, or a full company list, rarely leave a real gap in
// this corner). The source PNGs already have their background removed
// (real alpha transparency), so no CSS masking is needed here.
export function PigeonWatermark({ theme }: PigeonWatermarkProps) {
  const src = theme === "dark" ? "/bg-pigeon-dark2.png" : "/bg-pigeon-light2.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute bottom-3 right-3 z-20 h-48 w-48 select-none opacity-70"
    />
  );
}
