import Parser from "rss-parser";
import { subDays, isAfter, parseISO, isValid } from "date-fns";
import type { NewsTopic } from "./newsTopics";
import type {
  Company,
  NewsArticle,
  NewsSource,
  NewsTimeFrame,
  TimeFrameDays,
  TopicArticle,
} from "./types";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent":
      "CreditNewsAnalyst/1.0 (RSS reader for credit research; +https://github.com)",
    Accept: "application/rss+xml, application/xml, text/xml",
  },
});

function parseArticleDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (isValid(parsed)) return parsed;
  const iso = parseISO(value);
  return isValid(iso) ? iso : null;
}

function buildGoogleNewsUrl(
  query: string,
  days: TimeFrameDays,
  domain?: string
): string {
  const whenClause = days <= 1 ? "when:1d" : `when:${days}d`;
  const domainClause = domain ? ` site:${domain}` : "";
  const encoded = encodeURIComponent(`${query} ${whenClause}${domainClause}`);
  return `https://news.google.com/rss/search?q=${encoded}&hl=en-US&gl=US&ceid=US:en`;
}

function companyMatches(text: string, company: Company): boolean {
  const haystack = text.toLowerCase();
  const name = company.name.toLowerCase();
  if (haystack.includes(name)) return true;
  if (company.ticker && haystack.includes(company.ticker.toLowerCase())) {
    return true;
  }
  return false;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s*-\s*[^-]+$/i, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function articleId(link: string, companyId: string, sourceId: string): string {
  return `${sourceId}-${companyId}-${Buffer.from(link).toString("base64url").slice(0, 24)}`;
}

async function fetchFeed(url: string) {
  try {
    return await parser.parseURL(url);
  } catch {
    return null;
  }
}

function mapFeedItem(
  item: Parser.Item,
  company: Company,
  source: NewsSource,
  cutoff: Date
): NewsArticle | null {
  const pubDate = parseArticleDate(item.isoDate || item.pubDate);
  if (!pubDate || !isAfter(pubDate, cutoff)) return null;

  const title = item.title?.trim() ?? "Untitled";
  const summary = stripHtml(item.contentSnippet || item.content || "");
  const link = item.link?.trim() ?? "";

  if (!link) return null;
  if (!companyMatches(`${title} ${summary}`, company)) return null;

  return {
    id: articleId(link, company.id, source.id),
    title,
    link,
    pubDate: pubDate.toISOString(),
    summary: summary.slice(0, 400),
    source: source.name,
    sourceId: source.id,
    company: company.name,
    companyId: company.id,
  };
}

async function fetchCompanySourceArticles(
  company: Company,
  source: NewsSource,
  days: TimeFrameDays,
  cutoff: Date
): Promise<{ articles: NewsArticle[]; errors: string[] }> {
  const articles: NewsArticle[] = [];
  const errors: string[] = [];

  const googleUrl = buildGoogleNewsUrl(company.name, days, source.domain);
  const googleFeed = await fetchFeed(googleUrl);

  if (googleFeed?.items?.length) {
    for (const item of googleFeed.items) {
      const article = mapFeedItem(item, company, source, cutoff);
      if (article) articles.push(article);
    }
  } else if (source.feedUrls.length === 0) {
    errors.push(
      `No articles returned for ${company.name} on ${source.name} (Google News).`
    );
  }

  for (const feedUrl of source.feedUrls) {
    const feed = await fetchFeed(feedUrl);
    if (!feed?.items?.length) {
      errors.push(`Could not load feed: ${feedUrl}`);
      continue;
    }

    for (const item of feed.items) {
      const article = mapFeedItem(item, company, source, cutoff);
      if (article) articles.push(article);
    }
  }

  return { articles, errors };
}

export async function fetchNewsForWatchlist(
  companies: Company[],
  sources: NewsSource[],
  days: TimeFrameDays
): Promise<{ articles: NewsArticle[]; errors: string[] }> {
  const enabledSources = sources.filter((s) => s.enabled);
  const cutoff = subDays(new Date(), days);
  const allArticles: NewsArticle[] = [];
  const errors: string[] = [];

  if (companies.length === 0) {
    return { articles: [], errors: ["Add at least one company to your watchlist."] };
  }

  if (enabledSources.length === 0) {
    return { articles: [], errors: ["Enable at least one news source."] };
  }

  const tasks = companies.flatMap((company) =>
    enabledSources.map(async (source) => {
      const result = await fetchCompanySourceArticles(
        company,
        source,
        days,
        cutoff
      );
      return result;
    })
  );

  const results = await Promise.all(tasks);

  for (const result of results) {
    allArticles.push(...result.articles);
    errors.push(...result.errors);
  }

  const unique = new Map<string, NewsArticle>();
  for (const article of allArticles) {
    const key = `${article.companyId}:${normalizeTitle(article.title)}`;
    const existing = unique.get(key);
    if (!existing) {
      unique.set(key, article);
      continue;
    }
    if (
      existing.link.includes("news.google.com") &&
      !article.link.includes("news.google.com")
    ) {
      unique.set(key, article);
    }
  }

  const sorted = Array.from(unique.values()).sort(
    (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );

  return { articles: sorted, errors: [...new Set(errors)] };
}

const MAX_ARTICLES_PER_TOPIC = 30;

function extractImageUrl(item: Parser.Item): string | null {
  // rss-parser exposes <enclosure> out of the box; most other thumbnail
  // formats (media:content, media:thumbnail) need custom field config we
  // don't otherwise use, so this covers the common case without a second
  // parser instance. Cards render fine with no image either way.
  const url = item.enclosure?.url;
  return url && /^https?:\/\//.test(url) ? url : null;
}

function topicArticleId(topicId: string, link: string): string {
  return `${topicId}-${Buffer.from(link).toString("base64url").slice(0, 24)}`;
}

async function fetchTopicSourceArticles(
  topic: NewsTopic,
  source: NewsTopic["sources"][number],
  isInRange: (pubDate: Date) => boolean
): Promise<{ articles: TopicArticle[]; error: string | null }> {
  const feed = await fetchFeed(source.feedUrl);
  if (!feed?.items?.length) {
    return { articles: [], error: `Could not load feed: ${source.name}` };
  }

  const articles: TopicArticle[] = [];
  for (const item of feed.items) {
    const pubDate = parseArticleDate(item.isoDate || item.pubDate);
    if (!pubDate || !isInRange(pubDate)) continue;

    const title = item.title?.trim();
    const link = item.link?.trim();
    if (!title || !link) continue;

    articles.push({
      id: topicArticleId(topic.id, link),
      title,
      link,
      pubDate: pubDate.toISOString(),
      summary: stripHtml(item.contentSnippet || item.content || "").slice(0, 240),
      source: source.name,
      topic: topic.id,
      imageUrl: extractImageUrl(item),
    });
  }

  return { articles, error: null };
}

/**
 * Fetches every topic's columns in parallel. Unlike company tracking, there's
 * no keyword filter — every recent item from a topic's sources belongs in
 * that column, deduped by normalized headline (outlets sometimes syndicate
 * the same story to more than one of their own feeds).
 *
 * `timeFrame` pages backward through the archive rather than narrowing a
 * recency window: each column is a flat top-30-most-recent slice, so "last
 * N days" would almost always return the same handful of items regardless
 * of N. "now" takes the newest 30 with no age floor; a numeric value keeps
 * only items at least that many days old, so 1/3/7/14 each surface a
 * distinctly older slice instead of repeating the freshest one.
 */
export async function fetchTopicNews(
  topics: NewsTopic[],
  timeFrame: NewsTimeFrame
): Promise<Record<string, { articles: TopicArticle[]; errors: string[] }>> {
  const boundary = timeFrame === "now" ? null : subDays(new Date(), timeFrame);
  const isInRange = (pubDate: Date) =>
    boundary === null || !isAfter(pubDate, boundary);

  const entries = await Promise.all(
    topics.map(async (topic) => {
      const results = await Promise.all(
        topic.sources.map((source) =>
          fetchTopicSourceArticles(topic, source, isInRange)
        )
      );

      const errors: string[] = [];
      const unique = new Map<string, TopicArticle>();
      for (const result of results) {
        if (result.error) errors.push(result.error);
        for (const article of result.articles) {
          const key = normalizeTitle(article.title);
          if (!unique.has(key)) unique.set(key, article);
        }
      }

      const sorted = Array.from(unique.values())
        .sort(
          (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
        )
        .slice(0, MAX_ARTICLES_PER_TOPIC);

      return [topic.id, { articles: sorted, errors }] as const;
    })
  );

  return Object.fromEntries(entries);
}
