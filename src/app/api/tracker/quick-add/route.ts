import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { companyName, roleTitle, jobUrl, salaryEst, notes } = body;

    if (!companyName || !roleTitle) {
      return NextResponse.json(
        { error: "Company name and role title are required." },
        { status: 400 }
      );
    }

    // Create or find a JobDescription record first
    const jd = await prisma.jobDescription.create({
      data: {
        userId,
        title: roleTitle,
        company: companyName,
        sourceUrl: jobUrl || "",
        rawText: `${roleTitle} at ${companyName}. Estimated compensation: ${salaryEst || "Competitive"}.`,
      },
    });

    // Create the Application record attached to this JD
    const application = await prisma.application.create({
      data: {
        userId,
        jdId: jd.id,
        status: "applied",
        notes: notes || `Auto-synced from Paniund Autonomous Hunter Agent Swarm. Comp: ${salaryEst || "N/A"}`,
        appliedAt: new Date(),
      },
      include: {
        jobDescription: {
          select: { title: true, company: true, sourceUrl: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: application });
  } catch (err) {
    console.error("Quick add tracker error:", err);
    return NextResponse.json(
      { error: "Failed to save application to tracker." },
      { status: 500 }
    );
  }
}
