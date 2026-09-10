import type {
  AccentColor,
  Company,
  FontFamily,
  FontScale,
  Industry,
  NewsSource,
  SuggestedSource,
  TimeFrameDays,
} from "./types";

export const INDUSTRIES: Industry[] = [
  "Consumer",
  "Energy",
  "Information Technology",
  "Communications",
];

// Reserved, permanent virtual "industries": they are never stored in
// AppPreferences.industries, can't be renamed/deleted, and always render
// pinned above the user's real industries in the sidebar.
export const ALL_INDUSTRY = "All";
export const WATCHLIST_INDUSTRY = "Watchlist";
export const RESERVED_INDUSTRY_NAMES = [ALL_INDUSTRY, WATCHLIST_INDUSTRY];

export function isReservedIndustryName(name: string): boolean {
  return RESERVED_INDUSTRY_NAMES.some(
    (reserved) => reserved.toLowerCase() === name.trim().toLowerCase()
  );
}

export const ALL_INDUSTRY_EMOJI = "🌐";
export const WATCHLIST_INDUSTRY_EMOJI = "⭐";

export function getIndustryEmoji(
  industry: Industry,
  industryEmojis: Record<Industry, string>
): string {
  if (industry === ALL_INDUSTRY) return ALL_INDUSTRY_EMOJI;
  if (industry === WATCHLIST_INDUSTRY) return WATCHLIST_INDUSTRY_EMOJI;
  return industryEmojis[industry] ?? DEFAULT_INDUSTRY_EMOJI;
}

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
export const PROFILE_STORAGE_KEY = "credit-news-analyst-profile";

export const DEFAULT_SIDEBAR_WIDTH = 224;
export const MIN_SIDEBAR_WIDTH = 180;
export const MAX_SIDEBAR_WIDTH = 420;
export const COLLAPSED_SIDEBAR_WIDTH = 56;

interface AccentPreset {
  label: string;
  swatch: string;
  solid: string;
  solidHover: string;
  text: string;
  border: string;
  ring: string;
  softBg: string;
}

export const ACCENT_PRESETS: Record<AccentColor, AccentPreset> = {
  blue: {
    label: "Blue",
    swatch: "bg-blue-500",
    solid: "bg-blue-600",
    solidHover: "hover:bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500",
    ring: "ring-blue-500/40",
    softBg: "bg-blue-500/15 dark:bg-blue-500/20",
  },
  teal: {
    label: "Teal",
    swatch: "bg-teal-500",
    solid: "bg-teal-600",
    solidHover: "hover:bg-teal-500",
    text: "text-teal-600 dark:text-teal-400",
    border: "border-teal-500",
    ring: "ring-teal-500/40",
    softBg: "bg-teal-500/15 dark:bg-teal-500/20",
  },
  emerald: {
    label: "Emerald",
    swatch: "bg-emerald-500",
    solid: "bg-emerald-600",
    solidHover: "hover:bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500",
    ring: "ring-emerald-500/40",
    softBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
  },
  violet: {
    label: "Violet",
    swatch: "bg-violet-500",
    solid: "bg-violet-600",
    solidHover: "hover:bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-500",
    ring: "ring-violet-500/40",
    softBg: "bg-violet-500/15 dark:bg-violet-500/20",
  },
  pink: {
    label: "Pink",
    swatch: "bg-pink-500",
    solid: "bg-pink-600",
    solidHover: "hover:bg-pink-500",
    text: "text-pink-600 dark:text-pink-400",
    border: "border-pink-500",
    ring: "ring-pink-500/40",
    softBg: "bg-pink-500/15 dark:bg-pink-500/20",
  },
  rose: {
    label: "Rose",
    swatch: "bg-rose-500",
    solid: "bg-rose-600",
    solidHover: "hover:bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500",
    ring: "ring-rose-500/40",
    softBg: "bg-rose-500/15 dark:bg-rose-500/20",
  },
  amber: {
    label: "Amber",
    swatch: "bg-amber-500",
    solid: "bg-amber-600",
    solidHover: "hover:bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500",
    ring: "ring-amber-500/40",
    softBg: "bg-amber-500/15 dark:bg-amber-500/20",
  },
};

export const FONT_FAMILY_PRESETS: Record<
  FontFamily,
  { label: string; stack: string }
