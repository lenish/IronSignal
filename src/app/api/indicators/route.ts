import { NextResponse } from "next/server";
import { fetchIndicators } from "@/lib/indicators";

export async function GET() {
  try {
    const data = await fetchIndicators();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch indicators" },
      { status: 500 }
    );
  }
}
