import { NextResponse } from "next/server";
import { fetchFXRates } from "@/lib/fx";

export async function GET() {
  try {
    const rates = await fetchFXRates();
    return NextResponse.json(rates);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch FX rates" },
      { status: 500 }
    );
  }
}