> = {
  system: {
    label: "Poppins",
    stack: "var(--font-poppins), ui-sans-serif, system-ui, sans-serif",
  },
  serif: {
    label: "Serif",
    stack: "Georgia, Cambria, 'Times New Roman', Times, serif",
  },
  mono: {
    label: "Monospace",
    stack: "var(--font-geist-mono), ui-monospace, 'SF Mono', monospace",
  },
};

export const FONT_SCALE_PRESETS: Record<
  FontScale,
  { label: string; value: number }
> = {
  sm: { label: "Small", value: 0.925 },
  md: { label: "Medium", value: 1 },
  lg: { label: "Large", value: 1.1 },
};

// Reputable financial/business news outlets suggested as additional sources.
// `feedUrl` is a direct RSS feed where one is publicly documented; otherwise
// the domain still works as a Google News `site:` filter (which is how the
// app matches news regardless of feedUrl). Feed URLs can change over time —
// worth spot-checking after adding one.
export const SUGGESTED_SOURCES: SuggestedSource[] = [
  {
    name: "Reuters Business",
    domain: "reuters.com",
    feedUrl: null,
    description: "Top global wire service for company and markets news.",
    region: "US",
  },
  {
    name: "Bloomberg Markets",
    domain: "bloomberg.com",
    feedUrl: "https://feeds.bloomberg.com/markets/news.rss",
    description: "Real-time markets and finance news from a leading wire.",
    region: "US",
  },
  {
    name: "CNBC Finance",
    domain: "cnbc.com",
    feedUrl: "https://www.cnbc.com/id/10000664/device/rss/rss.html",
    description: "US markets and investing headlines from a major broadcaster.",
    region: "US",
  },
  {
    name: "CNBC Top News",
    domain: "cnbc.com",
    feedUrl: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    description: "General US business and markets top stories.",
    region: "US",
  },
  {
    name: "MarketWatch",
    domain: "marketwatch.com",
    feedUrl: "https://feeds.marketwatch.com/marketwatch/topstories/",
    description: "Dow Jones-owned markets and personal-finance news.",
    region: "US",
  },
  {
    name: "Wall Street Journal Markets",
    domain: "wsj.com",
    feedUrl: "https://feeds.content.dowjones.io/public/rss/RSSMarketsMain",
    description: "Flagship US financial newspaper's markets desk.",
    region: "US",
  },
  {
    name: "Forbes Business",
    domain: "forbes.com",
    feedUrl: "https://www.forbes.com/business/feed/",
    description: "Company, industry, and entrepreneurship coverage.",
    region: "US",
  },
  {
    name: "Yahoo Finance",
    domain: "finance.yahoo.com",
    feedUrl: null,
    description: "Widely aggregated markets and company news hub.",
    region: "US",
  },
  {
    name: "Financial Times Companies",
    domain: "ft.com",
    feedUrl: "https://www.ft.com/companies?format=rss",
    description: "Premier global business and companies coverage.",
    region: "UK/EU",
  },
  {
    name: "Financial Times Markets",
    domain: "ft.com",
    feedUrl: "https://www.ft.com/markets?format=rss",
    description: "Global markets and macroeconomic coverage.",
    region: "UK/EU",
  },
  {
    name: "BBC Business",
    domain: "bbc.com",
    feedUrl: "https://feeds.bbci.co.uk/news/business/rss.xml",
    description: "Trusted broadcaster, UK and global business news.",
    region: "UK/EU",
  },
  {
    name: "The Guardian Business",
    domain: "theguardian.com",
    feedUrl: "https://www.theguardian.com/uk/business/rss",
    description: "UK and global financial and economic news.",
    region: "UK/EU",
  },
  {
    name: "The Economist — Finance & Economics",
    domain: "economist.com",
    feedUrl: "https://www.economist.com/finance-and-economics/rss.xml",
    description: "In-depth economic and financial analysis.",
    region: "UK/EU",
  },
  {
    name: "Nikkei Asia",
    domain: "asia.nikkei.com",
    feedUrl: "https://asia.nikkei.com/rss/feed/nar",
    description: "Leading Japanese and pan-Asian business coverage.",
    region: "Asia-Pacific",
  },
  {
    name: "South China Morning Post Business",
    domain: "scmp.com",
    feedUrl: "https://www.scmp.com/rss/92/feed",
    description: "Greater China and Hong Kong business/economic news.",
    region: "Asia-Pacific",
  },
  {
    name: "Australian Financial Review",
    domain: "afr.com",
    feedUrl: null,
    description: "Australia's leading financial and business daily.",
    region: "Asia-Pacific",
  },
];
