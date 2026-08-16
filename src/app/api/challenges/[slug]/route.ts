import { NextRequest, NextResponse } from "next/server";
import { CHALLENGES } from "@/lib/challenges/data";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const challenge = CHALLENGES.find((c) => c.slug === slug || c.id === slug);

  if (!challenge) {
    return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  }

  return NextResponse.json({ challenge });
}
