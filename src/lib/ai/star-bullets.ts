import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";
import { StarBulletOption } from "@/types/ai";

interface GenerateStarBulletsParams {
  rawBullet: string;
  targetRole?: string;
}

export async function generateStarBullets({
  rawBullet,
  targetRole,
}: GenerateStarBulletsParams): Promise<StarBulletOption[]> {
  const prompt = `You are a resume expert specializing in the STAR (Situation, Task, Action, Result) method.

${targetRole ? `Target Role: ${targetRole}` : ""}
Raw Bullet Point / Responsibility:
"${rawBullet}"

## Instructions:
Transform this weak or standard bullet point into 3 high-impact, quantified achievement bullet points suitable for an ATS resume. Return a JSON array with EXACTLY this structure (no markdown):

[
  {
    "title": "High Impact & Metrics Focus",
    "bullet": "<Action verb + task + specific quantified metrics + result>",
    "starBreakdown": {
      "situationTask": "<Context or problem addressed>",
      "action": "<Specific technical or operational actions taken>",
      "resultMetrics": "<Quantified outcome, e.g., 'improving performance by 35%'>"
    }
  },
  {
    "title": "Technical & Execution Focus",
    "bullet": "<Focus on tools, processes, efficiency improvements and delivery>",
    "starBreakdown": {
      "situationTask": "<Context>",
      "action": "<Key tools/technologies used>",
      "resultMetrics": "<Productivity or performance metric achieved>"
    }
  },
  {
    "title": "Leadership & Value Creation",
    "bullet": "<Focus on collaboration, ownership, business value and outcome>",
    "starBreakdown": {
      "situationTask": "<Context>",
      "action": "<Leadership or collaborative action taken>",
      "resultMetrics": "<Business outcome or ROI created>"
    }
  }
]

Return ONLY the JSON array.`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content || "[]";
  return parseJsonSafely<StarBulletOption[]>(content, []);
}
