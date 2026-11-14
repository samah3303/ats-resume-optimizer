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

export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
  company: string,
): Promise<string> {
  const prompt = `Write a professional, tailored cover letter for this candidate applying to the specified role. Be specific to both the resume and job description. Keep it concise (3-4 paragraphs). Do NOT use generic filler. Output the cover letter text only, no JSON.`;

  const userMsg = `RESUME:\n${resumeText.slice(0, 3000)}\n\nJOB: ${jobTitle} at ${company}\nDESCRIPTION:\n${jobDescription?.slice(0, 2000) || "Not provided"}`;

  return aiChat(prompt, userMsg, { temperature: 0.5, maxTokens: 2000 });
}

export async function generateResumeUpdates(
  resumeText: string,
  jobDescription: string,
  jobTitle: string,
): Promise<{
  suggestions: {
    section: string;
    current: string;
    suggested: string;
    reason: string;
  }[];
  missingSkills: string[];
  atsScoreForJob: number;
}> {
  const prompt = `Compare this resume against the job description. Return JSON:
{
  "suggestions": [{"section":"section name","current":"current text","suggested":"improved text","reason":"why"}],
  "missingSkills": ["skill1", "skill2"],
  "atsScoreForJob": 0-100
}
Provide specific, actionable edits. Focus on keywords matching and impact.`;

  const userMsg = `RESUME:\n${resumeText.slice(0, 3000)}\n\nJOB: ${jobTitle}\nDESCRIPTION:\n${jobDescription?.slice(0, 2000) || "Not provided"}`;

  const response = await aiChat(prompt, userMsg, { temperature: 0.3 });
  return parseJsonSafely(response, {
    suggestions: [],
    missingSkills: [],
    atsScoreForJob: 50,
  });
}

export async function generateFollowupEmail(
  resumeText: string,
  jobTitle: string,
  company: string,
  context: string,
): Promise<string> {
  const prompt = `Write a professional follow-up email for a job application. Context: ${context}. Keep it brief, warm, and professional. Output the email text only, no JSON. Include a subject line at the top.`;

  const userMsg = `CANDIDATE RESUME:\n${resumeText.slice(0, 2000)}\n\nROLE: ${jobTitle} at ${company}`;

  return aiChat(prompt, userMsg, { temperature: 0.5, maxTokens: 1500 });
}

export async function generateLinkedInMessage(
  resumeText: string,
  jobTitle: string,
  company: string,
  messageType: string,
): Promise<string> {
  const prompt = `Write a LinkedIn ${messageType} for this candidate reaching out about the role. Keep it short (under 300 characters for connection request, under 1000 for InMail). Be professional and personalized. Output text only.`;

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
