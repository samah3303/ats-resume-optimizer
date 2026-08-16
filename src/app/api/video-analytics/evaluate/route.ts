import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateVideoPresenceReport } from "@/lib/ai/video-analytics";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { metrics, targetRole, interviewQuestion } = body;

    if (!metrics) {
      return NextResponse.json(
        { error: "Telemetry metrics are required." },
        { status: 400 }
      );
    }

    const report = await generateVideoPresenceReport({
      metrics,
      targetRole: targetRole || "Senior Full-Stack Engineer",
      interviewQuestion:
        interviewQuestion || "Walk me through your most impactful technical architecture decision.",
    });

    return NextResponse.json({ data: report });
  } catch (err) {
    console.error("Video analytics evaluation error:", err);
    return NextResponse.json(
      { error: "Failed to evaluate video session." },
      { status: 500 }
    );
  }
}
