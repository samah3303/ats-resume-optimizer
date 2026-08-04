/**
 * Multi-Step ATS Analysis Agent
 *
 * Replaces the single-prompt analyzeResumeAgainstJD() with a proper agentic workflow:
 *   Step 1: Extract structured requirements from JD
 *   Step 2: Extract structured claims/skills from Resume
 *   Step 3: Map gaps + calculate detailed match scores
 *   Step 4: Generate specific rewrite suggestions
 *   Step 5: Self-verify suggestions against JD requirements
 *
 * Uses Vercel AI SDK with DeepSeek as the backing model.
 */

import { generateText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { extractLocalKeywordMatch, pruneJobDescription } from "@/lib/keyword-matcher";
import { parseJsonSafely } from "@/lib/deepseek";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface JdRequirements {
  title: string;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  qualifications: string[];
  yearsExperience: string;
  educationLevel: string;
  keyPhrases: string[];
}

export interface ResumeClaims {
  name: string;
  skills: string[];
  experiences: Array<{ title: string; company: string; duration: string; bullets: string[] }>;
  education: Array<{ degree: string; school: string }>;
  certifications: string[];
  metrics: string[];
}

export interface SkillGap {
  skill: string;
  type: "must-have" | "nice-to-have";
  status: "present" | "missing" | "partial";
  resumeEvidence: string;
  impact: "high" | "medium" | "low";
}

export interface AgentSuggestion {
  section: string;
  originalText: string;
  suggestedText: string;
  rationale: string;
  targetedSkill: string;
  impact: "high" | "medium" | "low";
}

export interface AgentAnalysisResult {
  overallScore: number;
  keywordsMatchPct: number;
  formatScore: number;
  impactScore: number;
  summaryText: string;
  skillsGapJson: string;
  suggestions: AgentSuggestion[];
  jdRequirements: JdRequirements;
  resumeClaims: ResumeClaims;
  skillGaps: SkillGap[];
  agentSteps: number;
  tokensUsed: number;
}

// ─── Provider Setup ─────────────────────────────────────────────────────────

function getProvider() {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY required");
  return createOpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  });
}

// ─── Step 1: Extract JD Requirements ────────────────────────────────────────

async function extractJdRequirements(jdText: string, jdTitle?: string): Promise<JdRequirements> {
  const provider = getProvider();
  const model = provider("deepseek-v4-flash");

  const prompt = `Extract structured requirements from this job description. Output ONLY valid JSON:

{
  "title": "job title",
  "mustHaveSkills": ["skill1", "skill2"],
  "niceToHaveSkills": ["skill1", "skill2"],
  "responsibilities": ["responsibility 1", "responsibility 2"],
  "qualifications": ["qualification 1", "qualification 2"],
  "yearsExperience": "e.g., 3-5 years",
  "educationLevel": "e.g., Bachelor's in CS",
  "keyPhrases": ["important phrase 1", "important phrase 2"]
}

${jdTitle ? `Job Title: ${jdTitle}` : ""}

## Job Description:
${pruneJobDescription(jdText).slice(0, 3000)}`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.1,
    maxOutputTokens: 1500,
  });

  return parseJsonSafely<JdRequirements>(result.text, {
    title: jdTitle || "Unknown Position",
    mustHaveSkills: [],
    niceToHaveSkills: [],
    responsibilities: [],
    qualifications: [],
    yearsExperience: "",
    educationLevel: "",
    keyPhrases: [],
  });
}

// ─── Step 2: Extract Resume Claims ──────────────────────────────────────────

async function extractResumeClaims(resumeText: string, resumeName?: string): Promise<ResumeClaims> {
  const provider = getProvider();
  const model = provider("deepseek-v4-flash");

  const prompt = `Extract structured information from this resume. Output ONLY valid JSON:

{
  "name": "candidate name",
  "skills": ["skill1", "skill2"],
  "experiences": [
    {"title": "Software Engineer", "company": "Acme Corp", "duration": "2020-2023", "bullets": ["bullet 1", "bullet 2"]}
  ],
  "education": [{"degree": "BS Computer Science", "school": "MIT"}],
  "certifications": ["AWS Solutions Architect"],
  "metrics": ["increased revenue 30%", "managed team of 5"]
}

## Resume${resumeName ? `: ${resumeName}` : ""}:
${resumeText.slice(0, 4000)}`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.1,
    maxOutputTokens: 2000,
  });

  return parseJsonSafely<ResumeClaims>(result.text, {
    name: resumeName || "Candidate",
    skills: [],
    experiences: [],
    education: [],
    certifications: [],
    metrics: [],
  });
}

// ─── Step 3: Map Skill Gaps ─────────────────────────────────────────────────

