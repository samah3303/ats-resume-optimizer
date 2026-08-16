import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_RESUME_DATA } from "@/lib/resume-templates";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const draftId = searchParams.get("id");

    if (draftId) {
      const draft = await prisma.resumeDraft.findFirst({
        where: { id: draftId, userId: session.user.id },
      });
      if (!draft) {
        return NextResponse.json({ error: "Resume draft not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, draft });
    }

    const drafts = await prisma.resumeDraft.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      drafts,
      latestDraft: drafts[0] || null,
    });
  } catch (error) {
    console.error("Failed to fetch resume drafts:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume drafts." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, title, templateId, data, dataJson, isComplete, lastSection } = body;

    let serializedData: string;
    if (dataJson && typeof dataJson === "string") {
      serializedData = dataJson;
    } else if (data && typeof data === "object") {
      serializedData = JSON.stringify(data);
    } else {
      serializedData = JSON.stringify(DEFAULT_RESUME_DATA);
    }

    let draft;
    if (id) {
      const existing = await prisma.resumeDraft.findFirst({
        where: { id, userId: session.user.id },
      });

      if (existing) {
        draft = await prisma.resumeDraft.update({
          where: { id },
          data: {
            title: title ?? existing.title,
            templateId: templateId ?? existing.templateId,
            dataJson: serializedData,
            isComplete: isComplete ?? existing.isComplete,
            lastSection: lastSection ?? existing.lastSection,
          },
        });
      }
    }

    if (!draft) {
      draft = await prisma.resumeDraft.create({
        data: {
          userId: session.user.id,
          title: (title && typeof title === "string" && title.trim()) || "Untitled Resume",
          templateId: (templateId && typeof templateId === "string" && templateId.trim()) || "classic-corporate",
          dataJson: serializedData,
          isComplete: isComplete ?? false,
          lastSection: lastSection || "personal",
        },
      });
    }

    return NextResponse.json({ success: true, draft }, { status: 201 });
  } catch (error) {
    console.error("Failed to save resume draft:", error);
    return NextResponse.json(
      { error: "Failed to save resume draft." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const draftId = searchParams.get("id");

    if (!draftId) {
      return NextResponse.json({ error: "Draft ID is required." }, { status: 400 });
    }

    await prisma.resumeDraft.deleteMany({
      where: { id: draftId, userId: session.user.id },
    });

    return NextResponse.json({ success: true, message: "Draft deleted successfully" });
  } catch (error) {
    console.error("Failed to delete resume draft:", error);
    return NextResponse.json(
      { error: "Failed to delete resume draft." },
      { status: 500 }
    );
  }
}
