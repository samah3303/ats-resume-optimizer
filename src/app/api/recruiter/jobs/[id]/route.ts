import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const userId = (session.user as { id: string }).id;

  try {
    const job = await prisma.jobPosting.findUnique({
      where: { id },
      include: {
        applications: true,
      },
    });

    if (!job || job.userId !== userId) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    return NextResponse.json({ job });
  } catch (err) {
    console.error("Error fetching job:", err);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const userId = (session.user as { id: string }).id;

  try {
    const existing = await prisma.jobPosting.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    const body = await req.json();
    const updateData: Record<string, any> = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.department !== undefined) updateData.department = body.department.trim();
    if (body.location !== undefined) updateData.location = body.location.trim();
    if (body.jobType !== undefined) updateData.jobType = body.jobType;
    if (body.remotePolicy !== undefined) updateData.remotePolicy = body.remotePolicy;
    if (body.salaryMin !== undefined)
      updateData.salaryMin = body.salaryMin ? parseInt(body.salaryMin, 10) : null;
    if (body.salaryMax !== undefined)
      updateData.salaryMax = body.salaryMax ? parseInt(body.salaryMax, 10) : null;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.requirements !== undefined) updateData.requirements = body.requirements.trim();
    if (body.status !== undefined) updateData.status = body.status;

    const updatedJob = await prisma.jobPosting.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ job: updatedJob });
  } catch (err) {
    console.error("Error updating job:", err);
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

export const PUT = PATCH;


export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const userId = (session.user as { id: string }).id;

  try {
    const existing = await prisma.jobPosting.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    await prisma.jobPosting.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting job:", err);
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
