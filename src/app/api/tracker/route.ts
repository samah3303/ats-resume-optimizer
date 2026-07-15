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

  const applications = await prisma.application.findMany({
    where: { userId },
    include: {
      jobDescription: {
        select: { title: true, company: true, sourceUrl: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();

    if (!body.jdId) {
      return NextResponse.json(
        { error: "jdId is required." },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        userId,
        jdId: body.jdId,
        status: body.status || "wishlist",
        notes: body.notes || null,
      },
      include: {
        jobDescription: {
          select: { title: true, company: true, sourceUrl: true },
        },
      },
    });

    return NextResponse.json({ application }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create application." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "id is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.application.findUnique({
      where: { id: body.id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const application = await prisma.application.update({
      where: { id: body.id },
      data: updateData,
      include: {
        jobDescription: {
          select: { title: true, company: true, sourceUrl: true },
        },
      },
    });

    return NextResponse.json({ application });
  } catch {
    return NextResponse.json(
      { error: "Failed to update application." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "id is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      );
    }

    await prisma.application.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete application." },
      { status: 500 }
    );
  }
}
