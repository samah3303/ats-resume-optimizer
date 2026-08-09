import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";
import { OutreachPack } from "@/types/ai";

interface GenerateOutreachPackParams {
  resumeText: string;
  jobDescriptionText: string;
  jobTitle?: string;
  company?: string;
  recruiterName?: string;
}

export async function generateOutreachPack({
  resumeText,
  jobDescriptionText,
  jobTitle,
  company,
  recruiterName,
}: GenerateOutreachPackParams): Promise<OutreachPack> {
  const prompt = `You are an expert career strategist helping an unemployed job seeker land an interview through cold outreach and application materials.

${jobTitle ? `Job Title: ${jobTitle}` : ""}
${company ? `Company: ${company}` : ""}
${recruiterName ? `Recruiter / Manager Name: ${recruiterName}` : ""}

## Job Description:
${jobDescriptionText}

## Candidate Resume:
${resumeText}

## Instructions:
Generate a complete candidate outreach pack as a JSON object with EXACTLY the following structure (no markdown code fence outside JSON):

{
  "coverLetter": "<A 300-word highly tailored, persuasive cover letter highlighting key matches and enthusiasm>",
  "linkedinMessage": "<A high-converting 250-character max LinkedIn connection note to a recruiter or peer at ${company || "the target company"}>",
  "coldEmailSubject": "<An attention-grabbing email subject line, e.g., 'Experienced ${jobTitle || "Engineer"} passionate about ${company || "your team"}'s growth'>",
  "coldEmailBody": "<A concise 4-paragraph cold outreach email to a hiring manager pitch asking for a brief intro call>",
  "followupEmailBody": "<A polite follow-up email to send 5-7 days after applying, reaffirming value>",
  "elevatorPitch": "<A 60-second spoken elevator pitch answering 'Tell me about yourself' for an interview>"
}

Guidelines:
- Make every piece specific to the candidate's actual background and the target company/role.
- Tone should be professional, confident, proactive, and achievement-focused.
- Return ONLY the JSON object.`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 3072,
  });

  const content = response.choices[0]?.message?.content || "{}";
  return parseJsonSafely<OutreachPack>(content, {
    coverLetter: "Dear Hiring Manager,\n\nI am writing to express my strong interest...",
    linkedinMessage: "Hi, I saw your opening and would love to connect!",
    coldEmailSubject: `Application for ${jobTitle || "Role"} at ${company || "Company"}`,
    coldEmailBody: "Dear Hiring Manager,\n\nI am reaching out regarding...",
    followupEmailBody: "Dear Hiring Manager,\n\nI wanted to follow up on my recent application...",
    elevatorPitch: "I am a dedicated professional with experience in...",
  });
}
