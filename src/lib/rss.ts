import RSSParser from "rss-parser";
import crypto from "crypto";
import { RSS_FEEDS, classifyCommodity } from "./config";
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

async function fetchFeed(feed: FeedConfig): Promise<NewsItem[]> {
  try {
    const result = await parser.parseURL(feed.url);
    const items: NewsItem[] = (result.items ?? [])
      .filter((item) => item.title && item.link)
      .map((item) => {
        const title = item.title!.trim();
        const description =
          item.contentSnippet?.slice(0, 500) ??
          item.content?.replace(/<[^>]*>/g, "").slice(0, 500) ??
          null;

        return {
          id: generateId(item.link!, title),
          title,
          link: item.link!,
          source: feed.name,
          publishedAt: item.isoDate ?? new Date().toISOString(),
          description,
          commodity: classifyCommodity(title, description),
          createdAt: new Date().toISOString(),
        };
      });

    return items;
  } catch (error) {
    console.error(`[RSS] Failed to fetch ${feed.name}: ${error}`);
    return [];
  }
}

export async function refreshAllFeeds(): Promise<{
  total: number;
  inserted: number;
  sources: Record<string, number>;
}> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map((feed) => fetchFeed(feed))
  );

  const allItems: NewsItem[] = [];
  const sources: Record<string, number> = {};

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const feedName = RSS_FEEDS[i].name;
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
      sources[feedName] = result.value.length;
    } else {
      sources[feedName] = 0;
      console.error(`[RSS] ${feedName} failed:`, result.reason);
    }
  }

  const inserted = allItems.length > 0 ? await insertNews(allItems) : 0;

  return { total: allItems.length, inserted, sources };
}
