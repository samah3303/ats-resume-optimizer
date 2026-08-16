import { NextRequest, NextResponse } from "next/server";
import { getOrCreateRoom, updateRoom } from "@/lib/webrtc/rooms";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const room = getOrCreateRoom(roomId);
  return NextResponse.json({ room });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  try {
    const body = await req.json();
    const updated = updateRoom(roomId, body);
    if (!updated) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    return NextResponse.json({ room: updated });
  } catch (err) {
    console.error("Update room error:", err);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}
