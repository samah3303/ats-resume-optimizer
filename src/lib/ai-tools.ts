import { aiChat, parseJsonSafely } from "@/lib/ai";

export async function analyzeAtsScore(resumeText: string): Promise<{
  overallScore: number;
  keywordScore: number;
  formatScore: number;
  impactScore: number;
  quantificationScore: number;
  details: string[];
  recommendations: string[];
}> {
  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume and score it. Return JSON:
{
  "overallScore": 0-100,
  "keywordScore": 0-100 (industry keywords density and relevance),
  "formatScore": 0-100 (ATS-friendly formatting),
  "impactScore": 0-100 (action verbs, achievement-oriented language),
  "quantificationScore": 0-100 (metrics, numbers, quantified achievements),
  "details": ["specific observation 1", "specific observation 2", ...],
  "recommendations": ["actionable improvement 1", "actionable improvement 2", ...]
}

Be honest and specific. Provide 5-8 details and 5-8 recommendations.`;

  const response = await aiChat(prompt, resumeText.slice(0, 5000), {
    temperature: 0.2,
  });
  return parseJsonSafely(response, {
    overallScore: 50,
    keywordScore: 50,
    formatScore: 50,
    impactScore: 50,
    quantificationScore: 50,
    details: ["Analysis unavailable"],
    recommendations: ["Try re-analyzing"],
  });
}

export function getToneInstruction(tone: string = "professional"): string {
  switch (tone.toLowerCase()) {
    case "conversational":
      return "Tone instruction: Adopt an approachable, warm, engaging, and conversational tone that sounds natural and genuine while remaining workplace-appropriate.";
    case "confident":
      return "Tone instruction: Adopt an assertive, bold, high-impact tone that directly highlights leadership, ownership, and measurable achievements with conviction.";
    case "humble":
      return "Tone instruction: Adopt a modest, collaborative, and team-oriented tone highlighting eagerness to learn, contribute, and support collective team success.";
    case "professional":
    default:
      return "Tone instruction: Adopt a polished, articulate, formal, and well-structured corporate professional tone.";
  }
}

export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  company: string,
  tone: string = "professional",
): Promise<string> {
  const toneInstruction = getToneInstruction(tone);
  const prompt = `Write a tailored cover letter for this candidate applying to the specified role. ${toneInstruction} Be specific to both the resume and job description. Keep it concise (3-4 paragraphs). Do NOT use generic filler. Output the cover letter text only, no JSON.`;

  const userMsg = `RESUME:\n${resumeText.slice(0, 3000)}\n\nJOB: ${jobTitle} at ${company}\nDESCRIPTION:\n${jobDescription?.slice(0, 2000) || "Not provided"}`;

  return aiChat(prompt, userMsg, { temperature: 0.5, maxTokens: 2000 });
}

export interface BulletUpgrade {
  section: string;
  original: string;
  updated: string;
  reason: string;
  keywordsAdded?: string[];
}

export interface NewPointToAdd {
  section: string;
  suggestedBullet: string;
  targetedRequirement: string;
  reason: string;
}

export interface SummaryUpgrade {
  suggestedSummary: string;
  reason: string;
}

export interface DetailedResumeUpdates {
  atsScoreForJob: number;
  missingSkills: string[];
  bulletUpgrades: BulletUpgrade[];
  newPointsToAdd: NewPointToAdd[];
  summaryUpgrade?: SummaryUpgrade;
  suggestions: {
    section: string;
    current: string;
    suggested: string;
    reason: string;
  }[];
}

export async function generateResumeUpdates(
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  tone: string = "professional",
): Promise<DetailedResumeUpdates> {
  const toneInstruction = getToneInstruction(tone);
  const prompt = `You are a world-class ATS Resume Optimization Architect. Compare the candidate's resume against the target job posting.
${toneInstruction} Apply this tone particularly to rewritten bullet points and the tailored professional summary.
Provide a detailed, itemized improvement plan categorized into:
1. "missingSkills": Array of technical skills, tools, and credentials explicitly in the job description that are absent from the resume.
2. "bulletUpgrades": Array of 3-6 specific bullet point upgrades where you identify a weak or generic bullet from the candidate's resume and rewrite it with high-impact action verbs, quantifiable metrics, and matching job keywords.
   Format: {"section": "Experience section or role title", "original": "exact original bullet", "updated": "optimized high-impact bullet", "reason": "why this boosts ATS ranking", "keywordsAdded": ["keyword1", "keyword2"]}
3. "newPointsToAdd": Array of 2-4 brand new accomplishment bullets the candidate should add to cover major job requirements that their resume currently omits entirely.
   Format: {"section": "Recommended placement", "suggestedBullet": "brand new bullet text", "targetedRequirement": "the unmet job requirement", "reason": "why to add"}
4. "summaryUpgrade": An ATS-tailored 2-3 sentence professional summary tailored specifically for this role.
   Format: {"suggestedSummary": "tailored summary", "reason": "why this grabs the recruiter and passes ATS"}
5. "atsScoreForJob": Estimated ATS match score (0-100).

Return valid JSON with this exact schema:
{
  "atsScoreForJob": 85,
  "missingSkills": ["Docker", "Kubernetes", "GraphQL"],
  "bulletUpgrades": [
    {
      "section": "Software Engineer at Acme Corp",
      "original": "Worked on backend services and APIs",
      "updated": "Architected high-throughput REST & GraphQL microservices, reducing p99 latency by 34% across 2M daily requests",
      "reason": "Replaces generic duty with quantified impact and target keywords (GraphQL, microservices, latency)",
      "keywordsAdded": ["GraphQL", "microservices", "latency"]
    }
  ],
  "newPointsToAdd": [
    {
      "section": "Work Experience or Technical Projects",
      "suggestedBullet": "Engineered automated CI/CD pipelines deploying Docker containers to Kubernetes clusters with zero downtime",
      "targetedRequirement": "Container orchestration & CI/CD deployment experience",
      "reason": "Directly addresses core requirement missing from the current resume"
    }
  ],
  "summaryUpgrade": {
    "suggestedSummary": "Full Stack Engineer with 5+ years optimizing distributed systems and web applications. Proven track record leading cloud migrations and delivering scalable microservices.",
    "reason": "Explicitly highlights the target role's core requirements in the first 3 lines."
  }
}
Be precise, realistic, and actionable. Do not use generic filler.`;

  const userMsg = `CANDIDATE RESUME:\n${resumeText.slice(0, 4000)}\n\nTARGET JOB TITLE: ${jobTitle}\nJOB DESCRIPTION:\n${jobDescription?.slice(0, 3000) || "Not provided"}`;

  const response = await aiChat(prompt, userMsg, { temperature: 0.3 });
  const parsed = parseJsonSafely(response, {
    atsScoreForJob: 65,
    missingSkills: [],
    bulletUpgrades: [],
    newPointsToAdd: [],
    summaryUpgrade: undefined,
  });

  // Ensure backward compatibility by mapping bulletUpgrades to suggestions
  const suggestions = (parsed.bulletUpgrades || []).map((b: BulletUpgrade) => ({
    section: b.section,
    current: b.original,
    suggested: b.updated,
    reason: b.reason,
  }));

  return {
    atsScoreForJob: typeof parsed.atsScoreForJob === "number" ? parsed.atsScoreForJob : 65,
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    bulletUpgrades: Array.isArray(parsed.bulletUpgrades) ? parsed.bulletUpgrades : [],
    newPointsToAdd: Array.isArray(parsed.newPointsToAdd) ? parsed.newPointsToAdd : [],
    summaryUpgrade: parsed.summaryUpgrade || undefined,
    suggestions,
  };
}

export async function generateFollowupEmail(
  resumeText: string,
  jobTitle: string,
  company: string,
  context: string,
  tone: string = "professional",
): Promise<string> {
  const toneInstruction = getToneInstruction(tone);
  const prompt = `Write a follow-up email for a job application. Context: ${context}. ${toneInstruction} Keep it brief and effective. Output the email text only, no JSON. Include a subject line at the top.`;

  const userMsg = `CANDIDATE RESUME:\n${resumeText.slice(0, 2000)}\n\nROLE: ${jobTitle} at ${company}`;

  return aiChat(prompt, userMsg, { temperature: 0.5, maxTokens: 1500 });
}

export async function generateLinkedInMessage(
  resumeText: string,
  jobTitle: string,
  company: string,
  messageType: string,
  tone: string = "professional",
): Promise<string> {
  const toneInstruction = getToneInstruction(tone);
  const prompt = `Write a LinkedIn ${messageType} for this candidate reaching out about the role. ${toneInstruction} Keep it short (under 300 characters for connection request, under 1000 for InMail). Output text only.`;

  const userMsg = `CANDIDATE:\n${resumeText.slice(0, 1500)}\n\nROLE: ${jobTitle} at ${company}`;

  return aiChat(prompt, userMsg, { temperature: 0.5, maxTokens: 1000 });
}

export async function getJobSearchRecommendations(
  resumeText: string,
  targetRoles: string[],
  skills: string[],
): Promise<{
  searchTerms: string[];
  rolesSuggested: string[];
  industryTips: string[];
  skillGaps: string[];
}> {
  const prompt = `Based on this candidate's profile, suggest job search strategies. Return JSON:
{
  "searchTerms": ["search query 1", "search query 2"],
  "rolesSuggested": ["role title 1", "role title 2"],
  "industryTips": ["tip 1", "tip 2"],
  "skillGaps": ["skill to learn 1", "skill to learn 2"]
}`;

  const userMsg = `RESUME:\n${resumeText.slice(0, 3000)}\nTARGET ROLES: ${targetRoles.join(", ")}\nSKILLS: ${skills.join(", ")}`;

  const response = await aiChat(prompt, userMsg, { temperature: 0.4 });
  return parseJsonSafely(response, {
    searchTerms: [],
    rolesSuggested: [],
    industryTips: [],
    skillGaps: [],
  });
}
