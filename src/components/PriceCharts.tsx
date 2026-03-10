"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CommodityHistory } from "@/lib/types";

const CHART_COLORS: Record<string, { stroke: string; fill: string }> = {
  "TIO=F": { stroke: "#f59e0b", fill: "#f59e0b" },
  "HG=F": { stroke: "#ef4444", fill: "#ef4444" },
  "ALI=F": { stroke: "#06b6d4", fill: "#06b6d4" },
  "GC=F": { stroke: "#eab308", fill: "#eab308" },
  "SI=F": { stroke: "#9ca3af", fill: "#9ca3af" },
};

function MiniChart({ commodity }: { commodity: CommodityHistory }) {
  const colors = CHART_COLORS[commodity.symbol] ?? {
    stroke: "#3b82f6",
    fill: "#3b82f6",
  };

  if (commodity.data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted text-xs font-mono">
        NO DATA
      </div>
    );
  }

  const first = commodity.data[0].close;
  const last = commodity.data[commodity.data.length - 1].close;
  const isPositive = last >= first;
  const activeColor = isPositive ? "#10b981" : "#ef4444";

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
          <span className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-1 border border-border">
            {commodity.exchange}
          </span>
        </div>
        <span
          className="text-xs font-mono"
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
            data={commodity.data}
            margin={{ top: 4, right: 4, bottom: 0, left: 4 }}
          >
            <defs>
              <linearGradient
                id={`grad-${commodity.symbol}`}
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
              fill={`url(#grad-${commodity.symbol})`}
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
    <div className="grid grid-cols-5 gap-px bg-border h-[140px]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-bg-secondary p-2">
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

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/prices/history?range=1mo");
      if (!res.ok) return;
      const data = await res.json();
      setHistory(data.history);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading) return <SkeletonCharts />;
  if (history.length === 0) return null;

  return (
    <div className="grid grid-cols-5 gap-px bg-border h-[140px]">
      {history.map((h) => (
        <div key={h.symbol} className="bg-bg-secondary overflow-hidden">
          <MiniChart commodity={h} />
        </div>
      ))}
    </div>
  );
}
