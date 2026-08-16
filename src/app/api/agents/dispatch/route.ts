import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { runHunterAgentScan } from "@/lib/ai/autonomous-agents";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();
    const { agentType = "hunter", targetRole } = body;

    // Get user's primary resume
    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const resumeText =
      resume?.parsedText ||
      "Senior Software Engineer with 6+ years building distributed cloud microservices, PostgreSQL query optimization, and high-throughput Kafka streaming.";

    const result = await runHunterAgentScan({
      candidateName: session.user.name || "Candidate",
      candidateResumeText: resumeText,
      targetRole: targetRole || "Staff Software Engineer",
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("Agent dispatch error:", err);
    return NextResponse.json(
      { error: "Failed to dispatch autonomous agent cycle." },
      { status: 500 }
    );
  }
}
