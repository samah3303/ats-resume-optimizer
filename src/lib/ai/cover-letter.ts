import { getDeepSeek, getAiModelName } from "./client";

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
  const prompt = `You are a professional cover letter writer. Generate a highly tailored, compelling cover letter based on the job description and candidate's resume.

${jobTitle ? `Job Title: ${jobTitle}` : ""}
${company ? `Company: ${company}` : ""}

## Job Description:
${jobDescriptionText}

## Candidate Resume:
${resumeText}

## Instructions:
Write a professional, persuasive 3-4 paragraph cover letter.
- Paragraph 1: Express enthusiasm for the specific role and company, highlight top value proposition.
- Paragraph 2: Map relevant accomplishments from the resume to key requirements in the job description.
- Paragraph 3: Explain why the candidate is drawn to this company/mission and how they can contribute immediately.
- Paragraph 4: Professional closing call-to-action requesting an interview.

Do NOT include placeholder variables like [Your Name] or [Date] — write as a complete, ready-to-use draft using details from the resume. Return ONLY the cover letter text, no explanations or introductory remarks.`;

  const response = await getDeepSeek().chat.completions.create({
    model: getAiModelName(),
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2048,
  });

  return response.choices[0]?.message?.content || "";
}
