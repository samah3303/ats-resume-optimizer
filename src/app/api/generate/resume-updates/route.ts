import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateResumeUpdates } from "@/lib/ai-tools";
import { generateResumeUpdatesSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { jobId } = generateResumeUpdatesSchema.parse(body);

    // Get user's profile and resume
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile?.resumeText) {
      return apiError("No resume found. Please upload your resume first.", 404);
    }

    // Verify job belongs to user (anti-IDOR)
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.userId !== userId) {
      return apiError("Job not found", 404);
    }

    const result = await generateResumeUpdates(
      profile.resumeText,
      job.description || "",
      job.title,
    );

    // Save to GeneratedContent
    const saved = await prisma.generatedContent.create({
      data: {
        userId,
        jobId,
        type: "resume_updates",
        content: JSON.stringify(result),
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "resume_updates_generated",
        details: `Generated resume update suggestions for ${job.title}`,
      },
    });

    return apiSuccess({
      id: saved.id,
      type: saved.type,
      content: saved.content,
      createdAt: saved.createdAt,
    }, 201);
  } catch (error) {
    return handleApiError(error, "Failed to generate resume updates");
  }
}
