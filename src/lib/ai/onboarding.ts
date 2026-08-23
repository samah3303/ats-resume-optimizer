import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";

export async function mode1OnboardingAnalysis(
  resumeText: string,
  targetPositions: string[],
  targetCountry: string,
  targetCity?: string | null,
  linkedinUrl?: string
): Promise<{
  profileSummary: string;
  detectedCoreSkills: string[];
  marketGaps: Array<{ type: string; description: string }>;
  aiSuggestions: string[];
  linkedinOptimizations: string[];
  generalAtsScore: number;
  resumeImprovements: Array<{
    section: string;
    current: string;
    suggested: string;
    reason: string;
    atsBoost?: string | number;
  }>;
}> {
  const prompt = `You are a world-class ATS Resume Auditor and Career Intelligence Engine.

Your task is to conduct an authoritative, standalone General ATS Compatibility Analysis on the candidate's resume for their target positions (${targetPositions.join(", ")}) in ${targetCity ? targetCity + ", " : ""}${targetCountry}.
Analyze formatting parseability, keyword density, section taxonomy, and quantifiable impact to provide prioritized, actionable recommendations that will elevate the candidate's ATS score from its current state to 80+ (Tier-1 ATS Benchmark).

## Target Positions:
${targetPositions.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## Target Geography: ${targetCity ? targetCity + ", " : ""}${targetCountry}
${linkedinUrl ? `## Candidate Link: ${linkedinUrl}` : ""}

## Candidate Resume Text:
${resumeText}

## Output Format:
Output ONLY a valid JSON object matching this exact schema (no markdown fences, no explanatory preambles):

{
  "profileSummary": "<2-3 paragraph executive summary evaluating the candidate's professional trajectory, core strengths, and immediate ATS readiness>",
  "detectedCoreSkills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
  "marketGaps": [
    {
      "type": "skill|experience|certification|education|language|other",
      "description": "<specific gap description explaining what prevents the resume from ranking in the top 10% for ${targetPositions[0] || "Target Position"}>"
    }
  ],
  "aiSuggestions": [
    "<High-priority action item to achieve 80+ ATS score: e.g. Add quantified metrics (%, $, latency) to bullet points>",
    "<Action item: Integrate high-frequency industry keywords relevant to ${targetPositions[0] || "Target Role"}>",
    "<Action item: Standardize section headers and bullet formatting for flawless parser parsing>",
    "<Action item: Strengthen executive summary with target role alignment>"
  ],
  "linkedinOptimizations": [
    "<Strategic positioning advice to rank in recruiter search results for ${targetPositions[0] || "Target Position"}>",
    "<Keyword-rich headline and summary formula for ${targetCountry} talent markets>"
  ],
  "generalAtsScore": <integer 50-95 realistically scoring the current resume's parseability, keyword density, action verb strength, and quantified achievements>,
  "resumeImprovements": [
    {
      "section": "<Section Name: Summary | Experience | Skills | Education | Projects>",
      "current": "<Exact weak or passive phrasing from resume needing improvement>",
      "suggested": "<High-impact rewrite using Google/Executive STAR method (Situation, Task, Action, Metric Result) to hit 80+ score>",
      "reason": "<Why this change satisfies ATS filters and hiring managers>",
      "atsBoost": "<Estimated score gain e.g. '+6% ATS Boost' or '+8% ATS Boost'>"
    }
  ]
}

## Guidelines:
1. Provide a realistic generalAtsScore (typically 55-80 for unoptimized resumes, 80+ for top-tier resumes).
2. Detail 4-6 high-impact resumeImprovements with concrete before-and-after bullet rewrites using numbers, metrics, and industry taxonomy.
3. Identify 4-8 core verified skills and 3-5 critical market gaps.
4. Ensure all suggestions are universally applicable for the candidate's target role and domain.`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const result = parseJsonSafely<Record<string, any>>(content, {});

  // Compute a fallback ATS score based on resume content length & structure if LLM didn't provide one
  const computedFallbackScore = Math.min(
    92,
    Math.max(68, 70 + (resumeText.length > 1000 ? 10 : 0) + (resumeText.toLowerCase().includes("experience") ? 5 : 0))
  );

  const finalAtsScore =
    typeof result.generalAtsScore === "number" && result.generalAtsScore > 0
      ? result.generalAtsScore
      : computedFallbackScore;

  const rawImprovements = Array.isArray(result.resumeImprovements) ? result.resumeImprovements : [];
  const processedImprovements = rawImprovements.map((imp: any, idx: number) => ({
    section: imp.section || "Experience",
    current: imp.current || "Standard bullet point lacking metric ROI",
    suggested: imp.suggested || "Quantified accomplishment bullet point with tech keywords",
    reason: imp.reason || "Improves ATS search frequency and recruiter engagement",
    atsBoost: imp.atsBoost || `+${Math.min(10, Math.max(3, 8 - idx * 2))}% ATS Boost`,
  }));

  return {
    profileSummary: result.profileSummary || "Resume onboarding analysis complete.",
    detectedCoreSkills: Array.isArray(result.detectedCoreSkills) ? result.detectedCoreSkills : [],
    marketGaps: Array.isArray(result.marketGaps) ? result.marketGaps : [],
    aiSuggestions: Array.isArray(result.aiSuggestions) ? result.aiSuggestions : [],
    linkedinOptimizations: Array.isArray(result.linkedinOptimizations) ? result.linkedinOptimizations : [],
    generalAtsScore: finalAtsScore,
    resumeImprovements: processedImprovements,
  };
}

