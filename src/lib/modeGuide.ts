import type { TourStep } from "@/components/SpotlightTour";
import type { AppMode } from "@/components/Sidebar";

export type GuidedMode = Exclude<AppMode, "home">;

// Home's own tour: jumps between all three modes, spotlighting each one's
// sidebar row as it goes. The row stays clickable while spotlighted (the
// dim overlay leaves a real hole over the target), so there's no separate
// "go there" button — clicking the highlighted nav item just takes you.
export const HOME_TOUR_STEPS: TourStep[] = [
  {
    id: "nav-news",
    selector: '[data-tour="nav-news"]',
    title: "📰 The Yard",
    description:
      "Headlines roam free here — a live, multi-column stream from World, Markets, Tech and whatever else you let off the leash. Pick a time range, hit Re-fetch!, and see what's afoot.",
    placement: "right",
  },
  {
    id: "nav-companies",
    selector: '[data-tour="nav-companies"]',
    title: "🏢 Pack Watch",
    description:
      "Keeps tabs on your pack of companies, organized by industry. Tick a few and Fetch! grabs just those — leave nothing ticked and it fetches the whole industry instead.",
    placement: "right",
  },
  {
    id: "nav-saved",
    selector: '[data-tour="nav-saved"]',
    title: "🦴 Buried Bones",
    description:
      "Your stash — bookmark any article with 🔖, or bury a link of your own. Dig it back up anytime to read inline and jot down notes.",
    placement: "right",
  },
];

// Each mode's own ❓ — a single centered slide explaining just that page,
// rather than restarting the whole tour.
export const MODE_DETAILED_STEPS: Record<GuidedMode, TourStep> = {
  news: {
    id: "help-news",
    selector: null,
    title: "📰 The Yard",
    description:
      'Each column is a theme — World, Malaysia, Tech, and whatever else you\'ve let off the leash in Edit Themes (sidebar → Manage). Time-range pills page backward through the archive: "Now" is the freshest batch, "7d" means at least 7 days old — not "in the last 7 days". Search commits on Enter and highlights matches in your accent color. Drag a column\'s ⠿ handle to reorder it.',
  },
  companies: {
    id: "help-companies",
    selector: null,
    title: "🏢 Pack Watch",
    description:
      "Companies are grouped by industry in the sidebar — click one to see just its pack. Tick checkboxes and Fetch! (N) grabs just those; leave nothing ticked and it fetches the whole industry instead. Search here is instant, no Enter needed. Hover an industry row for the rename/delete circles, or add one from the + row. Edit Lists and Edit Sources at the bottom manage your roster and RSS feeds.",
  },
  saved: {
    id: "help-saved",
    selector: null,
    title: "🦴 Buried Bones",
    description:
      "Bookmark an article via its 🔖 icon on The Yard or Pack Watch, or bury a link yourself with + Save link. Selecting a saved link opens it inline when possible, with a fallback to the original site if it blocks extraction. Categories live in the sidebar — hover one to rename or delete it, or add a new one from the + row. Pin your most-dug-up bones to keep them at the top.",
  },
};
