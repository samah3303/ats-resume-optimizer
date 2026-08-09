import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";
import { InterviewQuestion } from "@/types/ai";

interface GenerateInterviewQuestionsParams {
  skillsGapJson?: string;
  resumeText: string;
  jobDescriptionText: string;
  jobTitle?: string;
  stage?: string;
}

export async function generateInterviewQuestions({
  skillsGapJson,
  resumeText,
  jobDescriptionText,
  jobTitle,
  stage = "all",
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

  const stageInstruction =
    stage === "hr"
      ? "Focus 100% on HR / Recruiter Screening Round (salary expectations, career trajectory, culture fit, reason for leaving, motivation)."
      : stage === "technical"
      ? "Focus 100% on Technical Deep-Dive Round (architecture, framework choices, trade-offs, debugging, tech stack depth)."
      : stage === "coding"
      ? "Focus 100% on Live Coding / System Design Round (data structures, algorithms, API design, scalability, system trade-offs)."
      : stage === "behavioral"
      ? "Focus 100% on Behavioral & Leadership Round (STAR scenarios, conflict resolution, cross-functional teamwork, overcoming failures)."
      : stage === "ceo"
      ? "Focus 100% on CEO / Founder / Executive Round (business vision, strategic impact, ownership mindset, company alignment)."
      : "Provide a balanced mix of HR Screening, Technical Deep-Dive, Live Coding/System Design, Behavioral, and Executive Founder questions.";

  const prompt = `You are a senior technical interviewer and executive hiring manager. Generate 8 to 12 tailored interview questions for this specific candidate and job description, COMPLETE WITH COMPREHENSIVE HIGH-SCORING MODEL ANSWERS.

${stageInstruction}

${jobTitle ? `Target Job Title: ${jobTitle}` : ""}

## Job Description:
${jobDescriptionText.slice(0, 3000)}

## Candidate Resume:
${resumeText.slice(0, 3000)}
${skillsGapContext}

## Instructions:
Output a JSON array of interview questions with EXACTLY this structure (no markdown formatting):

[
  {
    "question": "<Specific, highly relevant interview question>",
    "category": "<Technical | Behavioral | System Design | Role Fit | Leadership | HR Screening>",
    "stage": "<HR Screening | Technical Deep-Dive | Coding & System Design | Behavioral & Leadership | Executive CEO Round>",
    "answer": "<High-scoring 2-3 paragraph sample model answer written in the STAR method (Situation, Task, Action, Result) directly tailoring the candidate's resume experience to this JD>",
    "keyTalkingPoints": [
      "<Key bullet point 1 to mention>",
      "<Key bullet point 2 to mention>",
      "<Key bullet point 3 to mention>"
    ],
    "rationale": "<Why this specific question will be asked based on the JD/resume skills gap>"
  }
]

Guidelines:
- Make model answers realistic, professional, and directly derived from the candidate's background and target role.
- Cover missing skills and gaps from the resume.
- Return ONLY the JSON array.`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
    max_tokens: 4096,
  });

  const content = response.choices[0]?.message?.content || "[]";
  return parseJsonSafely<InterviewQuestion[]>(content, []);
}
