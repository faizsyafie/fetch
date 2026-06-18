import type { Company, Industry, NewsSource, TimeFrameDays } from "./types";

export const INDUSTRIES: Industry[] = [
  "Consumer",
  "Energy",
  "Information Technology",
  "Communications",
];

export const TIME_FRAME_OPTIONS: { label: string; days: TimeFrameDays }[] = [
  { label: "Last 1 day", days: 1 },
  { label: "Last 3 days", days: 3 },
  { label: "Last 10 days", days: 10 },
  { label: "Last 15 days", days: 15 },
  { label: "Last 30 days", days: 30 },
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
