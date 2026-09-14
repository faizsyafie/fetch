"use client";

import { useBackgroundImage } from "@/hooks/useBackgroundImage";
import type { Theme } from "@/hooks/useTheme";

interface BackgroundImageLayerProps {
  theme: Theme;
}

// Renders the user's uploaded photo full-bleed behind the app content when
// the "image" theme is active — a scrim on top (the same derived brand
// ramp everything else uses) keeps card text and borders legible over an
// arbitrary photo. Sits at z-0 alongside DogWatermark, below the z-10
// content wrapper in page.tsx.
export function BackgroundImageLayer({ theme }: BackgroundImageLayerProps) {
  const { url } = useBackgroundImage();
  if (theme !== "image" || !url) return null;

  return (
    // overflow-hidden on this wrapper (not the img itself) clips the
    // blur+scale combo's faded edge fringe — without it, CSS blur samples
    // past the image's own bounds and shows a dark seam right where the
    // pane meets the sidebar.
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Blurred + scaled up slightly so the photo reads as ambient color
          rather than competing detail behind text that has no card of its
          own — the welcome heading and stats footer on Home sit directly
          on this layer. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        aria-hidden="true"
        className="h-full w-full scale-110 select-none object-cover blur-lg"
      />
      <div className="absolute inset-0 bg-brand-100/90 dark:bg-brand-950/90" />
    </div>
  );
}
