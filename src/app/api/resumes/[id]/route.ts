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

  const resume = await prisma.resume.findFirst({
    where: { id, userId },
  });

  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ resume });
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

  const existing = await prisma.resume.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  if (body.isPrimary) {
    await prisma.resume.updateMany({
      where: { userId, id: { not: id } },
      data: { isPrimary: false },
    });
  }

  const resume = await prisma.resume.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      parsedText: body.parsedText ?? existing.parsedText,
      isPrimary: body.isPrimary ?? existing.isPrimary,
    },
  });

  return NextResponse.json({ resume });
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

  const existing = await prisma.resume.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.resume.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
