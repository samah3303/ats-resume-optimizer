"use client";

import React from "react";
import { RecruiterStats, JobPostingData } from "./types";

interface RecruiterHeaderProps {
  stats?: RecruiterStats;
  activeJobsCount?: number;
  totalApplicants?: number;
  interviewsScheduled?: number;
  offersExtended?: number;
  onPostNewJob: () => void;
  onAiScreenResumes: () => void;
  companyName?: string;
  jobs?: JobPostingData[];
  selectedJobId?: string;
  onSelectJob?: (jobId: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export default function RecruiterHeader({
  stats,
  activeJobsCount = 0,
  totalApplicants = 0,
  interviewsScheduled = 0,
  offersExtended = 0,
  onPostNewJob,
  onAiScreenResumes,
  companyName = "OmniJob AI Talent Suite",
  jobs = [],
  selectedJobId = "all",
  onSelectJob,
  onRefresh,
  isRefreshing = false,
}: RecruiterHeaderProps) {
  // Use stats object if provided, otherwise fallback to explicit props
  const activeCount = stats?.activeJobsCount ?? stats?.activePostings ?? activeJobsCount;
  const applicantsCount = stats?.totalApplicants ?? totalApplicants;
  const interviewsCount = stats?.interviewsScheduled ?? stats?.inInterview ?? interviewsScheduled;
  const offersCount = stats?.offersExtended ?? offersExtended;

  return (
    <div className="space-y-6">
      {/* Top Banner with Actions */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 text-black shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Branding & Summary */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-black" />
                {companyName}
              </span>
              <span className="px-2.5 py-0.5 bg-zinc-100 text-zinc-700 border border-zinc-300 text-[11px] font-bold rounded-lg">
                Talent OS v3.0
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight flex items-center gap-3">
                <span>Recruiter & Talent Studio</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-2xl mt-1.5 leading-relaxed">
                Streamline hiring workflows with AI-powered resume screening, predictive ATS scorecards, and a real-time collaborative candidate pipeline.
              </p>
            </div>

            {/* Job Filter Pill Selector (if multiple jobs available) */}
            {jobs && jobs.length > 0 && onSelectJob && (
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-zinc-600 flex items-center gap-1">
                  🎯 Active Job Filter:
                </span>
                <select
                  value={selectedJobId}
                  onChange={(e) => onSelectJob(e.target.value)}
                  className="bg-white border border-zinc-300 focus:border-black text-xs font-semibold text-zinc-900 rounded-xl px-3 py-1.5 outline-none transition-all cursor-pointer hover:border-zinc-500 shadow-sm"
                >
                  <option value="all">All Active Pipelines ({jobs.length} Jobs)</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} {job.department ? `(${job.department})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right: Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh pipeline data"
                className="touch-target px-4 py-3 min-h-[44px] bg-white hover:bg-zinc-100 text-zinc-800 hover:text-black border border-zinc-300 hover:border-black text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-sm"
              >
                <span className={isRefreshing ? "animate-spin" : ""}>🔄</span>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}

            <button
              onClick={onAiScreenResumes}
              className="touch-target min-h-[44px] px-5 py-3 text-xs font-black text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-300 hover:border-black rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>⚡</span>
              <span>AI Screen Resumes</span>
            </button>

            <button
              onClick={onPostNewJob}
              className="touch-target min-h-[44px] px-5 py-3 text-xs font-black text-white bg-black hover:bg-zinc-800 border border-black rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span className="text-base font-black leading-none">+</span>
              <span>Post New Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Key Hiring Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Jobs */}
        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-black transition-colors">
              Active Jobs
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 text-sm">
              📋
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono">
              {activeCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <span>Published & sourcing</span>
            </div>
          </div>
        </div>

        {/* Total Applicants */}
        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-black transition-colors">
              Total Applicants
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 text-sm">
              👥
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono">
              {applicantsCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <span>Active in pipeline</span>
            </div>
          </div>
        </div>

        {/* Interviews Scheduled */}
        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-black transition-colors">
              Interviews Scheduled
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 text-sm">
              🎙️
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono">
              {interviewsCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
              <span>AI & Live panel rounds</span>
            </div>
          </div>
        </div>

        {/* Offers Extended */}
        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between group">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-zinc-500 group-hover:text-black transition-colors">
              Offers Extended
            </span>
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 text-sm">
              💼
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono">
              {offersCount}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <span>Pending & closed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
