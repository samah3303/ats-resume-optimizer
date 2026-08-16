import { getDeepSeek, getAiModelName, parseJsonSafely } from "./client";

export interface CompensationPackage {
  companyName: string;
  roleTitle: string;
  location: string;
  baseSalary: number;
  annualBonusPercent: number; // e.g. 15 for 15%
  signOnBonus: number;
  equityTotalGrant: number; // Total $ value over 4 years
  equityVestingType: "standard_4yr_cliff" | "backloaded_amazon" | "equal_monthly" | "none";
  relocationBonus: number;
  employer401kMatch: number; // Annual $ contribution
  annualBonusAmount: number;
  year1TotalComp: number;
  year2TotalComp: number;
  year3TotalComp: number;
  year4TotalComp: number;
  total4YearComp: number;
  averageAnnualComp: number;
}

export interface RecruiterSimulationMessage {
  role: "user" | "recruiter";
  content: string;
}

export interface RecruiterSimulationTurnResponse {
  recruiterMessage: string;
  coachInsight: {
    tacticDetected: string;
    leverageAnalysis: string;
    suggestedResponses: string[];
    riskLevel: "low" | "medium" | "high";
    successProbability: number; // 0 to 100
  };
}

export interface CounterOfferLetterResult {
  subjectLine: string;
  salutation: string;
  openingAppreciation: string;
  coreJustification: string;
  specificCounterTerms: {
    component: string;
    originalOffer: string;
    requestedAmount: string;
    rationale: string;
  }[];
  closingCommitment: string;
  fullLetterMarkdown: string;
}

export interface OfferComparisonResult {
  winnerCompanyName: string;
  executiveSummary: string;
  scoredOffers: {
    companyName: string;
    overallScore: number; // 0 - 100
    compScore: number;
    growthScore: number;
    wlbScore: number;
    cultureScore: number;
    pros: string[];
    cons: string[];
    negotiationRecommendation: string;
  }[];
}

/**
 * Calculates accurate multi-year Total Compensation with vesting curves
 */
export function calculateCompBreakdown(input: {
  companyName: string;
  roleTitle: string;
  location?: string;
  baseSalary: number;
  annualBonusPercent?: number;
  signOnBonus?: number;
  equityTotalGrant?: number;
  equityVestingType?: "standard_4yr_cliff" | "backloaded_amazon" | "equal_monthly" | "none";
  relocationBonus?: number;
  employer401kMatch?: number;
}): CompensationPackage {
  const {
    companyName,
    roleTitle,
    location = "Remote",
    baseSalary = 160000,
    annualBonusPercent = 10,
    signOnBonus = 15000,
    equityTotalGrant = 120000,
    equityVestingType = "standard_4yr_cliff",
    relocationBonus = 0,
    employer401kMatch = 6000,
  } = input;

  const annualBonusAmount = Math.round(baseSalary * (annualBonusPercent / 100));

  // Determine equity distribution over 4 years
  let y1Equity = 0;
  let y2Equity = 0;
  let y3Equity = 0;
  let y4Equity = 0;

  if (equityVestingType === "standard_4yr_cliff" || equityVestingType === "equal_monthly") {
    // 25% each year
    y1Equity = equityTotalGrant * 0.25;
    y2Equity = equityTotalGrant * 0.25;
    y3Equity = equityTotalGrant * 0.25;
    y4Equity = equityTotalGrant * 0.25;
  } else if (equityVestingType === "backloaded_amazon") {
    // 5%, 15%, 40%, 40% (Amazon style)
    y1Equity = equityTotalGrant * 0.05;
    y2Equity = equityTotalGrant * 0.15;
    y3Equity = equityTotalGrant * 0.40;
    y4Equity = equityTotalGrant * 0.40;
  }

  const year1TotalComp = Math.round(
    baseSalary + annualBonusAmount + signOnBonus + relocationBonus + y1Equity + employer401kMatch
  );
  const year2TotalComp = Math.round(
    baseSalary + annualBonusAmount + y2Equity + employer401kMatch
  );
  const year3TotalComp = Math.round(
    baseSalary + annualBonusAmount + y3Equity + employer401kMatch
  );
  const year4TotalComp = Math.round(
    baseSalary + annualBonusAmount + y4Equity + employer401kMatch
  );

  const total4YearComp = year1TotalComp + year2TotalComp + year3TotalComp + year4TotalComp;
  const averageAnnualComp = Math.round(total4YearComp / 4);

  return {
    companyName,
    roleTitle,
    location,
    baseSalary,
    annualBonusPercent,
    annualBonusAmount,
    signOnBonus,
    equityTotalGrant,
    equityVestingType,
    relocationBonus,
    employer401kMatch,
    year1TotalComp,
    year2TotalComp,
    year3TotalComp,
    year4TotalComp,
    total4YearComp,
    averageAnnualComp,
  };
}

