import { COMMODITIES, YAHOO_FINANCE_BASE } from "./config";
import type { CommodityPrice, CommodityConfig } from "./types";

// HG=F (COMEX Copper) is quoted in USD/lb; convert to USD/MT for LME-equivalent display
const LBS_PER_MT = 2204.62;
const COPPER_SYMBOL = "HG=F";

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

async function fetchSinglePrice(
  commodity: CommodityConfig
): Promise<CommodityPrice | null> {
  try {
    const url = `${YAHOO_FINANCE_BASE}/${encodeURIComponent(commodity.symbol)}?interval=1d&range=1d`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data: YahooChartResponse = await response.json();
    const meta = data.chart.result?.[0]?.meta;
    if (!meta) return null;

    let price = meta.regularMarketPrice;
    let prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;

    if (commodity.symbol === COPPER_SYMBOL) {
      price *= LBS_PER_MT;
      prevClose *= LBS_PER_MT;
    }

    const change = price - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol: commodity.symbol,
      name: commodity.name,
      price: Math.round(price * 100) / 100,
      previousClose: Math.round(prevClose * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent,
      currency: meta.currency ?? "USD",
      fetchedAt: new Date().toISOString(),
      exchange: commodity.exchange,
      contract: commodity.contract,
    };
  } catch (_) {
    return null;
  }
}

export async function fetchAllPrices(): Promise<CommodityPrice[]> {
  const results = await Promise.allSettled(
    COMMODITIES.map((c) => fetchSinglePrice(c))
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<CommodityPrice | null> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((p): p is CommodityPrice => p !== null);
}
