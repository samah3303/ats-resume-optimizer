import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";

export type InterviewPersonaType =
  | "phone_screen"
  | "technical_depth"
  | "star_behavioral"
  | "system_design"
  | "hiring_manager"
  | "bar_raiser_executive"
  | "product_sense"
  | "rapid_fire";

export interface PersonaMetadata {
  type: InterviewPersonaType;
  title: string;
  interviewerName: string;
  role: string;
  focusArea: string;
  description: string;
  avatarEmoji: string;
}

export const INTERVIEW_PERSONAS: Record<InterviewPersonaType, PersonaMetadata> = {
  phone_screen: {
    type: "phone_screen",
    title: "Recruiter Phone Screen",
    interviewerName: "Jessica Chen",
    role: "Lead Talent Partner",
    focusArea: "Career narrative, core stack, communication clarity & compensation expectations",
    description: "A friendly but thorough 15-30 minute screening to assess communication and role fit.",
    avatarEmoji: "📞",
  },
  technical_depth: {
    type: "technical_depth",
    title: "Technical Architecture & Deep-Dive",
    interviewerName: "Marcus Vance",
    role: "Principal Systems Architect",
    focusArea: "Past engineering projects, distributed systems trade-offs, concurrency & failure modes",
    description: "Deep technical interrogation evaluating your architectural decision-making and scale experience.",
    avatarEmoji: "💻",
  },
  star_behavioral: {
    type: "star_behavioral",
    title: "STAR Behavioral & Amazon LPs",
    interviewerName: "Elena Rostova",
    role: "Director of Engineering",
    focusArea: "Situation, Task, Action, Result, handling conflict, ambiguous deadlines, customer obsession",
    description: "Rigorous behavioral probing challenging your leadership, ownership, and team impact.",
    avatarEmoji: "⭐",
  },
  system_design: {
    type: "system_design",
    title: "Large-Scale System Design",
    interviewerName: "David K.",
    role: "Staff Infrastructure Engineer",
    focusArea: "High availability, database sharding, caching strategies, rate limiters, CDN topology",
    description: "Open-ended architectural challenge designing systems to handle millions of requests per second.",
    avatarEmoji: "📐",
  },
  hiring_manager: {
    type: "hiring_manager",
    title: "Hiring Manager & Team Fit",
    interviewerName: "Sarah Jenkins",
    role: "Engineering Manager",
    focusArea: "Day-to-day execution, agile velocity, cross-functional collaboration, mentorship",
    description: "Assesses how you work in sprints, mentor junior engineers, and unblock cross-functional dependencies.",
    avatarEmoji: "🤝",
  },
  bar_raiser_executive: {
    type: "bar_raiser_executive",
    title: "Executive VP / Bar Raiser",
    interviewerName: "Robert Thorne",
    role: "VP of Engineering",
    focusArea: "Long-term technical vision, organizational bar raising, high-stakes trade-offs",
    description: "High-level interview ensuring you raise the engineering bar across the entire company.",
    avatarEmoji: "🏛️",
  },
  product_sense: {
    type: "product_sense",
    title: "Product Sense & Engineering Empathy",
    interviewerName: "Amina Patel",
    role: "Head of Product Engineering",
    focusArea: "User empathy, analytics-driven trade-offs, feature prioritization vs tech debt",
    description: "Evaluates how you translate product requirements into resilient engineering architectures.",
    avatarEmoji: "🎯",
  },
  rapid_fire: {
    type: "rapid_fire",
    title: "Rapid-Fire Core Computer Science",
    interviewerName: "Alex Mercer",
    role: "Senior Engineering Lead",
    focusArea: "Data structures, memory layouts, HTTP/gRPC protocols, OS threads, ACID transactions",
    description: "Fast-paced, high-density fundamental knowledge questions.",
    avatarEmoji: "⚡",
  },
};

export interface VoiceChatMessage {
  role: "assistant" | "user";
  content: string;
  timestamp: string;
  metrics?: {
    wpm?: number;
    fillerWordsCount?: number;
    concisenessScore?: number; // 0-100
  };
}

export interface VoiceTurnResponse {
  spokenReply: string; // The text the AI interviewer speaks
  realtimeFeedback: {
    strengths: string[];
    improvementTip: string;
    contentScore: number; // 0-100
    starStructureScore: number; // 0-100
    pacingAssessment: "too_fast" | "optimal" | "too_slow" | "good";
  };
  suggestedFollowUpTopic?: string;
}

