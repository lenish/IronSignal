export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  description: string | null;
  commodity: CommodityType | null;
  createdAt: string;
}

export type CommodityType =
  | "iron"
  | "copper"
  | "aluminium"
  | "gold"
  | "silver"
  | "general";

export interface CommodityPrice {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  fetchedAt: string;
}

export interface PriceHistoryPoint {
  date: string;
  close: number;
}

export interface CommodityHistory {
  symbol: string;
  name: string;
  data: PriceHistoryPoint[];
}

export interface DailySummary {
  id: number;
  date: string;
  content: string;
  commodities: string;
  createdAt: string;
}

export interface FeedConfig {
  url: string;
  name: string;
  category: CommodityType | "general";
}

export interface CommodityConfig {
  symbol: string;
  name: string;
  unit: string;
  type: CommodityType;
}
