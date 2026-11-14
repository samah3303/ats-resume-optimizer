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

    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...job,
      generatedContents,
    });
  } catch (error) {
    console.error("Job fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
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

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      company,
      location,
      salary,
      jobType,
      description,
      requirements,
      sourceUrl,
      isBookmarked,
      matchScore,
    } = body as {
      title?: string;
      company?: string;
      location?: string;
      salary?: string;
      jobType?: string;
      description?: string;
      requirements?: string;
      sourceUrl?: string;
      isBookmarked?: boolean;
      matchScore?: number;
    };

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (company !== undefined) updateData.company = company?.trim() || null;
    if (location !== undefined) updateData.location = location?.trim() || null;
    if (salary !== undefined) updateData.salary = salary?.trim() || null;
    if (jobType !== undefined) updateData.jobType = jobType || null;
    if (description !== undefined) updateData.description = description || null;
    if (requirements !== undefined)
      updateData.requirements = requirements || null;
    if (sourceUrl !== undefined)
      updateData.sourceUrl = sourceUrl?.trim() || null;
    if (isBookmarked !== undefined) updateData.isBookmarked = isBookmarked;
    if (matchScore !== undefined) updateData.matchScore = matchScore;

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error("Job update error:", error);
    return NextResponse.json(
      { error: "Failed to update job" },
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

    const existing = await prisma.job.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    await prisma.job.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Job delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 },
    );
  }
}
