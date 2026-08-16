import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";

export interface LinkedInHeadline {
  style: "metrics" | "keywords" | "mission" | "executive";
  headline: string;
  charCount: number;
  explanation: string;
}

export interface LinkedInAbout {
  variant: "executive_narrative" | "high_velocity_builder";
  title: string;
  content: string;
  wordCount: number;
  keyHighlights: string[];
}

export interface LinkedInSkillsCategory {
  category: string;
  skills: string[];
}

export interface LinkedInOptimizationResult {
  headlines: LinkedInHeadline[];
  aboutStories: LinkedInAbout[];
  skillsTaxonomy: LinkedInSkillsCategory[];
  experienceHighlights: string[];
  strategicTips: {
    title: string;
    description: string;
  }[];
}

export interface ColdOutreachStep {
  stepNumber: number;
  dayDelay: number;
  name: string;
  subjectLines: { subject: string; openRateScore: number }[];
  body: string;
  characterCount: number;
  purpose: string;
}

export interface ColdOutreachSequenceResult {
  targetCompany: string;
  roleTitle: string;
  recruiterName: string;
  steps: ColdOutreachStep[];
  outreachTips: string[];
}

/**
 * Generates comprehensive section-by-section LinkedIn profile enhancements
 */
export async function generateLinkedInProfileOptimization(params: {
  resumeText: string;
  targetRole?: string;
  industry?: string;
  tone?: "bold" | "executive" | "technical" | "founder";
}): Promise<LinkedInOptimizationResult> {
  const { resumeText, targetRole = "Software Engineer", industry = "Technology", tone = "executive" } = params;

  const prompt = `You are the world's top LinkedIn Executive Brand Strategist and Talent Recruiter.
Analyze this resume and generate an elite, high-conversion LinkedIn profile optimization packet.

## Context:
- Target Role: ${targetRole}
- Target Industry: ${industry}
- Preferred Tone: ${tone}

## Candidate Resume:
${resumeText.slice(0, 4000)}

Generate a JSON object with this EXACT structure:
{
  "headlines": [
    {
      "style": "metrics",
      "headline": "<Under 220 chars. Focus on quantifiable scale, ex-employers, and core technical stack>",
      "charCount": <number>,
      "explanation": "<Why this works for recruiter searches>"
    },
    {
      "style": "keywords",
      "headline": "<Under 220 chars. SEO-maximized with exact high-volume recruiter search terms>",
      "charCount": <number>,
      "explanation": "<Why this works for search algorithms>"
    },
    {
      "style": "mission",
      "headline": "<Under 220 chars. Visionary problem-solver angle highlighting impact>",
      "charCount": <number>,
      "explanation": "<Why this connects with hiring managers>"
    },
    {
      "style": "executive",
      "headline": "<Under 220 chars. Minimalist, high-status leadership positioning>",
      "charCount": <number>,
      "explanation": "<Why this signals senior authority>"
    }
  ],
  "aboutStories": [
    {
      "variant": "executive_narrative",
      "title": "Executive Career Arc (First-Person Story)",
      "content": "<3-paragraph compelling personal story. Hook opening -> Major career milestones with metrics -> Core philosophy -> Call to action/contact info>",
      "wordCount": <number>,
      "keyHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
    },
    {
      "variant": "high_velocity_builder",
      "title": "High-Velocity Impact & Technical Index",
      "content": "<Structured format with summary overview, Core Engineering Pillars, Notable Scale Metrics, and Tech Stack Index>",
      "wordCount": <number>,
      "keyHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"]
    }
  ],
  "skillsTaxonomy": [
    {
      "category": "Core Technologies & Languages",
      "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6", "Skill7", "Skill8"]
    },
    {
      "category": "Architecture, Cloud & Infrastructure",
      "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5", "Skill6"]
    },
    {
      "category": "Domain & Product Expertise",
      "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"]
    },
    {
      "category": "Leadership & Agile Methodologies",
      "skills": ["Skill1", "Skill2", "Skill3", "Skill4"]
    }
  ],
  "experienceHighlights": [
    "High-impact rewritten LinkedIn bullet point with metrics 1",
    "High-impact rewritten LinkedIn bullet point with metrics 2",
    "High-impact rewritten LinkedIn bullet point with metrics 3",
    "High-impact rewritten LinkedIn bullet point with metrics 4"
  ],
  "strategicTips": [
    {
      "title": "Featured Section Strategy",
      "description": "Advice on what exact GitHub repositories, case studies, or live demos to pin in the Featured section."
    },
    {
      "title": "Custom Banner & Visual Positioning",
      "description": "Specific visual design recommendations for the LinkedIn header banner."
    },
    {
      "title": "Social Proof & Recommendations",
      "description": "Script template to ask former engineering managers and colleagues for targeted recommendations."
    }
  ]
}`;

  try {
    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2800,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = parseJsonSafely<LinkedInOptimizationResult>(content, {
      headlines: [],
      aboutStories: [],
      skillsTaxonomy: [],
      experienceHighlights: [],
      strategicTips: [],
    });

    // Ensure character counts match headline lengths
    if (Array.isArray(result.headlines)) {
      result.headlines = result.headlines.map((h) => ({
        ...h,
        charCount: h.headline ? h.headline.length : 0,
      }));
    }

    return result;
  } catch (err) {
    console.error("LinkedIn AI optimization error:", err);
    // Fallback baseline data
    return {
      headlines: [
        {
          style: "metrics",
          headline: `${targetRole} | Scaling High-Performance Systems & Products | React, TypeScript, Cloud`,
          charCount: 92,
          explanation: "Clear technical positioning with core stack keywords.",
        },
        {
          style: "keywords",
          headline: `${targetRole} | Full-Stack Engineering, Cloud Architecture, Distributed Systems`,
          charCount: 88,
          explanation: "Maximized for recruiter keyword search queries.",
        },
      ],
      aboutStories: [
        {
          variant: "executive_narrative",
          title: "Executive Career Narrative",
          content: `I am a passionate ${targetRole} with extensive experience architecting and shipping mission-critical software systems.\n\nThroughout my career, I've focused on delivering clean, resilient code and driving measurable product velocity.\n\nLet's connect or reach out directly for technical discussions and engineering opportunities.`,
          wordCount: 45,
          keyHighlights: ["Full-Stack Architecture", "High Velocity Delivery", "Cross-functional Leadership"],
        },
      ],
      skillsTaxonomy: [
        {
          category: "Core Technologies",
          skills: ["TypeScript", "React", "Next.js", "Node.js", "Python", "SQL", "TailwindCSS"],
        },
      ],
      experienceHighlights: [
        "Architected and deployed scalable web applications improving system throughput by 35%.",
        "Mentored junior developers and established code review best practices across the engineering team.",
      ],
      strategicTips: [
        {
          title: "Featured Projects",
          description: "Pin 2 top GitHub repositories with interactive live demo links and clean README documentation.",
        },
      ],
    };
  }
}

