import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateStarBullets } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { rawBullet, targetRole } = body;

    if (!rawBullet || typeof rawBullet !== "string" || !rawBullet.trim()) {
      return NextResponse.json(
        { error: "rawBullet is required." },
        { status: 400 }
      );
    }

    const options = await generateStarBullets({
      rawBullet,
      targetRole,
    });

    return NextResponse.json({ options });
  } catch (err) {
    console.error("STAR bullet generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate STAR bullet points." },
      { status: 500 }
    );
  }
}
