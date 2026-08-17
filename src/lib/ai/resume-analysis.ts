import {
  getDeepSeek,
  getAiModelName,
  parseJsonSafely,
  buildCachedPrompt,
  sanitizeJdPayload,
  sanitizeResumePayload,
} from "./client";
import { extractLocalKeywordMatch, pruneJobDescription } from "../keyword-matcher";

// Simple in-memory cache to prevent duplicate API calls for identical scans
const analysisCache = new Map<string, any>();

interface AnalyzeResumeParams {
  resumeText: string;
  jobDescriptionText: string;
  positionTitle?: string;
  jobType?: string;
}

export async function analyzeResumeAgainstJD({
  resumeText,
  jobDescriptionText,
  positionTitle,
  jobType,
}: AnalyzeResumeParams): Promise<{
  overallScore: number;
  keywordsMatchPct: number;
  skillsGapJson: string;
  formatScore: number;
  impactScore: number;
  summaryText: string;
  suggestions: Array<{
    section: string;
    originalText: string;
    suggestedText: string;
    rationale: string;
  }>;
}> {
  // Strategy 2: In-Memory Caching (0 Token Cost for Repeated Scans)
  const cacheKey = `${resumeText.slice(0, 200)}_${jobDescriptionText.slice(0, 200)}`;
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey);
  }

  // Strategy 3: Local Deterministic Keyword Pre-Matching
  const prunedJd = pruneJobDescription(jobDescriptionText);
  const localMatch = extractLocalKeywordMatch(resumeText, prunedJd);

  // Check if AI API key is configured
  let aiAvailable = false;
  try {
    getDeepSeek();
    aiAvailable = true;
  } catch {
    aiAvailable = false;
  }

  // Fallback: If no API key is provided, return instant local analysis
  if (!aiAvailable) {
    const missingItems = [
      ...localMatch.skills.missing,
      ...localMatch.keywords.missing,
    ].slice(0, 8);

    const localSuggestions = missingItems.map((item, idx) => ({
      section: idx % 2 === 0 ? "Work Experience" : "Technical Skills",
      originalText: `Missing key requirement: "${item}"`,
      suggestedText: `Engineered solutions incorporating "${item}" with quantified ROI performance metrics.`,
      rationale: `Including "${item}" directly clears ATS keyword scanning algorithms for ${positionTitle || "this role"}.`,
    }));

    const localResult = {
      overallScore: Math.round((localMatch.keywordsMatchPct + localMatch.formatScore + localMatch.impactScore) / 3),
      keywordsMatchPct: localMatch.keywordsMatchPct,
      skillsGapJson: JSON.stringify({
        keywords: localMatch.keywords,
        skills: localMatch.skills,
      }),
      formatScore: localMatch.formatScore,
      impactScore: localMatch.impactScore,
      summaryText: `Your resume matches ${localMatch.keywordsMatchPct}% of key requirements for ${positionTitle || "this position"}. Incorporate the targeted suggestions below to push your ATS score to 75%–85%+.`,
      suggestions: localSuggestions,
    };
    analysisCache.set(cacheKey, localResult);
    return localResult;
  }

  const cleanJd = sanitizeJdPayload(jobDescriptionText, 2200);
  const cleanResume = sanitizeResumePayload(resumeText, 2500);

  const featureSystemInstructions = `Role: ATS Resume Specialist. Generate 6 to 9 high-impact suggestions elevating ATS resume scores to 80%+ using STAR metrics. Output strict JSON: {"overallScore": number, "summaryText": string, "suggestions": [{"section": string, "originalText": string, "suggestedText": string, "rationale": string}]}`;

  const dynamicPayload = `Target Position: ${positionTitle || "Software Engineer"}
Pre-analyzed Match %: ${localMatch.keywordsMatchPct}%
Missing Keywords: ${localMatch.keywords.missing.join(", ")}
Missing Skills: ${localMatch.skills.missing.join(", ")}

## Job Description:
${cleanJd}

## Candidate Resume:
${cleanResume}`;

  const messages = buildCachedPrompt(featureSystemInstructions, dynamicPayload);

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: messages as any,
    temperature: 0.2,
    max_tokens: 2200,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const result = parseJsonSafely<Record<string, any>>(content, {});

  const suggestions = Array.isArray(result.suggestions) ? result.suggestions : [];

  const finalResult = {
    overallScore: typeof result.overallScore === "number" ? result.overallScore : Math.round((localMatch.keywordsMatchPct + localMatch.formatScore + localMatch.impactScore) / 3),
    keywordsMatchPct: localMatch.keywordsMatchPct,
    skillsGapJson: JSON.stringify({
      keywords: localMatch.keywords,
      skills: localMatch.skills,
    }),
    formatScore: localMatch.formatScore,
    impactScore: localMatch.impactScore,
    summaryText: result.summaryText || `Analysis completed. Applying the ${suggestions.length} suggestions below will elevate your ATS score to 78%–85%+.`,
    suggestions,
  };

  analysisCache.set(cacheKey, finalResult);
  return finalResult;
}
