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

  const position = await prisma.positionProfile.findFirst({
    where: { id, userId },
  });

  if (!position) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ position });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const existing = await prisma.positionProfile.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  const position = await prisma.positionProfile.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      targetRole: body.targetRole ?? existing.targetRole,
      industry: body.industry !== undefined ? body.industry : existing.industry,
      notes: body.notes !== undefined ? body.notes : existing.notes,
    },
  });

  return NextResponse.json({ position });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { id } = await params;

  const existing = await prisma.positionProfile.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.positionProfile.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
