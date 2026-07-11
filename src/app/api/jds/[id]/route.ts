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

  const jd = await prisma.jobDescription.findFirst({
    where: { id, userId },
  });

  if (!jd) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ jd });
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

  const existing = await prisma.jobDescription.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();

  const jd = await prisma.jobDescription.update({
    where: { id },
    data: {
      title: body.title ?? existing.title,
      company: body.company !== undefined ? body.company : existing.company,
      rawText: body.rawText ?? existing.rawText,
      sourceUrl:
        body.sourceUrl !== undefined ? body.sourceUrl : existing.sourceUrl,
      positionProfileId:
        body.positionProfileId !== undefined
          ? body.positionProfileId
          : existing.positionProfileId,
    },
  });

  return NextResponse.json({ jd });
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

  const existing = await prisma.jobDescription.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.jobDescription.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
