"use client";

import type { Theme } from "@/hooks/useTheme";

interface LogoProps {
  theme: Theme;
  compact?: boolean;
}

// icon-dog-*-new.png: square headshot crop of the dog, background baked in
// to match the theme. text-dog-*-new.png: wordmark only ("fetch"), also with
// the theme background baked in — object-contain so the whole word shows
// without cropping, letterboxing blends into the sidebar's own matching
// background.
export function Logo({ theme, compact = false }: LogoProps) {
  const iconSrc =
    theme === "dark" ? "/icon-dog-dark-new.png" : "/icon-dog-light-new.png";
  const textSrc =
    theme === "dark" ? "/text-dog-dark-new.png" : "/text-dog-light-new.png";

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

  return (
    <div className="h-8 w-28 shrink-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={textSrc}
        alt="fetch — Daily RSS"
        className="h-full w-full object-contain"
      />
    </div>
  );
}
