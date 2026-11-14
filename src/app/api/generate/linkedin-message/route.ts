import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLinkedInMessage } from "@/lib/ai-tools";
import { generateLinkedInSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { jobId, messageType, type } = generateLinkedInSchema.parse(body);
    const chosenType = messageType || type || "connection_request";

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

    const content = await generateLinkedInMessage(
      profile.resumeText,
      job.title,
      job.company || "the company",
      chosenType,
    );

    // Save to GeneratedContent
    const saved = await prisma.generatedContent.create({
      data: {
        userId,
        jobId,
        type: "linkedin_message",
        content,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "linkedin_message_generated",
        details: `Generated LinkedIn ${chosenType} for ${job.title} at ${job.company || "Unknown"}`,
      },
    });

    return apiSuccess({
      id: saved.id,
      type: saved.type,
      content: saved.content,
      createdAt: saved.createdAt,
    }, 201);
  } catch (error) {
    return handleApiError(error, "Failed to generate LinkedIn outreach");
  }
}
