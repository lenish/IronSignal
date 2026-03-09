import { NextRequest, NextResponse } from "next/server";
import { COMMODITIES, YAHOO_FINANCE_BASE } from "@/lib/config";
import type { CommodityHistory, PriceHistoryPoint } from "@/lib/types";

interface YahooHistoryResponse {
  chart: {
    result: Array<{
      timestamp: number[];
      meta: { symbol: string };
      indicators: {
        quote: Array<{
          close: (number | null)[];
        }>;
      };
    }> | null;
  };
}

async function fetchHistory(
  symbol: string,
  range = "1mo",
  interval = "1d"
): Promise<PriceHistoryPoint[]> {
  try {
    const url = `${YAHOO_FINANCE_BASE}/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const data: YahooHistoryResponse = await response.json();
    const result = data.chart.result?.[0];
    if (!result) return [];

    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    return timestamps
      .map((ts, i) => {
        const close = closes[i];
        if (close === null || close === undefined) return null;
        return {
          date: new Date(ts * 1000).toISOString().split("T")[0],
          close: Math.round(close * 100) / 100,
        };
      })
      .filter((p): p is PriceHistoryPoint => p !== null);
  } catch (_) {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const range = searchParams.get("range") ?? "1mo";
  const symbolParam = searchParams.get("symbol");

  const targets = symbolParam
    ? COMMODITIES.filter((c) => c.symbol === symbolParam)
    : COMMODITIES;

  const results = await Promise.all(
    targets.map(async (c): Promise<CommodityHistory> => ({
      symbol: c.symbol,
      name: c.name,
      data: await fetchHistory(c.symbol, range),
    }))
  );

  return NextResponse.json({ history: results });
}
