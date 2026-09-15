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
      {/* Blurred + scaled up slightly so fine detail doesn't compete with
          text that has no card of its own (the welcome heading and stats
          footer on Home sit directly on this layer) — blur is what actually
          protects legibility here, not the scrim. The scrim just nudges the
          blurred photo's colors toward the derived theme; keep it fairly
          light or the photo washes out to a flat color wash and stops
          reading as a photo at all (especially for low-contrast images like
          sky/grass). */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt=""
        aria-hidden="true"
        className="h-full w-full scale-110 select-none object-cover blur-2xl"
      />
      <div className="absolute inset-0 bg-brand-100/55 dark:bg-brand-950/55" />
    </div>
  );
}
