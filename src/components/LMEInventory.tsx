"use client";

import { useState, useEffect, useCallback } from "react";

interface LMEItem {
  metal: string;
  stock: number;
  change: number;
}

interface LMEData {
  available: boolean;
  reason?: string;
  items?: LMEItem[];
  fetchedAt?: string;
}

export default function LMEInventory() {
  const [data, setData] = useState<LMEData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLME = useCallback(async () => {
    try {
      const res = await fetch("/api/lme");
      if (!res.ok) return;
      const json = await res.json();
      setData(json);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLME();
    const interval = setInterval(fetchLME, 30 * 60_000);
    return () => clearInterval(interval);
  }, [fetchLME]);

  return (
    <div className="border-t border-border">
      <div className="px-3 py-2 border-b border-border">
        <h2 className="text-xs font-mono text-text-muted uppercase tracking-widest">
          LME Warehouse Stocks
        </h2>
      </div>

      <div className="px-3 py-2">
        {loading ? (
          <div className="space-y-1.5 py-1">
            <div className="skeleton w-full h-3" />
            <div className="skeleton w-3/4 h-3" />
          </div>
        ) : data?.available === false ? (
          <div className="text-xs font-mono text-text-muted py-2 space-y-1">
            <p>{data.reason ?? "Nasdaq Data Link subscription required"}</p>
            <a
              href="https://data.nasdaq.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-blue hover:underline"
            >
              data.nasdaq.com →
            </a>
          </div>
        ) : data?.items && data.items.length > 0 ? (
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-text-muted">
                <th className="text-left py-0.5">Metal</th>
                <th className="text-right py-0.5">Stock (t)</th>
                <th className="text-right py-0.5">Chg</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={item.metal} className="border-t border-border/50">
                  <td className="py-0.5 text-text-secondary uppercase">
                    {item.metal}
                  </td>
                  <td className="py-0.5 text-right text-text-primary">
                    {item.stock.toLocaleString()}
                  </td>
                  <td
                    className={`py-0.5 text-right ${item.change >= 0 ? "text-accent-green" : "text-accent-red"}`}
                  >
                    {item.change >= 0 ? "+" : ""}
                    {item.change.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-xs font-mono text-text-muted py-2">No data</p>
        )}
      </div>
    </div>
  );
}
