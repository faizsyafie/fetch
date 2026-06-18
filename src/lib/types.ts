export type TimeFrameDays = 1 | 3 | 10 | 15 | 30;

export type Industry =
  | "Consumer"
  | "Energy"
  | "Information Technology"
  | "Communications";

export interface Company {
  id: string;
  name: string;
  industry: Industry;
  ticker?: string;
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

export interface AppPreferences {
  companies: Company[];
  sources: NewsSource[];
  days: TimeFrameDays;
  selectedIndustries: Industry[];
}
