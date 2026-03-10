import { NextRequest, NextResponse } from "next/server";
import { getNewsByDateRange } from "@/lib/db";
import { aggregateSentiment } from "@/lib/sentiment";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const days = Math.min(parseInt(searchParams.get("days") ?? "30"), 90);

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const news = await getNewsByDateRange(
      start.toISOString(),
      end.toISOString()
    );

    const sentiment = aggregateSentiment(news, days);

    return NextResponse.json({ sentiment, days, totalArticles: news.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
