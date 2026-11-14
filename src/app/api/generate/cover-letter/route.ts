import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateCoverLetter } from "@/lib/ai-tools";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { jobId } = body as { jobId: string };

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 },
      );
    }

    // Get user's profile and resume
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile?.resumeText) {
      return NextResponse.json(
        { error: "No resume found. Please upload your resume first." },
        { status: 404 },
      );
    }

    // Get job details
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const content = await generateCoverLetter(
      profile.resumeText,
      job.description || "",
      job.title,
      job.company || "the company",
    );

    // Save to GeneratedContent
    const saved = await prisma.generatedContent.create({
      data: {
        userId,
        jobId,
        type: "cover_letter",
        content,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: "cover_letter_generated",
        details: `Generated cover letter for ${job.title} at ${job.company || "Unknown"}`,
      },
    });

    return NextResponse.json({
      id: saved.id,
      type: saved.type,
      content: saved.content,
      coverLetter: saved.content,
      jobId: saved.jobId,
      createdAt: saved.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Cover letter generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 },
    );
  }
}
