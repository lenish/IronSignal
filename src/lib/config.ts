import type { FeedConfig, CommodityConfig, CommodityType } from "./types";

export const RSS_FEEDS: FeedConfig[] = [
  {
    url: "https://www.mining.com/feed/",
    name: "Mining.com",
    category: "general",
  },
  {
    url: "https://www.mining.com/category/base-metals/feed/",
    name: "Mining.com Base Metals",
    category: "general",
  },
  {
    url: "https://www.mining-technology.com/feed/",
    name: "Mining Technology",
    category: "general",
  },
  {
    url: "https://agmetalminer.com/feed/",
    name: "MetalMiner",
    category: "general",
  },
  {
    url: "https://www.kitco.com/news/category/base-metals/feed",
    name: "Kitco Base Metals",
    category: "general",
  },
  {
    url: "https://www.kitco.com/news/category/mining/feed",
    name: "Kitco Mining",
    category: "general",
  },
  {
    url: "https://news.google.com/rss/search?q=iron+ore+copper+aluminium+commodity&hl=en-US&gl=US&ceid=US:en",
    name: "Google News",
    category: "general",
  },
];

export const COMMODITIES: CommodityConfig[] = [
  { symbol: "TIO=F", name: "Iron Ore", unit: "/MT", type: "iron" },
  { symbol: "HG=F", name: "Copper", unit: "/lb", type: "copper" },
  { symbol: "ALI=F", name: "Aluminium", unit: "/MT", type: "aluminium" },
  { symbol: "GC=F", name: "Gold", unit: "/oz", type: "gold" },
  { symbol: "SI=F", name: "Silver", unit: "/oz", type: "silver" },
];

export const YAHOO_FINANCE_BASE =
  "https://query1.finance.yahoo.com/v8/finance/chart";

// Keyword-based commodity classification
const COMMODITY_KEYWORDS: Record<CommodityType, string[]> = {
  iron: [
    "iron ore",
    "iron-ore",
    "ironore",
    "steel",
    "blast furnace",
    "pellet",
    "sinter",
    "pig iron",
    "hbi",
    "dri",
    "62% fe",
    "65% fe",
    "iron ore fines",
  ],
  copper: [
    "copper",
    "comex copper",
    "copper cathode",
    "copper concentrate",
    "cu price",
    "red metal",
  ],
  aluminium: [
    "aluminum",
    "aluminium",
    "alumina",
    "bauxite",
    "smelter",
    "aluminium alloy",
  ],
  gold: ["gold", "bullion", "gold price", "xau", "gold futures", "gold mine"],
  silver: [
    "silver",
    "silver price",
    "xag",
    "silver futures",
    "silver mine",
  ],
  general: [],
};

export function classifyCommodity(
  title: string,
  description?: string | null
): CommodityType {
  const text = `${title} ${description ?? ""}`.toLowerCase();

  // Priority order: specific metals first, then general
  const priorities: CommodityType[] = [
    "iron",
    "copper",
    "aluminium",
    "gold",
    "silver",
  ];

  for (const commodity of priorities) {
    const keywords = COMMODITY_KEYWORDS[commodity];
    if (keywords.some((kw) => text.includes(kw))) {
      return commodity;
    }
  }

  return "general";
}

export const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
export const NEWS_PAGE_SIZE = 50;
