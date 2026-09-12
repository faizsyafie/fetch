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
  {
    id: "topbar-settings",
    selector: '[data-tour="topbar-settings"]',
    title: "⚙️ Settings",
    description:
      "Theme, accent color, font and row spacing all live here — saved to your profile, so it follows you between sessions.",
    placement: "bottom",
  },
  {
    id: "topbar-user",
    selector: '[data-tour="topbar-user"]',
    title: "🐕 Your profile",
    description:
      "Your name in the corner. Switch profiles, send feedback, or log out from here.",
    placement: "bottom",
  },
  {
    id: "topbar-help",
    selector: '[data-tour="topbar-help"]',
    title: "❓ Help",
    description:
      "Forget any of this? Click ❓ on any page, anytime, for a refresher on just that page's own functions.",
    placement: "bottom",
  },
];

// Each mode's own ❓ — a short spotlight tour of just that page's own
// sections, rather than restarting the whole cross-mode tour.
export const MODE_DETAILED_STEPS: Record<GuidedMode, TourStep[]> = {
  news: [
    {
      id: "news-columns",
      selector: '[data-tour="news-columns"]',
      title: "📰 Columns",
      description:
        "Each column is a theme — World, Malaysia, Tech, and whatever else is off the leash. Drag a column's ⠿ handle to reorder it; duplicate headlines from the same story get merged automatically.",
      placement: "bottom",
    },
    {
      id: "news-timerange",
      selector: '[data-tour="topbar-timerange"]',
      title: "🕐 Time range",
      description:
        '"Now" is the freshest batch. "7d" means at least 7 days old — not "in the last 7 days" — so each option digs up a genuinely older slice instead of repeating the same one.',
      placement: "bottom",
    },
    {
      id: "news-fetch",
      selector: '[data-tour="topbar-fetch"]',
      title: "🦴 Re-fetch!",
      description: "Reloads every column for the current time range. Search commits on Enter and highlights matches in your accent color.",
      placement: "bottom",
    },
    {
      id: "news-themes",
      selector: '[data-tour="sidebar-manage-themes"]',
      title: "✏️ Edit Themes",
      description:
        "Turn columns on or off, and raise how many articles each one fetches — though most feeds only carry their most recent ~20-50 items regardless.",
      placement: "right",
    },
  ],
  companies: [
    {
      id: "companies-industries",
      selector: '[data-tour="industry-sub-list"]',
      title: "🏢 Industries",
      description:
        "Click one to see just its pack. Hover a row for the rename/delete circles, or add a new industry from the + row at the bottom.",
      placement: "right",
    },
    {
      id: "companies-list",
      selector: '[data-tour="company-list"]',
      title: "🐕 Your pack",
      description:
        "Tick a company's checkbox to include it in a targeted fetch, or expand a row to add a private note. Search here is instant — no Enter needed.",
      placement: "top",
    },
    {
      id: "companies-fetch",
      selector: '[data-tour="topbar-fetch"]',
      title: "🦴 Fetch!",
      description:
        "Tick a few and Fetch! (N) grabs just those. Leave nothing ticked and it fetches the whole industry instead — Clear and Collapse pop up alongside once there's something to act on.",
      placement: "bottom",
    },
    {
      id: "companies-manage",
      selector: '[data-tour="sidebar-manage"]',
      title: "✏️ Manage",
      description: "Edit Lists manages your company roster; Edit Sources manages the RSS feeds each search checks.",
      placement: "right",
    },
  ],
  saved: [
    {
      id: "saved-categories",
      selector: '[data-tour="category-sub-list"]',
      title: "🦴 Categories",
      description:
        "Organize your buried bones by topic. Hover a category for the rename/delete circles, or add a new one from the + row.",
      placement: "right",
    },
    {
      id: "saved-add",
      selector: '[data-tour="saved-add-link"]',
      title: "🔖 Bury a link",
      description:
        "Paste any URL here, or bookmark an article straight from its 🔖 icon on The Yard or Pack Watch.",
      placement: "bottom",
    },
    {
      id: "saved-list",
      selector: '[data-tour="saved-links-list"]',
      title: "📖 Dig it back up",
      description:
        "Select a saved link to read it inline when possible (with a fallback to the original site if it blocks extraction) and jot down notes. Pin your favorites to keep them at the top.",
      placement: "right",
    },
  ],
};
