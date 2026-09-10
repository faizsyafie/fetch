import type { NewsTopicId, TopicArticle } from "./types";

export interface NewsTopicSource {
  name: string;
  feedUrl: string;
}

export interface NewsTopic {
  id: NewsTopicId;
  label: string;
  emoji: string;
  sources: NewsTopicSource[];
}

// Shared "nothing fetched yet" shape for every topic's state — one entry per
// NewsTopic below, whether or not the user currently has that topic enabled
// (see uiSettings.newsTopicOrder for the enabled/visible subset).
export const EMPTY_NEWS_ARTICLES: Record<NewsTopicId, TopicArticle[]> = {
  world: [],
  malaysia: [],
  generalEconomy: [],
  tech: [],
  energy: [],
  financials: [],
  healthcare: [],
  consumer: [],
  industrials: [],
  materials: [],
  monetaryPolicy: [],
  tradeGeopolitics: [],
};
export const EMPTY_NEWS_ERRORS: Record<NewsTopicId, string[]> = {
  world: [],
  malaysia: [],
  generalEconomy: [],
  tech: [],
  energy: [],
  financials: [],
  healthcare: [],
  consumer: [],
  industrials: [],
  materials: [],
  monetaryPolicy: [],
  tradeGeopolitics: [],
};

// The full catalog of General-page columns. Unlike company tracking, these
// pull every recent item from their sources directly — no keyword matching —
// so each source here should already be scoped to the topic (a general wire
// feed, not a company-specific one). Not every topic is shown by default —
// see DEFAULT_NEWS_TOPIC_ORDER — the rest are opt-in via Edit Themes.
//
// Feed URLs for the newer topics (energy onward) were compiled via research
// rather than live-tested against this deployment's network, the same
// caveat as SUGGESTED_SOURCES in defaults.ts — a dead or renamed feed just
// contributes no articles for that source rather than breaking the column
// (see fetchFeed in rss.ts), but the exact tag-page slugs are worth
// spot-checking after launch.
export const NEWS_TOPICS: NewsTopic[] = [
  {
    id: "world",
    label: "World",
    emoji: "🌍",
    sources: [
      { name: "BBC News", feedUrl: "https://feeds.bbci.co.uk/news/world/rss.xml" },
      { name: "Al Jazeera", feedUrl: "https://www.aljazeera.com/xml/rss/all.xml" },
      { name: "The Guardian", feedUrl: "https://www.theguardian.com/world/rss" },
    ],
  },
  {
    id: "malaysia",
    label: "Malaysia",
    emoji: "🇲🇾",
    sources: [
      {
        name: "Free Malaysia Today",
        feedUrl: "https://www.freemalaysiatoday.com/feed/",
      },
      {
        name: "The Star",
        feedUrl: "https://www.thestar.com.my/rss/News/Nation",
      },
      {
        name: "Malay Mail",
        feedUrl: "https://www.malaymail.com/feed/rss/malaysia",
      },
    ],
  },
  {
    id: "generalEconomy",
    label: "General Economy",
    emoji: "📈",
    sources: [
      {
        name: "Bloomberg Markets",
        feedUrl: "https://feeds.bloomberg.com/markets/news.rss",
      },
      {
        name: "BBC Business",
        feedUrl: "https://feeds.bbci.co.uk/news/business/rss.xml",
      },
      {
        name: "The Guardian Business",
        feedUrl: "https://www.theguardian.com/uk/business/rss",
      },
    ],
  },
  {
    id: "tech",
    label: "Tech",
    emoji: "💻",
    sources: [
      { name: "TechCrunch", feedUrl: "https://techcrunch.com/feed/" },
      { name: "The Verge", feedUrl: "https://www.theverge.com/rss/index.xml" },
      {
        name: "Ars Technica",
        feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
      },
    ],
  },
  {
    id: "energy",
    label: "Energy",
    emoji: "⚡",
    sources: [
      {
        name: "EIA Today in Energy",
        feedUrl: "https://www.eia.gov/rss/todayinenergy.xml",
      },
      { name: "OilPrice.com", feedUrl: "https://oilprice.com/rss/main" },
    ],
  },
  {
    id: "financials",
    label: "Financials",
    emoji: "🏦",
    sources: [
      {
        name: "The Guardian Banking",
        feedUrl: "https://www.theguardian.com/business/banking/rss",
      },
      {
        name: "FT Banking & Finance",
        feedUrl: "https://www.ft.com/banking-and-finance?format=rss",
      },
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare & Pharmaceuticals",
    emoji: "🏥",
    sources: [
      { name: "BBC Health", feedUrl: "https://feeds.bbci.co.uk/news/health/rss.xml" },
      {
        name: "The Guardian Pharmaceuticals",
        feedUrl: "https://www.theguardian.com/business/pharmaceuticals-industry/rss",
      },
    ],
  },
  {
    id: "consumer",
    label: "Consumer",
    emoji: "🛍️",
    sources: [
      {
        name: "The Guardian Retail",
        feedUrl: "https://www.theguardian.com/business/retail/rss",
      },
      {
        name: "The Guardian Consumer Affairs",
        feedUrl: "https://www.theguardian.com/money/consumeraffairs/rss",
      },
    ],
  },
  {
    id: "industrials",
    label: "Industrials & Manufacturing",
    emoji: "🏭",
    sources: [
      {
        name: "The Guardian Manufacturing",
        feedUrl: "https://www.theguardian.com/business/manufacturingindustry/rss",
      },
    ],
  },
  {
    id: "materials",
    label: "Materials & Construction",
    emoji: "🏗️",
    sources: [
      {
        name: "The Guardian Construction",
        feedUrl: "https://www.theguardian.com/business/construction/rss",
      },
      {
        name: "The Guardian Mining",
        feedUrl: "https://www.theguardian.com/business/mining/rss",
      },
    ],
  },
  {
    id: "monetaryPolicy",
    label: "Monetary & Fiscal Policy",
    emoji: "💰",
    sources: [
      {
        name: "The Guardian Federal Reserve",
        feedUrl: "https://www.theguardian.com/business/federalreserve/rss",
      },
      {
        name: "The Guardian Interest Rates",
        feedUrl: "https://www.theguardian.com/business/interestrates/rss",
      },
    ],
  },
  {
    id: "tradeGeopolitics",
    label: "Trade & Geopolitics",
    emoji: "🤝",
    sources: [
      {
        name: "The Guardian Global Trade",
        feedUrl: "https://www.theguardian.com/business/internationaltrade/rss",
      },
      {
        name: "Al Jazeera",
        feedUrl: "https://www.aljazeera.com/xml/rss/all.xml",
      },
    ],
  },
];

// Default columns shown on the News board — user-rearrangable and
// toggleable, see uiSettings.newsTopicOrder and Edit Themes.
export const DEFAULT_NEWS_TOPIC_ORDER: NewsTopicId[] = [
  "world",
  "malaysia",
  "generalEconomy",
  "tech",
  "tradeGeopolitics",
];
