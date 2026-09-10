"use client";

import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";

interface BoneButtonProps {
  onClick: () => void;
  disabled?: boolean;
  accent: AccentColor;
  children: React.ReactNode;
}

// Each end is two overlapping circles (a "peanut" lobe), not one — that's
// what actually reads as a dog bone rather than a rounded pill. The bar
// stays noticeably thinner than the lobes so they visibly flare above and
// below it. Shared by the Companies "Fetch!" and General "Re-fetch!"
// actions.
function Lobe({ side, colorClass }: { side: "left" | "right"; colorClass: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute top-1/2 flex -translate-y-1/2 flex-col ${side === "left" ? "-left-3" : "-right-3"}`}
    >
      <span className={`h-5 w-5 rounded-full ${colorClass}`} />
      <span className={`-mt-2 h-5 w-5 rounded-full ${colorClass}`} />
    </span>
  );
}

export function BoneButton({ onClick, disabled, accent, children }: BoneButtonProps) {
  const accentPreset = ACCENT_PRESETS[accent];
  const colorClass = disabled ? "bg-brand-400" : accentPreset.solid;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex h-8 items-center ${
        disabled ? "cursor-not-allowed" : "hover:animate-bone-jump"
      }`}
    >
      <Lobe side="left" colorClass={colorClass} />
      <span
        className={`relative z-10 flex h-4 items-center whitespace-nowrap rounded-sm px-4 text-[11px] font-semibold text-white ${colorClass}`}
      >
        {children}
      </span>
      <Lobe side="right" colorClass={colorClass} />
    </button>
  );
}