async function mapSkillGaps(
  jdReqs: JdRequirements,
  resumeClaims: ResumeClaims,
  localMatch: ReturnType<typeof extractLocalKeywordMatch>
): Promise<SkillGap[]> {
  const provider = getProvider();
  const model = provider("deepseek-v4-flash");

  const prompt = `Compare the job requirements against the candidate's resume and identify specific skill gaps. Output a JSON array:

[
  {
    "skill": "Kubernetes",
    "type": "must-have",
    "status": "missing",
    "resumeEvidence": "No mention of container orchestration",
    "impact": "high"
  }
]

Status must be: "present", "missing", or "partial"
Impact must be: "high", "medium", or "low"

## Job Requirements:
${JSON.stringify(jdReqs, null, 2)}

## Candidate Claims:
${JSON.stringify(resumeClaims, null, 2)}

## Local Keyword Analysis:
- Matched: ${localMatch.keywords.matched.join(", ")}
- Missing: ${localMatch.keywords.missing.join(", ")}`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.2,
    maxOutputTokens: 1500,
  });

  return parseJsonSafely<SkillGap[]>(result.text, []);
}

// ─── Step 4: Generate Suggestions ───────────────────────────────────────────

async function generateAgentSuggestions(
  jdReqs: JdRequirements,
  resumeClaims: ResumeClaims,
  skillGaps: SkillGap[],
  resumeText: string
): Promise<AgentSuggestion[]> {
  const provider = getProvider();
  const model = provider("deepseek-v4-flash");

  const highImpactGaps = skillGaps.filter((g) => g.impact === "high");
  const mediumImpactGaps = skillGaps.filter((g) => g.impact === "medium");

  const prompt = `You are an expert ATS resume coach. Generate 4-6 specific, actionable suggestions to rewrite the resume for this job.

## Target Job:
${jdReqs.title}
Must-have skills: ${jdReqs.mustHaveSkills.join(", ")}
Key phrases: ${jdReqs.keyPhrases.join(", ")}

## Top Skill Gaps to Address:
${highImpactGaps.map((g) => `- [${g.type}] ${g.skill}: ${g.status} (${g.resumeEvidence})`).join("\n")}
${mediumImpactGaps.map((g) => `- [${g.type}] ${g.skill}: ${g.status}`).join("\n")}

## Resume Excerpt:
${resumeText.slice(0, 2500)}

Output a JSON array of suggestions:
[
  {
    "section": "Experience",
    "originalText": "<exact weak sentence from resume under 120 chars>",
    "suggestedText": "<rewritten bullet with metrics and targeted keywords>",
    "rationale": "<why this improves ATS match for this specific JD>",
    "targetedSkill": "<which skill from the gap list this addresses>",
    "impact": "high"
  }
]

Guidelines:
- Each suggestion MUST address a specific gap from the list above
- Use metrics and numbers from the candidate's actual experience
- Prioritize high-impact must-have skill gaps
- Keep originalText under 120 characters (exact quote from resume)
- impact: "high" if addresses must-have gap, "medium" if nice-to-have`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.3,
    maxOutputTokens: 2500,
  });

  return parseJsonSafely<AgentSuggestion[]>(result.text, []);
}

// ─── Step 5: Self-Verify Suggestions ────────────────────────────────────────

async function verifySuggestions(
  suggestions: AgentSuggestion[],
  jdReqs: JdRequirements
): Promise<AgentSuggestion[]> {
  if (suggestions.length === 0) return suggestions;

  const provider = getProvider();
  const model = provider("deepseek-v4-flash");

  const prompt = `Verify that these resume suggestions actually address the job requirements. Flag any that are misaligned. Output a JSON array of corrected suggestions:

## Job Requirements:
Must-have: ${jdReqs.mustHaveSkills.join(", ")}
Nice-to-have: ${jdReqs.niceToHaveSkills.join(", ")}
Key phrases: ${jdReqs.keyPhrases.join(", ")}

## Suggestions to Verify:
${JSON.stringify(suggestions, null, 2)}

## Instructions:
- For each suggestion, check if it truly addresses a job requirement
- If a suggestion is off-target, improve the "suggestedText" to better match
- Keep the structure identical, only modify "suggestedText" and "rationale" if needed
- Return the same number of suggestions
- Return ONLY the JSON array, no other text`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.1,
    maxOutputTokens: 2500,
  });

  const verified = parseJsonSafely<AgentSuggestion[]>(result.text, suggestions);
  return verified.length === suggestions.length ? verified : suggestions;
}

// ─── Aggregated Score Calculation ───────────────────────────────────────────

