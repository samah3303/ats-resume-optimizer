import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";
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

  // Strategy 4: Pruned Prompt (Passing Pre-Extracted Gaps)
  const prompt = `You are an expert ATS resume coach. Your objective is to generate 7 to 10 COMPREHENSIVE, section-by-section suggestions to elevate this candidate's ATS score to 75%–80%+.

CRITICAL INSTRUCTIONS:
1. Every suggestion MUST be strictly derived from this specific resume and Job Description.
2. "originalText" MUST quote an actual weak sentence or bullet directly from the candidate's resume.
3. "suggestedText" MUST incorporate missing hard skills, frameworks, tools, or qualification keywords directly requested in the Job Description, rewritten using the STAR method with numbers & ROI.
4. Output 7 to 10 suggestions spanning Summary, Work Experience, Technical Skills, Projects, and Education/Certifications.

${positionTitle ? `Target Position: ${positionTitle}` : ""}
Pre-analyzed Keyword Match %: ${localMatch.keywordsMatchPct}%
Missing Keywords to Target: ${localMatch.keywords.missing.join(", ")}
Missing Skills: ${localMatch.skills.missing.join(", ")}

## Job Description Excerpt:
${prunedJd.slice(0, 2000)}

## Full Candidate Resume Text:
${resumeText.slice(0, 3000)}

Output a JSON object with EXACTLY this structure:

{
  "overallScore": ${Math.round((localMatch.keywordsMatchPct + localMatch.formatScore + localMatch.impactScore) / 3)},
  "summaryText": "<2 sentence assessment highlighting how these changes reach 75-80%+ score>",
  "suggestions": [
    {
      "section": "Experience",
      "originalText": "<exact weak sentence from resume>",
      "suggestedText": "<rewritten bullet point incorporating missing skills & metrics>",
      "rationale": "<why this improves ATS match for this specific JD>"
    }
  ]
}`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 3500,
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
