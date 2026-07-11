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

  const positions = await prisma.positionProfile.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ positions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();

    if (!body.title || !body.targetRole) {
      return NextResponse.json(
        { error: "Title and targetRole are required." },
        { status: 400 }
      );
    }

    const position = await prisma.positionProfile.create({
      data: {
        userId,
        title: body.title,
        targetRole: body.targetRole,
        industry: body.industry || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ position }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create position." },
      { status: 500 }
    );
  }
}
