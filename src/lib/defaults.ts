import type {
  AccentColor,
  Company,
  FontFamily,
  FontScale,
  Industry,
  NewsSource,
  NewsTimeFrame,
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

// Saved-links categories — same "protected virtual view" pattern as
// industries above, plus "Uncategorized" as a permanent fallback bucket
// that's never actually stored in linkCategories: a link's category counts
// as Uncategorized whenever it isn't (or is no longer) in that list, so
// deleting a category can't strand or delete anyone's notes.
export const ALL_LINKS_CATEGORY = "All";
export const PINNED_LINKS_CATEGORY = "Pinned";
export const UNCATEGORIZED_CATEGORY = "Uncategorized";
export const RESERVED_LINK_CATEGORY_NAMES = [
  ALL_LINKS_CATEGORY,
  PINNED_LINKS_CATEGORY,
  UNCATEGORIZED_CATEGORY,
];

export function isReservedLinkCategoryName(name: string): boolean {
  return RESERVED_LINK_CATEGORY_NAMES.some(
    (reserved) => reserved.toLowerCase() === name.trim().toLowerCase()
  );
}

export const ALL_LINKS_EMOJI = "🔖";
export const PINNED_LINKS_EMOJI = "⭐";
export const UNCATEGORIZED_LINKS_EMOJI = "🗂️";
export const DEFAULT_LINK_CATEGORY_EMOJI = "📌";

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

// The General/News board's own time filter — see the NewsTimeFrame type for
// why this reads "at least N days old" rather than "within the last N days."
export const NEWS_TIME_FRAME_OPTIONS: { label: string; value: NewsTimeFrame }[] = [
  { label: "Now", value: "now" },
  { label: "1d", value: 1 },
  { label: "3d", value: 3 },
  { label: "7d", value: 7 },
  { label: "14d", value: 14 },
];

// Selectable "articles per topic" caps for the General page (Edit Themes
// panel) — the server clamps to the same range regardless (see
// MAX_ARTICLES_PER_TOPIC in rss.ts), so this list and that clamp must stay
// in sync.
export const NEWS_ARTICLE_LIMIT_OPTIONS = [30, 50, 75, 100] as const;
export const DEFAULT_NEWS_ARTICLE_LIMIT = 30;

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
    id: "the-edge-malaysia",
    name: "The Edge Malaysia",
    domain: "theedgemalaysia.com",
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
  /** "r,g,b" of the 500 shade, for inline rgba() styles (e.g. glow shadows). */
  rgb: string;
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
    rgb: "59,130,246",
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
    rgb: "20,184,166",
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
    rgb: "16,185,129",
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
    rgb: "139,92,246",
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
    rgb: "236,72,153",
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
    rgb: "244,63,94",
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
    rgb: "245,158,11",
  },
};

// Saved-link categories are colored circles rather than emoji — cycles
// through the same 7 accent colors used for the app's own accent picker,
// assigned by creation order so a new category always gets a fresh-looking
// default before the user picks one themselves.
export const LINK_CATEGORY_COLOR_ORDER: AccentColor[] = [
  "blue",
  "teal",
  "emerald",
  "violet",
  "pink",
  "rose",
  "amber",
];

export function linkCategoryColor(
  category: string,
  categories: string[],
  colors: Record<string, AccentColor>
): AccentColor {
  if (colors[category]) return colors[category];
  const idx = Math.max(0, categories.indexOf(category));
  return LINK_CATEGORY_COLOR_ORDER[idx % LINK_CATEGORY_COLOR_ORDER.length];
}

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
  // Mirrors DEFAULT_SOURCES exactly (same domains, so "already added" checks
  // by domain line up) — shown as its own highlighted section, hidden once
  // all three are already in the user's list.
  {
    name: "Bloomberg",
    domain: "bloomberg.com",
    // addSource only takes a single feed URL from a suggestion; the other
    // two Bloomberg feeds DEFAULT_SOURCES carries are lost on remove+re-add
    // via this card. Not worth widening SuggestedSource's shape over.
    feedUrl: "https://feeds.bloomberg.com/markets/news.rss",
    description: "Real-time markets and finance news from a leading wire.",
    region: "Recommended",
  },
  {
    name: "Reuters",
    domain: "reuters.com",
    feedUrl: null,
    description: "Top global wire service for company and markets news.",
    region: "Recommended",
  },
  {
    name: "The Edge Malaysia",
    domain: "theedgemalaysia.com",
    feedUrl: null,
    description: "Malaysia's leading business and investment news outlet.",
    region: "Recommended",
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
  {
    name: "The Star Business",
    domain: "thestar.com.my",
    feedUrl: "https://www.thestar.com.my/rss/Business",
    description: "Malaysia's widest-read English daily, business desk.",
    region: "Malaysia",
  },
  {
    name: "New Straits Times Business",
    domain: "nst.com.my",
    feedUrl: null,
    description: "Malaysian business, banking and corporate news.",
    region: "Malaysia",
  },
  {
    name: "Free Malaysia Today Business",
    domain: "freemalaysiatoday.com",
    feedUrl: null,
    description: "Independent Malaysian outlet, business coverage.",
    region: "Malaysia",
  },
  {
    name: "Bernama",
    domain: "bernama.com",
    feedUrl: null,
    description: "Malaysia's national news agency.",
    region: "Malaysia",
  },
];
