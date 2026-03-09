import { NextResponse } from "next/server";
import { refreshAllFeeds } from "@/lib/rss";

export const maxDuration = 30;

export async function POST() {
  try {
    const result = await refreshAllFeeds();
    return NextResponse.json({
      success: true,
      ...result,
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
