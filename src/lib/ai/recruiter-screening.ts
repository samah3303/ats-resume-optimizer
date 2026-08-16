import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";
import { extractLocalKeywordMatch, pruneJobDescription } from "../keyword-matcher";

export interface CandidateScreeningResult {
  fitScore: number;
  fitSummary: string;
  matchedSkills: string[];
  missingSkills: string[];
  recommendation: "strong_hire" | "hire" | "hold" | "reject";
  strengths: string[];
  redFlags: string[];
}

export async function screenCandidateResume({
  candidateName,
  resumeText,
  jobTitle,
  jobDescription,
  jobRequirements,
}: {
  candidateName?: string;
  resumeText: string;
  jobTitle: string;
  jobDescription: string;
  jobRequirements?: string;
}): Promise<CandidateScreeningResult> {
  const combinedJd = `${jobTitle}\n\n${jobDescription}\n\n${jobRequirements || ""}`;
  const prunedJd = pruneJobDescription(combinedJd);
  const localMatch = extractLocalKeywordMatch(resumeText, prunedJd);

  let aiAvailable = false;
  try {
    getDeepSeek();
    aiAvailable = true;
  } catch {
    aiAvailable = false;
  }

  // Fallback if AI provider is not available
  if (!aiAvailable) {
    const rawScore = Math.min(
      100,
      Math.max(
        35,
        Math.round(
          localMatch.keywordsMatchPct * 0.6 +
            localMatch.formatScore * 0.2 +
            localMatch.impactScore * 0.2
        )
      )
    );

    let recommendation: CandidateScreeningResult["recommendation"] = "hold";
    if (rawScore >= 80) recommendation = "strong_hire";
    else if (rawScore >= 68) recommendation = "hire";
    else if (rawScore < 50) recommendation = "reject";

    return {
      fitScore: rawScore,
      fitSummary: `${candidateName || "Candidate"} demonstrates a ${rawScore}% ATS match for ${jobTitle}, showing core competency in ${localMatch.skills.present.slice(0, 3).join(", ") || "fundamental engineering"}.`,
      matchedSkills: localMatch.skills.present.slice(0, 8),
      missingSkills: localMatch.skills.missing.slice(0, 6),
      recommendation,
      strengths: [
        `Strong alignment with ${localMatch.keywords.matched.slice(0, 3).join(", ") || "job requirements"}`,
        `Clean scannable experience structure (${localMatch.formatScore}/100 ATS readability)`,
      ],
      redFlags: localMatch.skills.missing.length > 0
        ? [`Missing explicitly listed skills: ${localMatch.skills.missing.slice(0, 3).join(", ")}`]
        : [],
    };
  }

  const prompt = `You are a Principal Technical Recruiter and Head of Talent screening candidates for the role of "${jobTitle}".
Evaluate the candidate's resume against the Job Description & Requirements with precision and objectivity.

## Target Job: ${jobTitle}
## Job Description & Requirements:
${prunedJd.slice(0, 2200)}

## Candidate: ${candidateName || "Applicant"}
## Resume Content:
${resumeText.slice(0, 3200)}

## Pre-Calculated Match Data:
- Keyword Match: ${localMatch.keywordsMatchPct}%
- Matched Skills: ${localMatch.skills.present.join(", ") || "None"}
- Missing Skills: ${localMatch.skills.missing.join(", ") || "None"}

Generate an executive candidate screening summary in JSON format:
{
  "fitScore": <Integer between 40 and 99 reflecting technical & experience match>,
  "fitSummary": "<2 sentences executive recruiter summary highlighting qualifications and fit for this specific job>",
  "matchedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "missingSkills": ["missingSkill1", "missingSkill2", "missingSkill3"],
  "recommendation": "<\"strong_hire\" | \"hire\" | \"hold\" | \"reject\">",
  "strengths": ["Key strength 1 with evidence", "Key strength 2"],
  "redFlags": ["Potential concern or missing requirement if any"]
}`;

  try {
    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = parseJsonSafely<Record<string, any>>(content, {});

    const fitScore =
      typeof result.fitScore === "number"
        ? Math.min(100, Math.max(20, result.fitScore))
        : Math.round(
            localMatch.keywordsMatchPct * 0.6 +
              localMatch.formatScore * 0.2 +
              localMatch.impactScore * 0.2
          );

    return {
      fitScore,
      fitSummary:
        result.fitSummary ||
        `${candidateName || "Candidate"} shows solid technical capabilities aligning with ${jobTitle}.`,
      matchedSkills: Array.isArray(result.matchedSkills) && result.matchedSkills.length > 0
        ? result.matchedSkills.slice(0, 10)
        : localMatch.skills.present.slice(0, 8),
      missingSkills: Array.isArray(result.missingSkills) && result.missingSkills.length > 0
        ? result.missingSkills.slice(0, 8)
        : localMatch.skills.missing.slice(0, 6),
      recommendation: ["strong_hire", "hire", "hold", "reject"].includes(result.recommendation)
        ? result.recommendation
        : fitScore >= 80 ? "strong_hire" : fitScore >= 68 ? "hire" : "hold",
      strengths: Array.isArray(result.strengths) ? result.strengths.slice(0, 4) : [],
      redFlags: Array.isArray(result.redFlags) ? result.redFlags.slice(0, 3) : [],
    };
  } catch {
    return {
      fitScore: Math.round((localMatch.keywordsMatchPct + localMatch.formatScore) / 2),
      fitSummary: `${candidateName || "Candidate"} possesses key competencies matching ${jobTitle}.`,
      matchedSkills: localMatch.skills.present.slice(0, 8),
      missingSkills: localMatch.skills.missing.slice(0, 6),
      recommendation: "hire",
      strengths: ["Relevant technical foundation", "Standard ATS scannability"],
      redFlags: [],
    };
  }
}
