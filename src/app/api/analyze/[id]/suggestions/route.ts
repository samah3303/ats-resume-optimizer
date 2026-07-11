import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id: analysisId } = await params;

  // Verify ownership
  const analysis = await prisma.analysis.findFirst({
    where: { id: analysisId, userId },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const { suggestionId, accepted } = body;

    if (!suggestionId) {
      return NextResponse.json(
        { error: "suggestionId is required." },
        { status: 400 }
      );
    }

    const suggestion = await prisma.suggestion.findFirst({
      where: { id: suggestionId, analysisId },
    });

    if (!suggestion) {
      return NextResponse.json(
        { error: "Suggestion not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.suggestion.update({
      where: { id: suggestionId },
      data: { accepted },
    });

    return NextResponse.json({ suggestion: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update suggestion." },
      { status: 500 }
    );
  }
}
