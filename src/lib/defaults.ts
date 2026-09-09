import type { Company, Industry, NewsSource, TimeFrameDays } from "./types";

export const INDUSTRIES: Industry[] = [
  "Consumer",
  "Energy",
  "Information Technology",
  "Communications",
];

export const INDUSTRY_ICONS: Record<string, string> = {
  Consumer: "🛍️",
  Energy: "⚡",
  "Information Technology": "💻",
  Communications: "📡",
  Materials: "⚗️",
};

export const DEFAULT_INDUSTRY_EMOJI = "📁";

export function industryIcon(industry: Industry): string {
  return INDUSTRY_ICONS[industry] ?? DEFAULT_INDUSTRY_EMOJI;
}

export function defaultIndustryEmojis(
  industries: Industry[]
): Record<Industry, string> {
  return Object.fromEntries(
    industries.map((industry) => [industry, industryIcon(industry)])
  );
}

// A compact, curated set for the industry emoji picker — no external
// emoji-picker dependency required.
export const EMOJI_PICKER_OPTIONS: string[] = [
  "📁", "🛍️", "🛒", "⚡", "💻", "📡", "🏭", "⚗️", "🏦", "💰",
  "📈", "📉", "🛢️", "🚗", "✈️", "🏗️", "🌾", "🏥", "🎮", "📱",
  "🔋", "🌐", "🚢", "🏠", "💵", "⛏️", "🧪", "🛰️", "📞", "🏬",
];

interface IndustryPalette {
  accent: string;
  badgeBg: string;
  badgeText: string;
  ring: string;
}

const INDUSTRY_PALETTES: IndustryPalette[] = [
  {
    accent: "bg-emerald-500",
    badgeBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-500/40",
  },
  {
    accent: "bg-amber-500",
    badgeBg: "bg-amber-500/15 dark:bg-amber-500/20",
    badgeText: "text-amber-700 dark:text-amber-300",
    ring: "ring-amber-500/40",
  },
  {
    accent: "bg-sky-500",
    badgeBg: "bg-sky-500/15 dark:bg-sky-500/20",
    badgeText: "text-sky-700 dark:text-sky-300",
    ring: "ring-sky-500/40",
  },
  {
    accent: "bg-violet-500",
    badgeBg: "bg-violet-500/15 dark:bg-violet-500/20",
    badgeText: "text-violet-700 dark:text-violet-300",
    ring: "ring-violet-500/40",
  },
  {
    accent: "bg-rose-500",
    badgeBg: "bg-rose-500/15 dark:bg-rose-500/20",
    badgeText: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-500/40",
  },
  {
    accent: "bg-orange-500",
    badgeBg: "bg-orange-500/15 dark:bg-orange-500/20",
    badgeText: "text-orange-700 dark:text-orange-300",
    ring: "ring-orange-500/40",
  },
];

export function industryPalette(
  industry: Industry,
  industries: Industry[]
): IndustryPalette {
  const idx = Math.max(0, industries.indexOf(industry));
  return INDUSTRY_PALETTES[idx % INDUSTRY_PALETTES.length];
}

export const TIME_FRAME_OPTIONS: { label: string; days: TimeFrameDays }[] = [
  { label: "1d", days: 1 },
  { label: "3d", days: 3 },
  { label: "7d", days: 7 },
  { label: "14d", days: 14 },
  { label: "30d", days: 30 },
];

export const DEFAULT_SOURCES: NewsSource[] = [
  {
    id: "bloomberg",
    name: "Bloomberg",
    domain: "bloomberg.com",
    feedUrls: [
      "https://feeds.bloomberg.com/markets/news.rss",
      "https://feeds.bloomberg.com/economics/news.rss",
      "https://feeds.bloomberg.com/bview/news.rss",
    ],
    enabled: true,
    isDefault: true,
  },
  {
    id: "reuters",
    name: "Reuters",
    domain: "reuters.com",
    feedUrls: [],
    enabled: true,
    isDefault: true,
  },
  {
    id: "the-edge-singapore",
    name: "The Edge Singapore",
    domain: "theedgesingapore.com",
    feedUrls: [],
    enabled: true,
    isDefault: true,
  },
];

export const SAMPLE_COMPANIES: Company[] = [
  { id: "c-apple", name: "Apple", industry: "Consumer", ticker: "AAPL" },
  { id: "c-nike", name: "Nike", industry: "Consumer", ticker: "NKE" },
  { id: "c-pg", name: "Procter & Gamble", industry: "Consumer", ticker: "PG" },
  { id: "e-exxon", name: "ExxonMobil", industry: "Energy", ticker: "XOM" },
  { id: "e-chevron", name: "Chevron", industry: "Energy", ticker: "CVX" },
  { id: "e-shell", name: "Shell", industry: "Energy", ticker: "SHEL" },
  {
    id: "it-msft",
    name: "Microsoft",
    industry: "Information Technology",
    ticker: "MSFT",
  },
  {
    id: "it-nvidia",
    name: "Nvidia",
    industry: "Information Technology",
    ticker: "NVDA",
  },
  {
    id: "it-oracle",
    name: "Oracle",
    industry: "Information Technology",
    ticker: "ORCL",
  },
  {
    id: "com-meta",
    name: "Meta",
    industry: "Communications",
    ticker: "META",
  },
  {
    id: "com-verizon",
    name: "Verizon",
    industry: "Communications",
    ticker: "VZ",
  },
  {
    id: "com-singtel",
    name: "Singtel",
    industry: "Communications",
    ticker: "Z74.SI",
  },
];

export const STORAGE_KEY = "credit-news-analyst-preferences";
export const THEME_STORAGE_KEY = "credit-news-analyst-theme";
export const UI_STORAGE_KEY = "credit-news-analyst-ui";
export const SEEN_ARTICLES_STORAGE_KEY = "credit-news-analyst-seen-articles";

export const DEFAULT_SIDEBAR_WIDTH = 224;
export const MIN_SIDEBAR_WIDTH = 180;
export const MAX_SIDEBAR_WIDTH = 420;
export const COLLAPSED_SIDEBAR_WIDTH = 56;
