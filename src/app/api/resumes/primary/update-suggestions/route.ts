import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mode1OnboardingAnalysis } from "@/lib/ai/onboarding";
import { getDeepSeek, parseJsonSafely } from "@/lib/ai/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as { id: string }).id;

  try {
    const { suggestion } = await req.json();

    const resume = await prisma.resume.findFirst({
      where: { userId, isPrimary: true },
    });

    if (!resume) {
      return NextResponse.json({ error: "No primary resume found" }, { status: 404 });
    }

    const profile = await prisma.onboardingProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "No onboarding profile found" }, { status: 404 });
    }

    // Call DeepSeek to apply the suggestion to the parsedText
    const prompt = `You are a resume editing assistant. The user wants to update their resume text based on an AI suggestion.
    
Current section text to replace:
"""
${suggestion.current}
"""

Suggested replacement:
"""
${suggestion.suggested}
"""

Here is the full current resume text:
"""
${resume.parsedText}
"""

Your task is to carefully find the exact or closest matching section in the full resume text and replace it with the suggested replacement. 
Return ONLY the complete updated resume text, maintaining the original structure where possible. Do not wrap in markdown or add explanations.`;

    const modelName = process.env.DEEPSEEK_MODEL || "deepseek-chat";
    const result = await getDeepSeek().chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });
    
    let updatedText = result.choices[0].message.content || resume.parsedText;
    
    // Clean markdown fences if AI included them
    if (updatedText.startsWith("\`\`\`")) {
      updatedText = updatedText.replace(/^\`\`\`[\s\S]*?\n/, "").replace(/\n\`\`\`$/, "");
    }

    // Save updated resume text
    await prisma.resume.update({
      where: { id: resume.id },
      data: { parsedText: updatedText },
    });

    // Re-run ATS analysis
    const positions = [
      profile.targetRole1,
      profile.targetRole2,
      profile.targetRole3,
    ].filter(Boolean) as string[];

    const mode1Result = await mode1OnboardingAnalysis(
      updatedText,
      positions,
      profile.targetCountry,
      profile.targetCity,
      profile.linkedinUrl || undefined
    );

    await prisma.onboardingProfile.update({
      where: { userId },
      data: {
        profileSummary: mode1Result.profileSummary,
        coreSkills: JSON.stringify(mode1Result.detectedCoreSkills),
        marketGaps: JSON.stringify(mode1Result.marketGaps),
        aiSuggestions: JSON.stringify(mode1Result.aiSuggestions),
        linkedinOpts: JSON.stringify(mode1Result.linkedinOptimizations),
        generalAtsScore: mode1Result.generalAtsScore,
        resumeImprovements: JSON.stringify(mode1Result.resumeImprovements),
      },
    });

    return NextResponse.json({
      success: true,
      newScore: mode1Result.generalAtsScore,
    });

  } catch (err) {
    console.error("Failed to update resume suggestions:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
