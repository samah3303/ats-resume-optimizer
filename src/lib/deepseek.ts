import OpenAI from "openai";

let _deepseek: OpenAI | null = null;

function getDeepSeek(): OpenAI {
  if (!_deepseek) {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY environment variable is not set");
    }
    _deepseek = new OpenAI({
      apiKey,
      baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
    });
  }
  return _deepseek;
}

/**
 * Helper: extract JSON from LLM response, handling markdown code blocks.
 */
function extractJson(content: string): string {
  let jsonStr = content.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  return jsonStr;
}

// ─── Analyze Resume Against Job Description ────────────────────────────────

interface AnalyzeResumeParams {
  resumeText: string;
  jobDescriptionText: string;
  positionTitle?: string;
}

export async function analyzeResumeAgainstJD({
  resumeText,
  jobDescriptionText,
  positionTitle,
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
  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach.

Your task is to analyze a resume against a job description and provide detailed, actionable feedback.

${positionTitle ? `The candidate is targeting a "${positionTitle}" role.` : ""}

## Job Description:
${jobDescriptionText}

## Resume:
${resumeText}

## Instructions:
Analyze the resume against the job description and output a JSON response with EXACTLY this structure. Do NOT include markdown formatting or extra text:

{
  "overallScore": <number 0-100 representing overall ATS compatibility>,
  "keywordsMatchPct": <number 0-100 representing percentage of JD keywords found in resume>,
  "keywords": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  },
  "skills": {
    "present": ["skill1", "skill2"],
    "missing": ["skill3", "skill4"]
  },
  "formatScore": <number 0-100 for resume format and ATS readability>,
  "impactScore": <number 0-100 for achievement impact and metrics usage>,
  "summaryText": "<2-3 sentence overall assessment and top recommendation>",
  "suggestions": [
    {
      "section": "<section name like Summary, Experience, Skills, Education>",
      "originalText": "<the exact text from the resume that needs improvement>",
      "suggestedText": "<your improved version of that text>",
      "rationale": "<why this change improves ATS compatibility or impact>"
    }
  ]
}

Guidelines:
- Provide 5-10 specific suggestions covering different sections
- Focus on: keyword inclusion, ATS formatting, quantifiable achievements, active language
- Be honest about scores. Most resumes score 40-70.
- For suggestions, quote actual text from the resume as originalText
- Make suggestedText specific and ready to use
- Each rationale should explain the ATS or hiring impact`;

  const response = await getDeepSeek().chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "";

  const jsonStr = extractJson(content);
  const result = JSON.parse(jsonStr);

  return {
    overallScore: result.overallScore,
    keywordsMatchPct: result.keywordsMatchPct,
    skillsGapJson: JSON.stringify({
      keywords: result.keywords,
      skills: result.skills,
    }),
    formatScore: result.formatScore,
    impactScore: result.impactScore,
    summaryText: result.summaryText,
    suggestions: result.suggestions,
  };
}

// ─── Generate Cover Letter ──────────────────────────────────────────────────

interface GenerateCoverLetterParams {
  resumeText: string;
  jobDescriptionText: string;
  jobTitle?: string;
  company?: string;
}

export async function generateCoverLetter({
  resumeText,
  jobDescriptionText,
  jobTitle,
  company,
}: GenerateCoverLetterParams): Promise<string> {
  const prompt = `You are an expert cover letter writer. Write a professional, compelling cover letter tailored to the job description and the candidate's background.

${jobTitle ? `Job Title: ${jobTitle}` : ""}
${company ? `Company: ${company}` : ""}

## Job Description:
${jobDescriptionText}

## Candidate Resume:
${resumeText}

## Instructions:
- Write a professional cover letter (300-500 words)
- Address the key requirements from the job description
- Highlight relevant experience and skills from the resume
- Use a confident, enthusiastic tone
- Format with proper greeting, body paragraphs, and closing
- Include placeholders like [Your Name], [Date] where appropriate
- Return ONLY the cover letter text, no additional commentary`;

  const response = await getDeepSeek().chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content || "";
}

// ─── Generate Interview Questions ───────────────────────────────────────────

export interface InterviewQuestion {
  question: string;
  category: string;
  rationale: string;
}

interface GenerateInterviewQuestionsParams {
  skillsGapJson?: string;
  resumeText: string;
  jobDescriptionText: string;
  jobTitle?: string;
}

export async function generateInterviewQuestions({
  skillsGapJson,
  resumeText,
  jobDescriptionText,
  jobTitle,
}: GenerateInterviewQuestionsParams): Promise<InterviewQuestion[]> {
  let skillsGapContext = "";
  if (skillsGapJson) {
    try {
      const gaps = JSON.parse(skillsGapJson);
      skillsGapContext = `
## Skills Gap Analysis:
- Matched Keywords: ${JSON.stringify(gaps.keywords?.matched || [])}
- Missing Keywords: ${JSON.stringify(gaps.keywords?.missing || [])}
- Present Skills: ${JSON.stringify(gaps.skills?.present || [])}
- Missing Skills: ${JSON.stringify(gaps.skills?.missing || [])}`;
    } catch {
      // ignore invalid JSON
    }
  }

  const prompt = `You are an expert technical interviewer. Generate tailored interview questions based on the job description, candidate's resume, and skills gap analysis.

${jobTitle ? `Job Title: ${jobTitle}` : ""}

## Job Description:
${jobDescriptionText}

## Candidate Resume:
${resumeText}
${skillsGapContext}

## Instructions:
Generate 8-12 interview questions covering different categories. Output a JSON array with EXACTLY this structure (no markdown):

[
  {
    "question": "<the interview question>",
    "category": "<one of: Technical, Behavioral, Experience, Skills Gap, Role Fit, Problem Solving, Leadership, Communication>",
    "rationale": "<brief reason: why this question is relevant based on the JD/resume>"
  }
]

Guidelines:
- Focus on skills gaps (missing keywords/skills) — ask about these areas
- Include at least 2 technical questions related to required technologies
- Include questions about past experience that maps to JD requirements
- Challenge candidates on their weak areas constructively
- Return ONLY the JSON array, no other text`;

  const response = await getDeepSeek().chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 2048,
  });

  const content = response.choices[0]?.message?.content || "[]";
  const jsonStr = extractJson(content);

  return JSON.parse(jsonStr);
}

// ─── Compare Multiple Resumes ───────────────────────────────────────────────

interface ResumeComparisonInput {
  name: string;
  parsedText: string;
}

export interface ResumeComparison {
  name: string;
  overallScore: number;
  strengths: string[];
  improvements: string[];
}

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
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "[]";
  const jsonStr = extractJson(content);

  return JSON.parse(jsonStr);
}

// ─── Analyze LinkedIn Profile ───────────────────────────────────────────────

interface AnalyzeLinkedInProfileParams {
  profileText: string;
  jobDescriptionText?: string;
  jobTitle?: string;
}

export interface LinkedInAnalysisResult {
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
}

export async function analyzeLinkedInProfile({
  profileText,
  jobDescriptionText,
  jobTitle,
}: AnalyzeLinkedInProfileParams): Promise<LinkedInAnalysisResult> {
  const jdSection = jobDescriptionText
    ? `
## Target Job Description:
${jobDescriptionText}`
    : "";

  const prompt = `You are an expert resume writer and ATS analyst. Analyze this LinkedIn profile${jobDescriptionText ? " against the target job description" : " for overall professional quality"} and provide actionable feedback.

${jobTitle ? `Target Role: ${jobTitle}` : ""}${jdSection}

## LinkedIn Profile:
${profileText}

## Instructions:
Analyze the profile and output a JSON response with EXACTLY this structure (no markdown):

{
  "overallScore": <number 0-100>,
  "keywordsMatchPct": <number 0-100${jobDescriptionText ? " representing percentage of JD keywords found in profile" : " — relevance and impact of keywords used"}>,
  "keywords": {
    "matched": ["keyword1", "keyword2"],
    "missing": ["keyword3", "keyword4"]
  },
  "skills": {
    "present": ["skill1", "skill2"],
    "missing": ["skill3", "skill4"]
  },
  "formatScore": <number 0-100 for profile structure and readability>,
  "impactScore": <number 0-100 for achievement impact and metrics usage>,
  "summaryText": "<2-3 sentence overall assessment and top recommendation>",
  "suggestions": [
    {
      "section": "<section like Headline, Summary, Experience, Skills>",
      "originalText": "<excerpt from the profile that needs improvement>",
      "suggestedText": "<improved version>",
      "rationale": "<why this change matters>"
    }
  ]
}

Guidelines:
- LinkedIn profiles are often less formal than resumes; suggest how to tighten the language
- Focus on keywords, quantifiable achievements, and professional tone
- Provide 5-8 specific suggestions covering different sections
- Be honest — most LinkedIn profiles score in the 40-70 range
- Return ONLY the JSON, no markdown formatting`;

  const response = await getDeepSeek().chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const jsonStr = extractJson(content);
  const result = JSON.parse(jsonStr);

  return {
    overallScore: result.overallScore,
    keywordsMatchPct: result.keywordsMatchPct,
    skillsGapJson: JSON.stringify({
      keywords: result.keywords,
      skills: result.skills,
    }),
    formatScore: result.formatScore,
    impactScore: result.impactScore,
    summaryText: result.summaryText,
    suggestions: result.suggestions,
  };
}

// ─── Generate Optimized Resume ──────────────────────────────────────────────

export async function generateOptimizedResume(
  resumeText: string,
  suggestions: Array<{ section: string; originalText: string; suggestedText: string }>,
  jobDescriptionTitle: string
): Promise<string> {
  const suggestionsBlock = suggestions
    .map(
      (s, i) =>
        `${i + 1}. [${s.section}] Replace "${s.originalText}" with "${s.suggestedText}"`
    )
    .join("\n");

  const prompt = `You are an expert resume writer. Apply the following suggestions to the resume and return the full, updated resume text. Do NOT include any explanations, just the updated resume.

Target Job: ${jobDescriptionTitle}

## Suggestions to Apply:
${suggestionsBlock}

## Original Resume:
${resumeText}

## Updated Resume (return ONLY the updated resume text):`;

  const response = await getDeepSeek().chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || resumeText;
}
