import { YAHOO_FINANCE_BASE } from "./config";
import type { FXRates } from "./types";

interface YahooChartMeta {
  regularMarketPrice: number;
  currency: string;
  symbol: string;
}

interface YahooChartResponse {
  chart: {
    result: Array<{ meta: YahooChartMeta }> | null;
    error: { code: string; description: string } | null;
  };
}

async function fetchSingleRate(symbol: string): Promise<number | null> {
  try {
    const url = `${YAHOO_FINANCE_BASE}/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
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

    return meta.regularMarketPrice;
  } catch (_) {
    return null;
  }
}

export async function fetchFXRates(): Promise<FXRates> {
  const results = await Promise.allSettled([
    fetchSingleRate("CNY=X"),
    fetchSingleRate("AUD=X"),
    fetchSingleRate("DX-Y.NYB"),
  ]);

  const usdcny =
    results[0].status === "fulfilled" && results[0].value !== null
      ? results[0].value
      : 0;
  const usdaud =
    results[1].status === "fulfilled" && results[1].value !== null
      ? results[1].value
      : 0;
  const dxy =
    results[2].status === "fulfilled" && results[2].value !== null
      ? results[2].value
      : 0;

  return {
    usdcny,
    usdaud,
    dxy,
    fetchedAt: new Date().toISOString(),
  };
}
