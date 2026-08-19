/**
 * Interview Coach Agent
 *
 * Interactive mock interview with multi-step feedback:
 *   1. Analyze JD + resume to identify weak areas
 *   2. Generate targeted questions by category
 *   3. Evaluate user answers against ideal responses
 *   4. Provide specific feedback + model answers
 */

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { parseJsonSafely } from "@/lib/deepseek";

function getProvider() {
  return createOpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY!,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  });
}

export interface CoachQuestion {
  id: string;
  question: string;
  category: "Technical" | "Behavioral" | "Experience" | "Skills Gap" | "Role Fit" | "Problem Solving" | "Leadership";
  rationale: string;
  targetSkill: string;
  idealAnswerPoints: string[];
}

export interface AnswerFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  followupQuestion: string;
}

// ─── Session management (in-memory, per-user) ───────────────────────────────

interface CoachSession {
  userId: string;
  questions: CoachQuestion[];
  currentIndex: number;
  answers: Array<{ questionId: string; answer: string; feedback: AnswerFeedback }>;
  createdAt: number;
}

const sessions = new Map<string, CoachSession>();

// ─── Step 1: Generate Questions from Analysis ───────────────────────────────

export async function startInterviewSession(params: {
  userId: string;
  resumeText: string;
  jobDescriptionText: string;
  jobTitle?: string;
  skillsGapJson?: string;
  questionCount?: number;
}): Promise<{ sessionId: string; questions: CoachQuestion[] }> {
  const provider = getProvider();
  const model = provider("deepseek-v4-flash");

  let gapsContext = "";
  if (params.skillsGapJson) {
    try {
      const gaps = JSON.parse(params.skillsGapJson);
      gapsContext = `\n## Candidate Weak Areas (from ATS analysis):\n${JSON.stringify(gaps.skillGaps || gaps, null, 2)}`;
    } catch { /* ignore */ }
  }

  const prompt = `You are an expert technical interviewer at a top tech company. Generate ${params.questionCount || 8} interview questions tailored to this candidate and job.

${params.jobTitle ? `Target Role: ${params.jobTitle}` : ""}

## Job Description:
${params.jobDescriptionText.slice(0, 2000)}

## Candidate Resume:
${params.resumeText.slice(0, 2000)}
${gapsContext}

## Instructions:
Generate questions that PROBE the candidate's weak areas. For each gap, ask a question that tests whether they actually have the skill or are just missing it from their resume.

Output a JSON array:
[
  {
    "id": "q1",
    "question": "Can you walk me through...",
    "category": "Technical",
    "rationale": "This tests their claimed Kubernetes experience",
    "targetSkill": "Kubernetes",
    "idealAnswerPoints": ["Mention pod management", "Describe scaling experience", "Reference monitoring tools"]
  }
]

Categories: "Technical", "Behavioral", "Experience", "Skills Gap", "Role Fit", "Problem Solving", "Leadership"
Include at least 2 "Skills Gap" questions targeting gaps.
Return ONLY the JSON array.`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.5,
  });

  const questions = parseJsonSafely<CoachQuestion[]>(result.text, []);

  // Ensure IDs are unique
  questions.forEach((q, i) => {
    if (!q.id) q.id = `q${i + 1}`;
  });

  const session: CoachSession = {
    userId: params.userId,
    questions,
    currentIndex: 0,
    answers: [],
    createdAt: Date.now(),
  };

  const sessionId = `coach_${params.userId}_${Date.now()}`;
  sessions.set(sessionId, session);

  // Clean old sessions (>1 hour)
  for (const [key, s] of sessions) {
    if (Date.now() - s.createdAt > 3600000) sessions.delete(key);
  }

  console.log(`[interview-coach] Session ${sessionId}: ${questions.length} questions generated`);

  return { sessionId, questions };
}

// ─── Step 2: Evaluate Answer ────────────────────────────────────────────────

