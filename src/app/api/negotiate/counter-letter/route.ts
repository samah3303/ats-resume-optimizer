import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateExecutiveCounterLetter } from "@/lib/ai/negotiation";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      candidateName,
      companyName,
      roleTitle,
      recruiterName,
      currentBase,
      requestedBase,
      currentEquity,
      requestedEquity,
      currentSignOn,
      requestedSignOn,
      keyLeveragePoints,
    } = body;

    const letter = await generateExecutiveCounterLetter({
      candidateName: candidateName || session.user.name || "Candidate",
      companyName: companyName || "Company",
      roleTitle: roleTitle || "Software Engineer",
      recruiterName: recruiterName || "Recruiter",
      currentBase: Number(currentBase) || 160000,
      requestedBase: Number(requestedBase) || 180000,
      currentEquity: Number(currentEquity) || 100000,
      requestedEquity: Number(requestedEquity) || 130000,
      currentSignOn: Number(currentSignOn) || 10000,
      requestedSignOn: Number(requestedSignOn) || 25000,
      keyLeveragePoints: keyLeveragePoints || "strong full-stack systems engineering experience",
    });

    return NextResponse.json({ data: letter });
  } catch (err) {
    console.error("Counter letter API error:", err);
    return NextResponse.json(
      { error: "Failed to generate counter-offer letter." },
      { status: 500 }
    );
  }
}