/**
 * Simulates a realistic interactive AI recruiter in a live salary negotiation roleplay
 */
export async function simulateRecruiterNegotiationTurn(params: {
  companyName: string;
  roleTitle: string;
  currentOffer: string;
  candidateGoal: string;
  recruiterPersona: "firm_enterprise" | "startup_founder" | "collaborative_recruiter";
  conversationHistory: RecruiterSimulationMessage[];
  latestCandidateMessage: string;
}): Promise<RecruiterSimulationTurnResponse> {
  const {
    companyName,
    roleTitle,
    currentOffer,
    candidateGoal,
    recruiterPersona,
    conversationHistory,
    latestCandidateMessage,
  } = params;

  const prompt = `You are an expert Salary Negotiation Simulator with a dual-brain:
1. Act as the REALISTIC RECRUITER negotiating compensation for ${companyName} (${roleTitle}).
2. Act as the SECRET EXECUTIVE COACH providing candid, tactical advice to the candidate.

## Context:
- Company: ${companyName}
- Role: ${roleTitle}
- Initial Offer Details: ${currentOffer}
- Candidate Target / Goal: ${candidateGoal}
- Recruiter Persona: ${recruiterPersona}

## Conversation History so far:
${conversationHistory
  .map((m) => `${m.role === "user" ? "Candidate" : "Recruiter"}: ${m.content}`)
  .join("\n")}
Candidate: ${latestCandidateMessage}

Instructions:
- Provide the recruiter's realistic in-character response. Don't fold immediately; use industry compensation logic (bands, internal equity, signing bonus levers, trade-offs).
- Provide the secret "Coach Insight" analyzing what tactic the recruiter just used, what leverage the candidate holds, 2 suggested exact script options for the candidate's next reply, risk level, and current success probability score (0-100).

Return JSON format:
{
  "recruiterMessage": "<Realistic, in-character recruiter message>",
  "coachInsight": {
    "tacticDetected": "<e.g., Band Anchoring / Equity Tradeoff / Exploding Timeline>",
    "leverageAnalysis": "<Detailed analysis of where the candidate has strong leverage>",
    "suggestedResponses": [
      "<Option 1: Assertive value-anchored response>",
      "<Option 2: Collaborative trade-off response focusing on sign-on or equity>"
    ],
    "riskLevel": "<"low" | "medium" | "high">",
    "successProbability": <Integer 0 to 100>
  }
}`;

  try {
    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1800,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return parseJsonSafely<RecruiterSimulationTurnResponse>(content, {
      recruiterMessage:
        "Thank you for sharing your thoughts. While our base salary bands for this level are relatively firm, I can check with leadership to see if we have any flexibility on the sign-on bonus or equity grant.",
      coachInsight: {
        tacticDetected: "Base Salary Band Anchoring",
        leverageAnalysis: "The recruiter has flexibility on non-base components (Sign-on Bonus, Equity). Pivot your ask there.",
        suggestedResponses: [
          "I understand base bands are structured. If we bridge the $15k gap through an increased sign-on bonus, I'm ready to sign today.",
          "Could we explore adjusting the initial equity grant to better align with the overall compensation target?"
        ],
        riskLevel: "low",
        successProbability: 75,
      },
    });
  } catch (err) {
    console.error("Recruiter simulation turn error:", err);
    return {
      recruiterMessage:
        "I appreciate you bringing this to my attention. Let me take this back to the compensation committee and see what adjustments might be possible.",
      coachInsight: {
        tacticDetected: "Internal Escalation Delay",
        leverageAnalysis: "They are willing to advocate internally. Maintain excitement and reiterate your commitment upon agreement.",
        suggestedResponses: [
          "Thank you for advocating for this. I'm very excited about the team and look forward to hearing what the committee says."
        ],
        riskLevel: "low",
        successProbability: 70,
      },
    };
  }
}

/**
 * Generates an executive-level formal written counter-offer email
 */
