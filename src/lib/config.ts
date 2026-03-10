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
    url: "https://news.google.com/rss/search?q=%22gold+price%22+OR+%22silver+price%22+OR+%22platinum%22+OR+%22palladium%22+OR+%22precious+metals%22&hl=en-US&gl=US&ceid=US:en",
    name: "Google News Precious",
    category: "general",
  },
  {
    url: "https://news.google.com/rss/search?q=%22crude+oil%22+OR+%22brent%22+OR+%22natural+gas+price%22+OR+%22OPEC%22&hl=en-US&gl=US&ceid=US:en",
    name: "Google News Energy",
    category: "general",
  },
];

export const COMMODITIES: CommodityConfig[] = [
  { symbol: "TIO=F", name: "Iron Ore", unit: "/MT", type: "iron", exchange: "SGX", contract: "62% FE Fines" },
  { symbol: "HG=F", name: "Copper", unit: "/lb", type: "copper", exchange: "COMEX", contract: "Futures" },
  { symbol: "ALI=F", name: "Aluminium", unit: "/MT", type: "aluminium", exchange: "COMEX", contract: "Futures" },
  { symbol: "GC=F", name: "Gold", unit: "/oz", type: "gold", exchange: "COMEX", contract: "Futures" },
  { symbol: "SI=F", name: "Silver", unit: "/oz", type: "silver", exchange: "COMEX", contract: "Futures" },
  { symbol: "PL=F", name: "Platinum", unit: "/oz", type: "platinum", exchange: "COMEX", contract: "Futures" },
  { symbol: "PA=F", name: "Palladium", unit: "/oz", type: "palladium", exchange: "COMEX", contract: "Futures" },
  { symbol: "CL=F", name: "Crude Oil WTI", unit: "/bbl", type: "oil", exchange: "NYMEX", contract: "Futures" },
  { symbol: "BZ=F", name: "Brent Crude", unit: "/bbl", type: "oil", exchange: "ICE", contract: "Futures" },
  { symbol: "NG=F", name: "Natural Gas", unit: "/MMBtu", type: "natgas", exchange: "NYMEX", contract: "Futures" },
];

export const YAHOO_FINANCE_BASE =
  "https://query1.finance.yahoo.com/v8/finance/chart";

export interface CommodityMeta {
  label: string;
  color: string;
  filterBg: string;
  newsClass: string;
}

export const COMMODITY_META: Record<CommodityType, CommodityMeta> = {
  iron:      { label: "IRON",    color: "#f59e0b", filterBg: "bg-amber-500",    newsClass: "text-amber-500 border-amber-500" },
  copper:    { label: "CU",      color: "#ef4444", filterBg: "bg-red-500",      newsClass: "text-red-500 border-red-500" },
  aluminium: { label: "ALUM",    color: "#06b6d4", filterBg: "bg-cyan-500",     newsClass: "text-cyan-500 border-cyan-500" },
  nickel:    { label: "NI",      color: "#34d399", filterBg: "bg-emerald-400",  newsClass: "text-emerald-400 border-emerald-400" },
  zinc:      { label: "ZN",      color: "#60a5fa", filterBg: "bg-blue-400",     newsClass: "text-blue-400 border-blue-400" },
  gold:      { label: "GOLD",    color: "#eab308", filterBg: "bg-yellow-500",   newsClass: "text-yellow-500 border-yellow-500" },
  silver:    { label: "AG",      color: "#9ca3af", filterBg: "bg-gray-400",     newsClass: "text-gray-400 border-gray-400" },
  platinum:  { label: "PT",      color: "#a78bfa", filterBg: "bg-violet-400",   newsClass: "text-violet-400 border-violet-400" },
  palladium: { label: "PD",      color: "#f472b6", filterBg: "bg-pink-400",     newsClass: "text-pink-400 border-pink-400" },
  oil:       { label: "OIL",     color: "#d97706", filterBg: "bg-amber-600",    newsClass: "text-amber-600 border-amber-600" },
  natgas:    { label: "GAS",     color: "#fb923c", filterBg: "bg-orange-400",   newsClass: "text-orange-400 border-orange-400" },
  tin:       { label: "SN",    color: "#c084fc", filterBg: "bg-purple-400",  newsClass: "text-purple-400 border-purple-400" },
  lead:      { label: "PB",    color: "#94a3b8", filterBg: "bg-slate-400",   newsClass: "text-slate-400 border-slate-400" },
  general:   { label: "GEN",   color: "#64748b", filterBg: "bg-slate-500",   newsClass: "text-text-muted border-text-muted" },
};

