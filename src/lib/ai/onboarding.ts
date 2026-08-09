import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";

export async function mode1OnboardingAnalysis(
  resumeText: string,
  targetPositions: string[],
  targetCountry: string,
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
  const prompt = `You are an expert career coach and ATS analyst.

Your task is to analyze a candidate's primary resume against their target positions and country, then produce a comprehensive onboarding analysis.

## Target Positions:
${targetPositions.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## Target Country: ${targetCountry}
${linkedinUrl ? `## LinkedIn Profile URL: ${linkedinUrl}` : ""}

## Primary Resume Text:
${resumeText}

## Instructions:
Parse the resume and produce a JSON response with EXACTLY this structure. Do NOT include markdown formatting or extra text:

{
  "profileSummary": "<2-3 paragraph professional summary distilling the candidate's experience, strengths, and career narrative>",
  "detectedCoreSkills": ["skill1", "skill2", "skill3"],
  "marketGaps": [
    {
      "type": "skill|experience|certification|education|language|other",
      "description": "<specific gap description relevant to target positions and country>"
    }
  ],
  "aiSuggestions": [
    "<actionable suggestion for improving ATS competitiveness>",
    "<actionable suggestion for skill development>"
  ],
  "linkedinOptimizations": [
    "<Specific LinkedIn profile change needed to align candidate's resume to target position '${targetPositions[0] || "Target Role"}' — e.g. Headline, About Section, Skills List, or Experience Title>",
    "<Specific headline or summary phrasing adjustment to rank in recruiter searches in ${targetCountry}>"
  ],
  "generalAtsScore": <integer 60-95 rating the resume's standalone ATS compatibility — format, keywords, structure, readability>,
  "resumeImprovements": [
    {
      "section": "<resume section name e.g. Summary, Experience, Skills, Education>",
      "current": "<brief excerpt or description of what's currently lacking>",
      "suggested": "<specific improvement suggestion>",
      "reason": "<why this change improves ATS performance>",
      "atsBoost": "<estimated ATS score gain e.g. '+5% ATS Boost' or '+8% ATS Boost'>"
    }
  ]
}

Guidelines:
- Identify 4-8 core skills from the resume
- Identify 3-6 market gaps specific to the target positions and country
- Provide 4-8 actionable AI suggestions
- Provide 4-6 LinkedIn profile optimization tips specifically tailored to bridge the candidate's resume to target positions
- Provide 3-6 resume improvements with specific current vs suggested comparisons AND estimated ATS score percentage gains (atsBoost)
- Rate generalAtsScore holistically between 60 and 95 based on formatting, keyword density, action verbs, and structure
- Be honest and constructive; focus on what will actually help the candidate
- Consider country-specific requirements (visa, language, certifications, local market norms)`;

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
  generationCount: number = 1
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

  const prompt = `You are an expert career strategist and resume coach.

Your task is to create an 8-week phased roadmap to close market gaps and position the candidate for their target roles.

${initialSetupInstruction}

## Target Positions:
${targetPositions.map((p, i) => `${i + 1}. ${p}`).join("\n")}

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
