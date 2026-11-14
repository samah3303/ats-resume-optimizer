import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateFollowupEmail } from "@/lib/ai-tools";
import { generateFollowupSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { jobId, context } = generateFollowupSchema.parse(body);

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

    const content = await generateFollowupEmail(
      profile.resumeText,
      job.title,
      job.company || "the company",
      context || "following up on application",
    );

    // Save to GeneratedContent
    const saved = await prisma.generatedContent.create({
      data: {
        userId,
        jobId,
        type: "followup_email",
        content,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "followup_email_generated",
        details: `Generated follow-up email for ${job.title} at ${job.company || "Unknown"}`,
      },
    });

    return apiSuccess({
      id: saved.id,
      type: saved.type,
      content: saved.content,
      createdAt: saved.createdAt,
    }, 201);
  } catch (error) {
    return handleApiError(error, "Failed to generate follow-up email");
  }
}
