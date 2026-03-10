"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { DailySummary } from "@/lib/types";
import type { SentimentDataPoint } from "@/lib/sentiment";
import { COMMODITY_META, TRACKED_COMMODITIES } from "@/lib/config";
import { exportSummaryPDF } from "@/lib/pdf";

const COMMODITY_COLORS: Record<string, string> = Object.fromEntries(
  TRACKED_COMMODITIES.map((key) => [key, COMMODITY_META[key].color])
);

const COMMODITY_LABELS: Record<string, string> = Object.fromEntries(
  TRACKED_COMMODITIES.map((key) => [key, COMMODITY_META[key].label])
);

function renderContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    if (trimmed.startsWith("## ")) {
      return (
        <h3
          key={i}
          className="text-accent-blue text-sm font-bold mt-6 mb-3 font-mono uppercase tracking-wider"
        >
          {trimmed.replace("## ", "")}
        </h3>
      );
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h2
          key={i}
          className="text-accent-cyan text-base font-bold mt-4 mb-3 font-mono uppercase tracking-wider"
        >
          {trimmed.replace("# ", "")}
        </h2>
      );
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.slice(2);
      return (
        <div key={i} className="flex gap-2 text-sm text-text-secondary leading-relaxed mb-1.5 pl-3">
          <span className="text-text-muted shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(text) }} />
        </div>
      );
    }
    return (
      <p
        key={i}
        className="text-sm text-text-secondary leading-relaxed mb-1.5"
        dangerouslySetInnerHTML={{ __html: boldify(trimmed) }}
      />
    );
  });
}

function boldify(text: string): string {
  return text.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-text-primary font-semibold">$1</strong>'
  );
}

function formatSentiment(val: number): string {
  if (val === 0) return "0.00";
  return (val > 0 ? "+" : "") + val.toFixed(2);
}

