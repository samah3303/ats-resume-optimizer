export interface Resume {
  id: string;
  name: string;
  parsedText: string;
  isPrimary?: boolean;
  createdAt: string;
}

export interface Analysis {
  id: string;
  overallScore: number | null;
  createdAt: string;
  resume?: { name: string };
  jobDescription?: { title: string };
}

export interface WeekTask {
  id: string;
  weekNumber: number;
  phase: string;
  focusTitle: string;
  tasks: string[];
  completedTasks?: boolean[];
  milestone: string;
}

export interface Roadmap {
  id: string;
  strategyOverview: string | null;
  generationCount?: number;
  generatedAt: string;
  weeks: WeekTask[];
}

export interface OnboardingProfileData {
  resumeId?: string | null;
  targetPositions: string;
  targetCountry: string;
  linkedinUrl: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  industry?: string | null;
  jobType?: string | null;
  generalAtsScore: number | null;
  linkedinOpts: string | null;
  resumeImprovements: string | null;
  coreSkills: string | null;
}

export interface ResumeImprovement {
  section: string;
  current: string;
  suggested: string;
  reason: string;
  atsBoost?: string | number;
}
