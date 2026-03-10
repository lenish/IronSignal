import type { LMEInventory, LMEInventoryItem } from "./types";

interface NasdaqDataset {
  dataset: {
    data: Array<[string, number]>;
  };
}

const METALS = [
  { code: "CU", name: "Copper" },
  { code: "AL", name: "Aluminium" },
  { code: "ZN", name: "Zinc" },
  { code: "NI", name: "Nickel" },
];

async function fetchSingleMetal(
  metalCode: string,
  metalName: string,
  apiKey: string
): Promise<LMEInventoryItem | null> {
  try {
    const url = `https://data.nasdaq.com/api/v3/datasets/LME/ST_${metalCode}.json?api_key=${apiKey}&rows=30`;
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Failed to fetch LME ${metalName}: ${response.status}`);
      return null;
    }

    const data: NasdaqDataset = await response.json();
    const dataPoints = data.dataset.data;

    if (!dataPoints || dataPoints.length < 2) {
      console.error(`Insufficient data for LME ${metalName}`);
      return null;
    }

    const [latestDate, latestStocks] = dataPoints[0];
    const [, previousStocks] = dataPoints[1];
    const change = latestStocks - previousStocks;

    return {
      metal: metalName,
      metalCode,
      stocks: latestStocks,
      change,
      date: latestDate,
    };
  } catch (error) {
    console.error(`Error fetching LME ${metalName}:`, error);
    return null;
  }
}

export async function fetchLMEInventory(): Promise<LMEInventory> {
  const apiKey = process.env.NASDAQ_DATA_LINK_KEY;

  if (!apiKey) {
    return {
      available: false,
      reason:
        "Nasdaq Data Link subscription required. Sign up at data.nasdaq.com",
      fetchedAt: new Date().toISOString(),
    };
  }

  const results = await Promise.allSettled(
    METALS.map((metal) => fetchSingleMetal(metal.code, metal.name, apiKey))
  );

  const items: LMEInventoryItem[] = results
    .filter(
      (r): r is PromiseFulfilledResult<LMEInventoryItem | null> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value)
    .filter((item): item is LMEInventoryItem => item !== null);

  if (items.length === 0) {
    return {
      available: false,
      reason: "Failed to fetch LME inventory data",
      fetchedAt: new Date().toISOString(),
    };
  }

  return {
    available: true,
    items,
    fetchedAt: new Date().toISOString(),
  };
}
