"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { NewsItem } from "@/lib/types";
import CommodityFilter from "./CommodityFilter";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

const COMMODITY_COLORS: Record<string, string> = {
  iron: "text-accent-amber border-accent-amber",
  copper: "text-accent-red border-accent-red",
  aluminium: "text-accent-cyan border-accent-cyan",
  gold: "text-yellow-500 border-yellow-500",
  silver: "text-gray-400 border-gray-400",
  general: "text-text-muted border-text-muted",
};

function RelevanceDot({ score }: { score?: number }) {
  if (!score || score <= 0.4) return null;
  if (score > 0.7) return <span className="text-xs text-accent-green shrink-0">●</span>;
  return <span className="text-xs text-yellow-500 shrink-0">●</span>;
}

function NewsItemRow({ item }: { item: NewsItem }) {
  const commodityColor =
    COMMODITY_COLORS[item.commodity ?? "general"] ??
    COMMODITY_COLORS.general;

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-3 py-3 border-b border-border hover:bg-bg-tertiary transition-colors duration-100 animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <RelevanceDot score={item.relevanceScore} />
            <span className="text-text-muted text-xs font-mono shrink-0">
              {timeAgo(item.publishedAt)}
            </span>
            <span className="text-accent-blue text-xs font-mono truncate">
              [{item.source}]
            </span>
            {item.commodity && item.commodity !== "general" && (
              <span
                className={`text-xs font-mono uppercase border px-1 ${commodityColor}`}
              >
                {item.commodity}
              </span>
            )}
          </div>
          <h3 className="text-sm text-text-primary leading-snug font-medium">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

function SkeletonNews() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="px-3 py-3 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <div className="skeleton w-12 h-3" />
            <div className="skeleton w-24 h-3" />
          </div>
          <div className="skeleton w-full h-4 mb-1" />
          <div className="skeleton w-3/4 h-3" />
        </div>
      ))}
    </div>
  );
}

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const initialRefreshDone = useRef(false);

  const refreshFeeds = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetch("/api/news/refresh", { method: "POST" });
    } catch (_) {
    } finally {
      setRefreshing(false);
    }
  }, []);

  const fetchNews = useCallback(
    async (append = false) => {
      const currentOffset = append ? offset : 0;
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          commodity: filter,
          limit: "50",
          offset: String(currentOffset),
        });
        const res = await fetch(`/api/news?${params}`);
        if (!res.ok) return;
        const data = await res.json();

        if (append) {
          setNews((prev) => [...prev, ...data.news]);
        } else {
          setNews(data.news);
        }
        setHasMore(data.hasMore);
        setOffset(currentOffset + data.news.length);
      } catch (_) {
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter, offset]
  );

  useEffect(() => {
    if (!initialRefreshDone.current) {
      initialRefreshDone.current = true;
      refreshFeeds().then(() => fetchNews());
    } else {
      fetchNews();
    }
  }, [filter]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshFeeds();
      fetchNews();
    }, 5 * 60_000);
    return () => clearInterval(interval);
  }, [refreshFeeds, fetchNews]);

  const handleFilterChange = (commodity: string) => {
    setFilter(commodity);
    setOffset(0);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-border">
        <CommodityFilter active={filter} onChange={handleFilterChange} />
        <div className="flex items-center gap-2 px-3">
          {refreshing && (
            <span className="text-xs text-text-muted font-mono">
              syncing...
            </span>
          )}
          <button
            onClick={() => refreshFeeds().then(() => fetchNews())}
            disabled={refreshing}
            className="text-text-muted hover:text-text-primary text-xs font-mono px-2 py-1 border border-border hover:border-border-bright transition-colors"
          >
            ↻ REFRESH
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <SkeletonNews />
        ) : news.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-text-muted text-sm font-mono">
            NO DATA — click REFRESH to fetch feeds
          </div>
        ) : (
          <>
            {news.map((item) => (
              <NewsItemRow key={item.id} item={item} />
            ))}
            {hasMore && (
              <div className="p-3">
                <button
                  onClick={() => fetchNews(true)}
                  disabled={loadingMore}
                  className="w-full py-2 text-xs font-mono text-text-secondary border border-border hover:border-border-bright hover:text-text-primary transition-colors"
                >
                  {loadingMore ? "LOADING..." : "LOAD MORE"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
