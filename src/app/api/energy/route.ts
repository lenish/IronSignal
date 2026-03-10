import { NextResponse } from "next/server";
import { fetchEnergyPrices } from "@/lib/energy";

export async function GET() {
  try {
    const prices = await fetchEnergyPrices();
    return NextResponse.json({ prices });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch energy prices" },
      { status: 500 }
    );
  }
}
