import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { analysisId } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId is required." },
        { status: 400 }
      );
    }

    // Verify the analysis belongs to this user
    const analysis = await prisma.analysis.findFirst({
      where: { id: analysisId, userId },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: "Analysis not found." },
        { status: 404 }
      );
    }

    // Check if already shared — return existing
    const existing = await prisma.sharedAnalysis.findFirst({
      where: { analysisId },
    });

    if (existing) {
      const shareUrl = `/share/${existing.token}`;
      return NextResponse.json({
        shareUrl,
        token: existing.token,
      });
    }

    // Create new share
    const token = randomUUID();
    await prisma.sharedAnalysis.create({
      data: {
        analysisId,
        token,
      },
    });

    const origin = req.headers.get("origin") || "";
    const shareUrl = `${origin}/share/${token}`;

    return NextResponse.json({ shareUrl, token }, { status: 201 });
  } catch (err) {
    console.error("Share creation error:", err);
    return NextResponse.json(
      { error: "Failed to create share link." },
      { status: 500 }
    );
  }
}
