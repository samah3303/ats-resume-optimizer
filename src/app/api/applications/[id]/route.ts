import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateApplicationSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    // IDOR defense: ensure user owns this application
    if (!application || application.userId !== userId) {
      return apiError("Application not found", 404);
    }

    return apiSuccess({
      ...application,
      statusHistory: application.statusHistory
        ? JSON.parse(application.statusHistory)
        : [],
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch application");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const existing = await prisma.application.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return apiError("Application not found", 404);
    }

    const body = await request.json();
    const validatedData = updateApplicationSchema.parse(body);

    const updateData: Record<string, unknown> = {};

    // Track status transitions in statusHistory
    if (validatedData.status !== undefined && validatedData.status !== existing.status) {
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
        to: validatedData.status,
        date: new Date().toISOString(),
      });
      updateData.status = validatedData.status;
      updateData.statusHistory = JSON.stringify(history);

      // Set appliedAt if transitioning to "applied"
      if (validatedData.status === "applied" && !existing.appliedAt) {
        updateData.appliedAt = new Date();
      }
    }

    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
    if (validatedData.contactPerson !== undefined)
      updateData.contactPerson = validatedData.contactPerson;
    if (validatedData.interviewDate !== undefined)
      updateData.interviewDate = validatedData.interviewDate ? new Date(validatedData.interviewDate) : null;
    if (validatedData.coverLetter !== undefined) updateData.coverLetter = validatedData.coverLetter;
    if (validatedData.resumeUpdates !== undefined)
      updateData.resumeUpdates = validatedData.resumeUpdates;
    if (validatedData.atsScore !== undefined) updateData.atsScore = validatedData.atsScore;

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
      include: { job: true },
    });

    if (validatedData.status && validatedData.status !== existing.status) {
      await prisma.activityLog.create({
        data: {
          userId,
          action: "application_status_changed",
          details: `${application.job.title}: ${existing.status} → ${validatedData.status}`,
        },
      });
    }

    return apiSuccess({
      ...application,
      statusHistory: application.statusHistory
        ? JSON.parse(application.statusHistory)
        : [],
    });
  } catch (error) {
    return handleApiError(error, "Failed to update application");
  }
}

export const PATCH = PUT;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return apiError("Application not found", 404);
    }

    await prisma.application.delete({ where: { id } });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete application");
  }
}
