import { NextRequest, NextResponse } from "next/server";
import { getNews, getNewsCount } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const commodity = searchParams.get("commodity") ?? "all";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 200);
    const offset = parseInt(searchParams.get("offset") ?? "0");
    const since = searchParams.get("since") ?? undefined;

    const minRelevance = 0;

    const [news, total] = await Promise.all([
      getNews({ commodity, limit, offset, since, minRelevance }),
      getNewsCount(commodity),
    ]);

    return NextResponse.json({
      news,
      total,
      limit,
      offset,
      hasMore: offset + news.length < total,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
