import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const draft = await prisma.resumeDraft.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!draft) {
      return NextResponse.json(
        { error: "Resume draft not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error("Failed to fetch draft:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume draft" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingDraft = await prisma.resumeDraft.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingDraft) {
      return NextResponse.json(
        { error: "Resume draft not found" },
        { status: 404 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { title, templateId, dataJson, data, isComplete, lastSection } = body;

    const updatePayload: {
      title?: string;
      templateId?: string;
      dataJson?: string;
      isComplete?: boolean;
      lastSection?: string;
    } = {};

    if (typeof title === "string" && title.trim()) {
      updatePayload.title = title.trim();
    }
    if (typeof templateId === "string" && templateId.trim()) {
      updatePayload.templateId = templateId.trim();
    }
    if (typeof dataJson === "string") {
      updatePayload.dataJson = dataJson;
    } else if (data && typeof data === "object") {
      updatePayload.dataJson = JSON.stringify(data);
    }
    if (typeof isComplete === "boolean") {
      updatePayload.isComplete = isComplete;
    }
    if (typeof lastSection === "string") {
      updatePayload.lastSection = lastSection;
    }

    const updatedDraft = await prisma.resumeDraft.update({
      where: { id },
      data: updatePayload,
    });

    return NextResponse.json({ success: true, draft: updatedDraft });
  } catch (error) {
    console.error("Failed to update draft:", error);
    return NextResponse.json(
      { error: "Failed to update resume draft" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingDraft = await prisma.resumeDraft.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingDraft) {
      return NextResponse.json(
        { error: "Resume draft not found" },
        { status: 404 }
      );
    }

    await prisma.resumeDraft.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Resume draft deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete draft:", error);
    return NextResponse.json(
      { error: "Failed to delete resume draft" },
      { status: 500 }
    );
  }
}