export async function generateExecutiveCounterLetter(params: {
  candidateName: string;
  companyName: string;
  roleTitle: string;
  recruiterName: string;
  currentBase: number;
  requestedBase: number;
  currentEquity: number;
  requestedEquity: number;
  currentSignOn: number;
  requestedSignOn: number;
  keyLeveragePoints: string;
}): Promise<CounterOfferLetterResult> {
  const {
    candidateName,
    companyName,
    roleTitle,
    recruiterName,
    currentBase,
    requestedBase,
    currentEquity,
    requestedEquity,
    currentSignOn,
    requestedSignOn,
    keyLeveragePoints,
  } = params;

  const prompt = `You are the world's leading executive compensation negotiator.
Draft an elite, polite, highly persuasive formal counter-offer email for a software engineering candidate.

## Context:
- Candidate Name: ${candidateName}
- Company: ${companyName}
- Role: ${roleTitle}
- Recruiter Name: ${recruiterName}
- Base: Current $${currentBase} -> Requested $${requestedBase}
- Equity: Current $${currentEquity} -> Requested $${requestedEquity}
- Sign-On: Current $${currentSignOn} -> Requested $${requestedSignOn}
- Key Leverage & Value Points: ${keyLeveragePoints}

Rules:
1. Tone: Enthusiastic about the team, highly professional, non-confrontational, grounded in market value and specific impact.
2. Structure:
   - Genuine excitement & gratitude for the offer.
   - Specific, structured breakdown of counter-proposal terms with clear business justification.
   - Definitive closing statement expressing commitment to accept immediately if terms are met.

Return JSON format:
{
  "subjectLine": "Discussion regarding ${roleTitle} offer – ${candidateName}",
  "salutation": "Dear ${recruiterName},",
  "openingAppreciation": "<2 sentences expressing genuine excitement for the role and team>",
  "coreJustification": "<1-2 paragraphs highlighting market alignment, unique domain experience, and technical leadership>",
  "specificCounterTerms": [
    {
      "component": "Base Salary",
      "originalOffer": "$${currentBase.toLocaleString()}",
      "requestedAmount": "$${requestedBase.toLocaleString()}",
      "rationale": "<Reasoning>"
    },
    {
      "component": "Equity Grant",
      "originalOffer": "$${currentEquity.toLocaleString()}",
      "requestedAmount": "$${requestedEquity.toLocaleString()}",
      "rationale": "<Reasoning>"
    },
    {
      "component": "Sign-On Bonus",
      "originalOffer": "$${currentSignOn.toLocaleString()}",
      "requestedAmount": "$${requestedSignOn.toLocaleString()}",
      "rationale": "<Reasoning>"
    }
  ],
  "closingCommitment": "<Closing pledge to sign immediately if terms are reached>",
  "fullLetterMarkdown": "<Complete copy-ready email in clean Markdown format>"
}`;

  try {
    const response = await getDeepSeek().chat.completions.create({
      model: getAiModelName(),
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 2200,
    });

    const content = response.choices[0]?.message?.content || "{}";
    return parseJsonSafely<CounterOfferLetterResult>(content, {
      subjectLine: `Offer Discussion – ${roleTitle} – ${candidateName}`,
      salutation: `Dear ${recruiterName},`,
      openingAppreciation: `Thank you so much for extending the offer to join ${companyName} as ${roleTitle}. I was genuinely impressed by the vision of the engineering team.`,
      coreJustification: `Given my background in ${keyLeveragePoints || "delivering scalable systems"}, I am confident in my ability to immediately accelerate your product roadmap.`,
      specificCounterTerms: [
        {
          component: "Base Salary",
          originalOffer: `$${currentBase.toLocaleString()}`,
          requestedAmount: `$${requestedBase.toLocaleString()}`,
          rationale: "Aligning with senior market benchmarks for this engineering scope.",
        },
      ],
      closingCommitment: `If we can agree on these adjusted terms, I would be thrilled to accept and sign the agreement immediately.`,
      fullLetterMarkdown: `Dear ${recruiterName},\n\nThank you for the offer to join ${companyName}. Based on market data and my technical background, I would like to propose a base salary of $${requestedBase.toLocaleString()}.\n\nBest regards,\n${candidateName}`,
    });
  } catch (err) {
    console.error("Counter letter generation error:", err);
    return {
      subjectLine: `Regarding ${roleTitle} offer – ${candidateName}`,
      salutation: `Dear ${recruiterName},`,
      openingAppreciation: `Thank you for extending the offer for ${roleTitle} at ${companyName}.`,
      coreJustification: `I am very excited about the opportunity and would love to align on a compensation structure that reflects the scope of the role.`,
      specificCounterTerms: [],
      closingCommitment: `Looking forward to your thoughts.`,
      fullLetterMarkdown: `Dear ${recruiterName},\n\nThank you for the offer. I look forward to finalizing terms.\n\nBest,\n${candidateName}`,
    };
  }
}
