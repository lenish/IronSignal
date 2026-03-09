"use client";

import { useState, useEffect, useCallback } from "react";
import type { DailySummary as DailySummaryType } from "@/lib/types";

function renderContent(content: string) {
  const lines = content.split("\n");
  return lines.map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    if (trimmed.startsWith("## ")) {
      return (
        <h3
          key={i}
          className="text-accent-blue text-xs font-bold uppercase tracking-wider mt-4 mb-2 font-mono"
        >
          {trimmed.replace("## ", "")}
        </h3>
      );
    }
    if (trimmed.startsWith("# ")) {
      return (
        <h2
          key={i}
          className="text-accent-cyan text-sm font-bold uppercase tracking-wider mt-3 mb-2 font-mono"
        >
          {trimmed.replace("# ", "")}
        </h2>
      );
    }
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const text = trimmed.slice(2);
      return (
        <div key={i} className="flex gap-2 text-xs text-text-secondary leading-relaxed mb-1 pl-2">
          <span className="text-text-muted shrink-0">•</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(text) }} />
        </div>
      );
    }
    return (
      <p
        key={i}
        className="text-xs text-text-secondary leading-relaxed mb-1"
        dangerouslySetInnerHTML={{ __html: boldify(trimmed) }}
      />
    );
  });
}

function boldify(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-semibold">$1</strong>');
}

export default function DailySummary() {
  const [summary, setSummary] = useState<DailySummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch("/api/summary");
      if (!res.ok) return;
      const data = await res.json();
      if (data.summaries?.length > 0) {
        setSummary(data.summaries[0]);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  const generateSummary = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }
      setSummary(data.summary);
    } catch {
      setError("Network error");
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">
          Daily Briefing
        </h2>
        {summary && (
          <span className="text-xs font-mono text-text-muted">
            {summary.date}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {loading ? (
          <div className="space-y-2 py-4">
            <div className="skeleton w-32 h-3" />
            <div className="skeleton w-full h-3" />
            <div className="skeleton w-full h-3" />
            <div className="skeleton w-3/4 h-3" />
            <div className="skeleton w-32 h-3 mt-4" />
            <div className="skeleton w-full h-3" />
            <div className="skeleton w-5/6 h-3" />
          </div>
        ) : summary ? (
          <div className="py-1">{renderContent(summary.content)}</div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-text-muted text-xs font-mono text-center gap-2">
            <span>No summary available</span>
            <span className="text-text-muted/60">
              Generate a briefing from collected news
            </span>
          </div>
        )}
      </div>

      <div className="px-3 py-2 border-t border-border">
        {error && (
          <p className="text-accent-red text-xs font-mono mb-2">{error}</p>
        )}
        <button
          onClick={generateSummary}
          disabled={generating}
          className="w-full py-2 text-xs font-mono uppercase tracking-wider border border-border text-text-secondary hover:border-accent-blue hover:text-accent-blue transition-colors disabled:opacity-50"
        >
          {generating ? "Generating..." : "Generate Summary"}
        </button>
      </div>
    </div>
  );
}
