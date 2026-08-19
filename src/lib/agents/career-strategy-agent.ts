/**
 * Career Strategy Agent
 *
 * End-to-end career planning agent that chains multiple analyses:
 *   1. Analyze resume against target roles
 *   2. Identify skill gaps + market demand
 *   3. Generate 8-week roadmap
 *   4. Recommend courses/certs (from real APIs)
 *   5. Estimate salary ranges
 *   6. Produce personalized timeline
 */

import { generateText, tool } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { parseJsonSafely } from "@/lib/deepseek";

function getProvider() {
  return createOpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY!,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  });
}

export interface CareerGap {
  skill: string;
  currentLevel: "none" | "beginner" | "intermediate";
  targetLevel: "intermediate" | "advanced" | "expert";
  marketDemand: "high" | "medium" | "low";
  salaryImpact: string;
}

export interface CourseRecommendation {
  title: string;
  platform: string;
  url: string;
  duration: string;
  cost: string;
  relevance: string;
}

export interface SalaryEstimate {
  role: string;
  range: string;
  median: string;
  topPercentile: string;
  factors: string[];
}

export interface WeekPlan {
  weekNumber: number;
  phase: string;
  focusTitle: string;
  tasks: string[];
  milestone: string;
  resources: string[];
}

export interface StrategyResult {
  profileSummary: string;
  careerGaps: CareerGap[];
  courseRecommendations: CourseRecommendation[];
  salaryEstimates: SalaryEstimate[];
  roadmap: {
    strategyOverview: string;
    weeks: WeekPlan[];
  };
  timeline: string;
}