export const TRACKED_COMMODITIES: CommodityType[] = [
  "iron", "copper", "aluminium", "nickel", "zinc", "tin", "lead",
  "gold", "silver", "platinum", "palladium",
  "oil", "natgas",
];

const COMMODITY_KEYWORDS: Record<CommodityType, string[]> = {
  iron: [
    "iron ore", "iron-ore", "ironore", "steel",
    "blast furnace", "pellet", "sinter", "pig iron",
    "hbi", "dri", "62% fe", "65% fe", "iron ore fines",
  ],
  copper: [
    "copper", "comex copper", "copper cathode",
    "copper concentrate", "cu price", "red metal",
  ],
  aluminium: [
    "aluminum", "aluminium", "alumina", "bauxite",
    "smelter", "aluminium alloy",
  ],
  nickel: [
    "nickel", "nickel price", "nickel ore",
    "stainless steel", "nickel sulphate", "nickel pig iron",
    "laterite", "class 1 nickel",
  ],
  zinc: [
    "zinc", "zinc price", "galvanized",
    "zinc concentrate", "zinc smelter",
  ],
  gold: [
    "gold", "bullion", "gold price", "xau",
    "gold futures", "gold mine", "gold bar",
  ],
  silver: [
    "silver", "silver price", "xag",
    "silver futures", "silver mine",
  ],
  platinum: [
    "platinum", "platinum price", "platinum group",
    "pgm", "autocatalyst",
  ],
  palladium: [
    "palladium", "palladium price",
    "catalytic converter",
  ],
  oil: [
    "crude oil", "brent crude", "wti crude",
    "oil price", "opec", "petroleum",
    "barrel", "oil futures", "shale oil",
    "oil production", "refinery",
  ],
  natgas: [
    "natural gas", "natgas", "lng",
    "gas price", "henry hub", "gas futures",
    "liquefied natural gas",
  ],
  tin: [
    "tin price", "tin metal", "tin futures",
    "tinplate", "tin smelter", "tin mine",
  ],
  lead: [
    "lead metal", "lead price", "lead futures",
    "lead smelter", "lead battery", "refined lead",
  ],
  general: [],
};

const NEGATIVE_KEYWORDS: string[] = [
  "nfl", "nba", "mlb", "nhl",
  "soccer", "football", "basketball", "baseball",
  "touchdown", "superbowl",
  "celebrity", "movie", "actor", "actress",
  "netflix", "streaming", "box office", "hollywood",
  "real estate", "housing market", "mortgage",
  "foreclosure", "home price", "apartment",
  "bitcoin", "cryptocurrency", "ethereum",
  "blockchain", "nft", "defi",
  "fda approval", "drug trial", "pharma",
  "clinical trial", "vaccine",
  "iphone", "ipad", "android",
  "app store", "google play", "software update",
];

const TIER_1_SOURCES = [
  "Mining.com",
  "Financial Times",
  "Mining Technology",
  "MetalMiner",
];

export function isRelevantToCommodities(
  title: string,
  description?: string | null
): boolean {
  const text = `${title} ${description ?? ""}`.toLowerCase();
  const hasCommodityKeyword = TRACKED_COMMODITIES.some((commodity) =>
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

  for (const commodity of TRACKED_COMMODITIES) {
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

  for (const commodity of TRACKED_COMMODITIES) {
    const keywords = COMMODITY_KEYWORDS[commodity];
    if (keywords.some((kw) => text.includes(kw))) {
      return commodity;
    }
  }

  return "general";
}

export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
export const NEWS_PAGE_SIZE = 50;
