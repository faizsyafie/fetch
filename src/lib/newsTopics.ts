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

// Shared "nothing fetched yet" shape for the four columns' state.
export const EMPTY_NEWS_ARTICLES: Record<NewsTopicId, TopicArticle[]> = {
  world: [],
  malaysia: [],
  economy: [],
  tech: [],
};
export const EMPTY_NEWS_ERRORS: Record<NewsTopicId, string[]> = {
  world: [],
  malaysia: [],
  economy: [],
  tech: [],
};

// The News board's fixed columns (World, Malaysia, Economy, Tech). Unlike company tracking, these pull
// every recent item from their sources directly — no keyword matching — so
// each source here should already be scoped to the topic (a general wire
// feed, not a company-specific one). Feed URLs are publicly documented today
// but outlets do move them occasionally; a dead feed just contributes no
// articles for that source rather than breaking the column (see fetchFeed
// in rss.ts).
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
    id: "economy",
    label: "Economy",
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
];

// Default column order shown on the News board — user-rearrangable, see
// uiSettings.newsTopicOrder.
export const DEFAULT_NEWS_TOPIC_ORDER: NewsTopicId[] = [
  "world",
  "malaysia",
  "economy",
  "tech",
];