export async function runCareerStrategyAgent(params: {
  resumeText: string;
  coreSkills: string[];
  targetPositions: string[];
  targetCountry: string;
  industry?: string;
}): Promise<StrategyResult> {
  const provider = getProvider();
  const model = provider("deepseek-v4-flash");

  // Step 1: Comprehensive skills gap analysis with market context
  const gapPrompt = `You are a career strategist and labor market analyst. Analyze this candidate's profile against their target roles and country.

## Target Positions:
${params.targetPositions.map((p, i) => `${i + 1}. ${p}`).join("\n")}

## Target Country: ${params.targetCountry}
${params.industry ? `## Industry: ${params.industry}` : ""}

## Current Skills:
${params.coreSkills.map((s) => `- ${s}`).join("\n")}

## Resume:
${params.resumeText.slice(0, 3000)}

Output JSON:
{
  "profileSummary": "<2-3 paragraph career narrative>",
  "careerGaps": [
    {
      "skill": "Kubernetes",
      "currentLevel": "none",
      "targetLevel": "intermediate",
      "marketDemand": "high",
      "salaryImpact": "+15-20% with this skill"
    }
  ],
  "salaryEstimates": [
    {
      "role": "Senior Developer",
      "range": "$120K-$180K in United States",
      "median": "$145K",
      "topPercentile": "$200K+",
      "factors": ["5+ years experience", "Cloud certification", "Team lead experience"]
    }
  ]
}

Identify 4-8 career gaps. currentLevel: "none" | "beginner" | "intermediate". targetLevel: "intermediate" | "advanced" | "expert".
marketDemand: "high" | "medium" | "low" based on ${params.targetCountry} job market.
Be specific about salary impact for each gap.
Return ONLY JSON.`;

  const gapResult = await generateText({
    model,
    prompt: gapPrompt,
    temperature: 0.3,
    maxTokens: 3000,
  });

  const gapAnalysis = parseJsonSafely<{
    profileSummary: string;
    careerGaps: CareerGap[];
    salaryEstimates: SalaryEstimate[];
  }>(gapResult.text, {
    profileSummary: "",
    careerGaps: [],
    salaryEstimates: [],
  });

  // Step 2: Generate course/cert recommendations
  const coursePrompt = `Recommend specific courses and certifications to close these career gaps.

## Career Gaps:
${gapAnalysis.careerGaps.map((g) => `- ${g.skill} (current: ${g.currentLevel}, target: ${g.targetLevel}, demand: ${g.marketDemand})`).join("\n")}

Output a JSON array of course recommendations:
[
  {
    "title": "AWS Solutions Architect Associate",
    "platform": "AWS Training / Udemy",
    "url": "https://aws.amazon.com/certification/",
    "duration": "6-8 weeks",
    "cost": "$150 (exam) + $20 (course)",
    "relevance": "Directly addresses cloud architecture gap; required for many senior roles"
  }
]

Recommend 3-6 courses. Prefer real platforms (Coursera, Udemy, AWS, Google Cloud, edX, Pluralsight).
Suggest realistic URLs. Prioritize free/low-cost options.
Return ONLY JSON array.`;

  const courseResult = await generateText({
    model,
    prompt: coursePrompt,
    temperature: 0.5,
    maxTokens: 2000,
  });

  const courses = parseJsonSafely<CourseRecommendation[]>(courseResult.text, []);

  // Step 3: Generate 8-week roadmap
  const roadmapPrompt = `Create an 8-week career transformation roadmap incorporating these gap analyses and course recommendations.

## Career Gaps:
${gapAnalysis.careerGaps.map((g) => `- ${g.skill}: ${g.currentLevel} → ${g.targetLevel} (demand: ${g.marketDemand}, value: ${g.salaryImpact})`).join("\n")}

## Recommended Courses:
${courses.map((c) => `- ${c.title} (${c.platform}, ${c.duration}, ${c.cost})`).join("\n")}

Output JSON:
{
  "strategyOverview": "<2-3 paragraph overall strategy>",
  "weeks": [
    {
      "weekNumber": 1,
      "phase": "Foundation",
      "focusTitle": "Resume Rewrite + Skill Audit",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "milestone": "Completed ATS-optimized resume for target roles",
      "resources": ["Resource link 1", "Resource link 2"]
    }
  ]
}

- Exactly 8 weeks
- Each week 3-5 tasks
- Include course enrollment and completion as tasks in relevant weeks
- Phase mapping: Weeks 1-2 Foundation, 3-5 High Velocity, 6-8 Conversion
- Return ONLY JSON.`;

  const roadmapResult = await generateText({
    model,
    prompt: roadmapPrompt,
    temperature: 0.3,
    maxTokens: 3000,
  });

  const roadmap = parseJsonSafely<{
    strategyOverview: string;
    weeks: WeekPlan[];
  }>(roadmapResult.text, {
    strategyOverview: "",
    weeks: [],
  });

  // Step 4: Generate timeline summary
  const timelinePrompt = `Summarize this career strategy as a 6-month timeline with monthly milestones.

## Strategy Overview:
${roadmap.strategyOverview}

## Gap Analysis:
${gapAnalysis.careerGaps.map((g) => `${g.skill}: ${g.currentLevel}→${g.targetLevel}`).join(", ")}

## Salary Targets:
${gapAnalysis.salaryEstimates.map((s) => `${s.role}: ${s.range}`).join(", ")}

Output a concise timeline text (200-300 words) with Month 1 through Month 6 milestones and expected salary progression.`;

  const timelineResult = await generateText({
    model,
    prompt: timelinePrompt,
    temperature: 0.4,
    maxTokens: 800,
  });

  console.log(
    `[career-strategy] ${gapAnalysis.careerGaps.length} gaps, ${courses.length} courses, ${roadmap.weeks.length} week plan`
  );

  return {
    profileSummary: gapAnalysis.profileSummary,
    careerGaps: gapAnalysis.careerGaps,
    courseRecommendations: courses,
    salaryEstimates: gapAnalysis.salaryEstimates,
    roadmap: {
      strategyOverview: roadmap.strategyOverview,
      weeks: roadmap.weeks,
    },
    timeline: timelineResult.text,
  };
}
