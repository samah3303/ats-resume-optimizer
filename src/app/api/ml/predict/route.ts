import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { quickPredict } from "@/lib/ml-predictor";

/**
 * POST /api/ml/predict — Predict ATS score using ML model (no LLM call)
 * Body: { resumeText: string }
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { resumeText } = await req.json();

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json(
        { error: "resumeText is required." },
        { status: 400 }
      );
    }

    const prediction = await quickPredict(resumeText);

    return NextResponse.json({
      predictedScore: prediction.score,
      confidence: prediction.confidence,
      topFactors: prediction.topFactors.map((f) => ({
        factor: f.name,
        contribution: Math.round(f.contribution * 100) / 100,
      })),
    });
  } catch (err) {
    console.error("ML predict error:", err);
    return NextResponse.json(
      { error: "Failed to predict score." },
      { status: 500 }
    );
  }
}
