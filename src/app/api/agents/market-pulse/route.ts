import { NextResponse } from "next/server";
import { CURRENT_MARKET_INTELLIGENCE } from "@/lib/market/intelligence";

export async function GET() {
  return NextResponse.json({ data: CURRENT_MARKET_INTELLIGENCE });
}
