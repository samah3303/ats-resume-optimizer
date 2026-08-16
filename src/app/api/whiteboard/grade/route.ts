import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { gradeSystemArchitecture } from "@/lib/ai/architecture-grader";
import { ArchitectureGraph } from "@/lib/whiteboard/types";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { graph, targetProblem } = body;

    if (!graph || !graph.nodes) {
      return NextResponse.json(
        { error: "Architecture graph is required." },
        { status: 400 }
      );
    }

    const evaluation = await gradeSystemArchitecture(
      graph as ArchitectureGraph,
      targetProblem || graph.title || "Distributed System"
    );

    return NextResponse.json({ data: evaluation });
  } catch (err) {
    console.error("Whiteboard grade error:", err);
    return NextResponse.json(
      { error: "Failed to grade system architecture." },
      { status: 500 }
    );
  }
}
