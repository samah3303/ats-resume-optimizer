import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";
import { recordAiUsageLog } from "./usage";
import { extractLocalKeywordMatch } from "../keyword-matcher";
import {
  JobDescriptionGenerationParams,
  GeneratedJobDescription,
  CandidateScreenResult,
  CandidateRecommendation,
} from "@/types/ai";

/**
 * Deterministic fallback for Job Description generation when AI client is unavailable or encounters an error.
 */
function getFallbackJobDescription(params: JobDescriptionGenerationParams): GeneratedJobDescription {
  const skillsList = params.keySkills && params.keySkills.length > 0
    ? params.keySkills.join(", ")
    : "modern tools, industry methodologies, and agile practices";

  const seniority = params.seniority || "Mid-Senior";
  const department = params.department || "Engineering";
  const location = params.location || "Remote";

  let minSalary = 85000;
  let maxSalary = 135000;
  if (/lead|principal|staff|director|vp|head/i.test(params.title) || /lead|director|principal/i.test(seniority)) {
    minSalary = 135000;
    maxSalary = 200000;
  } else if (/junior|entry|intern|associate/i.test(params.title) || /entry|junior/i.test(seniority)) {
    minSalary = 60000;
    maxSalary = 90000;
  } else if (/senior/i.test(params.title) || /senior/i.test(seniority)) {
    minSalary = 110000;
    maxSalary = 160000;
  }

  return {
    title: params.title,
    description: `### About the Position\nWe are looking for a skilled and motivated **${params.title}** to join our **${department}** team (${location}). In this role, you will lead impactful initiatives, build robust and scalable systems, and collaborate cross-functionally to deliver measurable business results.\n\n### Key Responsibilities\n- Design, develop, and maintain high-quality, high-performance solutions.\n- Collaborate closely with product management, design, and cross-functional engineering teams.\n- Champion engineering excellence, code reviews, and automated testing.\n- Solve complex technical challenges and optimize system scalability and reliability.\n- Mentor fellow team members and contribute to technical decision-making.`,
    requirements: `### Qualifications & Requirements\n- Proven professional experience as a ${params.title} or in a closely related capacity.\n- Hands-on expertise with ${skillsList}.\n- Strong problem-solving, architectural, and analytical capabilities.\n- Experience in agile development, CI/CD pipelines, and cloud environments.\n- Outstanding verbal and written communication skills.\n\n### Preferred Qualifications\n- Degree in Computer Science, Information Technology, or relevant real-world equivalent.\n- Track record of shipping customer-facing features at scale.`,
    suggestedSalaryMin: minSalary,
    suggestedSalaryMax: maxSalary,
    screeningQuestions: [
      `How many years of professional experience do you have with ${params.keySkills?.[0] || params.title}?`,
      `Describe a recent high-impact technical project you led from conception through deployment.`,
      `How do you handle technical debt while keeping up with rapid product iteration deadlines?`,
      `What are your compensation expectations and what is your notice period / target start date?`,
    ],
  };
}

/**
 * AI Job Description Generator
 * Creates structured, production-ready JDs complete with responsibilities, requirements, salary bands, and screening questions.
 */
export async function generateJobDescription(
  params: JobDescriptionGenerationParams
): Promise<GeneratedJobDescription> {
  const fallback = getFallbackJobDescription(params);

  try {
    const prompt = `You are an elite Talent Acquisition Leader and Executive Hiring Manager. Generate a structured, comprehensive, and high-converting Job Description for the following opening:

Role Title: ${params.title}
${params.department ? `Department: ${params.department}` : ""}
${params.location ? `Location: ${params.location}` : "Location: Remote / Hybrid"}
${params.seniority ? `Seniority Level: ${params.seniority}` : ""}
${params.keySkills && params.keySkills.length > 0 ? `Key Skills & Tech Stack: ${params.keySkills.join(", ")}` : ""}

## Instructions:
Generate a structured JSON object with the following fields:
1. "title": Exact job title (e.g. "${params.title}")
2. "description": Rich Markdown formatted overview detailing the mission, team culture, and 5-7 core responsibilities.
3. "requirements": Rich Markdown formatted qualifications including hard skills, soft skills, years of experience, and nice-to-have qualifications.
4. "suggestedSalaryMin": Estimated annual minimum base salary in USD (integer, e.g. 95000).
5. "suggestedSalaryMax": Estimated annual maximum base salary in USD (integer, e.g. 150000).
6. "screeningQuestions": Array of 4-6 targeted, role-specific screening interview questions.

Output ONLY a valid JSON object matching this exact structure (no commentary or markdown wrappers):
{
  "title": "${params.title}",
  "description": "### About the Role\\n...\\n\\n### Key Responsibilities\\n- ...",
  "requirements": "### Qualifications & Requirements\\n- ...\\n\\n### Nice to Have\\n- ...",
  "suggestedSalaryMin": ${fallback.suggestedSalaryMin},
  "suggestedSalaryMax": ${fallback.suggestedSalaryMax},
  "screeningQuestions": [
    "Question 1...",
    "Question 2...",
    "Question 3..."
  ]
}`;

    const client = getDeepSeek();
    const model = getAiModelName();

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 3000,
    });

    if (response.usage && params.userId) {
      await recordAiUsageLog({
        userId: params.userId,
        feature: "recruiter_jd",
        model,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
      });
    }

    const rawContent = response.choices[0]?.message?.content || "";
    const parsed = parseJsonSafely<Partial<GeneratedJobDescription>>(rawContent, fallback);

    return {
      title: parsed.title || fallback.title,
      description: parsed.description || fallback.description,
      requirements: parsed.requirements || fallback.requirements,
      suggestedSalaryMin: typeof parsed.suggestedSalaryMin === "number" ? parsed.suggestedSalaryMin : fallback.suggestedSalaryMin,
      suggestedSalaryMax: typeof parsed.suggestedSalaryMax === "number" ? parsed.suggestedSalaryMax : fallback.suggestedSalaryMax,
      screeningQuestions: Array.isArray(parsed.screeningQuestions) && parsed.screeningQuestions.length > 0
        ? parsed.screeningQuestions
        : fallback.screeningQuestions,
    };
  } catch (error) {
    console.error("AI Job Description generation failed, using fallback:", error);
    return fallback;
  }
}