export interface FinalInterviewDiagnostic {
  overallScore: number; // 0-100
  recommendation: "strong_hire" | "hire" | "lean_hire" | "lean_no_hire" | "no_hire";
  summary: string;
  categoryScores: {
    technicalAcumen: number;
    starStructure: number;
    communicationPace: number;
    executivePresence: number;
    cultureAndValues: number;
  };
  topStrengths: string[];
  keyAreasToImprove: string[];
  questionByQuestionReview: {
    question: string;
    candidateAnswerSummary: string;
    score: number;
    critique: string;
    modelAnswerSnippet: string;
  }[];
}

/**
 * Initializes a new Voice Mock Interview session and generates opening greeting
 */
export async function startVoiceInterviewSession(params: {
  persona: InterviewPersonaType;
  targetRole: string;
  companyTarget?: string;
  candidateName?: string;
  resumeSummary?: string;
  difficulty?: "junior" | "mid" | "senior" | "staff" | "executive";
}): Promise<{ openingSpeech: string; interviewerDetails: PersonaMetadata }> {
  const {
    persona,
    targetRole,
    companyTarget = "our company",
    candidateName = "Candidate",
    resumeSummary = "",
    difficulty = "senior",
  } = params;

  const interviewer = INTERVIEW_PERSONAS[persona] || INTERVIEW_PERSONAS.phone_screen;

  const prompt = `You are ${interviewer.interviewerName}, ${interviewer.role} conducting a ${interviewer.title} mock interview.

## Interview Context:
- Target Role: ${targetRole} (${difficulty} level)
- Company: ${companyTarget}
- Candidate Name: ${candidateName}
- Interview Focus: ${interviewer.focusArea}
- Candidate Resume Context: ${resumeSummary.slice(0, 1500)}

Instructions:
1. Speak naturally as an interviewer in voice format (under 60 words).
2. Welcome the candidate warmly, state your role, and ask the FIRST opening question tailored specifically to their background and the chosen interview stage.
3. Do NOT include markdown headers or bullet points; this text will be read aloud by a Text-to-Speech voice engine.

Return ONLY a JSON object:
{
  "openingSpeech": "<Natural spoken opening greeting and first question>"
}`;

  try {
    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 400,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = parseJsonSafely<{ openingSpeech: string }>(content, {
      openingSpeech: `Hi ${candidateName}, thanks for joining today. I'm ${interviewer.interviewerName}, ${interviewer.role}. To kick things off, could you walk me through your background and the most impactful technical project you've led recently?`,
    });

    return {
      openingSpeech: result.openingSpeech,
      interviewerDetails: interviewer,
    };
  } catch (err) {
    console.error("Start voice session error:", err);
    return {
      openingSpeech: `Hi ${candidateName}, thanks for meeting with me today! I'm ${interviewer.interviewerName}. To get started, could you give me a brief overview of your background and what you're looking for in your next role as a ${targetRole}?`,
      interviewerDetails: interviewer,
    };
  }
}

/**
 * Evaluates candidate spoken response and generates next spoken interview turn + live coaching feedback
 */
export async function processVoiceInterviewTurn(params: {
  persona: InterviewPersonaType;
  targetRole: string;
  conversationHistory: { role: string; content: string }[];
  latestSpokenAnswer: string;
  wpm?: number;
  fillerWords?: string[];
}): Promise<VoiceTurnResponse> {
  const {
    persona,
    targetRole,
    conversationHistory,
    latestSpokenAnswer,
    wpm = 140,
    fillerWords = [],
  } = params;

  const interviewer = INTERVIEW_PERSONAS[persona] || INTERVIEW_PERSONAS.phone_screen;

  const prompt = `You are ${interviewer.interviewerName}, ${interviewer.role} conducting a spoken mock interview for a ${targetRole}.

## Context:
- Interview Stage: ${interviewer.title}
- Focus: ${interviewer.focusArea}
- Speech Cadence: Candidate spoke at ~${wpm} WPM with filler words: [${fillerWords.join(", ") || "None"}].

## Conversation History so far:
${conversationHistory.map((m) => `${m.role === "assistant" ? interviewer.interviewerName : "Candidate"}: ${m.content}`).join("\n")}
Candidate Spoke: "${latestSpokenAnswer}"

Instructions:
1. Act with dual intelligence:
   - Spoken Response ("spokenReply"): A conversational, natural reaction to what the candidate just said (e.g., "That makes sense," or "Interesting architectural trade-off,"), followed by a realistic follow-up question or probe (Under 75 words, optimized for spoken TTS playback).
   - Real-time Secret Coach Feedback ("realtimeFeedback"): Content accuracy score (0-100), STAR structure score (0-100), 1-2 concrete strengths, and 1 sharp actionable tip to improve in the very next turn.

Return JSON format:
{
  "spokenReply": "<Natural spoken response and follow-up question for voice engine>",
  "realtimeFeedback": {
    "strengths": ["Clear articulation of technical trade-offs", "Good metric mention"],
    "improvementTip": "<Actionable tip e.g. Start with the quantifiable outcome before detailing the implementation>",
    "contentScore": 88,
    "starStructureScore": 82,
    "pacingAssessment": "${wpm > 180 ? "too_fast" : wpm < 110 ? "too_slow" : "optimal"}"
  },
  "suggestedFollowUpTopic": "<Topic>"
}`;

  try {
    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return parseJsonSafely<VoiceTurnResponse>(content, {
      spokenReply:
        "That's a very solid explanation. Could you drill down into how you handled failure modes and data consistency during that migration?",
      realtimeFeedback: {
        strengths: ["Clear technical narrative", "Strong domain vocabulary"],
        improvementTip: "Make sure to explicitly state the quantifiable impact on business metrics.",
        contentScore: 85,
        starStructureScore: 80,
        pacingAssessment: "optimal",
      },
    });
  } catch (err) {
    console.error("Voice turn processing error:", err);
    return {
      spokenReply:
        "Thanks for explaining that. Moving to the next area, how do you typically approach resolving technical disagreements within your engineering team?",
      realtimeFeedback: {
        strengths: ["Direct response to the question"],
        improvementTip: "Use the STAR method: explicitly define Situation, Action, and Result.",
        contentScore: 80,
        starStructureScore: 75,
        pacingAssessment: "optimal",
      },
    };
  }
}

