import type { TourStep } from "@/components/SpotlightTour";

/**
 * The guided-tour script. Each step (other than the intro/outro, which have
 * `selector: null`) targets a `data-tour="..."` attribute placed on the real
 * UI element elsewhere in the app — see Sidebar.tsx and TopBar.tsx. Keep this
 * list in sync whenever a major feature is added. Kept short and light on
 * purpose — nine steps, one idea each.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    selector: null,
    title: "Welcome to fetch",
    description:
      "🐾 A 30-second tour, then you're off the leash. Esc skips anytime.",
  },
  {
    id: "nav-list",
    selector: '[data-tour="nav-list"]',
    title: "General, Companies & Buried Bones",
    description:
      "Three places to be: General for curated news, Companies for your tracked watchlist, Buried Bones for anything you've saved. Pick one anytime.",
    placement: "right",
  },
  {
    id: "industry-sub-list",
    selector: '[data-tour="industry-sub-list"]',
    title: "Industries, unfolded",
    description:
      "Click Companies or Buried Bones and its list unfolds right here — industries, or your saved-link categories. Drag to reorder, hover a row for the ✏️/✕ to rename or delete it.",
    placement: "right",
  },
  {
    id: "topbar-search",
    selector: '[data-tour="topbar-search"]',
    title: "Search",
    description: "🔍 or hit / to search — companies, articles, or saved links, wherever you are.",
    placement: "bottom",
  },
  {
    id: "topbar-timerange",
    selector: '[data-tour="topbar-timerange"]',
    title: "Time range",
    description: "Pick how far back to look — a day up to a month.",
    placement: "bottom",
  },
  {
    id: "topbar-fetch",
    selector: '[data-tour="topbar-fetch"]',
    title: "🦴 Fetch!",
    description:
      "The bone button! Tick a few companies and Fetch! grabs just those — leave nothing ticked and it grabs the whole industry. Same trick on General as Re-fetch!.",
    placement: "bottom",
  },
  {
    id: "topbar-settings",
    selector: '[data-tour="topbar-settings"]',
    title: "Settings",
    description: "Theme, spacing, accent color, fonts — all here, all saved to you.",
    placement: "bottom",
  },
  {
    id: "topbar-user",
    selector: '[data-tour="topbar-user"]',
    title: "Your profile",
    description: "Your name in the corner. Switch profiles or log out from here.",
    placement: "bottom",
  },
  {
    id: "shortcuts",
    selector: null,
    title: "That's the trick",
    description:
      "↑/↓ to move, Enter to expand, ⌘K / Ctrl+K for the command palette. Reopen this anytime from ❓. Go fetch! 🐕",
  },
];
