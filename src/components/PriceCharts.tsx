"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CommodityHistory, PriceHistoryPoint, ExchangeVariant } from "@/lib/types";
import { COMMODITIES, COMMODITY_META, EXCHANGE_OPTIONS } from "@/lib/config";
import type { CommodityType } from "@/lib/types";

const CHART_COLORS: Record<string, { stroke: string; fill: string }> =
  Object.fromEntries(
    COMMODITIES.map((c) => {
      const color = COMMODITY_META[c.type]?.color ?? "#3b82f6";
      return [c.symbol, { stroke: color, fill: color }];
    })
  );

function findCommodityType(symbol: string): CommodityType | null {
  return COMMODITIES.find((c) => c.symbol === symbol)?.type ?? null;
}

function ExchangeSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: ExchangeVariant[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="flex items-center gap-px">
      {variants.map((v) => (
        <button
          key={v.key}
          onClick={(e) => { e.stopPropagation(); onSelect(v.key); }}
          className={`text-[9px] font-mono px-1 py-px border transition-colors ${
            selected === v.key
              ? "bg-bg-tertiary text-text-primary border-text-muted"
              : "text-text-muted border-transparent hover:text-text-secondary hover:border-border"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

function MiniChart({
  commodity,
  variants,
  selectedKey,
  onSelectExchange,
  altData,
  altLoading,
}: {
  commodity: CommodityHistory;
  variants?: ExchangeVariant[];
  selectedKey: string;
  onSelectExchange: (key: string) => void;
  altData?: PriceHistoryPoint[];
  altLoading: boolean;
}) {
  const colors = CHART_COLORS[commodity.symbol] ?? {
    stroke: "#3b82f6",
    fill: "#3b82f6",
  };

  const selectedVariant = variants?.find((v) => v.key === selectedKey);

  const chartData = useMemo(() => {
    if (!variants || !selectedVariant) return commodity.data;

    if (selectedVariant.symbol !== commodity.symbol && altData) {
      return altData;
    }

    if (selectedVariant.divisor) {
      return commodity.data.map((p) => ({
        ...p,
        close: Math.round((p.close / selectedVariant.divisor!) * 10000) / 10000,
      }));
    }

    return commodity.data;
  }, [commodity.data, variants, selectedVariant, altData]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-xs font-mono">
        {altLoading ? "LOADING…" : "NO DATA"}
      </div>
    );
  }

  const first = chartData[0].close;
  const last = chartData[chartData.length - 1].close;
  const isPositive = last >= first;
  const activeColor = isPositive ? "#10b981" : "#ef4444";
  const exchangeLabel = selectedVariant?.label ?? commodity.exchange;
  const gradientId = `grad-${commodity.symbol}-${selectedKey}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-2 pt-1.5">
        <div className="flex items-center gap-1">
          <span
            className="text-xs font-mono font-bold uppercase tracking-wider"
            style={{ color: colors.stroke }}
          >
            {commodity.name}
          </span>
          {variants && variants.length > 1 ? (
            <ExchangeSelector
              variants={variants}
              selected={selectedKey}
              onSelect={onSelectExchange}
            />
          ) : (
            <span className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-1 border border-border">
              {exchangeLabel}
            </span>
          )}
        </div>
        <span
          className={`text-xs font-mono ${altLoading ? "animate-pulse" : ""}`}
          style={{ color: activeColor }}
        >
          {last.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor={activeColor}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={activeColor}
                  stopOpacity={0.02}
                />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis domain={["auto", "auto"]} hide />
            <Tooltip
              contentStyle={{
                background: "#1a2332",
                border: "1px solid #334155",
                borderRadius: 0,
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#e2e8f0",
              }}
              labelStyle={{ color: "#94a3b8" }}
              formatter={(value) => [
                `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                commodity.name,
              ]}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={activeColor}
              strokeWidth={1.5}
              fill={`url(#${gradientId})`}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SkeletonCharts() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-bg-secondary p-2 h-[120px] lg:h-[140px]">
          <div className="flex justify-between mb-2">
            <div className="skeleton w-16 h-3" />
            <div className="skeleton w-14 h-3" />
          </div>
          <div className="skeleton w-full h-[90px]" />
        </div>
      ))}
    </div>
  );
}

export default function PriceCharts() {
  const [history, setHistory] = useState<CommodityHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchangeKeys, setExchangeKeys] = useState<Record<string, string>>({});
  const [altCache, setAltCache] = useState<Record<string, PriceHistoryPoint[]>>({});
  const [altLoading, setAltLoading] = useState<Record<string, boolean>>({});

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/prices/history?range=1mo");
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.history);

      const defaults: Record<string, string> = {};
      for (const h of data.history as CommodityHistory[]) {
        const type = findCommodityType(h.symbol);
        if (type) {
          const variants = EXCHANGE_OPTIONS[type];
          if (variants?.length) {
            defaults[h.symbol] = variants[0].key;
          }
        }
      }
      setExchangeKeys(defaults);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleExchangeSelect = useCallback(
    async (commoditySymbol: string, key: string) => {
      setExchangeKeys((prev) => ({ ...prev, [commoditySymbol]: key }));

      const type = findCommodityType(commoditySymbol);
      if (!type) return;
      const variants = EXCHANGE_OPTIONS[type];
      const variant = variants?.find((v) => v.key === key);
      if (!variant || variant.symbol === commoditySymbol) return;

      const cacheKey = variant.symbol;
      if (altCache[cacheKey]) return;

      setAltLoading((prev) => ({ ...prev, [commoditySymbol]: true }));
      try {
        const res = await fetch(
          `/api/prices/history?range=1mo&symbol=${encodeURIComponent(variant.symbol)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const points: PriceHistoryPoint[] = data.history?.[0]?.data ?? [];
        setAltCache((prev) => ({ ...prev, [cacheKey]: points }));
      } catch (_) {
      } finally {
        setAltLoading((prev) => ({ ...prev, [commoditySymbol]: false }));
      }
    },
    [altCache]
  );

  if (loading) return <SkeletonCharts />;
  if (history.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-border">
      {history.map((h) => {
        const type = findCommodityType(h.symbol);
        const variants = type ? EXCHANGE_OPTIONS[type] : undefined;
        const selectedKey = exchangeKeys[h.symbol] ?? variants?.[0]?.key ?? "";
        const selectedVariant = variants?.find((v) => v.key === selectedKey);
        const altSymbol = selectedVariant?.symbol !== h.symbol ? selectedVariant?.symbol : undefined;

        return (
          <div key={h.symbol} className="bg-bg-secondary overflow-hidden h-[120px] lg:h-[140px]">
            <MiniChart
              commodity={h}
              variants={variants}
              selectedKey={selectedKey}
              onSelectExchange={(key) => handleExchangeSelect(h.symbol, key)}
              altData={altSymbol ? altCache[altSymbol] : undefined}
              altLoading={altLoading[h.symbol] ?? false}
            />
          </div>
        );
      })}
    </div>
  );
}
