import type { FeedConfig, CommodityConfig, CommodityType } from "./types";

export const RSS_FEEDS: FeedConfig[] = [
  {
    url: "https://www.ft.com/commodities?format=rss",
    name: "Financial Times Commodities",
    category: "general",
  },
  {
    url: "https://www.cnbc.com/id/100727362/device/rss/rss.html",
    name: "CNBC International",
    category: "general",
  },
  {
    url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    name: "MarketWatch",
    category: "general",
  },
  {
    url: "https://www.investing.com/rss/news_25.rss",
    name: "Investing.com Markets",
    category: "general",
  },
  {
    url: "https://www.investing.com/rss/news_14.rss",
    name: "Investing.com Economy",
    category: "general",
  },
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
    url: "https://news.google.com/rss/search?q=%22iron+ore%22+OR+%22copper+price%22+OR+%22aluminium%22+OR+%22LME%22&hl=en-US&gl=US&ceid=US:en",
    name: "Google News Metals",
    category: "general",
  },
  {
    url: "https://news.google.com/rss/search?q=%22gold+price%22+OR+%22silver+price%22+OR+%22precious+metals%22&hl=en-US&gl=US&ceid=US:en",
    name: "Google News Precious",
    category: "general",
  },
];

export const COMMODITIES: CommodityConfig[] = [
  { symbol: "TIO=F", name: "Iron Ore", unit: "/MT", type: "iron", exchange: "SGX", contract: "62% FE Fines" },
  { symbol: "HG=F", name: "Copper", unit: "/lb", type: "copper", exchange: "COMEX", contract: "Futures" },
  { symbol: "ALI=F", name: "Aluminium", unit: "/MT", type: "aluminium", exchange: "COMEX", contract: "Futures" },
  { symbol: "GC=F", name: "Gold", unit: "/oz", type: "gold", exchange: "COMEX", contract: "Futures" },
  { symbol: "SI=F", name: "Silver", unit: "/oz", type: "silver", exchange: "COMEX", contract: "Futures" },
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

const NEGATIVE_KEYWORDS: string[] = [
  "nfl",
  "nba",
  "mlb",
  "nhl",
  "soccer",
  "football",
  "basketball",
  "baseball",
  "touchdown",
  "superbowl",
  "celebrity",
  "movie",
  "actor",
  "actress",
  "netflix",
  "streaming",
  "box office",
  "hollywood",
  "real estate",
  "housing market",
  "mortgage",
  "foreclosure",
  "home price",
  "apartment",
  "bitcoin",
  "cryptocurrency",
  "ethereum",
  "blockchain",
  "nft",
  "defi",
  "fda approval",
  "drug trial",
  "pharma",
  "clinical trial",
  "vaccine",
  "iphone",
  "ipad",
  "android",
  "app store",
  "google play",
  "software update",
];

const TIER_1_SOURCES = [
  "Mining.com",
  "Financial Times",
  "Mining Technology",
  "MetalMiner",
];

const PRIORITIES: CommodityType[] = [
  "iron",
  "copper",
  "aluminium",
  "gold",
  "silver",
];

export function isRelevantToCommodities(
  title: string,
  description?: string | null
): boolean {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const hasCommodityKeyword = PRIORITIES.some((commodity) =>
    COMMODITY_KEYWORDS[commodity].some((kw) => text.includes(kw))
  );
  if (hasCommodityKeyword) return true;
  const hasNegativeKeyword = NEGATIVE_KEYWORDS.some((kw) => text.includes(kw));
  return !hasNegativeKeyword;
}

export function calculateRelevanceScore(
  title: string,
  description?: string | null,
  source?: string
): number {
  const titleText = title.toLowerCase();
  const descriptionText = (description ?? "").toLowerCase();
  const combinedText = `${titleText} ${descriptionText}`;

  let score = 0.5;
  let titleMatches = 0;
  let descriptionOnlyMatches = 0;

  for (const commodity of PRIORITIES) {
    for (const keyword of COMMODITY_KEYWORDS[commodity]) {
      const inTitle = titleText.includes(keyword);
      const inDescription = descriptionText.includes(keyword);
      if (inTitle) {
        titleMatches += 1;
      } else if (inDescription) {
        descriptionOnlyMatches += 1;
      }
    }
  }

  score += Math.min(titleMatches * 0.2, 0.4);
  score += Math.min(descriptionOnlyMatches * 0.1, 0.2);

  const hasNegativeKeyword = NEGATIVE_KEYWORDS.some((kw) =>
    combinedText.includes(kw)
  );
  if (hasNegativeKeyword) {
    score -= 0.3;
  }

  const normalizedSource = (source ?? "").toLowerCase();
  const isTier1Source = TIER_1_SOURCES.some((tier1) =>
    normalizedSource.includes(tier1.toLowerCase())
  );
  if (isTier1Source) {
    score += 0.15;
  }

  return Math.min(1, Math.max(0, score));
}

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