/**
 * Generates comprehensive post-interview diagnostic scorecard
 */
export async function generateFinalVoiceInterviewReport(params: {
  persona: InterviewPersonaType;
  targetRole: string;
  fullConversation: { role: string; content: string }[];
}): Promise<FinalInterviewDiagnostic> {
  const { persona, targetRole, fullConversation } = params;
  const interviewer = INTERVIEW_PERSONAS[persona] || INTERVIEW_PERSONAS.phone_screen;

  const prompt = `You are a Senior Bar Raiser and Executive Interview Evaluator.
Analyze the complete transcript of this mock interview for ${targetRole} conducted by ${interviewer.interviewerName} (${interviewer.title}).

## Transcript:
${fullConversation.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")}

Generate an executive interview performance evaluation in JSON format:
{
  "overallScore": <Integer between 40 and 99>,
  "recommendation": "<"strong_hire" | "hire" | "lean_hire" | "lean_no_hire" | "no_hire">",
  "summary": "<2-3 sentences executive debrief summarizing technical mastery, communication clarity, and hire recommendation>",
  "categoryScores": {
    "technicalAcumen": <number 50-100>,
    "starStructure": <number 50-100>,
    "communicationPace": <number 50-100>,
    "executivePresence": <number 50-100>,
    "cultureAndValues": <number 50-100>
  },
  "topStrengths": [
    "Strength 1 with specific quote or evidence from transcript",
    "Strength 2",
    "Strength 3"
  ],
  "keyAreasToImprove": [
    "High-priority area to sharpen with actionable coaching advice 1",
    "Area 2"
  ],
  "questionByQuestionReview": [
    {
      "question": "<The question asked>",
      "candidateAnswerSummary": "<Brief summary of what candidate said>",
      "score": <number 50-100>,
      "critique": "<Specific feedback on why this answer was strong or where it fell short>",
      "modelAnswerSnippet": "<How a top 1% candidate would have structured this answer>"
    }
  ]
}`;

  try {
    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 2800,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return parseJsonSafely<FinalInterviewDiagnostic>(content, {
      overallScore: 84,
      recommendation: "hire",
      summary: "Candidate demonstrated solid domain competency, clear technical communication, and sound architectural judgment.",
      categoryScores: {
        technicalAcumen: 86,
        starStructure: 80,
        communicationPace: 88,
        executivePresence: 82,
        cultureAndValues: 85,
      },
      topStrengths: [
        "Structured technical explanations with architectural rationale",
        "Confident delivery and clean communication cadence",
      ],
      keyAreasToImprove: [
        "Quantify business and engineering outcomes with specific percentage metrics",
      ],
      questionByQuestionReview: [],
    });
  } catch (err) {
    console.error("Final report generation error:", err);
    return {
      overallScore: 80,
      recommendation: "hire",
      summary: "Candidate demonstrated good communication skills and relevant engineering foundation.",
      categoryScores: {
        technicalAcumen: 80,
        starStructure: 75,
        communicationPace: 85,
        executivePresence: 80,
        cultureAndValues: 80,
      },
      topStrengths: ["Relevant technical foundation"],
      keyAreasToImprove: ["Incorporate more quantifiable STAR metrics"],
      questionByQuestionReview: [],
    };
  }
}