export async function evaluateAnswer(params: {
  sessionId: string;
  questionId: string;
  answer: string;
}): Promise<{ feedback: AnswerFeedback; isLastQuestion: boolean }> {
  const session = sessions.get(params.sessionId);
  if (!session) {
    throw new Error("Session not found or expired. Start a new interview session.");
  }

  const questionIndex = session.questions.findIndex((q) => q.id === params.questionId);
  if (questionIndex === -1) {
    throw new Error("Question not found in session.");
  }

  const question = session.questions[questionIndex];
  const provider = getProvider();
  const model = provider("deepseek-v4-flash");

  const prompt = `You are an expert technical interviewer evaluating a candidate's answer. Be honest and constructive.

## Question:
Category: ${question.category}
Target Skill: ${question.targetSkill}
Question: ${question.question}

## Ideal Answer Points:
${question.idealAnswerPoints.map((p) => `- ${p}`).join("\n")}

## Candidate's Answer:
${params.answer}

## Evaluation:
Score the answer 0-100. Be critical but fair. If the answer is vague, short, or missing key points, score accordingly. Output JSON:

{
  "score": <0-100>,
  "strengths": ["what they did well"],
  "improvements": ["specific areas to improve"],
  "modelAnswer": "<a concise model answer (100-200 words) demonstrating the ideal response>",
  "followupQuestion": "<one follow-up question to probe deeper on a weak area>"
}

Return ONLY the JSON object.`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.3,
  });

  const feedback = parseJsonSafely<AnswerFeedback>(result.text, {
    score: 50,
    strengths: ["Attempted to answer the question"],
    improvements: ["Provide more specific examples"],
    modelAnswer: "A good answer would include specific examples from your experience.",
    followupQuestion: "Can you elaborate on that with a specific example?",
  });

  // Store answer + feedback
  session.answers.push({
    questionId: params.questionId,
    answer: params.answer,
    feedback,
  });

  // Advance to next question
  const nextIndex = questionIndex + 1;
  const isLastQuestion = nextIndex >= session.questions.length;

  return { feedback, isLastQuestion };
}

// ─── Step 3: Get Next Question ──────────────────────────────────────────────

export function getNextQuestion(sessionId: string): CoachQuestion | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  // Find first unanswered question
  const answeredIds = new Set(session.answers.map((a) => a.questionId));
  const next = session.questions.find((q) => !answeredIds.has(q.id));
  return next || null;
}

// ─── Step 4: Generate Final Report ──────────────────────────────────────────

export async function generateInterviewReport(sessionId: string): Promise<{
  overallScore: number;
  categoryScores: Record<string, number>;
  summary: string;
  topStrength: string;
  topWeakness: string;
  recommendations: string[];
}> {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error("Session not found.");
  }

  const provider = getProvider();
  const model = provider("deepseek-v4-flash");

  const answersSummary = session.answers
    .map((a) => {
      const q = session.questions.find((q) => q.id === a.questionId);
      return `Q: ${q?.question?.slice(0, 100)} | Category: ${q?.category} | Score: ${a.feedback.score}`;
    })
    .join("\n");

  const prompt = `Analyze this mock interview performance and generate a comprehensive report.

## Interview Results:
${answersSummary}

## Detailed Feedback:
${session.answers.map((a) => {
    const q = session.questions.find((q) => q.id === a.questionId);
    return `[${q?.category}] Score: ${a.feedback.score}/100\nStrengths: ${a.feedback.strengths.join("; ")}\nImprovements: ${a.feedback.improvements.join("; ")}`;
  }).join("\n\n")}

Output JSON:
{
  "overallScore": <0-100 average>,
  "categoryScores": {"Technical": 75, "Behavioral": 82, ...},
  "summary": "<2-3 sentence overall assessment>",
  "topStrength": "<their best interview skill>",
  "topWeakness": "<area needing most improvement>",
  "recommendations": ["specific prep tip 1", "specific prep tip 2", "specific prep tip 3"]
}

Return ONLY JSON.`;

  const result = await generateText({
    model,
    prompt,
    temperature: 0.3,
  });

  return parseJsonSafely(result.text, {
    overallScore: Math.round(
      session.answers.reduce((sum, a) => sum + a.feedback.score, 0) /
        (session.answers.length || 1)
    ),
    categoryScores: {},
    summary: "Interview completed.",
    topStrength: "Communication",
    topWeakness: "Technical depth",
    recommendations: ["Practice more technical questions"],
  });
}

// ─── Cleanup ────────────────────────────────────────────────────────────────

export function endInterviewSession(sessionId: string): void {
  sessions.delete(sessionId);
}
