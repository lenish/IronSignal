import { NextRequest, NextResponse } from "next/server";
import { COMMODITIES, YAHOO_FINANCE_BASE } from "@/lib/config";
import type { CommodityConfig, CommodityHistory, PriceHistoryPoint } from "@/lib/types";

const LBS_PER_MT = 2204.62;
const COPPER_SYMBOL = "HG=F";

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
  commodity: CommodityConfig,
  range = "1mo",
  interval = "1d"
): Promise<PriceHistoryPoint[]> {
  try {
    const url = `${YAHOO_FINANCE_BASE}/${encodeURIComponent(commodity.symbol)}?interval=${interval}&range=${range}`;
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
    const isCopper = commodity.symbol === COPPER_SYMBOL;

    return timestamps
      .map((ts, i) => {
        const raw = closes[i];
        if (raw === null || raw === undefined) return null;
        const close = isCopper ? raw * LBS_PER_MT : raw;
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

  const registered = symbolParam
    ? COMMODITIES.filter((c) => c.symbol === symbolParam)
    : COMMODITIES;

  if (symbolParam && registered.length === 0) {
    const adhoc: CommodityConfig = {
      symbol: symbolParam,
      name: symbolParam,
      unit: "",
      type: "general",
      exchange: "",
      contract: "",
    };
    const data = await fetchHistory(adhoc, range);
    return NextResponse.json({ history: [{ symbol: symbolParam, name: symbolParam, exchange: "", data }] });
  }

  const results = await Promise.all(
    registered.map(async (c): Promise<CommodityHistory> => ({
      symbol: c.symbol,
      name: c.name,
      exchange: c.exchange,
      data: await fetchHistory(c, range),
    }))
  );

  return NextResponse.json({ history: results });
}