function SentimentChart({
  sentiment,
  totalArticles,
  loading,
}: {
  sentiment: SentimentDataPoint[];
  totalArticles: number;
  loading: boolean;
}) {
  const [visible, setVisible] = useState<Set<string>>(
    new Set(["iron", "copper", "aluminium", "nickel", "zinc", "gold", "silver"])
  );

  const toggle = (commodity: string) => {
    setVisible((prev) => {
      const next = new Set(prev);
      if (next.has(commodity)) {
        next.delete(commodity);
      } else {
        next.add(commodity);
      }
      return next;
    });
  };

  const averages: Record<string, number> = {};
  for (const key of Object.keys(COMMODITY_COLORS)) {
    const values = sentiment.map((d) => d[key as keyof SentimentDataPoint] as number);
    const nonZero = values.filter((v) => v !== 0);
    averages[key] = nonZero.length > 0
      ? nonZero.reduce((a, b) => a + b, 0) / nonZero.length
      : 0;
  }

  if (loading) {
    return (
      <div className="bg-bg-secondary border border-border mb-6">
        <div className="px-4 py-2 border-b border-border flex items-center gap-2">
          <div className="skeleton w-40 h-3" />
        </div>
        <div className="p-4">
          <div className="skeleton w-full h-[200px]" />
        </div>
      </div>
    );
  }

  if (sentiment.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border mb-6">
        <div className="px-4 py-2 border-b border-border">
          <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
            Sentiment Analysis
          </span>
        </div>
        <div className="flex items-center justify-center h-[120px] text-text-muted text-xs font-mono">
          NO SENTIMENT DATA
        </div>
      </div>
    );
  }

  const chartData = sentiment.map((d) => ({
    ...d,
    label: d.date.slice(5),
  }));

  return (
    <div className="bg-bg-secondary border border-border mb-6">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-text-secondary uppercase tracking-widest font-bold">
            Sentiment Analysis
          </span>
          <span className="text-[10px] font-mono text-text-muted bg-bg-tertiary px-1.5 py-0.5 border border-border">
            30D
          </span>
          <span className="text-[10px] font-mono text-text-muted">
            {totalArticles} ARTICLES
          </span>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-border flex items-center gap-1.5">
        {Object.entries(COMMODITY_COLORS).map(([key, color]) => (
          <button
            key={key}
            onClick={() => toggle(key)}
            className={`text-[10px] font-mono px-2 py-0.5 border transition-colors ${
              visible.has(key)
                ? "border-border-bright"
                : "border-border opacity-40"
            }`}
            style={{
              color: visible.has(key) ? color : "#64748b",
              backgroundColor: visible.has(key) ? `${color}10` : "transparent",
            }}
          >
            {COMMODITY_LABELS[key]}
          </button>
        ))}
      </div>

      <div className="px-2 pt-2 pb-1">
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 4, left: 12 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fontFamily: "monospace", fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[-1, 1]}
              tick={{ fontSize: 10, fontFamily: "monospace", fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
              tickFormatter={(v: number) => v.toFixed(1)}
              width={32}
            />
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
                formatSentiment(Number(value)),
              ]}
            />
            <ReferenceLine y={0} stroke="#334155" strokeDasharray="3 3" />
            {Object.entries(COMMODITY_COLORS).map(([key, color]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={1.5}
                dot={false}
                hide={!visible.has(key)}
                animationDuration={800}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="px-4 py-2 border-t border-border flex items-center gap-2 md:gap-4 flex-wrap">
        <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
          AVG
        </span>
        {Object.entries(COMMODITY_COLORS).map(([key, color]) => {
          const avg = averages[key];
          return (
            <div key={key} className="flex items-center gap-1">
              <span
                className="text-[10px] font-mono"
                style={{ color }}
              >
                {COMMODITY_LABELS[key]}
              </span>
              <span
                className="text-[10px] font-mono font-bold"
                style={{
                  color: avg > 0 ? "#10b981" : avg < 0 ? "#ef4444" : "#64748b",
                }}
              >
                {formatSentiment(avg)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatSummaryDate(date: string): string {
  if (date.includes("~")) {
    const [start, end] = date.split("~");
    return `${start} — ${end}`;
  }
  return date;
}

function isWeeklySummary(date: string): boolean {
  return date.includes("~");
}

export default function SummaryPage() {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [selected, setSelected] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<number | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [sentiment, setSentiment] = useState<SentimentDataPoint[]>([]);
  const [sentimentLoading, setSentimentLoading] = useState(true);
  const [totalArticles, setTotalArticles] = useState(0);

  const fetchSummaries = () => {
    fetch("/api/summary")
      .then((res) => res.json())
      .then((data) => {
        setSummaries(data.summaries ?? []);
        if (data.summaries?.length > 0 && !selected) {
          setSelected(data.summaries[0]);
        }
      })
      .catch((_) => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummaries();

    fetch("/api/sentiment?days=30")
      .then((res) => res.json())
      .then((data) => {
        setSentiment(data.sentiment ?? []);
        setTotalArticles(data.totalArticles ?? 0);
      })
      .catch((_) => {})
      .finally(() => setSentimentLoading(false));
  }, []);

  const handleGenerate = async (days: number) => {
    setGenerating(days);
    setGenError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenError(data.error ?? "Generation failed");
        return;
      }
      setSelected(data.summary);
      fetchSummaries();
    } catch {
      setGenError("Network error");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <div className="flex flex-col min-h-screen md:h-screen md:overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <h1 className="text-sm font-mono font-bold tracking-widest text-text-primary">
              <span className="text-accent-amber">IRON</span>
              <span className="text-text-secondary">SIGNAL</span>
            </h1>
          </Link>
          <span className="text-text-muted text-xs font-mono">/</span>
          <span className="text-xs font-mono text-text-secondary uppercase tracking-widest">
            Summaries
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate(1)}
            disabled={generating !== null}
            className="text-xs font-mono px-2 py-1 border border-border text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors disabled:opacity-50"
          >
            {generating === 1 ? "..." : "GEN 1D"}
          </button>
          <button
            onClick={() => handleGenerate(7)}
            disabled={generating !== null}
            className="text-xs font-mono px-2 py-1 border border-border text-text-secondary hover:border-accent-cyan hover:text-accent-cyan transition-colors disabled:opacity-50"
          >
            {generating === 7 ? "..." : "GEN 7D"}
          </button>
          {selected && (
            <button
              onClick={() => exportSummaryPDF(selected)}
              className="text-xs font-mono px-2 py-1 border border-border text-text-secondary hover:border-accent-green hover:text-accent-green transition-colors"
            >
              PDF
            </button>
          )}
          <Link
            href="/"
            className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
          >
            &larr; DASH
          </Link>
        </div>
      </header>
      {genError && (
        <div className="px-4 py-1.5 bg-accent-red/10 border-b border-accent-red/30">
          <span className="text-xs font-mono text-accent-red">{genError}</span>
        </div>
      )}

      <div className="md:hidden border-b border-border bg-bg-secondary">
        <div className="flex overflow-x-auto">
          {loading ? (
            <div className="flex gap-2 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton w-20 h-7 shrink-0" />
              ))}
            </div>
          ) : summaries.length === 0 ? (
            <div className="p-2 text-xs text-text-muted font-mono">
              No summaries
            </div>
          ) : (
            summaries.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`shrink-0 px-3 py-2 text-xs font-mono border-r border-border transition-colors ${
                  selected?.id === s.id
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary"
                }`}
              >
                {isWeeklySummary(s.date) && (
                  <span className="text-accent-cyan mr-1">W</span>
                )}
                {formatSummaryDate(s.date)}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">
        <aside className="hidden md:block w-56 shrink-0 border-r border-border bg-bg-secondary overflow-y-auto">
          <div className="px-3 py-2 border-b border-border">
            <span className="text-xs font-mono text-text-muted uppercase tracking-widest">
              Recent
            </span>
          </div>
          {loading ? (
            <div className="p-3 space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton w-full h-8" />
              ))}
            </div>
          ) : summaries.length === 0 ? (
            <div className="p-3 text-xs text-text-muted font-mono">
              No summaries yet
            </div>
          ) : (
            summaries.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelected(s)}
                className={`w-full text-left px-3 py-2 text-sm font-mono border-b border-border transition-colors ${
                  selected?.id === s.id
                    ? "bg-bg-tertiary text-text-primary"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary"
                }`}
              >
                <div className="text-xs flex items-center gap-1">
                  {isWeeklySummary(s.date) && (
                    <span className="text-accent-cyan font-bold">W</span>
                  )}
                  <span>{formatSummaryDate(s.date)}</span>
                </div>
                <div className="text-xs text-text-muted mt-0.5 truncate">
                  {s.commodities || "General"}
                </div>
              </button>
            ))
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <SentimentChart
            sentiment={sentiment}
            totalArticles={totalArticles}
            loading={sentimentLoading}
          />

          {selected ? (
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-mono font-bold text-text-primary">
                  {isWeeklySummary(selected.date) ? "Weekly Briefing" : "Daily Briefing"}
                </h2>
                <span className="text-sm font-mono text-text-muted">
                  {formatSummaryDate(selected.date)}
                </span>
              </div>
              <div>{renderContent(selected.content)}</div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted text-sm font-mono">
              {loading
                ? "Loading..."
                : "Select a summary from the sidebar or generate one from the dashboard"}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
