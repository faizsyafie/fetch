import type { AppMode } from "@/components/Sidebar";

export type GuidedMode = Exclude<AppMode, "home">;

export interface ModeGuideStep {
  mode: GuidedMode;
  emoji: string;
  title: string;
  tagline: string;
  body: string[];
}

// Short, one-liner-ish version — used for the Home page's "Take the tour"
// button and its ❓, jumping briefly between all three modes. Order matches
// the Home hub's own card order (Yard, then Pack Watch), with Buried Bones
// as the bonus third stop.
export const MODE_OVERVIEW_STEPS: ModeGuideStep[] = [
  {
    mode: "news",
    emoji: "📰",
    title: "The Yard",
    tagline: "General news, multi-column",
    body: [
      "Headlines roam free here — a live, multi-column stream from World, Markets, Tech and whatever else you let off the leash.",
      "Pick a time range, hit Re-fetch!, and see what's afoot.",
    ],
  },
  {
    mode: "companies",
    emoji: "🏢",
    title: "Pack Watch",
    tagline: "Company news, your watchlist",
    body: [
      "Keeps tabs on your pack of companies, organized by industry in the sidebar.",
      "Tick a few and Fetch! grabs just those — leave nothing ticked and it fetches the whole industry.",
    ],
  },
  {
    mode: "saved",
    emoji: "🦴",
    title: "Buried Bones",
    tagline: "Saved articles & notes",
    body: [
      "Your stash — bookmark any article with 🔖, or bury a link of your own.",
      "Dig it back up anytime to read inline and jot down notes.",
    ],
  },
];

// Longer, single-mode version — used for each page's own ❓, so it explains
// just that page rather than restarting the whole tour.
export const MODE_DETAILED_GUIDE: Record<GuidedMode, ModeGuideStep> = {
  news: {
    mode: "news",
    emoji: "📰",
    title: "The Yard",
    tagline: "Your general-news board",
    body: [
      "Each column is a theme — World, Malaysia, Tech, and whatever else you've let off the leash in Edit Themes (sidebar → Manage).",
      "Time-range pills page backward through the archive: \"Now\" is the freshest batch, \"7d\" means at least 7 days old — not \"in the last 7 days\" — so each option surfaces a genuinely different slice.",
      "Search commits on Enter and hides everything that doesn't match, highlighting the term in your accent color.",
      "Drag a column's ⠿ handle to reorder it. Edit Themes also lets you raise how many articles each column fetches, though most feeds only carry their most recent ~20-50 items regardless.",
    ],
  },
  companies: {
    mode: "companies",
    emoji: "🏢",
    title: "Pack Watch",
    tagline: "Your company watchlist",
    body: [
      "Companies are grouped by industry in the sidebar sub-list — click one to see just its pack.",
      "Tick company checkboxes and Fetch! (N) grabs just those; leave nothing ticked and it fetches the whole industry instead.",
      "Search here is instant, no Enter needed. Hover an industry row for the rename/delete circles, or add a new one from the + row at the bottom.",
      "Edit Lists and Edit Sources at the bottom of the sidebar manage your company roster and the RSS feeds each search checks.",
    ],
  },
  saved: {
    mode: "saved",
    emoji: "🦴",
    title: "Buried Bones",
    tagline: "Everything you've saved",
    body: [
      "Bookmark an article via its 🔖 icon on The Yard or Pack Watch, or bury a link yourself with + Save link.",
      "Selecting a saved link opens it inline when possible — with a graceful fallback to the original site if it blocks extraction.",
      "Categories live in the sidebar sub-list — hover one to rename or delete it, or add a new one from the + row.",
      "Pin your most-dug-up bones to keep them at the top of the list.",
    ],
  },
};