export async function mode2GenerateRoadmap(
  resumeText: string,
  coreSkills: string[],
  marketGaps: Array<{ type: string; description: string }>,
  targetPositions: string[],
  generationCount: number = 1,
  targetCountry: string = "United States",
  targetCity?: string | null
): Promise<{
  strategyOverview: string;
  weeks: Array<{
    weekNumber: number;
    focus: string;
    tasks: string[];
    milestone: string;
  }>;
}> {
  const gapsText = marketGaps
    .map((g) => `- [${g.type}] ${g.description}`)
    .join("\n");

  const initialSetupInstruction = generationCount === 1
    ? `IMPORTANT: This is the INITIAL (Iteration 1) roadmap.
The VERY FIRST TASK in Week 1 MUST explicitly be: "Check the 'LinkedIn Tips' and 'Resume Improvements' tabs on your dashboard, apply the recommended profile & resume fixes, then click 'Regenerate Roadmap' above."`
    : `IMPORTANT: This is a REGENERATED (Iteration ${generationCount}) roadmap.
The candidate has ALREADY applied their initial LinkedIn and Resume fixes. Do NOT include setup/fix tasks for reviewing LinkedIn or Resume tabs. Focus 100% on advanced skill development, project portfolio execution, high-volume job applications, and interview performance.`;

  const prompt = `You are an expert career strategist and local market job hunt coach.

Your task is to create a highly actionable 8-week phased job hunt and upskilling roadmap to position the candidate for their target roles in ${targetCity ? targetCity + ", " : ""}${targetCountry}.

If the target location is UAE/Dubai/Middle East, explicitly include weekly strategies for Naukri Gulf, Indeed UAE, and localized LinkedIn Middle East networking, alongside WhatsApp follow-up practices.

${initialSetupInstruction}

## Target Positions:
${targetPositions.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## Target Geography: ${targetCity ? targetCity + ", " : ""}${targetCountry}

## Candidate Core Skills:
${coreSkills.map((s) => `- ${s}`).join("\n")}

## Identified Market Gaps:
${gapsText || "(none identified)"}

## Current Resume:
${resumeText}

## Instructions:
Create an 8-week roadmap and output a JSON response with EXACTLY this structure. Do NOT include markdown formatting or extra text:

{
  "strategyOverview": "<2-3 paragraph overall strategy summarizing the approach and end goal>",
  "weeks": [
    {
      "weekNumber": 1,
      "focus": "<one-line theme for the week>",
      "tasks": ["concrete task 1", "concrete task 2", "concrete task 3"],
      "milestone": "<measurable outcome by end of week>"
    }
  ]
}

Guidelines:
- Exactly 8 weeks (weekNumber 1-8)
- Each week should have 3-5 concrete, actionable tasks
- Phase the roadmap logically: early weeks focus on resume/ATS fixes, middle weeks on skill development/gap closing, later weeks on application strategy and interview prep
- Each milestone should be a specific, verifiable deliverable
- Tasks should be things the candidate can actually do (update resume section, take a course, practice interviews, research companies, etc.)
- Align the roadmap to target positions and close identified market gaps`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const result = parseJsonSafely<Record<string, any>>(content, {});

  return {
    strategyOverview: result.strategyOverview || "8-week career roadmap to achieve target role readiness.",
    weeks: Array.isArray(result.weeks) ? result.weeks : [],
  };
}

