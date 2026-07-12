import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateRecommendedPositions,
  generateRecommendedJDs,
} from "@/lib/deepseek";

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
        result.positions = await generateRecommendedPositions(
          resume.parsedText.slice(0, 3000),
          coreSkills,
          targetCountry
        );
      } catch (err) {
        console.error("Position recommendations failed:", err);
        result.positions = [];
      }
    }

    if (type === "jds" || type === "both") {
      try {
        result.jds = await generateRecommendedJDs(
          resume.parsedText.slice(0, 3000),
          coreSkills,
          targetPositions,
          targetCountry
        );
      } catch (err) {
        console.error("JD recommendations failed:", err);
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
