import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDeepSeek, getAiModelName, parseJsonSafely, buildCachedPrompt } from "@/lib/ai/client";

export interface CompanyPredictionResult {
  company: string;
  role: string;
  difficultyRating: "Medium" | "Hard" | "Very Hard";
  cultureFocus: string;
  predictedQuestions: {
    question: string;
    category: "Coding & Algo" | "System Design" | "Behavioral & STAR" | "Leadership / Bar Raiser";
    interviewerExpectation: string;
    suggestedTalkingPoints: string[];
  }[];
  insiderTips: string[];
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { company = "Google", role = "Senior Software Engineer" } = body;

    const featurePrompt = `Role: Principal Interview Loop Architect & Executive Bar Raiser.
Predict the exact top 5 interview questions and loop rubric for the given company and target role based on real industry hiring loops (e.g. Google Googleyness & System Design, Amazon 16 Leadership Principles & Bar Raiser, Meta Rapid Coding 2x45min, Stripe Bug Bash & Systems Integration, Netflix Context Not Control).

Output strict JSON matching:
{
  "company": "${company}",
  "role": "${role}",
  "difficultyRating": "Hard",
  "cultureFocus": "<1 sentence on company's core hiring philosophy>",
  "predictedQuestions": [
    {
      "question": "<exact predicted question>",
      "category": "Coding & Algo" | "System Design" | "Behavioral & STAR" | "Leadership / Bar Raiser",
      "interviewerExpectation": "<what the bar raiser looks for>",
      "suggestedTalkingPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "insiderTips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    const dynamicPayload = `Target Company: ${company}\nTarget Role: ${role}`;
    const messages = buildCachedPrompt(featurePrompt, dynamicPayload);

    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: messages as any,
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = parseJsonSafely<CompanyPredictionResult>(content, {
      company,
      role,
      difficultyRating: "Hard",
      cultureFocus: `Evaluates strong engineering fundamentals, structured communication, and alignment with ${company}'s core values.`,
      predictedQuestions: [
        {
          question: `Design a high-throughput, low-latency distributed telemetry and metrics aggregation pipeline for ${company}.`,
          category: "System Design",
          interviewerExpectation: "Expects back-of-the-envelope calculations, fault-tolerant write paths, and zero SPOF partition strategies.",
          suggestedTalkingPoints: ["Kafka partitioning by tenant", "Redis cluster caching", "Time-series database downsampling"],
        },
        {
          question: `Describe a scenario where you had to push back on a critical technical deadline due to architectural or reliability risks.`,
          category: "Leadership / Bar Raiser",
          interviewerExpectation: "Looks for customer obsession, bias for action, and data-backed diplomacy.",
          suggestedTalkingPoints: ["Quantified downtime risk ($ value)", "Alternative phased rollout milestone", "Alignment with cross-functional leadership"],
        },
        {
          question: `Given a continuous stream of events, find the top K most frequent elements in $O(N \\log K)$ time and $O(K)$ space.`,
          category: "Coding & Algo",
          interviewerExpectation: "Clean modular syntax, Min-Heap implementation, and optimal edge-case handling.",
          suggestedTalkingPoints: ["Min-Heap of size K", "HashMap frequency count", "Concurrency thread-safety locks"],
        },
      ],
      insiderTips: [
        `Always clarify functional and non-functional requirements in the first 3 minutes.`,
        `Quantify results with metrics (latencies, cost savings, user retention).`,
        `Ask deep questions about team roadmap and architectural trade-offs during the final 5 minutes.`,
      ],
    });

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("Predict questions error:", err);
    return NextResponse.json(
      { error: "Failed to generate company question predictions." },
      { status: 500 }
    );
  }
}
