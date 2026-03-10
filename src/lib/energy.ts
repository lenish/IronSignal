import { YAHOO_FINANCE_BASE } from "./config";
import type { EnergyPrice } from "./types";

interface YahooChartMeta {
  regularMarketPrice: number;
  chartPreviousClose: number;
  previousClose?: number;
  currency: string;
  symbol: string;
}

interface YahooChartResponse {
  chart: {
    result: Array<{ meta: YahooChartMeta }> | null;
    error: { code: string; description: string } | null;
  };
}

interface EnergyConfig {
  symbol: string;
  name: string;
  unit: string;
}

const ENERGY_SYMBOLS: EnergyConfig[] = [
  { symbol: "BZ=F", name: "Brent Crude", unit: "/bbl" },
  { symbol: "CL=F", name: "WTI Crude", unit: "/bbl" },
  { symbol: "NG=F", name: "Natural Gas", unit: "/MMBtu" },
];

async function fetchSingleEnergyPrice(
  config: EnergyConfig
): Promise<EnergyPrice | null> {
  try {
    const url = `${YAHOO_FINANCE_BASE}/${encodeURIComponent(config.symbol)}?interval=1d&range=5d`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; IronSignal/1.0)",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data: YahooChartResponse = await response.json();
    const meta = data.chart.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol: config.symbol,
      name: config.name,
      price,
      change,
      changePercent,
      unit: config.unit,
      fetchedAt: new Date().toISOString(),
    };
  } catch (_) {
    return null;
  }
}

export async function fetchEnergyPrices(): Promise<EnergyPrice[]> {
  const results = await Promise.allSettled(
    ENERGY_SYMBOLS.map((c) => fetchSingleEnergyPrice(c))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<EnergyPrice | null> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((p): p is EnergyPrice => p !== null);
}
