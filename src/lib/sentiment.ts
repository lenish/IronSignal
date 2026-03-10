import type { NewsItem, CommodityType } from "./types";

const POSITIVE_KEYWORDS = [
  "surge", "surges", "surging",
  "rally", "rallies", "rallying",
  "gain", "gains", "gaining",
  "rise", "rises", "rising",
  "jump", "jumps", "jumping",
  "climb", "climbs", "climbing",
  "soar", "soars", "soaring",
  "record high", "all-time high",
  "bullish", "upbeat", "optimistic",
  "strong demand", "robust demand",
  "supply shortage", "supply deficit",
  "outperform", "breakout", "rebound",
  "recovery", "recovering", "recovers",
  "boost", "boosts", "boosting",
  "up %", "higher",
];

const NEGATIVE_KEYWORDS = [
  "fall", "falls", "falling",
  "drop", "drops", "dropping",
  "decline", "declines", "declining",
  "plunge", "plunges", "plunging",
  "slump", "slumps", "slumping",
  "crash", "crashes", "crashing",
  "tumble", "tumbles", "tumbling",
  "slide", "slides", "sliding",
  "sink", "sinks", "sinking",
  "record low", "multi-year low",
  "bearish", "pessimistic", "downbeat",
  "weak demand", "demand slump",
  "supply glut", "oversupply", "surplus",
  "underperform",
  "down %", "lower",
  "cut", "cuts", "cutting",
  "warns", "warning", "concern",
  "recession", "slowdown",
  "tariff", "trade war", "sanctions",
];

export function scoreSentiment(title: string, description?: string | null): number {
  const text = `${title} ${description ?? ""}`.toLowerCase();

  let positiveHits = 0;
  let negativeHits = 0;

  for (const kw of POSITIVE_KEYWORDS) {
    if (text.includes(kw)) positiveHits++;
  }
  for (const kw of NEGATIVE_KEYWORDS) {
    if (text.includes(kw)) negativeHits++;
  }

  const total = positiveHits + negativeHits;
  if (total === 0) return 0;

  return (positiveHits - negativeHits) / total;
}

export interface SentimentDataPoint {
  date: string;
  iron: number;
  copper: number;
  aluminium: number;
  gold: number;
  silver: number;
  general: number;
}

export function aggregateSentiment(
  news: NewsItem[],
  days: number = 30
): SentimentDataPoint[] {
  const now = new Date();
  const commodities: CommodityType[] = ["iron", "copper", "aluminium", "gold", "silver", "general"];

  const dailyScores: Record<string, Record<CommodityType, number[]>> = {};

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyScores[key] = {} as Record<CommodityType, number[]>;
    for (const c of commodities) {
      dailyScores[key][c] = [];
    }
  }

  for (const item of news) {
    const dateKey = item.publishedAt.slice(0, 10);
    const commodity = (item.commodity ?? "general") as CommodityType;
    if (dailyScores[dateKey]?.[commodity]) {
      const score = scoreSentiment(item.title, item.description);
      dailyScores[dateKey][commodity].push(score);
    }
  }

  return Object.entries(dailyScores)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, commodityScores]) => {
      const point: SentimentDataPoint = {
        date,
        iron: 0,
        copper: 0,
        aluminium: 0,
        gold: 0,
        silver: 0,
        general: 0,
      };
      for (const c of commodities) {
        const scores = commodityScores[c];
        point[c] = scores.length > 0
          ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
          : 0;
      }
      return point;
    });
}
