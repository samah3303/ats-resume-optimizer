import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDeepSeek, extractJson } from "@/lib/deepseek";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { analysisId, targetSalary } = await req.json();
    if (!analysisId) {
      return NextResponse.json({ error: "analysisId required" }, { status: 400 });
    }

    const analysis = await prisma.analysis.findFirst({
      where: { id: analysisId, userId },
      include: {
        resume: { select: { name: true, parsedText: true } },
        jobDescription: { select: { title: true, company: true } },
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const prompt = `You are a senior career coach and salary negotiation expert. Generate a personalized salary negotiation guide for this candidate.

## Job Details:
Title: ${analysis.jobDescription.title}
Company: ${analysis.jobDescription.company || "the employer"}
Target Salary: ${targetSalary || "market rate"}

## Candidate Resume:
${analysis.resume?.parsedText?.slice(0, 3000) || ""}

## Instructions:
Output JSON with:
- "marketRange": estimated salary range for this role in a sentence
- "negotiationScript": a personalized phone/in-person script (4-5 talking points) addressing their specific experience and achievements
- "acceptanceEmail": email to accept an offer (leave salary placeholder)
- "counterOfferEmail": email to counter-offer with a higher amount based on their experience
- "salaryMatchEmail": email to ask current employer to match a competing offer
- "tips": array of 3-5 quick negotiation tips specific to their situation

Return ONLY JSON, no markdown.`;

    const response = await getDeepSeek().chat.completions.create({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonStr = extractJson(content);
    const result = JSON.parse(jsonStr);

    return NextResponse.json(result);
  } catch (err) {
    console.error("Negotiation error:", err);
    return NextResponse.json(
      { error: "Failed to generate negotiation guide" },
      { status: 500 }
    );
  }
}
