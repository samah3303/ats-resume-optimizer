export type PipelineStage =
  | "applied"
  | "screened"
  | "coding"
  | "ai_interview"
  | "live_interview"
  | "offer"
  | "hired"
  | "rejected";

export interface PipelineStageConfig {
  id: PipelineStage;
  title: string;
  icon: string;
  description: string;
  color: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  headerBg: string;
  dotColor: string;
}

export const PIPELINE_STAGES: PipelineStageConfig[] = [
  {
    id: "applied",
    title: "Applied",
    icon: "📥",
    description: "Initial application received and awaiting screening",
    color: "blue",
    badgeBg: "bg-blue-500/10",
    textColor: "text-blue-400",
    borderColor: "border-blue-500/30",
    headerBg: "bg-blue-950/20",
    dotColor: "bg-blue-400",
  },
  {
    id: "screened",
    title: "Screened",
    icon: "🔍",
    description: "Passed automated ATS scan and initial recruiter review",
    color: "cyan",
    badgeBg: "bg-cyan-500/10",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    headerBg: "bg-cyan-950/20",
    dotColor: "bg-cyan-400",
  },
  {
    id: "coding",
    title: "Code Challenge",
    icon: "💻",
    description: "Technical assessment or take-home code challenge issued",
    color: "purple",
    badgeBg: "bg-purple-500/10",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/30",
    headerBg: "bg-purple-950/20",
    dotColor: "bg-purple-400",
  },
  {
    id: "ai_interview",
    title: "AI Interview",
    icon: "🎙️",
    description: "Automated AI audio & behavioral screening evaluation",
    color: "amber",
    badgeBg: "bg-amber-500/10",
    textColor: "text-amber-400",
    borderColor: "border-amber-500/30",
    headerBg: "bg-amber-950/20",
    dotColor: "bg-amber-400",
  },
  {
    id: "live_interview",
    title: "Live Round",
    icon: "👥",
    description: "Hiring manager, panel, or onsite live interviews",
    color: "indigo",
    badgeBg: "bg-indigo-500/10",
    textColor: "text-indigo-400",
    borderColor: "border-indigo-500/30",
    headerBg: "bg-indigo-950/20",
    dotColor: "bg-indigo-400",
  },
  {
    id: "offer",
    title: "Offer Extended",
    icon: "💼",
    description: "Official employment offer letter issued to candidate",
    color: "emerald",
    badgeBg: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    headerBg: "bg-emerald-950/20",
    dotColor: "bg-emerald-400",
  },
  {
    id: "hired",
    title: "Hired",
    icon: "✅",
    description: "Offer accepted and onboarding preparations initiated",
    color: "teal",
    badgeBg: "bg-teal-500/10",
    textColor: "text-teal-400",
    borderColor: "border-teal-500/30",
    headerBg: "bg-teal-950/20",
    dotColor: "bg-teal-400",
  },
  {
    id: "rejected",
    title: "Rejected",
    icon: "❌",
    description: "Candidate archived or declined for this position",
    color: "rose",
    badgeBg: "bg-rose-500/10",
    textColor: "text-rose-400",
    borderColor: "border-rose-500/30",
    headerBg: "bg-rose-950/20",
    dotColor: "bg-rose-400",
  },
];

export const PIPELINE_STAGE_MAP: Record<PipelineStage, PipelineStageConfig> =
  PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage.id] = stage;
      return acc;
    },
    {} as Record<PipelineStage, PipelineStageConfig>
  );

export function getStageInfo(stage: string): PipelineStageConfig {
  const normalized = (stage?.toLowerCase().replace(/\s+/g, "_") || "applied") as PipelineStage;
  return (
    PIPELINE_STAGE_MAP[normalized] || {
      id: "applied",
      title: stage || "Applied",
      icon: "📥",
      description: "Applicant stage",
      color: "zinc",
      badgeBg: "bg-zinc-500/10",
      textColor: "text-zinc-400",
      borderColor: "border-zinc-500/30",
      headerBg: "bg-zinc-950/20",
      dotColor: "bg-zinc-400",
    }
  );
}

export interface ScorecardCriteria {
  technical?: number; // 1-100
  problemSolving?: number; // 1-100
  communication?: number; // 1-100
  cultureFit?: number; // 1-100
  [key: string]: number | undefined;
}

export type RecommendationType = "strong_hire" | "hire" | "hold" | "reject";

export interface CandidateScorecardData {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName?: string;
  reviewerEmail?: string;
  stage: PipelineStage | string;
  overallScore: number; // 1-100
  criteriaJson: string | ScorecardCriteria;
  feedback: string;
  recommendation: RecommendationType | string;
  createdAt?: string | Date;
}

export interface CandidateApplicationData {
  id: string;
  jobPostingId: string;
  candidateId?: string | null;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  resumeText: string;
  stage: PipelineStage;
  fitScore?: number | null; // 0-100
  fitSummary?: string | null;
  matchedSkills?: string[] | string | null;
  missingSkills?: string[] | string | null;
  notes?: string | null;
  createdAt: string | Date;
  updatedAt?: string | Date;
  scorecards?: CandidateScorecardData[];
  jobPosting?: JobPostingData;
}

export interface JobPostingData {
  id: string;
  organizationId?: string | null;
  userId?: string;
  title: string;
  department?: string | null;
  location: string;
  jobType: "full-time" | "part-time" | "contract" | "internship" | string;
  remotePolicy: "remote" | "hybrid" | "onsite" | string;
  salaryMin?: number | null;
  salaryMax?: number | null;
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
  createdAt?: string | Date;
  updatedAt?: string | Date;
  _count?: {
    applications?: number;
  };
  applications?: CandidateApplicationData[];
}

export interface RecruiterStats {
  activeJobsCount?: number;
  activePostings?: number;
  totalApplicants: number;
  interviewsScheduled?: number;
  inInterview?: number;
  offersExtended?: number;
  screened?: number;
  hired?: number;
  hiredCount?: number;
  avgTimeToHireDays?: number;
}
