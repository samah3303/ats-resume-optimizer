import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDeepSeek, getAiModelName, parseJsonSafely, buildCachedPrompt } from "@/lib/ai/client";

export interface FollowUpEmailResult {
  subjectLine: string;
  salutation: string;
  bodyHtml: string;
  plainText: string;
  recommendedSendWindow: string;
  keyTacticsUsed: string[];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      interviewerName = "Interviewer",
      companyName = "Tech Corp",
      roleTitle = "Software Engineer",
      topicsDiscussed = "Distributed database replication and p99 latency optimization",
      tone = "executive_and_confident",
    } = body;

    const featurePrompt = `Role: Principal Executive Career Strategist.
Craft a world-class, high-converting post-interview "Thank You & Strategic Alignment" follow-up email.
Instructions:
1. Reference the specific technical topic discussed (${topicsDiscussed}).
2. Reinforce the candidate's enthusiasm and direct alignment with ${companyName}'s engineering standards.
3. Keep it crisp, professional, and free of desperate or overly flattering cliches.

Output JSON matching:
{
  "subjectLine": "Thank you — [Role Title] interview discussion | [Candidate Name]",
  "salutation": "Hi [Interviewer Name],",
  "plainText": "<Full email text with paragraph breaks>",
  "bodyHtml": "<Formatted HTML>",
  "recommendedSendWindow": "Within 4 to 8 hours after the interview round",
  "keyTacticsUsed": ["Specific Technical Anchor", "Forward Value Projection", "Concise Executive Tone"]
}`;

    const dynamicPayload = `Interviewer: ${interviewerName}\nCompany: ${companyName}\nRole: ${roleTitle}\nTopics Discussed: ${topicsDiscussed}\nTone: ${tone}`;
    const messages = buildCachedPrompt(featurePrompt, dynamicPayload);

    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: messages as any,
      temperature: 0.3,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = parseJsonSafely<FollowUpEmailResult>(content, {
      subjectLine: `Thank you — ${roleTitle} discussion | Next steps at ${companyName}`,
      salutation: `Hi ${interviewerName},`,
      plainText: `Hi ${interviewerName},\n\nThank you for taking the time to speak with me today regarding the ${roleTitle} role at ${companyName}.\n\nI really enjoyed our deep dive into ${topicsDiscussed}. Our conversation reinforced my excitement about the team's engineering velocity and technical roadmap.\n\nPlease let me know if you need any additional code samples, architectural references, or documentation from my end.\n\nBest regards,\nCandidate`,
      bodyHtml: `<p>Hi ${interviewerName},</p><p>Thank you for taking the time to speak with me today regarding the <strong>${roleTitle}</strong> role at <strong>${companyName}</strong>.</p><p>I really enjoyed our deep dive into <em>${topicsDiscussed}</em>. Our conversation reinforced my excitement about the team's engineering velocity and technical roadmap.</p><p>Please let me know if you need any additional code samples, architectural references, or documentation from my end.</p><p>Best regards,<br/>Candidate</p>`,
      recommendedSendWindow: "Within 4 to 8 hours post-interview",
      keyTacticsUsed: ["Specific Technical Anchor", "Forward Value Projection", "Concise Executive Tone"],
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("Follow up email error:", err);
    return NextResponse.json(
      { error: "Failed to generate follow up email." },
      { status: 500 }
    );
  }
}
