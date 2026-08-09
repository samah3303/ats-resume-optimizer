import { getDeepSeek, getAiModelName, extractJson } from "./client";
import { ResumeComparisonInput, ResumeComparison } from "@/types/ai";

interface GenerateResumeComparisonsParams {
  resumes: ResumeComparisonInput[];
}

export async function generateResumeComparisons({
  resumes,
}: GenerateResumeComparisonsParams): Promise<ResumeComparison[]> {
  const resumesBlock = resumes
    .map((r, i) => `### Resume ${i + 1}: "${r.name}"
${r.parsedText}`)
    .join("\n\n");

  const prompt = `You are an expert resume reviewer. Compare the following resumes and rate each one on overall quality, strengths, and areas for improvement.

${resumesBlock}

## Instructions:
Evaluate each resume independently, then output a JSON array with EXACTLY this structure (no markdown):

[
  {
    "name": "<resume name exactly as provided>",
    "overallScore": <number 0-100>,
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "improvements": ["improvement area 1", "improvement area 2", "improvement area 3"]
  }
]

Guidelines:
- Score each resume on content quality, formatting, impact/achievements, and clarity
- Provide 3-5 specific strengths per resume
- Provide 3-5 specific, actionable improvement areas per resume
- Be honest — not all resumes are equal
- Return ONLY the JSON array, no other text`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "[]";
  const jsonStr = extractJson(content);

  return JSON.parse(jsonStr);
}
