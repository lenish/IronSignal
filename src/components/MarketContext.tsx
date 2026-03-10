"use client";

import { useState, useEffect, useCallback } from "react";

interface FXData {
  usdcny: number;
  usdaud: number;
  dxy: number;
}

interface EnergyItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

interface IndicatorData {
  available?: boolean;
  fedRate?: number;
  cpi?: number;
}

interface MarketData {
  fx: FXData | null;
  energy: EnergyItem[];
  indicators: IndicatorData | null;
}

function fmt(val: number | null | undefined, decimals = 2): string {
  if (val == null) return "—";
  return val.toFixed(decimals);
}

function Arrow({ pct }: { pct: number | null | undefined }) {
  if (pct == null) return null;
  if (pct > 0) return <span className="text-accent-green">▲</span>;
  if (pct < 0) return <span className="text-accent-red">▼</span>;
  return null;
}

export default function MarketContext() {
  const [data, setData] = useState<MarketData>({
    fx: null,
    energy: [],
    indicators: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [fxRes, energyRes, indRes] = await Promise.allSettled([
      fetch("/api/fx").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/energy").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/indicators").then((r) => (r.ok ? r.json() : null)),
    ]);

    setData({
      fx: fxRes.status === "fulfilled" ? (fxRes.value as FXData) : null,
      energy:
        energyRes.status === "fulfilled" && energyRes.value?.prices
          ? (energyRes.value.prices as EnergyItem[])
          : [],
      indicators:
        indRes.status === "fulfilled" && indRes.value?.available !== false
          ? (indRes.value as IndicatorData)
          : null,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAll();
    const interval = setInterval(() => void fetchAll(), 300_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="flex items-center gap-6 px-4 py-1.5 bg-bg-secondary border-b border-border text-xs font-mono text-text-muted">
        Loading market data...
      </div>
    );
  }

  const brent = data.energy.find((e) => e.symbol === "BZ=F");
  const wti = data.energy.find((e) => e.symbol === "CL=F");
  const natgas = data.energy.find((e) => e.symbol === "NG=F");

  return (
    <div className="flex items-center bg-bg-secondary border-b border-border text-xs font-mono overflow-x-auto">
      {/* FX Section */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-r border-border shrink-0">
        <span className="text-text-muted uppercase tracking-wider text-[10px]">
          FX
        </span>
        <span className="text-text-secondary">
          USD/CNY{" "}
          <span className="text-text-primary">{fmt(data.fx?.usdcny)}</span>
        </span>
        <span className="text-text-secondary">
          USD/AUD{" "}
          <span className="text-text-primary">{fmt(data.fx?.usdaud)}</span>
        </span>
        <span className="text-text-secondary">
          DXY{" "}
          <span className="text-text-primary">{fmt(data.fx?.dxy, 1)}</span>
        </span>
      </div>

      {/* Energy Section */}
      <div className="flex items-center gap-4 px-4 py-1.5 border-r border-border shrink-0">
        <span className="text-text-muted uppercase tracking-wider text-[10px]">
          ENERGY
        </span>
        <span className="text-text-secondary">
          BRENT <span className="text-text-primary">${fmt(brent?.price)}</span>{" "}
          <Arrow pct={brent?.changePercent} />
        </span>
        <span className="text-text-secondary">
          WTI <span className="text-text-primary">${fmt(wti?.price)}</span>{" "}
          <Arrow pct={wti?.changePercent} />
        </span>
        <span className="text-text-secondary">
          NATGAS{" "}
          <span className="text-text-primary">${fmt(natgas?.price)}</span>{" "}
          <Arrow pct={natgas?.changePercent} />
        </span>
      </div>

      {/* Indicators Section */}
      <div className="flex items-center gap-4 px-4 py-1.5 shrink-0">
        <span className="text-text-muted uppercase tracking-wider text-[10px]">
          MACRO
        </span>
        <span className="text-text-secondary">
          FED{" "}
          <span className="text-text-primary">
            {fmt(data.indicators?.fedRate)}%
          </span>
        </span>
        <span className="text-text-secondary">
          CPI{" "}
          <span className="text-text-primary">
            {fmt(data.indicators?.cpi)}%
          </span>
        </span>
      </div>
    </div>
  );
}
