import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        job: true,
      },
    });

    // Parse statusHistory JSON for each application
    const parsed = applications.map((app) => ({
      ...app,
      statusHistory: app.statusHistory ? JSON.parse(app.statusHistory) : [],
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Applications fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const { jobId, status } = body as {
      jobId: string;
      status?: string;
    };

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 },
      );
    }

    // Verify the job exists and belongs to user
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Check for existing application - if exists, update status
    const existing = await prisma.application.findFirst({
      where: { userId, jobId },
    });
    if (existing) {
      const targetStatus = status || "applied";
      const now = new Date().toISOString();
      let history: Array<{ from: string; to: string; date: string }> = [];
      try {
        if (existing.statusHistory) history = JSON.parse(existing.statusHistory);
      } catch {
        history = [];
      }
      history.push({ from: existing.status, to: targetStatus, date: now });

      const updated = await prisma.application.update({
        where: { id: existing.id },
        data: {
          status: targetStatus,
          appliedAt: targetStatus === "applied" ? (existing.appliedAt || new Date()) : existing.appliedAt,
          statusHistory: JSON.stringify(history),
        },
        include: { job: true },
      });

      return NextResponse.json(updated);
    }

    const initialStatus = status || "wishlist";
    const now = new Date().toISOString();

    const application = await prisma.application.create({
      data: {
        userId,
        jobId,
        status: initialStatus,
        appliedAt: initialStatus === "applied" ? new Date() : null,
        statusHistory: JSON.stringify([
          { from: "", to: initialStatus, date: now },
        ]),
      },
      include: { job: true },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: "application_created",
        details: `Applied to ${job.title} at ${job.company || "Unknown"}`,
      },
    });

    return NextResponse.json(
      {
        ...application,
        statusHistory: JSON.parse(application.statusHistory || "[]"),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Application creation error:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 },
    );
  }
}
