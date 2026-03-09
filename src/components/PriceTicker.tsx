"use client";

import { useState, useEffect, useCallback } from "react";
import type { CommodityPrice } from "@/lib/types";

function PriceItem({
  price,
  updated,
}: {
  price: CommodityPrice;
  updated: boolean;
}) {
  const isPositive = price.change >= 0;
  const arrow = isPositive ? "▲" : "▼";
  const colorClass = isPositive ? "text-accent-green" : "text-accent-red";

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 border-r border-border font-mono text-sm whitespace-nowrap ${updated ? "animate-pulse-price" : ""}`}
    >
      <span className="text-text-muted text-xs font-sans uppercase tracking-wider">
        {price.name}
      </span>
      <span className="text-text-primary font-semibold">
        ${price.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
      <span className={`text-xs ${colorClass}`}>
        {arrow} {Math.abs(price.changePercent).toFixed(2)}%
      </span>
    </div>
  );
}

function SkeletonTicker() {
  return (
    <div className="flex items-center gap-6 px-4 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="skeleton w-16 h-3" />
          <div className="skeleton w-20 h-4" />
          <div className="skeleton w-14 h-3" />
        </div>
      ))}
    </div>
  );
}

export default function PriceTicker() {
  const [prices, setPrices] = useState<CommodityPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(false);
  const [lastFetched, setLastFetched] = useState<string>("");

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/prices");
      if (!res.ok) return;
      const data = await res.json();
      setPrices(data.prices);
      setLastFetched(data.fetchedAt);
      setUpdated(true);
      setTimeout(() => setUpdated(false), 800);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  if (loading) return <SkeletonTicker />;
  if (prices.length === 0) return null;

  return (
    <div className="flex items-center overflow-x-auto bg-bg-secondary border-b border-border">
      {prices.map((p) => (
        <PriceItem key={p.symbol} price={p} updated={updated} />
      ))}
      <div className="ml-auto px-4 py-2 text-text-muted text-xs font-mono">
        {lastFetched
          ? new Date(lastFetched).toLocaleTimeString()
          : ""}
      </div>
    </div>
  );
}
