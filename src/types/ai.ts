export interface InterviewQuestion {
  question: string;
  category: string;
  stage?: string;
  answer?: string;
  keyTalkingPoints?: string[];
  rationale: string;
}

export interface ResumeComparisonInput {
  name: string;
  parsedText: string;
}

export interface ResumeComparison {
  name: string;
  overallScore: number;
  strengths: string[];
  improvements: string[];
}

export interface LinkedInAnalysisResult {
  overallScore: number;
  keywordsMatchPct: number;
  skillsGapJson: string;
  formatScore: number;
  impactScore: number;
  summaryText: string;
  suggestions: Array<{
    section: string;
    originalText: string;
    suggestedText: string;
    rationale: string;
  }>;
}

export interface RecommendedPosition {
  title: string;
  matchScore: number;
  rationale: string;
  keySkills: string[];
}

export interface RecommendedJob {
  title: string;
  company: string;
  rawText: string;
  matchReason: string;
  sourceUrl: string;
  applyUrls?: Array<{ label: string; url: string }>;
}

export interface OutreachPack {
  coverLetter: string;
  linkedinMessage: string;
  coldEmailSubject: string;
  coldEmailBody: string;
  followupEmailBody: string;
  elevatorPitch: string;
}

export interface StarBulletOption {
  title: string;
  bullet: string;
  starBreakdown: {
    situationTask: string;
    action: string;
    resultMetrics: string;
  };
}
