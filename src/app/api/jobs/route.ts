import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createJobSchema } from "@/lib/validations";
import { autoPopulateJobsForUser } from "@/lib/job-matcher";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;
    const { searchParams } = new URL(request.url);
    const bookmarked = searchParams.get("bookmarked");

    const where: { userId: string; isBookmarked?: boolean } = { userId };
    if (bookmarked === "true") {
      where.isBookmarked = true;
    }

    let jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { applications: true } },
        applications: {
          select: { id: true, status: true, appliedAt: true },
        },
      },
    });

    // If candidate has no jobs listed yet and is requesting all jobs,
    // auto-fetch matching jobs based on their extracted resume location & role
    if (jobs.length === 0 && bookmarked !== "true") {
      const populated = await autoPopulateJobsForUser(userId, { maxJobs: 5 });
      if (populated.length > 0) {
        jobs = await prisma.job.findMany({
          where,
          orderBy: { createdAt: "desc" },
          include: {
            _count: { select: { applications: true } },
            applications: {
              select: { id: true, status: true, appliedAt: true },
            },
          },
        });
      }
    }

    return apiSuccess(jobs);
  } catch (error) {
    return handleApiError(error, "Failed to fetch jobs");
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

    // Strict schema validation & sanitization via Zod
    const validatedData = createJobSchema.parse(body);

    const job = await prisma.job.create({
      data: {
        userId,
        title: validatedData.title,
        company: validatedData.company ?? null,
        location: validatedData.location ?? null,
        salary: validatedData.salary ?? null,
        jobType: validatedData.jobType ?? null,
        description: validatedData.description ?? null,
        requirements: validatedData.requirements ?? null,
        sourceUrl: validatedData.sourceUrl ?? null,
        source: validatedData.source ?? "manual",
        matchScore: validatedData.matchScore ?? null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: "job_added",
        details: `Added job: ${validatedData.title} at ${validatedData.company || "Unknown"}`,
      },
    });

    return apiSuccess(job, 201);
  } catch (error) {
    return handleApiError(error, "Failed to create job");
  }
}
