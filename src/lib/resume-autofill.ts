import { getDeepSeek, extractJson } from "./deepseek";

export async function autoFillFromResume(
  resumeText: string
): Promise<{
  suggestedName: string;
  suggestedTitle: string;
  suggestedSkills: string[];
  suggestedPositions: string[];
  suggestedIndustry: string;
}> {
  const prompt = `You are a resume parser. Extract key information from this resume text. Output ONLY a JSON object (no markdown):

{
  "suggestedName": "Full name from resume",
  "suggestedTitle": "Current or most recent job title",
  "suggestedSkills": ["skill1", "skill2", ...],
  "suggestedPositions": ["target role 1", "target role 2", ...],
  "suggestedIndustry": "primary industry domain"
}

Resume text:
${resumeText.slice(0, 4000)}`;

  const response = await getDeepSeek().chat.completions.create({
    model: "deepseek-v4-flash",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const jsonStr = extractJson(content);
  try {
    return JSON.parse(jsonStr);
  } catch {
    return {
      suggestedName: "",
      suggestedTitle: "",
      suggestedSkills: [],
      suggestedPositions: [],
      suggestedIndustry: "",
    };
  }
}
