import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateRoom } from "@/lib/webrtc/rooms";
import { InterviewRoomWorkspace } from "@/components/interview-room/InterviewRoomWorkspace";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  return {
    title: `Live Interview Room #${roomId} | KYRO AI`,
    description: "Peer-to-peer WebRTC video interview room with synchronized code pad and real-time AI fact-checking copilot.",
  };
}

export default async function LiveInterviewRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { roomId } = await params;

  const room = getOrCreateRoom(roomId, {
    interviewerName: session?.user?.name || "Technical Lead",
    candidateName: "Alex Rivers (Candidate)",
  });

  return <InterviewRoomWorkspace room={room} isHost={!!session?.user} />;
}
