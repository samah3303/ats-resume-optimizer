"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  JobPostingData,
  CandidateApplicationData,
  RecruiterStats,
  PIPELINE_STAGES,
} from "@/components/recruiter/types";
import JobPostingModal from "@/components/recruiter/JobPostingModal";
import AtsScreeningModal from "@/components/recruiter/AtsScreeningModal";
import CandidateDetailModal from "@/components/recruiter/CandidateDetailModal";

export default function RecruiterCommandCenterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RecruiterStats>({
    activePostings: 0,
    totalApplicants: 0,
    screened: 0,
    inInterview: 0,
    hired: 0,
  });
  const [jobs, setJobs] = useState<JobPostingData[]>([]);
  const [recentApplicants, setRecentApplicants] = useState<
    CandidateApplicationData[]
  >([]);
  const [companyName, setCompanyName] = useState("Talent Studio");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal States
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPostingData | null>(null);

  const [screeningModalJob, setScreeningModalJob] =
    useState<JobPostingData | null>(null);

  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateApplicationData | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/recruiter/jobs");
      if (res.ok) {
        const data = await res.json();
        setStats(
          data.stats || {
            activePostings: 0,
            totalApplicants: 0,
            screened: 0,
            inInterview: 0,
            hired: 0,
          }
        );
        setJobs(data.jobs || []);
        setRecentApplicants(data.recentApplicants || []);
        if (data.profile?.companyName) {
          setCompanyName(data.profile.companyName);
        }
      }
    } catch {
      toast("Failed to load recruiter data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const handleStageChange = async (candidateId: string, newStage: string) => {
    // Find job posting ID for this candidate
    const candidate = recentApplicants.find((c) => c.id === candidateId);
    const jobId = candidate?.jobPostingId || (jobs.length > 0 ? jobs[0].id : "");

    if (!jobId) return;

    try {
      const res = await fetch(`/api/recruiter/pipeline/${jobId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: candidateId,
          stage: newStage,
        }),
      });

      if (res.ok) {
        setRecentApplicants((prev) =>
          prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
        );
        if (selectedCandidate && selectedCandidate.id === candidateId) {
          setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));
        }
        await fetchData();
      } else {
        toast("Failed to advance stage", "error");
      }
    } catch {
      toast("Failed to advance stage", "error");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : job.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getScoreBadge = (score: number | null) => {
    if (score === null || score === undefined) {
      return "bg-zinc-100 text-zinc-500 border-zinc-200";
    }
    if (score >= 85) {
      return "bg-black text-white border-black font-black";
    }
    if (score >= 70) {
      return "bg-zinc-100 text-zinc-900 border-zinc-300 font-bold";
    }
    return "bg-zinc-50 text-zinc-600 border-zinc-200 font-medium";
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return "Competitive Salary";
    const symbol = currency === "INR" ? "₹" : "$";
    if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    if (min) return `From ${symbol}${min.toLocaleString()}`;
    return `Up to ${symbol}${max?.toLocaleString()}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="h-32 bg-zinc-100 rounded-3xl animate-pulse border border-zinc-200" />

          {/* Metric Cards Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-28 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200"
              />
            ))}
          </div>

          {/* Job Postings Skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-48 bg-zinc-100 rounded-xl animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-48 bg-zinc-100 rounded-3xl animate-pulse border border-zinc-200"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Recruiter Hero Command Header */}
        <div className="relative overflow-hidden bg-zinc-50 rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white border border-zinc-300 text-zinc-900 shadow-sm">
                <span>👔 Talent Acquisition Hub</span>
                <span>•</span>
                <span>{companyName}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black">
                Recruiter Command Center
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl leading-relaxed">
                Autonomous candidate screening, real-time stage progression, and AI-powered ATS resume matching.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  setEditingJob(null);
                  setShowJobModal(true);
                }}
                className="px-5 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs sm:text-sm rounded-2xl transition-all shadow-sm border border-black flex items-center gap-2 hover:scale-[1.02] active:scale-95"
              >
                <span>+ Post New Job</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5-Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Active Postings */}
          <div className="p-5 bg-white border border-zinc-200 hover:border-black rounded-3xl space-y-2 shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Active Postings
              </span>
              <span className="w-7 h-7 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm">
                💼
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                {stats.activePostings}
              </span>
              <span className="text-[10px] font-bold text-zinc-500">Live</span>
            </div>
          </div>

          {/* Total Applicants */}
          <div className="p-5 bg-white border border-zinc-200 hover:border-black rounded-3xl space-y-2 shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Total Applicants
              </span>
              <span className="w-7 h-7 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm">
                👥
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                {stats.totalApplicants}
              </span>
              <span className="text-[10px] font-bold text-zinc-500">Candidates</span>
            </div>
          </div>

          {/* Screened */}
          <div className="p-5 bg-white border border-zinc-200 hover:border-black rounded-3xl space-y-2 shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                AI Screened
              </span>
              <span className="w-7 h-7 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm">
                ⚡
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                {stats.screened || 0}
              </span>
              <span className="text-[10px] font-bold text-zinc-500">
                {(stats.totalApplicants || 0) > 0
                  ? `${Math.round(((stats.screened || 0) / stats.totalApplicants) * 100)}%`
                  : "0%"}
              </span>
            </div>
          </div>

          {/* In-Interview */}
          <div className="p-5 bg-white border border-zinc-200 hover:border-black rounded-3xl space-y-2 shadow-sm transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                In-Interview
              </span>
              <span className="w-7 h-7 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm">
                🎙️
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                {stats.inInterview || 0}
              </span>
              <span className="text-[10px] font-bold text-zinc-500">Active</span>
            </div>
          </div>

          {/* Hired */}
          <div className="p-5 bg-white border border-zinc-200 hover:border-black rounded-3xl space-y-2 shadow-sm transition-all col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                Hired
              </span>
              <span className="w-7 h-7 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-900 flex items-center justify-center text-sm">
                🎉
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                {stats.hired || 0}
              </span>
              <span className="text-[10px] font-bold text-zinc-500">Offers</span>
            </div>
          </div>
        </div>

        {/* Section: Active Job Openings */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                Active Job Openings
              </h2>
              <p className="text-xs text-zinc-500">
                Track candidate pipeline distributions and launch automated ATS screenings
              </p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="px-3.5 py-2 bg-white border border-zinc-300 focus:border-black rounded-xl text-xs text-black placeholder-zinc-400 outline-none w-48 transition-colors shadow-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-zinc-300 focus:border-black rounded-xl text-xs text-black outline-none cursor-pointer shadow-sm"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="draft">Drafts</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Job Openings Grid */}
          {filteredJobs.length === 0 ? (
            <div className="p-12 text-center bg-zinc-50 border border-zinc-200 rounded-3xl space-y-4 shadow-sm">
              <span className="text-4xl block">💼</span>
              <h3 className="text-base font-black text-black">No Job Openings Found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Post your first job opening to start receiving and screening candidates with OmniJob AI.
              </p>
              <button
                onClick={() => {
                  setEditingJob(null);
                  setShowJobModal(true);
                }}
                className="px-5 py-2.5 bg-black text-white text-xs font-black rounded-xl hover:bg-zinc-800 transition-colors border border-black shadow-sm"
              >
                + Post New Job
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredJobs.map((job) => {
                const breakdown = job.stageBreakdown || {
                  total: job.applicantCount || 0,
                  applied: 0,
                  screened: 0,
                  coding: 0,
                  ai_interview: 0,
                  live_interview: 0,
                  offer: 0,
                  hired: 0,
                  rejected: 0,
                };
                const total = breakdown.total || 1;
                const appliedPct = ((breakdown.applied || 0) / total) * 100;
                const screenedPct = ((breakdown.screened || 0) / total) * 100;
                const interviewPct =
                  (((breakdown.coding || 0) +
                    (breakdown.ai_interview || 0) +
                    (breakdown.live_interview || 0)) /
                    total) *
                  100;
                const offerPct =
                  (((breakdown.offer || 0) + (breakdown.hired || 0)) /
                    total) *
                  100;
                const rejectedPct = ((breakdown.rejected || 0) / total) * 100;

                return (
                  <div
                    key={job.id}
                    className="bg-white border border-zinc-200 hover:border-black rounded-3xl p-6 text-zinc-900 shadow-sm transition-all flex flex-col justify-between space-y-5 group"
                  >
                    <div className="space-y-4">
                      {/* Top Bar: Department, Status & Applicant Badge */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-300">
                            {job.department}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              job.status === "active"
                                ? "bg-zinc-900 text-white border border-black"
                                : job.status === "draft"
                                ? "bg-zinc-100 text-zinc-800 border border-zinc-300"
                                : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                            }`}
                          >
                            {job.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs font-black text-black bg-zinc-50 px-3 py-1 rounded-xl border border-zinc-200">
                          <span>👥</span>
                          <span>{job.applicantCount || 0}</span>
                          <span className="text-zinc-500 text-[10px] font-medium">candidates</span>
                        </div>
                      </div>

                      {/* Job Title */}
                      <div>
                        <Link
                          href={`/dashboard/recruiter/pipeline/${job.id}`}
                          className="text-lg sm:text-xl font-black text-black hover:underline transition-colors"
                        >
                          {job.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 pt-1 font-medium">
                          <span>📍 {job.location}</span>
                          <span>•</span>
                          <span className="capitalize">💼 {job.jobType}</span>
                          <span>•</span>
                          <span className="capitalize">🌐 {job.remotePolicy}</span>
                          {job.salaryMin && job.salaryMax && (
                            <>
                              <span>•</span>
                              <span className="text-black font-bold">
                                {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Description Preview */}
                      <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed font-normal">
                        {job.description}
                      </p>

                      {/* Stage Distribution Mini-Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                          <span>Pipeline Stage Distribution</span>
                          <span>
                            {breakdown.screened || 0} Screened • {(breakdown.live_interview || 0) + (breakdown.coding || 0) + (breakdown.ai_interview || 0)} Interviewing
                          </span>
                        </div>

                        {(job.applicantCount || 0) > 0 ? (
                          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200">
                            <div
                              style={{ width: `${appliedPct}%` }}
                              className="bg-zinc-400"
                              title={`Applied: ${breakdown.applied || 0}`}
                            />
                            <div
                              style={{ width: `${screenedPct}%` }}
                              className="bg-zinc-600"
                              title={`Screened: ${breakdown.screened || 0}`}
                            />
                            <div
                              style={{ width: `${interviewPct}%` }}
                              className="bg-zinc-800"
                              title={`Interview: ${(breakdown.coding || 0) + (breakdown.ai_interview || 0) + (breakdown.live_interview || 0)}`}
                            />
                            <div
                              style={{ width: `${offerPct}%` }}
                              className="bg-black"
                              title={`Offers: ${(breakdown.offer || 0) + (breakdown.hired || 0)}`}
                            />
                            <div
                              style={{ width: `${rejectedPct}%` }}
                              className="bg-zinc-300"
                              title={`Rejected: ${breakdown.rejected || 0}`}
                            />
                          </div>
                        ) : (
                          <div className="h-2 w-full bg-zinc-100 rounded-full border border-zinc-200" />
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-200 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingJob(job);
                            setShowJobModal(true);
                          }}
                          className="px-3 py-2 bg-white hover:bg-zinc-100 border border-zinc-300 hover:border-black text-xs font-bold text-zinc-800 rounded-xl transition-all shadow-sm"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setScreeningModalJob(job)}
                          className="px-3.5 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 hover:border-black text-xs font-bold text-zinc-900 rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span>⚡ AI Screen</span>
                        </button>
                      </div>

                      <Link
                        href={`/dashboard/recruiter/pipeline/${job.id}`}
                        className="px-5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl transition-all shadow-sm border border-black flex items-center gap-1.5"
                      >
                        <span>View Pipeline</span>
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section: Recent Applicants Stream Across All Jobs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                Recent Applicants Stream
              </h2>
              <p className="text-xs text-zinc-500">
                1-click stage advancement and candidate ATS scorecard inspection
              </p>
            </div>
            <span className="text-xs font-mono text-black font-bold">
              {recentApplicants.length} Active Stream
            </span>
          </div>

          {recentApplicants.length === 0 ? (
            <div className="p-8 text-center bg-zinc-50 border border-zinc-200 rounded-3xl shadow-sm">
              <p className="text-xs text-zinc-500 italic">
                No recent applicants yet. Post a job or add candidate profiles.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-800">
                  <thead className="bg-zinc-50 border-b border-zinc-200 text-[10px] font-black uppercase tracking-wider text-zinc-600">
                    <tr>
                      <th className="py-4 px-5">Candidate</th>
                      <th className="py-4 px-4">Job Opening</th>
                      <th className="py-4 px-4">AI Fit Match</th>
                      <th className="py-4 px-4">Stage</th>
                      <th className="py-4 px-4">Quick Advance</th>
                      <th className="py-4 px-4 text-right">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {recentApplicants.map((applicant) => {
                      const currentStage =
                        PIPELINE_STAGES.find((s) => s.key === applicant.stage) ||
                        PIPELINE_STAGES[0];

                      return (
                        <tr
                          key={applicant.id}
                          className="hover:bg-zinc-50 transition-colors cursor-pointer"
                          onClick={() => setSelectedCandidate(applicant)}
                        >
                          {/* Candidate Name & Email */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-300 text-black font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                                {applicant.candidateName
                                  .split(" ")
                                  .map((w) => w[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <span className="font-extrabold text-xs text-black block truncate">
                                  {applicant.candidateName}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono truncate block">
                                  {applicant.candidateEmail}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Job Opening */}
                          <td className="py-4 px-4">
                            <span className="font-bold text-zinc-900 block truncate">
                              {applicant.jobTitle || "Engineering"}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              {applicant.department || "General"}
                            </span>
                          </td>

                          {/* Fit Score */}
                          <td className="py-4 px-4">
                            {applicant.fitScore !== null ? (
                              <span
                                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-sm ${getScoreBadge(
                                  applicant.fitScore
                                )}`}
                              >
                                {applicant.fitScore}% ATS
                              </span>
                            ) : (
                              <span className="text-[10px] text-zinc-500">
                                Unscreened
                              </span>
                            )}
                          </td>

                          {/* Stage Pill */}
                          <td className="py-4 px-4">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-sm ${currentStage.badgeColor}`}
                            >
                              {currentStage.emoji} {currentStage.shortLabel}
                            </span>
                          </td>

                          {/* 1-Click Quick Advance Dropdown */}
                          <td
                            className="py-4 px-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={applicant.stage}
                              onChange={(e) =>
                                handleStageChange(applicant.id, e.target.value)
                              }
                              className="px-2.5 py-1 bg-white border border-zinc-300 focus:border-black text-xs font-bold text-black rounded-xl outline-none cursor-pointer shadow-sm"
                            >
                              {PIPELINE_STAGES.map((s) => (
                                <option key={s.key} value={s.key}>
                                  {s.emoji} {s.shortLabel}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Applied Date */}
                          <td className="py-4 px-4 text-right font-mono text-[10px] text-zinc-500">
                            {new Date(applicant.createdAt).toLocaleDateString(
                              undefined,
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Job Posting Modal (Create / Edit) */}
        <JobPostingModal
          open={showJobModal}
          initialData={editingJob}
          onClose={() => {
            setShowJobModal(false);
            setEditingJob(null);
          }}
          onSaved={async () => {
            await fetchData();
          }}
        />

        {/* ATS Batch Screening Modal */}
        {screeningModalJob && (
          <AtsScreeningModal
            open={!!screeningModalJob}
            jobId={screeningModalJob.id}
            jobTitle={screeningModalJob.title}
            candidateCount={screeningModalJob.applicantCount}
            onClose={() => setScreeningModalJob(null)}
            onScreeningCompleted={async () => {
              await fetchData();
            }}
          />
        )}

        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <CandidateDetailModal
            open={!!selectedCandidate}
            candidate={selectedCandidate}
            jobId={selectedCandidate.jobPostingId}
            onClose={() => setSelectedCandidate(null)}
            onStageChange={handleStageChange}
            onCandidateUpdated={async () => {
              await fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
}
