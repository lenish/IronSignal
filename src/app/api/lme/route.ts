import { NextResponse } from "next/server";
import { fetchLMEInventory } from "@/lib/lme";

export async function GET() {
  const inventory = await fetchLMEInventory();

  return NextResponse.json(inventory);
}
