"use client";

import type { Theme } from "@/hooks/useTheme";

interface LogoProps {
  theme: Theme;
  compact?: boolean;
  /** A large, centered rendering for standalone screens (e.g. the profile
   *  picker) rather than the compact sidebar header treatment. */
  large?: boolean;
}

// icon-dog-*-new.png: square headshot crop of the dog, background baked in
// to match the theme. text-dog-*-new.png: wordmark only ("fetch"), also with
// the theme background baked in — object-contain so the whole word shows
// without cropping, letterboxing blends into the sidebar's own matching
// background. full-logo-dog-*.png: dog + wordmark + "Daily RSS" side by
// side, wide aspect ratio (~2:1) — used for the large standalone treatment.
export function Logo({ theme, compact = false, large = false }: LogoProps) {
  const iconSrc =
    theme === "dark" ? "/icon-dog-dark-new.png" : "/icon-dog-light-new.png";
  const textSrc =
    theme === "dark" ? "/text-dog-dark-new.png" : "/text-dog-light-new.png";
  const fullSrc =
    theme === "dark" ? "/full-logo-dog-dark.png" : "/full-logo-dog-light.png";

  if (compact) {
    return (
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconSrc}
          alt="fetch"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  if (large) {
    return (
      <div className="h-40 w-full max-w-md shrink-0 overflow-hidden sm:h-48 md:h-64 md:max-w-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullSrc}
          alt="fetch — Daily RSS"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="h-8 w-28 shrink-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={textSrc}
        alt="fetch — Daily RSS"
        className="h-full w-full object-contain object-left"
      />
    </div>
  );
}
