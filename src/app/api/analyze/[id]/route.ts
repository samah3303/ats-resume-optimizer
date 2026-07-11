import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const analysis = await prisma.analysis.findFirst({
    where: { id, userId },
    include: {
      resume: { select: { id: true, name: true } },
      jobDescription: {
        select: { id: true, title: true, company: true },
      },
      suggestions: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ analysis });
}
