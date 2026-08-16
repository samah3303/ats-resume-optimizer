import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { simulateRecruiterNegotiationTurn } from "@/lib/ai/negotiation";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      companyName,
      roleTitle,
      currentOffer,
      candidateGoal,
      recruiterPersona,
      conversationHistory,
      latestCandidateMessage,
    } = body;

    if (!latestCandidateMessage) {
      return NextResponse.json(
        { error: "Candidate message is required." },
        { status: 400 }
      );
    }

    const response = await simulateRecruiterNegotiationTurn({
      companyName: companyName || "Target Company",
      roleTitle: roleTitle || "Senior Software Engineer",
      currentOffer: currentOffer || "$160k base, $100k equity, $10k sign-on",
      candidateGoal: candidateGoal || "$180k base or $25k sign-on bonus",
      recruiterPersona: recruiterPersona || "collaborative_recruiter",
      conversationHistory: conversationHistory || [],
      latestCandidateMessage,
    });

    return NextResponse.json({ data: response });
  } catch (err) {
    console.error("Simulation API error:", err);
    return NextResponse.json(
      { error: "Failed to process simulation turn." },
      { status: 500 }
    );
  }
}