export async function mode3EnhancedAnalysis(
  resumeText: string,
  jobDescriptionText: string,
  positionTitle?: string,
  atsPlatform?: string
): Promise<{
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
  verdict: string;
  atsRedFlags: string[];
}> {
  const prompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach.

Your task is to analyze a resume against a job description and provide detailed, actionable feedback including a compatibility verdict and ATS red flags.

${positionTitle ? `The candidate is targeting a "${positionTitle}" role.` : ""}
${atsPlatform ? `The target ATS platform is: ${atsPlatform}.` : ""}

## Job Description:
${jobDescriptionText}

## Resume:
${resumeText}

## Instructions:
Analyze the resume against the job description and output a JSON response with EXACTLY this structure. Do NOT include markdown formatting or extra text:

{
  "overallScore": <number 0-100>,
  "keywordsMatchPct": <number 0-100>,
  "keywords": {
    "matched": ["keyword1"],
    "missing": ["keyword2"]
  },
  "skills": {
    "present": ["skill1"],
    "missing": ["skill2"]
  },
  "formatScore": <number 0-100>,
  "impactScore": <number 0-100>,
  "summaryText": "<2-3 sentence overall assessment>",
  "verdict": "<one of: Highly Compatible | Needs Optimization | Poor Match>",
  "atsRedFlags": [
    "<specific ATS compatibility issue>",
    "<formatting problem that could cause rejection>"
  ],
  "suggestions": [
    {
      "section": "<section name>",
      "originalText": "<exact text from resume>",
      "suggestedText": "<improved version>",
      "rationale": "<why this change helps>"
    }
  ]
}

Verdict Guidelines:
- "Highly Compatible": overallScore >= 75, strong keyword and skill alignment
- "Needs Optimization": overallScore 45-74, decent match but needs improvements
- "Poor Match": overallScore < 45, significant gaps

ATS Red Flags Guidelines:
Check for: image-based content/charts, non-standard section headings, missing contact info, tables/columns that confuse parsers, special characters, unsupported fonts, PDF metadata issues, lack of standard section names (Experience, Education, Skills), overly complex formatting. Return 0-5 red flags depending on what's detectable from the text.

Other Guidelines:
- Provide 5-10 specific suggestions covering different sections
- Focus on: keyword inclusion, ATS formatting, quantifiable achievements, active language
- Be honest about scores. Most resumes score 40-70.
- For suggestions, quote actual text from the resume as originalText`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "{}";
  const result = parseJsonSafely<Record<string, any>>(content, {});

  return {
    overallScore: result.overallScore || 70,
    keywordsMatchPct: result.keywordsMatchPct || 70,
    skillsGapJson: JSON.stringify({
      keywords: result.keywords || { matched: [], missing: [] },
      skills: result.skills || { present: [], missing: [] },
    }),
    formatScore: result.formatScore || 75,
    impactScore: result.impactScore || 70,
    summaryText: result.summaryText || "Analysis completed.",
    suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    verdict: result.verdict || "Needs Optimization",
    atsRedFlags: Array.isArray(result.atsRedFlags) ? result.atsRedFlags : [],
  };
}