/**
 * Deterministic fallback for ATS Candidate Resume Screening.
 */
function getFallbackScreenResult(
  resumeText: string,
  jobTitle: string,
  jobRequirements: string
): CandidateScreenResult {
  const localMatch = extractLocalKeywordMatch(resumeText, `${jobTitle}\n${jobRequirements}`);
  const score = Math.round((localMatch.keywordsMatchPct + localMatch.formatScore + localMatch.impactScore) / 3);

  let recommendation: CandidateRecommendation = "hold";
  if (score >= 80) {
    recommendation = "strong_hire";
  } else if (score >= 68) {
    recommendation = "hire";
  } else if (score >= 50) {
    recommendation = "hold";
  } else {
    recommendation = "reject";
  }

  const matched = localMatch.keywords.matched.length > 0
    ? localMatch.keywords.matched
    : localMatch.skills.present;
  const missing = localMatch.keywords.missing.length > 0
    ? localMatch.keywords.missing
    : localMatch.skills.missing;

  return {
    fitScore: score,
    fitSummary: `Candidate matches ${localMatch.keywordsMatchPct}% of key technical criteria for ${jobTitle}. Shows good alignment on core skills with some potential gaps in specialized requirements.`,
    matchedSkills: matched.slice(0, 10),
    missingSkills: missing.slice(0, 10),
    recommendation,
  };
}

/**
 * Candidate ATS Auto-Screener
 * Computes fitScore (0-100), fitSummary, matchedSkills[], missingSkills[], and recommendation.
 */
export async function screenCandidateResume(
  resumeText: string,
  jobTitle: string,
  jobRequirements: string,
  userId?: string
): Promise<CandidateScreenResult> {
  const fallback = getFallbackScreenResult(resumeText, jobTitle, jobRequirements);

  try {
    const localMatch = extractLocalKeywordMatch(resumeText, `${jobTitle}\n${jobRequirements}`);

    const prompt = `You are an expert ATS (Applicant Tracking System) recruiter and technical screener.
Evaluate the candidate's resume objectively against the target job posting title and requirements.

Job Title: ${jobTitle}

## Job Requirements & Context:
${jobRequirements.slice(0, 3000)}

## Candidate Resume:
${resumeText.slice(0, 3000)}

## Pre-Analysis Data:
- Preliminary Keyword Match: ${localMatch.keywordsMatchPct}%
- Detected Hard Skills: ${localMatch.skills.present.join(", ") || "None"}
- Potential Missing Skills: ${localMatch.skills.missing.join(", ") || "None"}

## Instructions:
Perform a deep ATS screening analysis. Return a JSON object with:
1. "fitScore": An integer between 0 and 100 reflecting overall job qualification match.
2. "fitSummary": 2-3 concise sentences summarizing why the candidate is or is not a match for this role, highlighting key strengths and major gaps.
3. "matchedSkills": Array of strings representing exact skills, frameworks, tools, or requirements in the JD that the candidate possesses.
4. "missingSkills": Array of strings representing missing hard skills, qualifications, or requirements from the JD that are not clearly demonstrated.
5. "recommendation": One of:
   - "strong_hire" (Score >= 85: exceeds core requirements, strong background)
   - "hire" (Score 70-84: meets core requirements with good upside)
   - "hold" (Score 50-69: borderline fit, missing a few key skills)
   - "reject" (Score < 50: misses critical qualifications)

Output ONLY valid JSON matching this exact format (no markdown fences or additional explanation):
{
  "fitScore": 82,
  "fitSummary": "Candidate demonstrates strong full-stack engineering background...",
  "matchedSkills": ["TypeScript", "React", "PostgreSQL"],
  "missingSkills": ["Kubernetes", "GraphQL"],
  "recommendation": "hire"
}`;

    const client = getDeepSeek();
    const model = getAiModelName();

    const response = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2000,
    });

    if (response.usage && userId) {
      await recordAiUsageLog({
        userId,
        feature: "recruiter_screening",
        model,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
      });
    }

    const rawContent = response.choices[0]?.message?.content || "";
    const parsed = parseJsonSafely<Partial<CandidateScreenResult>>(rawContent, fallback);

    let rawScore = typeof parsed.fitScore === "number" ? parsed.fitScore : fallback.fitScore;
    const fitScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    const validRecommendations: CandidateRecommendation[] = ["strong_hire", "hire", "hold", "reject"];
    let recommendation: CandidateRecommendation = validRecommendations.includes(parsed.recommendation as CandidateRecommendation)
      ? (parsed.recommendation as CandidateRecommendation)
      : fallback.recommendation;

    return {
      fitScore,
      fitSummary: parsed.fitSummary || fallback.fitSummary,
      matchedSkills: Array.isArray(parsed.matchedSkills) && parsed.matchedSkills.length > 0
        ? parsed.matchedSkills
        : fallback.matchedSkills,
      missingSkills: Array.isArray(parsed.missingSkills) && parsed.missingSkills.length > 0
        ? parsed.missingSkills
        : fallback.missingSkills,
      recommendation,
    };
  } catch (error) {
    console.error("AI Candidate Resume screening failed, using fallback:", error);
    return fallback;
  }
}
