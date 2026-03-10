import { getNewsByDateRange, insertSummary, getSummary } from "./db";
import { format, subDays } from "date-fns";
import type { DailySummary, NewsItem } from "./types";
import { fetchFXRates } from "./fx";
import { fetchEnergyPrices } from "./energy";

async function callClaude(date: string, news: NewsItem[]): Promise<DailySummary | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const isOAuthToken = apiKey.startsWith("sk-ant-oat");
  const authHeaders: Record<string, string> = isOAuthToken
    ? { Authorization: `Bearer ${apiKey}` }
    : { "x-api-key": apiKey };

  const newsDigest = news
    .slice(0, 100)
    .map((n) => `[${n.source}] ${n.title}${n.description ? `: ${n.description.slice(0, 200)}` : ""}`)
    .join("\n");

  const commoditiesInNews = [
    ...new Set(news.map((n) => n.commodity).filter(Boolean)),
  ];

  let marketContext = "";
  try {
    const [fxData, energyData] = await Promise.allSettled([
      fetchFXRates(),
      fetchEnergyPrices(),
    ]);

    const fx = fxData.status === "fulfilled" ? fxData.value : null;
    const energy = energyData.status === "fulfilled" ? energyData.value : [];

    if (fx || energy.length > 0) {
      marketContext = "\n\nCurrent Market Context:\n";
      if (fx) {
        marketContext += `FX: USD/CNY ${fx.usdcny.toFixed(4)}, USD/AUD ${fx.usdaud.toFixed(4)}, DXY ${fx.dxy.toFixed(2)}\n`;
      }
      if (energy.length > 0) {
        const brent = energy.find((e) => e.symbol === "BZ=F");
        const wti = energy.find((e) => e.symbol === "CL=F");
        if (brent) marketContext += `Brent Crude: $${brent.price.toFixed(2)}\n`;
        if (wti) marketContext += `WTI Crude: $${wti.price.toFixed(2)}\n`;
      }
    }
  } catch (_) {
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `You are a commodity market analyst. Summarize the following commodity news from ${date} into a concise daily briefing.

Structure:
1. **Market Overview** - Overall market sentiment and key drivers
2. **Iron & Steel** - Key developments in iron ore, steel markets
3. **Base Metals** - Copper, aluminium, and other base metals updates
4. **Precious Metals** - Gold, silver movements (if relevant)
5. **Outlook** - Key things to watch

Keep it professional, concise, data-driven. Use bullet points. No fluff.
${marketContext}
News articles:
${newsDigest}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const summaryContent =
    data.content?.[0]?.text ?? "Summary generation failed.";

  await insertSummary(date, summaryContent, commoditiesInNews.join(","));
  return await getSummary(date);
}

function getNewsForDate(date: string) {
  return getNewsByDateRange(`${date}T00:00:00.000Z`, `${date}T23:59:59.999Z`);
}

export async function generateDailySummary(
  dateStr?: string
): Promise<DailySummary | null> {
  const today = new Date();
  const targetDate = dateStr ? new Date(dateStr) : today;
  const formatted = format(targetDate, "yyyy-MM-dd");

  const existing = await getSummary(formatted);
  if (existing) return existing;

  const news = await getNewsForDate(formatted);
  if (news.length > 0) return callClaude(formatted, news);

  // No explicit date: try yesterday as fallback
  if (!dateStr) {
    const yesterday = format(subDays(today, 1), "yyyy-MM-dd");
    const existingYesterday = await getSummary(yesterday);
    if (existingYesterday) return existingYesterday;

    const yesterdayNews = await getNewsForDate(yesterday);
    if (yesterdayNews.length > 0) return callClaude(yesterday, yesterdayNews);
  }

  return null;
}
