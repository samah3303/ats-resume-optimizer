export interface RecruiterProfile {
  id: string;
  userId: string;
  companyName: string;
  role: string;
  organizationId?: string | null;
}

export interface JobPostingData {
  id: string;
  userId?: string;
  organizationId?: string | null;
  title: string;
  department: string;
  location: string;
  jobType: string;
  remotePolicy: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  description: string;
  requirements: string;
  status: "active" | "draft" | "closed" | string;
  applicantCount?: number;
  stageBreakdown?: {
    applied?: number;
    screened?: number;
    coding?: number;
    ai_interview?: number;
    live_interview?: number;
    offer?: number;
    hired?: number;
    rejected?: number;
    total?: number;
    [key: string]: number | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ScorecardItem {
  id: string;
  stage: string;
  overallScore: number;
  criteria: {
    technical?: number;
    problemSolving?: number;
    communication?: number;
    culturalFit?: number;
  };
  feedback: string;
  recommendation: "strong_hire" | "hire" | "hold" | "reject" | string;
  reviewerName: string;
  createdAt: string;
}

export interface CandidateApplicationData {
  id: string;
  jobPostingId: string;
  jobTitle?: string;
  department?: string;
  candidateId?: string | null;
  candidateName: string;
  candidateEmail: string;
  resumeText: string;
  stage: string;
  fitScore: number | null;
  fitSummary: string | null;
  matchedSkills: string[];
  missingSkills: string[];
  notes: string | null;
  scorecards?: ScorecardItem[];
  scorecardsCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RecruiterStats {
  activePostings?: number;
  activeJobsCount?: number;
  totalApplicants: number;
  screened?: number;
  inInterview?: number;
  interviewsScheduled?: number;
  offersExtended?: number;
  hired?: number;
  hiredCount?: number;
}

export const PIPELINE_STAGES = [
  {
    key: "applied",
    label: "Applied / Inbound",
    shortLabel: "Applied",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-300",
    headerBg: "bg-zinc-100",
    dotColor: "bg-zinc-900",
    emoji: "📥",
  },
  {
    key: "screened",
    label: "AI Screened",
    shortLabel: "Screened",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-300",
    headerBg: "bg-zinc-100",
    dotColor: "bg-black",
    emoji: "⚡",
  },
  {
    key: "coding",
    label: "Technical Assessment",
    shortLabel: "Coding",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-300",
    headerBg: "bg-zinc-100",
    dotColor: "bg-zinc-900",
    emoji: "💻",
  },
  {
    key: "ai_interview",
    label: "AI Mock / Screening",
    shortLabel: "AI Interview",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-300",
    headerBg: "bg-zinc-100",
    dotColor: "bg-zinc-900",
    emoji: "🤖",
  },
  {
    key: "live_interview",
    label: "Live Panel Interview",
    shortLabel: "Interview",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-300",
    headerBg: "bg-zinc-100",
    dotColor: "bg-zinc-900",
    emoji: "🎙️",
  },
  {
    key: "offer",
    label: "Offer Extended",
    shortLabel: "Offer",
    badgeColor: "bg-zinc-100 text-zinc-900 border-zinc-300",
    headerBg: "bg-zinc-100",
    dotColor: "bg-black",
    emoji: "📜",
  },
  {
    key: "hired",
    label: "Hired Candidates",
    shortLabel: "Hired",
    badgeColor: "bg-black text-white border-black",
    headerBg: "bg-zinc-100",
    dotColor: "bg-black",
    emoji: "🎉",
  },
  {
    key: "rejected",
    label: "Archived / Rejected",
    shortLabel: "Archived",
    badgeColor: "bg-zinc-100 text-zinc-500 border-zinc-200",
    headerBg: "bg-zinc-100",
    dotColor: "bg-zinc-400",
    emoji: "📁",
  },
] as const;

export type PipelineStageKey = typeof PIPELINE_STAGES[number]["key"];
