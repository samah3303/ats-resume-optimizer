import { getDeepSeek, extractJson } from "./deepseek";

export interface AutoFillResult {
  suggestedName: string;
  suggestedTitle: string;
  suggestedSkills: string[];
  suggestedPositions: string[];
  suggestedIndustry: string;
  suggestedCountry: string;
  suggestedJobTypes: string[];
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

function extractRegexUrls(text: string) {
  let linkedinUrl = "";
  let githubUrl = "";

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?/i);
  if (linkedinMatch) {
    linkedinUrl = linkedinMatch[0].startsWith("http") ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
  }

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?/i);
  if (githubMatch) {
    githubUrl = githubMatch[0].startsWith("http") ? githubMatch[0] : `https://${githubMatch[0]}`;
  }

  return { linkedinUrl, githubUrl };
}

export async function autoFillFromResume(
  resumeText: string
): Promise<AutoFillResult> {
  const regexUrls = extractRegexUrls(resumeText);

  const prompt = `You are an expert resume parser. Extract key candidate details from this resume text. Output ONLY a JSON object (no markdown):

{
  "suggestedName": "<Full name from resume>",
  "suggestedTitle": "<Current or most recent job title>",
  "suggestedSkills": ["skill1", "skill2"],
  "suggestedPositions": ["3-5 target roles candidate is suitable for based on experience"],
  "suggestedIndustry": "<Primary industry domain, e.g. Technology / SaaS, Finance / FinTech, Healthcare / HealthTech, etc.>",
  "suggestedCountry": "<Candidate country or location if mentioned, e.g. United Arab Emirates, United States, United Kingdom, Canada, Germany, India, Singapore, Australia, etc.>",
  "suggestedJobTypes": ["Full-time", "Remote", etc.],
  "linkedinUrl": "<LinkedIn URL if present>",
  "githubUrl": "<GitHub URL if present>",
  "portfolioUrl": "<Personal website or portfolio URL if present>"
}

Resume text:
${resumeText.slice(0, 5000)}`;

  let llmData: Partial<AutoFillResult> = {};
  try {
    const response = await getDeepSeek().chat.completions.create({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonStr = extractJson(content);
    llmData = JSON.parse(jsonStr);
  } catch {
    llmData = {};
  }

  const normalizeUrl = (url?: string) => {
    if (!url || typeof url !== "string") return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  };

  return {
    suggestedName: llmData.suggestedName || "",
    suggestedTitle: llmData.suggestedTitle || "",
    suggestedSkills: Array.isArray(llmData.suggestedSkills) ? llmData.suggestedSkills : [],
    suggestedPositions: Array.isArray(llmData.suggestedPositions) ? llmData.suggestedPositions : [],
    suggestedIndustry: llmData.suggestedIndustry || "",
    suggestedCountry: llmData.suggestedCountry || "",
    suggestedJobTypes: Array.isArray(llmData.suggestedJobTypes) ? llmData.suggestedJobTypes : [],
    linkedinUrl: regexUrls.linkedinUrl || normalizeUrl(llmData.linkedinUrl),
    githubUrl: regexUrls.githubUrl || normalizeUrl(llmData.githubUrl),
    portfolioUrl: normalizeUrl(llmData.portfolioUrl),
  };
}
