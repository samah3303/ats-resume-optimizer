import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processVoiceInterviewTurn, InterviewPersonaType } from "@/lib/ai/voice-interview";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      persona = "phone_screen",
      targetRole = "Software Engineer",
      conversationHistory = [],
      latestSpokenAnswer,
      wpm = 140,
      fillerWords = [],
    } = body;

    if (!latestSpokenAnswer) {
      return NextResponse.json(
        { error: "Spoken answer is required." },
        { status: 400 }
      );
    }

    const turnResponse = await processVoiceInterviewTurn({
      persona: persona as InterviewPersonaType,
      targetRole,
      conversationHistory,
      latestSpokenAnswer,
      wpm,
      fillerWords,
    });

    return NextResponse.json({ data: turnResponse });
  } catch (err) {
    console.error("Voice interview turn error:", err);
    return NextResponse.json(
      { error: "Failed to process interview turn." },
      { status: 500 }
    );
  }
}
