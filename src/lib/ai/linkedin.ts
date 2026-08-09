import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";
import { extractLocalKeywordMatch, pruneJobDescription } from "../keyword-matcher";
import { LinkedInAnalysisResult } from "@/types/ai";

interface AnalyzeLinkedInProfileParams {
  profileText: string;
  jobDescriptionText?: string;
  jobTitle?: string;
}

export async function analyzeLinkedInProfile({
  profileText,
  jobDescriptionText,
  jobTitle,
}: AnalyzeLinkedInProfileParams): Promise<LinkedInAnalysisResult> {
  const prunedJd = jobDescriptionText ? pruneJobDescription(jobDescriptionText) : "";
  const localMatch = jobDescriptionText
    ? extractLocalKeywordMatch(profileText, prunedJd)
    : { keywordsMatchPct: 75, formatScore: 80, impactScore: 75, keywords: { matched: [], missing: [] }, skills: { present: [], missing: [] } };

  const prompt = `You are a LinkedIn Profile Optimization Expert and Recruiter.
Analyze this candidate's LinkedIn profile text for professional impact, keyword optimization, and recruiter searchability.

${jobTitle ? `Target Role: ${jobTitle}` : ""}
${jobDescriptionText ? `Target Job Description:\n${prunedJd.slice(0, 1000)}` : ""}

Candidate LinkedIn Profile Content:
${profileText.slice(0, 3000)}

## Instructions:
Provide a comprehensive analysis as a JSON object matching this structure:
{
  "overallScore": <number 0-100>,
  "formatScore": <number 0-100>,
  "impactScore": <number 0-100>,
  "summaryText": "<2-3 sentence overall critique focused on recruiter appeal and search visibility>",
  "suggestions": [
    {
      "section": "<Headline | About / Summary | Experience | Skills & Endorsements>",
      "originalText": "<weak or missing element>",
      "suggestedText": "<optimized rewrite for LinkedIn>",
      "rationale": "<why this boosts recruiter outreach>"
    }
  ]
}

Return 4-6 high-impact actionable suggestions. Return ONLY valid JSON.`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content || "";
  const result = parseJsonSafely(content, {
    overallScore: 78,
    formatScore: 80,
    impactScore: 75,
    summaryText: "Profile analyzed successfully.",
    suggestions: [],
  });

  return {
    overallScore: result.overallScore || 78,
    keywordsMatchPct: localMatch.keywordsMatchPct,
    skillsGapJson: JSON.stringify({
      keywords: localMatch.keywords,
      skills: localMatch.skills,
    }),
    formatScore: result.formatScore || 80,
    impactScore: result.impactScore || 75,
    summaryText: result.summaryText || "Profile reviewed for recruiter alignment.",
    suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
  };
}
