import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateFinalVoiceInterviewReport, InterviewPersonaType } from "@/lib/ai/voice-interview";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { persona = "phone_screen", targetRole = "Software Engineer", fullConversation = [] } = body;

    if (!fullConversation || fullConversation.length === 0) {
      return NextResponse.json(
        { error: "Conversation transcript is required." },
        { status: 400 }
      );
    }

    const report = await generateFinalVoiceInterviewReport({
      persona: persona as InterviewPersonaType,
      targetRole,
      fullConversation,
    });

    return NextResponse.json({ data: report });
  } catch (err) {
    console.error("Voice interview finish error:", err);
    return NextResponse.json(
      { error: "Failed to generate interview diagnostic report." },
      { status: 500 }
    );
  }
}
