/**
 * Resume Writer Agent
 *
 * Iterative resume rewriting with self-critique:
 *   1. Analyze target JD for requirements
 *   2. Generate a first-pass rewrite
 *   3. Self-critique: compare against JD, flag issues
 *   4. Revise based on critique
 *   5. Final polish (grammar, formatting, impact)
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

export interface WriterIteration {
  version: number;
  text: string;
  critique: string;
  improvements: string[];
}

export interface WriterResult {
  finalResume: string;
  iterations: WriterIteration[];
  improvements: Array<{ section: string; change: string; reason: string }>;
  totalTokens: number;
}

export async function runResumeWriterAgent(params: {
  resumeText: string;
  jobDescriptionTitle: string;
  jobDescriptionText: string;
  suggestions: Array<{ section: string; originalText: string; suggestedText: string; rationale: string }>;
  iterations?: number;
}): Promise<WriterResult> {
  const provider = getProvider();
  const model = provider("deepseek-v4-flash");
  const maxIterations = params.iterations || 3;
  const iterations: WriterIteration[] = [];
  let currentText = params.resumeText;

  const suggestionsBlock = params.suggestions
    .map((s, i) => `${i + 1}. [${s.section}] "${s.originalText}" → "${s.suggestedText}"\n   Reason: ${s.rationale}`)
    .join("\n\n");

  // Step 1: Initial rewrite incorporating all suggestions
  const v1Prompt = `You are an expert resume writer specialized in ATS optimization.

Apply the following suggestions to the resume. Rewrite the ENTIRE resume incorporating every suggestion. Preserve all factual information — only improve wording, add metrics, and incorporate keywords.

## Target Job: ${params.jobDescriptionTitle}

## Job Description:
${params.jobDescriptionText.slice(0, 2000)}

## Suggestions to Apply:
${suggestionsBlock}

## Original Resume:
${params.resumeText.slice(0, 4000)}

## Rewritten Resume:
Return ONLY the full rewrite. Use clear section headers (SUMMARY, EXPERIENCE, SKILLS, EDUCATION).`;

  const v1Result = await generateText({
    model,
    prompt: v1Prompt,
    temperature: 0.4,
    maxOutputTokens: 4096,
  });

  currentText = v1Result.text || params.resumeText;

  iterations.push({
    version: 1,
    text: currentText,
    critique: "",
    improvements: params.suggestions.map((s) => s.rationale),
  });

  // Steps 2-N: Self-critique + revise loop
  for (let i = 1; i < maxIterations; i++) {
    // Self-critique pass
    const critiquePrompt = `You are a harsh resume critic. Review this resume draft against the job description. Identify 3-5 specific issues and how to fix them.

## Target Job: ${params.jobDescriptionTitle}

## Job Description:
${params.jobDescriptionText.slice(0, 1500)}

## Resume Draft (v${i}):
${currentText.slice(0, 3000)}

Output JSON:
{
  "critique": "<overall assessment, 2-3 sentences>",
  "issues": [
    {"section": "Experience", "issue": "Bullet points lack metrics", "fix": "Add quantified achievements like 'increased X by Y%'"}
  ]
}

Return ONLY JSON.`;

    const critiqueResult = await generateText({
      model,
      prompt: critiquePrompt,
      temperature: 0.2,
      maxOutputTokens: 1000,
    });

    const critique = parseJsonSafely<{
      critique: string;
      issues: Array<{ section: string; issue: string; fix: string }>;
    }>(critiqueResult.text, { critique: "", issues: [] });

    if (critique.issues.length === 0) break; // No more improvements needed

    // Revision pass
    const revisePrompt = `Revise this resume draft based on the following critique. Fix EVERY issue listed.

## Criticism:
${critique.critique}

## Issues to Fix:
${critique.issues.map((iss, j) => `${j + 1}. [${iss.section}] ${iss.issue} → ${iss.fix}`).join("\n")}

## Resume Draft:
${currentText.slice(0, 4000)}

## Revised Resume:
Return ONLY the full revised resume.`;

    const reviseResult = await generateText({
      model,
      prompt: revisePrompt,
      temperature: 0.3,
      maxOutputTokens: 4096,
    });

    if (reviseResult.text) {
      currentText = reviseResult.text;
    }

    iterations.push({
      version: i + 1,
      text: currentText,
      critique: critique.critique,
      improvements: critique.issues.map((iss) => `${iss.section}: ${iss.fix}`),
    });
  }

  // Final polish
  const polishPrompt = `Polish this resume for grammar, consistent formatting, and professional tone. Fix any awkward phrasing. Do NOT change factual content.

## Resume:
${currentText.slice(0, 4000)}

## Polished Resume:
Return ONLY the polished resume.`;

  const polishResult = await generateText({
    model,
    prompt: polishPrompt,
    temperature: 0.1,
    maxOutputTokens: 4096,
  });

  if (polishResult.text) {
    currentText = polishResult.text;
  }

  // Collect all improvements across iterations
  const allImprovements = iterations.flatMap((iter) =>
    iter.improvements.map((imp) => {
      const [section, ...rest] = imp.split(": ");
      return { section: section || "General", change: rest.join(": "), reason: "From agent iteration" };
    })
  );

  console.log(
    `[resume-writer] ${iterations.length} iterations completed | Final length: ${currentText.length} chars`
  );

  return {
    finalResume: currentText,
    iterations,
    improvements: allImprovements,
    totalTokens: 0, // We don't track individual call tokens here
  };
}
