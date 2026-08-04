import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  runJobSearchAgent,
} from "@/lib/agents";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const type = req.nextUrl.searchParams.get("type") || "both";

  try {
    // Get user's onboarding profile and latest resume
    const profile = await prisma.onboardingProfile.findUnique({
      where: { userId },
    });

    const resume = await prisma.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!resume) {
      return NextResponse.json(
        { error: "No resume found. Please upload a resume first." },
        { status: 400 }
      );
    }

    const coreSkills = profile?.coreSkills
      ? JSON.parse(profile.coreSkills)
      : [];
    const targetPositions = profile?.targetPositions
      ? JSON.parse(profile.targetPositions)
      : [];
    const targetCountry = profile?.targetCountry || "United States";

    const result: {
      positions?: Array<{
        title: string;
        targetRole: string;
        industry: string;
        matchReason: string;
      }>;
      jds?: Array<{
        title: string;
        company: string;
        rawText: string;
        matchReason: string;
      }>;
    } = {};

    if (type === "positions" || type === "both") {
      try {
        // Use job search agent which returns real/synthetic jobs with match scores
        const searchResult = await runJobSearchAgent({
          userId,
          resumeText: resume.parsedText.slice(0, 4000),
          targetPositions,
          targetCountry,
          coreSkills,
        });
        result.positions = searchResult.jobs.map((j) => ({
          title: j.title,
          targetRole: j.title,
          industry: profile?.industry || "Technology",
          matchReason: `${j.matchScore}% match — ${j.snippet.slice(0, 100)}`,
        }));
        result.jds = searchResult.jobs.map((j) => ({
          title: j.title,
          company: j.company,
          rawText: j.snippet,
          matchReason: `${j.matchScore}% match based on your skills and experience`,
        }));
      } catch (err) {
        console.error("Position recommendations failed:", err);
        result.positions = [];
      }
    }

    if (type === "jds" || type === "both") {
      // JDs already generated above by runJobSearchAgent
      if (!result.jds) {
        result.jds = [];
      }
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Recommendations error:", err);
    return NextResponse.json(
      { error: "Failed to generate recommendations." },
      { status: 500 }
    );
  }
}
