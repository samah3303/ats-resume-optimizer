import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzeLiveInterviewTurn } from "@/lib/ai/interview-copilot";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { recentTranscript, targetRole, interviewerNotes } = body;

    if (!recentTranscript) {
      return NextResponse.json(
        { error: "Transcript is required." },
        { status: 400 }
      );
    }

    const insight = await analyzeLiveInterviewTurn({
      recentTranscript,
      targetRole: targetRole || "Staff Software Engineer",
      interviewerNotes: interviewerNotes || "",
    });

    return NextResponse.json({ data: insight });
  } catch (err) {
    console.error("Copilot API error:", err);
    return NextResponse.json(
      { error: "Failed to generate copilot insights." },
      { status: 500 }
    );
  }
}
