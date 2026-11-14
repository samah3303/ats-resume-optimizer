import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application || application.userId !== userId) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...application,
      statusHistory: application.statusHistory
        ? JSON.parse(application.statusHistory)
        : [],
    });
  } catch (error) {
    console.error("Application fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    const body = await request.json();
    const {
      status,
      notes,
      contactPerson,
      interviewDate,
      coverLetter,
      resumeUpdates,
      atsScore,
    } = body as {
      status?: string;
      notes?: string;
      contactPerson?: string;
      interviewDate?: string;
      coverLetter?: string;
      resumeUpdates?: string;
      atsScore?: number;
    };

    const updateData: Record<string, unknown> = {};

    // Track status changes in statusHistory
    if (status !== undefined && status !== existing.status) {
      const history = existing.statusHistory
        ? (JSON.parse(existing.statusHistory) as {
            from: string;
            to: string;
            date: string;
            note?: string;
          }[])
        : [];
      history.push({
        from: existing.status,
        to: status,
        date: new Date().toISOString(),
      });
      updateData.status = status;
      updateData.statusHistory = JSON.stringify(history);

      // Set appliedAt if transitioning to "applied"
      if (status === "applied" && !existing.appliedAt) {
        updateData.appliedAt = new Date();
      }
    }

    if (notes !== undefined) updateData.notes = notes || null;
    if (contactPerson !== undefined)
      updateData.contactPerson = contactPerson || null;
    if (interviewDate !== undefined)
      updateData.interviewDate = interviewDate ? new Date(interviewDate) : null;
    if (coverLetter !== undefined) updateData.coverLetter = coverLetter || null;
    if (resumeUpdates !== undefined)
      updateData.resumeUpdates = resumeUpdates || null;
    if (atsScore !== undefined) updateData.atsScore = atsScore;

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: { job: true },
    });

    if (status && status !== existing.status) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: "application_status_changed",
          details: `${application.job.title}: ${existing.status} → ${status}`,
        },
      });
    }

    return NextResponse.json({
      ...application,
      statusHistory: application.statusHistory
        ? JSON.parse(application.statusHistory)
        : [],
    });
  } catch (error) {
    console.error("Application update error:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 },
      );
    }

    await prisma.application.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Application delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 },
    );
  }
}
