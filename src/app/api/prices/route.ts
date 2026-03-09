import { NextResponse } from "next/server";
import { fetchAllPrices } from "@/lib/prices";

export async function GET() {
  const prices = await fetchAllPrices();

  return NextResponse.json({
    prices,
    fetchedAt: new Date().toISOString(),
  });
}
