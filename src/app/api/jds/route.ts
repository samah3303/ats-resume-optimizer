import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const jds = await prisma.jobDescription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jds });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();

    if (!body.title || !body.rawText) {
      return NextResponse.json(
        { error: "Title and rawText are required." },
        { status: 400 }
      );
    }

    const jd = await prisma.jobDescription.create({
      data: {
        userId,
        title: body.title,
        company: body.company || null,
        rawText: body.rawText,
        sourceUrl: body.sourceUrl || null,
        positionProfileId: body.positionProfileId || null,
      },
    });

    return NextResponse.json({ jd }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create JD." },
      { status: 500 }
    );
  }
}
