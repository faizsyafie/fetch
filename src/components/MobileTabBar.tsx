"use client";

import { ACCENT_PRESETS } from "@/lib/defaults";
import type { AccentColor } from "@/lib/types";
import type { AppMode } from "@/components/Sidebar";

interface MobileTabBarProps {
  mode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  accent: AccentColor;
}

const TABS: { mode: AppMode; label: string; emoji: string }[] = [
  { mode: "home", label: "Home", emoji: "🐾" },
  { mode: "saved", label: "Bones", emoji: "🔖" },
  { mode: "news", label: "The Yard", emoji: "📰" },
  { mode: "companies", label: "Pack Watch", emoji: "🏢" },
];

// Mobile-only quick nav for the app's four top-level destinations — sits
// alongside the hamburger/drawer (still the way to reach sub-lists and the
// per-mode Manage sections), a lower-friction path for the single most
// common action on mobile: switching modes. A normal flex sibling in the
// content column (not `fixed`) rather than an overlay, so it never needs a
// manual scroll-padding hack on every scrollable view underneath it —
// flexbox just gives it its own row and shrinks the content area to match.
export function MobileTabBar({ mode, onSelectMode, accent }: MobileTabBarProps) {
  const accentPreset = ACCENT_PRESETS[accent];

  return (
    <nav
      className="flex shrink-0 items-stretch border-t border-brand-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden dark:border-brand-800 dark:bg-brand-900"
      aria-label="Primary"
    >
      {TABS.map((tab) => {
        const isActive = mode === tab.mode;
        return (
          <button
            key={tab.mode}
            type="button"
            onClick={() => onSelectMode(tab.mode)}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[0.625rem] font-semibold transition-colors ${
              isActive
                ? accentPreset.text
                : "text-brand-400 dark:text-brand-500"
            }`}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {tab.emoji}
            </span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
