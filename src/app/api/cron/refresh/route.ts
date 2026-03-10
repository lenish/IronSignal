import { NextRequest, NextResponse } from "next/server";
import { refreshAllFeeds } from "@/lib/rss";
import { generateDailySummary } from "@/lib/summary";

export const maxDuration = 10;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const feedResult = await refreshAllFeeds();
    const summary = await generateDailySummary();

    return NextResponse.json({
      success: true,
      newsInserted: feedResult.inserted,
      newsFiltered: feedResult.filtered,
      summaryGenerated: summary !== null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
