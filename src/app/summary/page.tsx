"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { DailySummary } from "@/lib/types";

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

export default function SummaryPage() {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [selected, setSelected] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/summary")
      .then((res) => res.json())
      .then((data) => {
        setSummaries(data.summaries ?? []);
        if (data.summaries?.length > 0) {
          setSelected(data.summaries[0]);
        }
      })
      .catch((_) => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
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
        <Link
          href="/"
          className="text-xs font-mono text-text-secondary hover:text-text-primary transition-colors"
        >
          ← DASHBOARD
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 shrink-0 border-r border-border bg-bg-secondary overflow-y-auto">
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
                <div className="text-xs">{s.date}</div>
                <div className="text-xs text-text-muted mt-0.5 truncate">
                  {s.commodities || "General"}
                </div>
              </button>
            ))
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-6">
          {selected ? (
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-lg font-mono font-bold text-text-primary">
                  Daily Briefing
                </h2>
                <span className="text-sm font-mono text-text-muted">
                  {selected.date}
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
