export type TimeFrameDays = 1 | 3 | 7 | 14 | 30;

export type Industry = string;

export interface Company {
  id: string;
  name: string;
  industry: Industry;
  ticker?: string;
  pinned?: boolean;
  starred?: boolean;
  notes?: string;
}

export interface NewsSource {
  id: string;
  name: string;
  domain: string;
  feedUrls: string[];
  enabled: boolean;
  isDefault?: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  source: string;
  sourceId: string;
  company: string;
  companyId: string;
}

export interface FetchNewsRequest {
  companies: Company[];
  sources: NewsSource[];
  days: TimeFrameDays;
}

export interface FetchNewsResponse {
  articles: NewsArticle[];
  fetchedAt: string;
  errors: string[];
}

export type Density = "comfortable" | "compact";

export type AccentColor =
  | "blue"
  | "teal"
  | "emerald"
  | "violet"
  | "pink"
  | "rose"
  | "amber";

export type FontFamily = "system" | "serif" | "mono";

export type FontScale = "sm" | "md" | "lg";

export type NewsTopicId = "world" | "malaysia" | "economy" | "tech";

export interface UiSettings {
  sidebarWidth: number;
  sidebarCollapsed: boolean;
  density: Density;
  tutorialSeen: boolean;
  accent: AccentColor;
  fontFamily: FontFamily;
  fontScale: FontScale;
  newsTopicOrder: NewsTopicId[];
}

export interface TopicArticle {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  summary: string;
  source: string;
  topic: NewsTopicId;
  imageUrl: string | null;
}

export interface SuggestedSource {
  name: string;
  domain: string;
  feedUrl: string | null;
  description: string;
  region: "US" | "UK/EU" | "Asia-Pacific";
}

export interface SavedLink {
  id: string;
  url: string;
  title: string;
  notes: string;
  /** One of AppPreferences.linkCategories, or any other value which is
   *  treated as "Uncategorized" (e.g. after its category was deleted). */
  category: string;
  pinned: boolean;
  savedAt: string;
  editedAt: string;
}

export interface AppPreferences {
  companies: Company[];
  sources: NewsSource[];
  days: TimeFrameDays;
  industries: Industry[];
  activeIndustry: Industry;
  industryEmojis: Record<Industry, string>;
  links: SavedLink[];
  linkCategories: string[];
  activeLinkCategory: string;
}
