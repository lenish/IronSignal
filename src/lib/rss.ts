import RSSParser from "rss-parser";
import crypto from "crypto";
import {
  RSS_FEEDS,
  classifyCommodity,
  isRelevantToCommodities,
  calculateRelevanceScore,
} from "./config";
import { insertNews } from "./db";
import type { NewsItem, FeedConfig } from "./types";

const parser = new RSSParser({
  timeout: 10000,
  headers: {
    "User-Agent":
      "IronSignal/1.0 (Commodity News Aggregator; +https://ironsignal.dev)",
  },
});

function generateId(link: string, title: string): string {
  return crypto
    .createHash("sha256")
    .update(`${link}:${title}`)
    .digest("hex")
    .slice(0, 16);
}

async function fetchFeed(feed: FeedConfig): Promise<{
  items: NewsItem[];
  filtered: number;
}> {
  try {
    const result = await parser.parseURL(feed.url);
    const items: NewsItem[] = [];
    let filtered = 0;

    for (const item of result.items ?? []) {
      if (!item.title || !item.link) {
        continue;
      }

      const title = item.title.trim();
      const description =
        item.contentSnippet?.slice(0, 500) ??
        item.content?.replace(/<[^>]*>/g, "").slice(0, 500) ??
        null;
      const commodity = classifyCommodity(title, description);

      if (!isRelevantToCommodities(title, description)) {
        filtered += 1;
        continue;
      }

      const relevanceScore = calculateRelevanceScore(
        title,
        description,
        feed.name
      );

      items.push({
        id: generateId(item.link, title),
        title,
        link: item.link,
        source: feed.name,
        publishedAt: item.isoDate ?? new Date().toISOString(),
        description,
        commodity,
        relevanceScore,
        createdAt: new Date().toISOString(),
      });
    }

    return { items, filtered };
  } catch (error) {
    console.error(`[RSS] Failed to fetch ${feed.name}: ${error}`);
    return { items: [], filtered: 0 };
  }
}

export async function refreshAllFeeds(): Promise<{
  total: number;
  inserted: number;
  filtered: number;
  sources: Record<string, number>;
}> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchFeed(feed))
  );

  const allItems: NewsItem[] = [];
  let filtered = 0;
  const sources: Record<string, number> = {};

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const feedName = RSS_FEEDS[i].name;
    if (result.status === "fulfilled") {
      allItems.push(...result.value.items);
      filtered += result.value.filtered;
      sources[feedName] = result.value.items.length;
    } else {
      sources[feedName] = 0;
      console.error(`[RSS] ${feedName} failed:`, result.reason);
    }
  }

  const inserted = allItems.length > 0 ? await insertNews(allItems) : 0;

  return { total: allItems.length, inserted, filtered, sources };
}
