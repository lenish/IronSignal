export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  description: string | null;
  commodity: CommodityType | null;
  relevanceScore?: number;
  createdAt: string;
}

export type CommodityType =
  | "iron"
  | "copper"
  | "aluminium"
  | "nickel"
  | "zinc"
  | "tin"
  | "lead"
  | "gold"
  | "silver"
  | "platinum"
  | "palladium"
  | "oil"
  | "natgas"
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
  exchange: string;
  contract: string;
}

export interface PriceHistoryPoint {
  date: string;
  close: number;
}

export interface CommodityHistory {
  symbol: string;
  name: string;
  exchange: string;
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
  exchange: string;
  contract: string;
}

export interface ExchangeVariant {
  key: string;
  label: string;
  symbol: string;
  unit: string;
  divisor?: number;
}

export interface FXRates {
  usdcny: number;
  usdaud: number;
  dxy: number;
  fetchedAt: string;
}

export interface EnergyPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  unit: string;
  fetchedAt: string;
}

export interface EconomicIndicators {
  fedRate: number | null;
  cpi: number | null;
  dollarIndex: number | null;
  fetchedAt: string;
  available: boolean;
}

export interface LMEInventoryItem {
  metal: string;
  metalCode: string;
  stocks: number;
  change: number;
  date: string;
}

export interface LMEInventory {
  available: boolean;
  reason?: string;
  items?: LMEInventoryItem[];
  fetchedAt: string;
}