function calculateScores(
  localMatch: ReturnType<typeof extractLocalKeywordMatch>,
  skillGaps: SkillGap[],
  jdReqs: JdRequirements
): { overallScore: number; keywordsMatchPct: number; formatScore: number; impactScore: number } {
  const mustHaveTotal = jdReqs.mustHaveSkills.length || 1;
  const mustHavePresent = skillGaps.filter(
    (g) => g.type === "must-have" && g.status === "present"
  ).length;

  const niceToHaveTotal = jdReqs.niceToHaveSkills.length || 1;
  const niceToHavePresent = skillGaps.filter(
    (g) => g.type === "nice-to-have" && (g.status === "present" || g.status === "partial")
  ).length;

  // Weighted: must-have = 70% weight, nice-to-have = 30%
  const agentMatchPct = Math.round(
    (mustHavePresent / mustHaveTotal) * 70 + (niceToHavePresent / niceToHaveTotal) * 30
  );

  // Blend agent match with local keyword match (60/40)
  const blendedMatchPct = Math.round(
    agentMatchPct * 0.6 + localMatch.keywordsMatchPct * 0.4
  );

  const overallScore = Math.round(
    (blendedMatchPct + localMatch.formatScore + localMatch.impactScore) / 3
  );

  return {
    overallScore,
    keywordsMatchPct: blendedMatchPct,
    formatScore: localMatch.formatScore,
    impactScore: localMatch.impactScore,
  };
}

// ─── Main Agent Runner ──────────────────────────────────────────────────────

// Simple in-memory cache for the agent (cache key = resume+JD hash)
const agentCache = new Map<string, AgentAnalysisResult>();

export async function runAtsAnalysisAgent(params: {
  resumeText: string;
  resumeName?: string;
  jobDescriptionText: string;
  jdTitle?: string;
}): Promise<AgentAnalysisResult> {
  const cacheKey = `${params.resumeText.slice(0, 200)}__${params.jobDescriptionText.slice(0, 200)}`;
  if (agentCache.has(cacheKey)) {
    return agentCache.get(cacheKey)!;
  }

  const startTime = Date.now();
  let totalTokens = 0;

  // Pre-compute local keyword match (free)
  const prunedJd = pruneJobDescription(params.jobDescriptionText);
  const localMatch = extractLocalKeywordMatch(params.resumeText, prunedJd);

  // Step 1: Extract JD requirements
  const jdReqs = await extractJdRequirements(
    params.jobDescriptionText,
    params.jdTitle
  );

  // Step 2: Extract resume claims
  const resumeClaims = await extractResumeClaims(
    params.resumeText,
    params.resumeName
  );

  // Step 3: Map skill gaps
  const skillGaps = await mapSkillGaps(jdReqs, resumeClaims, localMatch);

  // Step 4: Generate suggestions
  const suggestions = await generateAgentSuggestions(
    jdReqs,
    resumeClaims,
    skillGaps,
    params.resumeText
  );

  // Step 5: Self-verify suggestions
  const verifiedSuggestions = await verifySuggestions(suggestions, jdReqs);

  // Calculate scores
  const scores = calculateScores(localMatch, skillGaps, jdReqs);

  // Generate summary
  const highGaps = skillGaps.filter((g) => g.impact === "high" && g.status === "missing");
  const partialGaps = skillGaps.filter((g) => g.impact === "high" && g.status === "partial");
  const summaryText = [
    `Your resume matches ${scores.keywordsMatchPct}% of key requirements for ${jdReqs.title || "this position"}.`,
    highGaps.length > 0
      ? `Critical gaps: ${highGaps.map((g) => g.skill).join(", ")}.`
      : "",
    partialGaps.length > 0
      ? `Partially addressed: ${partialGaps.map((g) => g.skill).join(", ")}.`
      : "",
    verifiedSuggestions.length > 0
      ? `${verifiedSuggestions.length} targeted suggestions provided.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const result: AgentAnalysisResult = {
    overallScore: scores.overallScore,
    keywordsMatchPct: scores.keywordsMatchPct,
    formatScore: scores.formatScore,
    impactScore: scores.impactScore,
    summaryText,
    skillsGapJson: JSON.stringify({
      jdRequirements: jdReqs,
      resumeClaims: resumeClaims,
      skillGaps,
      keywords: localMatch.keywords,
      skills: localMatch.skills,
    }),
    suggestions: verifiedSuggestions,
    jdRequirements: jdReqs,
    resumeClaims,
    skillGaps,
    agentSteps: 5,
    tokensUsed: totalTokens,
  };

  agentCache.set(cacheKey, result);

  console.log(
    `[analyze-agent] Completed in ${Date.now() - startTime}ms | ` +
    `Score: ${scores.overallScore} | Gaps: ${skillGaps.length} | ` +
    `Suggestions: ${verifiedSuggestions.length}`
  );

  return result;
}
