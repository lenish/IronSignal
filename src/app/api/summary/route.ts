import { NextRequest, NextResponse } from "next/server";
import { getSummary, getRecentSummaries } from "@/lib/db";
import { generateDailySummary } from "@/lib/summary";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const date = searchParams.get("date");

  if (date) {
    const summary = await getSummary(date);
    return NextResponse.json({ summary });
  }

  const summaries = await getRecentSummaries(30);
  return NextResponse.json({ summaries });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const date = body.date as string | undefined;

  try {
    const summary = await generateDailySummary(date);
    if (!summary) {
      return NextResponse.json(
        { error: "No news found for the specified date" },
        { status: 404 }
      );
    }
    return NextResponse.json({ summary });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Summary generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
