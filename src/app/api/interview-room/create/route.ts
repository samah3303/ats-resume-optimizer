import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateRoom } from "@/lib/webrtc/rooms";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, targetRole, candidateName } = body;

    const roomId = uuidv4().slice(0, 8);
    const room = getOrCreateRoom(roomId, {
      title: title || "Technical Interview Round",
      targetRole: targetRole || "Software Engineer",
      interviewerName: session.user.name || "Interviewer",
      candidateName: candidateName || "Candidate",
    });

    return NextResponse.json({
      room,
      inviteUrl: `/interview-room/${roomId}`,
    });
  } catch (err) {
    console.error("Create room error:", err);
    return NextResponse.json(
      { error: "Failed to create interview room." },
      { status: 500 }
    );
  }
}
