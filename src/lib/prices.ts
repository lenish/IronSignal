import { COMMODITIES, YAHOO_FINANCE_BASE } from "./config";
import type { CommodityPrice, CommodityConfig } from "./types";

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

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose !== 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol: commodity.symbol,
      name: commodity.name,
      price,
      previousClose: prevClose,
      change,
      changePercent,
      currency: meta.currency ?? "USD",
      fetchedAt: new Date().toISOString(),
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
