"use client";

import type { Theme } from "@/hooks/useTheme";

interface LogoProps {
  theme: Theme;
  compact?: boolean;
}

// The source PNGs are 2000x2000 square with the artwork (bird + wordmark)
// occupying a horizontal band across the middle, cream/charcoal background
// baked in (no transparency). object-fit: cover + a wide/short container
// crops out the surrounding padding to show just that band.
export function Logo({ theme, compact = false }: LogoProps) {
  const fullLogoSrc =
    theme === "dark" ? "/full-logo-dark.png" : "/full-logo-light.png";

  if (compact) {
    return (
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icon.png"
          alt="fetch"
          className="h-full w-full object-cover"
          style={{ objectPosition: "60% 45%" }}
        />
      </div>
    );
  }

  return (
    <div className="h-8 w-28 shrink-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fullLogoSrc}
        alt="fetch — Daily RSS"
        className="h-full w-full object-cover"
        style={{ objectPosition: "center 47%" }}
      />
    </div>
  );
}
