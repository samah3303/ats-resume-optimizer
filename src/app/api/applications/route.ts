import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createApplicationSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;

    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        job: true,
      },
    });

    // Safely parse statusHistory JSON for each application
    const parsed = applications.map((app) => ({
      ...app,
      statusHistory: app.statusHistory ? JSON.parse(app.statusHistory) : [],
    }));

    return apiSuccess(parsed);
  } catch (error) {
    return handleApiError(error, "Failed to fetch applications");
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();

    const { jobId, status } = createApplicationSchema.parse(body);

    // Verify the job exists and belongs to user (Anti-IDOR)
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.userId !== userId) {
      return apiError("Job not found", 404);
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

      return apiSuccess({
        ...updated,
        statusHistory: updated.statusHistory ? JSON.parse(updated.statusHistory) : [],
      });
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

    return apiSuccess(
      {
        ...application,
        statusHistory: JSON.parse(application.statusHistory || "[]"),
      },
      201,
    );
  } catch (error) {
    return handleApiError(error, "Failed to create application");
  }
}
