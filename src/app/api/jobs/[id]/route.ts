import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateJobSchema, patchBookmarkSchema } from "@/lib/validations";
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

    const [job, generatedContents] = await Promise.all([
      prisma.job.findUnique({
        where: { id },
        include: {
          applications: {
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      prisma.generatedContent.findMany({
        where: { userId, jobId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // IDOR check: ensure the record exists and belongs to the authenticated user
    if (!job || job.userId !== userId) {
      return apiError("Job not found", 404);
    }

    return apiSuccess({
      ...job,
      generatedContents,
    });
  } catch (error) {
    return handleApiError(error, "Failed to fetch job");
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

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return apiError("Job not found", 404);
    }

    const body = await request.json();
    const validatedData = updateJobSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (validatedData.title !== undefined) updateData.title = validatedData.title;
    if (validatedData.company !== undefined) updateData.company = validatedData.company;
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.salary !== undefined) updateData.salary = validatedData.salary;
    if (validatedData.jobType !== undefined) updateData.jobType = validatedData.jobType;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.requirements !== undefined) updateData.requirements = validatedData.requirements;
    if (validatedData.sourceUrl !== undefined) updateData.sourceUrl = validatedData.sourceUrl;
    if (validatedData.isBookmarked !== undefined) updateData.isBookmarked = validatedData.isBookmarked;
    if (validatedData.matchScore !== undefined) updateData.matchScore = validatedData.matchScore;

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess(job);
  } catch (error) {
    return handleApiError(error, "Failed to update job");
  }
}

export async function PATCH(
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

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return apiError("Job not found", 404);
    }

    const body = await request.json();
    const validatedData = patchBookmarkSchema.parse(body);

    const job = await prisma.job.update({
      where: { id },
      data: { isBookmarked: validatedData.isBookmarked },
    });

    return apiSuccess(job);
  } catch (error) {
    return handleApiError(error, "Failed to toggle bookmark");
  }
}

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

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return apiError("Job not found", 404);
    }

    await prisma.job.delete({ where: { id } });

    return apiSuccess({ success: true });
  } catch (error) {
    return handleApiError(error, "Failed to delete job");
  }
}