/**
 * Generates high-conversion 3-step recruiter cold outreach sequence
 */
export async function generateColdOutreachSequence(params: {
  candidateName?: string;
  targetCompany: string;
  roleTitle: string;
  recruiterName?: string;
  valueProp?: string;
  resumeSummary?: string;
}): Promise<ColdOutreachSequenceResult> {
  const {
    candidateName = "Candidate",
    targetCompany,
    roleTitle,
    recruiterName = "Hiring Team",
    valueProp = "demonstrated track record building high-performance systems",
    resumeSummary = "",
  } = params;

  const prompt = `You are the world's most successful tech recruiter and executive career coach.
Create a personalized, high-response 3-step Cold Outreach Sequence for a candidate reaching out to a recruiter/hiring manager.

## Parameters:
- Candidate Name: ${candidateName}
- Target Company: ${targetCompany}
- Target Role: ${roleTitle}
- Recruiter / Contact Name: ${recruiterName}
- Unique Value Proposition: ${valueProp}
- Candidate Background Context: ${resumeSummary.slice(0, 1500)}

Rules:
1. Tone: Respectful, punchy, hyper-specific, zero fluff, easy to reply on mobile.
2. Step 1 (Day 1): Initial Hook — under 120 words. Specific reference to company product/engineering, value proposition, low-friction ask.
3. Step 2 (Day 4): Value-Add Follow-Up — under 100 words. Share a relevant technical insight, architecture project link, or concrete idea for ${targetCompany}.
4. Step 3 (Day 8): The Polite Closing Bump — under 60 words. Short, gracious closing touch giving an easy out.

Generate a JSON object:
{
  "targetCompany": "${targetCompany}",
  "roleTitle": "${roleTitle}",
  "recruiterName": "${recruiterName}",
  "steps": [
    {
      "stepNumber": 1,
      "dayDelay": 0,
      "name": "Initial Value Pitch",
      "subjectLines": [
        { "subject": "<Subject Line Option 1>", "openRateScore": 92 },
        { "subject": "<Subject Line Option 2>", "openRateScore": 88 }
      ],
      "body": "<Body text with [Company] and [Role] tokens filled in>",
      "characterCount": <number>,
      "purpose": "<Why this email works>"
    },
    {
      "stepNumber": 2,
      "dayDelay": 4,
      "name": "Value-Add Follow-Up",
      "subjectLines": [
        { "subject": "Re: <Subject Line Option 1>", "openRateScore": 89 }
      ],
      "body": "<Follow-up body text>",
      "characterCount": <number>,
      "purpose": "<Why this follow-up converts>"
    },
    {
      "stepNumber": 3,
      "dayDelay": 8,
      "name": "Polite Final Bump",
      "subjectLines": [
        { "subject": "Re: <Subject Line Option 1>", "openRateScore": 84 }
      ],
      "body": "<Closing body text>",
      "characterCount": <number>,
      "purpose": "<Why this closing message maintains professional dignity>"
    }
  ],
  "outreachTips": [
    "Tip 1: Send between 8:30 AM - 9:15 AM recipient local time for maximum open rate.",
    "Tip 2: Attach your 1-page ATS PDF resume directly to email or link your portfolio in the signature.",
    "Tip 3: Always check LinkedIn to ensure the recruiter actively recruits for this engineering department."
  ]
}`;

  try {
    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2200,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = parseJsonSafely<ColdOutreachSequenceResult>(content, {
      targetCompany,
      roleTitle,
      recruiterName,
      steps: [],
      outreachTips: [],
    });

    if (Array.isArray(result.steps)) {
      result.steps = result.steps.map((s) => ({
        ...s,
        characterCount: s.body ? s.body.length : 0,
      }));
    }

    return result;
  } catch (err) {
    console.error("Cold outreach generation error:", err);
    return {
      targetCompany,
      roleTitle,
      recruiterName,
      steps: [
        {
          stepNumber: 1,
          dayDelay: 0,
          name: "Initial Value Pitch",
          subjectLines: [
            { subject: `${roleTitle} inquiry – ${candidateName}`, openRateScore: 90 },
            { subject: `Quick note regarding ${roleTitle} at ${targetCompany}`, openRateScore: 86 },
          ],
          body: `Hi ${recruiterName},\n\nI’ve been closely following ${targetCompany}’s engineering growth and noticed your open ${roleTitle} role.\n\nWith a strong track record in ${valueProp}, I’d love to explore how my technical background can contribute to your team's roadmap.\n\nWould you have 10 minutes next Tuesday for a brief intro call?\n\nBest,\n${candidateName}`,
          characterCount: 345,
          purpose: "Concise hook demonstrating company knowledge and clear value.",
        },
      ],
      outreachTips: [
        "Send on Tuesday or Thursday morning for peak open rates.",
        "Keep the initial message under 150 words.",
      ],
    };
  }
}
