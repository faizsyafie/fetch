import type { TourStep } from "@/components/SpotlightTour";

/**
 * The guided-tour script. Each step (other than the intro/outro, which have
 * `selector: null`) targets a `data-tour="..."` attribute placed on the real
 * UI element elsewhere in the app — see Sidebar.tsx, TopBar.tsx and
 * CompanyList.tsx. Keep this list in sync whenever a major feature is added.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "welcome",
    selector: null,
    title: "Welcome to fetch",
    description:
      "A quick tour of everything you can do here — industries, news fetching, customization, and shortcuts. Use Next/Back (or the arrow keys) to move around, and Esc any time to skip.",
  },
  {
    id: "sidebar-industries",
    selector: '[data-tour="sidebar-industries"]',
    title: "Industries & watchlist",
    description:
      "Companies are grouped into industries here. 🌐 All shows everything across every industry, and ⭐ Watchlist shows just the companies you've starred. Click a row to switch, or drag rows to reorder them while in Edit mode.",
    placement: "right",
  },
  {
    id: "sidebar-header",
    selector: '[data-tour="sidebar-header"]',
    title: "Resize or collapse the sidebar",
    description:
      "Drag the sidebar's right edge to resize it, or click « to collapse it down to icons only — handy on smaller screens. Click » to bring it back.",
    placement: "right",
  },
  {
    id: "mode-toggle",
    selector: '[data-tour="mode-toggle"]',
    title: "General news, too",
    description:
      "Flip this switch (or click the logo) to jump to General — a board of four columns, World, Malaysia, Economy and Tech, each pulling straight from curated RSS feeds with no company matching involved. Drag a column by its ⠿ handle to reorder them. It refreshes as soon as you open it; flip back to Companies any time.",
    placement: "right",
  },
  {
    id: "sidebar-manage",
    selector: '[data-tour="sidebar-manage"]',
    title: "Edit lists & sources",
    description:
      "Edit Lists lets you add, rename, delete and reorder industries and companies, with a custom emoji per industry. Edit Sources controls which news domains are searched, including a page of suggested RSS feeds to add.",
    placement: "right",
  },
  {
    id: "topbar-search",
    selector: '[data-tour="topbar-search"]',
    title: "Search everywhere",
    description:
      "Search for a company across every industry at once — press / anywhere on the page to jump straight here.",
    placement: "bottom",
  },
  {
    id: "topbar-timerange",
    selector: '[data-tour="topbar-timerange"]',
    title: "Choose a time range",
    description:
      "Pick how far back to pull news for the active industry — anywhere from the last day up to the last 30 days.",
    placement: "bottom",
  },
  {
    id: "topbar-command-palette",
    selector: '[data-tour="topbar-command-palette"]',
    title: "Command palette",
    description:
      "Press ⌘K (or Ctrl+K) to open the command palette and jump straight to any company or industry without touching the mouse.",
    placement: "bottom",
  },
  {
    id: "topbar-appearance",
    selector: '[data-tour="topbar-appearance"]',
    title: "Density, theme & customization",
    description:
      "Toggle Compact/Comfortable density, switch Light/Dark mode, or open Customize (🎨) to set an accent color (now with 7 to choose from — it colors the mode switch too), row spacing, font family and font size — all saved to your profile.",
    placement: "bottom",
  },
  {
    id: "topbar-fetch",
    selector: '[data-tour="topbar-fetch"]',
    title: "Fetch news",
    description:
      "Select companies with the checkboxes then Fetch News, or use Fetch all to pull the whole industry in one go. Collapse all closes every expanded card at once.",
    placement: "bottom",
  },
  {
    id: "topbar-user",
    selector: '[data-tour="topbar-user"]',
    title: "Your team profile",
    description:
      "Your watchlist, industries and sources sync under your profile name — no password needed. Switch profiles or log out from here.",
    placement: "bottom",
  },
  {
    id: "company-list",
    selector: '[data-tour="company-list"]',
    title: "Working with companies",
    description:
      "Click a row to expand it and load its news. 📌 pins a company to the top of its industry, ⭐ adds it to your Watchlist, and every expanded card has a private notes field. A blue badge marks articles you haven't read yet.",
    placement: "top",
  },
  {
    id: "shortcuts",
    selector: null,
    title: "Keyboard shortcuts",
    description:
      "↑/↓ or j/k move through the list, Enter expands the highlighted row, / focuses search, and ⌘K / Ctrl+K opens the command palette. You can always reopen this tour from the ❓ Tutorial button. You're all set!",
  },
];
