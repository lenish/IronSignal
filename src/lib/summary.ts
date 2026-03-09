import { getNewsByDateRange, insertSummary, getSummary } from "./db";
import { format, subDays } from "date-fns";
import type { DailySummary } from "./types";

export async function generateDailySummary(
  dateStr?: string
): Promise<DailySummary | null> {
  const targetDate = dateStr
    ? new Date(dateStr)
    : subDays(new Date(), 1);
  const formatted = format(targetDate, "yyyy-MM-dd");

  const existing = await getSummary(formatted);
  if (existing) return existing;

  const startDate = `${formatted}T00:00:00.000Z`;
  const endDate = `${formatted}T23:59:59.999Z`;
  const news = await getNewsByDateRange(startDate, endDate);

  if (news.length === 0) return null;

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
          content: `You are a commodity market analyst. Summarize the following commodity news from ${formatted} into a concise daily briefing.

Structure:
1. **Market Overview** - Overall market sentiment and key drivers
2. **Iron & Steel** - Key developments in iron ore, steel markets
3. **Base Metals** - Copper, aluminium, and other base metals updates
4. **Precious Metals** - Gold, silver movements (if relevant)
5. **Outlook** - Key things to watch

Keep it professional, concise, data-driven. Use bullet points. No fluff.

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

  await insertSummary(formatted, summaryContent, commoditiesInNews.join(","));

  return await getSummary(formatted);
}
