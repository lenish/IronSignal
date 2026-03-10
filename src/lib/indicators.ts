import type { EconomicIndicators } from "./types";

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

interface FREDResponse {
  observations: Array<{ value: string }>;
}

async function fetchFREDSeries(seriesId: string): Promise<number | null> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) return null;

  try {
    const url = new URL(FRED_BASE);
    url.searchParams.set("series_id", seriesId);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("limit", "1");
    url.searchParams.set("sort_order", "desc");
    url.searchParams.set("file_type", "json");

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) return null;

    const data: FREDResponse = await response.json();
    const value = data.observations?.[0]?.value;
    if (!value) return null;

    return parseFloat(value);
  } catch (_) {
    return null;
  }
}

export async function fetchIndicators(): Promise<EconomicIndicators> {
  const apiKey = process.env.FRED_API_KEY;
  const fetchedAt = new Date().toISOString();

  // If no API key, return graceful fallback
  if (!apiKey) {
    return {
      available: false,
      fedRate: null,
      cpi: null,
      dollarIndex: null,
      fetchedAt,
    };
  }

  // Fetch all 3 series in parallel
  const results = await Promise.allSettled([
    fetchFREDSeries("FEDFUNDS"),
    fetchFREDSeries("CPIAUCSL"),
    fetchFREDSeries("DTWEXBGS"),
  ]);

  const fedRate =
    results[0].status === "fulfilled" ? results[0].value : null;
  const cpi = results[1].status === "fulfilled" ? results[1].value : null;
  const dollarIndex =
    results[2].status === "fulfilled" ? results[2].value : null;

  return {
    available: true,
    fedRate,
    cpi,
    dollarIndex,
    fetchedAt,
  };
}
