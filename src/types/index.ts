// TypeScript interfaces for the application
export interface JobPreferences {
  locations?: string[];
  workModes?: string[];
  employmentTypes?: string[];
  platforms?: string[];
  minSalary?: string;
  experienceLevel?: string;
  keywords?: string[];
}

export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  location: string | null;
  targetRoles: string[];
  jobType: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  summary: string | null;
  atsScore: number | null;
  atsBreakdown: AtsBreakdown | null;
  recommendations: string[];
  resumeFileName?: string | null;
  preferences?: JobPreferences | null;
  onboardingDone: boolean;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  highlights?: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location?: string;
  year?: string;
  gpa?: string;
}

export interface AtsBreakdown {
  keywordScore: number;
  formatScore: number;
  impactScore: number;
  quantificationScore: number;
  details: string[];
}

export interface JobListing {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  salary: string | null;
  jobType: string | null;
  description: string | null;
  requirements: string | null;
  sourceUrl: string | null;
  source: string;
  matchScore: number | null;
  isBookmarked: boolean;
  createdAt: string;
  applications?: Array<{ id: string; status: string; appliedAt: string | null }>;
}

export interface ApplicationEntry {
  id: string;
  jobId: string;
  job: JobListing;
  status: ApplicationStatus;
  notes: string | null;
  contactPerson: string | null;
  interviewDate: string | null;
  appliedAt: string | null;
  statusHistory: StatusChange[];
  coverLetter: string | null;
  resumeUpdates: string | null;
  atsScore: number | null;
  createdAt: string;
}

export type ApplicationStatus =
  | "wishlist"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "accepted"
  | "rejected";

export const APPLICATION_STATUSES: {
  value: ApplicationStatus;
  label: string;
  color: string;
}[] = [
  { value: "wishlist", label: "Wishlist", color: "#9CA3AF" },
  { value: "applied", label: "Applied", color: "#2563EB" },
  { value: "phone_screen", label: "Phone Screen", color: "#CA8A04" },
  { value: "interview", label: "Interview", color: "#C49A2A" },
  { value: "offer", label: "Offer", color: "#16A34A" },
  { value: "accepted", label: "Accepted", color: "#16A34A" },
  { value: "rejected", label: "Rejected", color: "#DC2626" },
];

export interface StatusChange {
  from: string;
  to: string;
  date: string;
  note?: string;
}

export interface GeneratedContentItem {
  id: string;
  type:
    "cover_letter" | "followup_email" | "linkedin_message" | "resume_updates";
  content: string;
  jobId: string | null;
  createdAt: string;
}

export interface ResumeParseResult {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  rawText: string;
}

export interface DashboardStats {
  totalApplications: number;
  activeApplications: number;
  interviewsScheduled: number;
  offersReceived: number;
  atsScore: number | null;
  recentActivity: ActivityEntry[];
  statusDistribution: Record<ApplicationStatus, number>;
}

export interface ActivityEntry {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
}
