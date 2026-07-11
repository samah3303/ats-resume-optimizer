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

  // Extract JSON from the response (handle markdown code blocks)
  let jsonStr = content.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

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
