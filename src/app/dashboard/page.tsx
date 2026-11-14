"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { UserProfile, DashboardStats } from "@/types";
import AtsScoreTile from "@/components/dashboard/AtsScoreTile";
import ProfileSummaryTile from "@/components/dashboard/ProfileSummaryTile";
import JobsAppliedTile from "@/components/dashboard/JobsAppliedTile";
import RecommendedJobsTile from "@/components/dashboard/RecommendedJobsTile";
import ResumeRecommendationsTile from "@/components/dashboard/ResumeRecommendationsTile";
import QuickLinksTile from "@/components/dashboard/QuickLinksTile";
import RecentActivityTile from "@/components/dashboard/RecentActivityTile";
import JobSearchTipsTile from "@/components/dashboard/JobSearchTipsTile";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<
    Array<{
      id: string;
      title: string;
      company: string | null;
      matchScore: number | null;
    }>
  >([]);
  const [searchTips, setSearchTips] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profRes, statsRes, matchRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/dashboard/stats"),
        fetch("/api/jobs/match").catch(() => null),
      ]);

      if (profRes.ok) {
        const pData = await profRes.json();
        setProfile(pData);
      }
      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
      }

      let matchedJobList: Array<{
        id: string;
        title: string;
        company: string | null;
        matchScore: number | null;
      }> = [];

      if (matchRes && matchRes.ok) {
        const mData = await matchRes.json();
        if (Array.isArray(mData.jobs) && mData.jobs.length > 0) {
          matchedJobList = mData.jobs;
        }
        if (Array.isArray(mData.industryTips)) {
          setSearchTips(mData.industryTips);
        }
      }

      // If AI match didn't return vacancies, fallback to user's tracked jobs sorted by matchScore
      if (matchedJobList.length === 0) {
        try {
          const userJobsRes = await fetch("/api/jobs");
          if (userJobsRes.ok) {
            const userJobs = await userJobsRes.json();
            if (Array.isArray(userJobs)) {
              matchedJobList = [...userJobs]
                .sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0))
                .map((j) => ({
                  id: j.id,
                  title: j.title,
                  company: j.company,
                  matchScore: j.matchScore,
                }));
            }
          }
        } catch {
          // Ignore fallback error
        }
      }

      setRecommendedJobs(matchedJobList);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to fetch dashboard updates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAnalyzeResume = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch("/api/resume/analyze", { method: "POST" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Analysis failed");
      }
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to run ATS analysis"
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 w-full border border-[#DFDFDF] bg-white rounded-[4px] p-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 border border-[#DFDFDF] bg-white rounded-[4px] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const hasResume = Boolean(
    profile?.resumeFileName || (profile?.atsScore && profile.atsScore > 0)
  );
  const hasPreferences = Boolean(
    profile?.preferences?.locations?.length ||
      profile?.preferences?.platforms?.length
  );
  const hasApplied = Boolean(
    stats?.totalApplications && stats.totalApplications > 0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Overview Header Banner */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFDA1A] text-[#111111] text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-[#003399]" />
            Dashboard
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            {getGreeting()}, {profile?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-xs sm:text-sm text-[#484848] mt-0.5 sm:mt-1">
            Check your resume score, find matching jobs, and track applications.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto shrink-0">
          <button
            onClick={handleAnalyzeResume}
            disabled={analyzing}
            className="nordic-btn-primary text-xs sm:text-sm h-11 px-3 sm:px-5 cursor-pointer disabled:opacity-50 tap-active font-bold justify-center"
          >
            <svg
              className={`w-4 h-4 ${analyzing ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            {analyzing ? "Scanning..." : "Scan Resume"}
          </button>

          <Link
            href="/dashboard/jobs"
            className="nordic-btn-yellow text-xs sm:text-sm h-11 px-3 sm:px-5 flex items-center justify-center gap-2 text-center tap-active font-bold"
          >
            <span className="text-base">✨</span>
            <span>Find Jobs</span>
          </Link>
        </div>
      </div>

      {/* 3-Step Guided Mission Bar */}
      {(!hasResume || !hasPreferences || !hasApplied) && (
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-6 bg-gradient-to-r from-white via-white to-[#F9FAFB] border border-[#DFDFDF] shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DFDFDF] pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#003399]" />
                <h3 className="font-bold text-sm sm:text-base text-[#111111]">
                  Your Job Search Setup Checklist
                </h3>
              </div>
              <p className="text-xs text-[#767676] mt-0.5">
                Complete these 3 simple steps to start receiving high-matching job openings.
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 bg-[#003399]/10 text-[#003399] rounded-[3px] self-start sm:self-auto">
              {[hasResume, hasPreferences, hasApplied].filter(Boolean).length} / 3 Completed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/dashboard/profile"
              className={`p-3.5 rounded-xl sm:rounded-[4px] border transition-all tap-active flex items-start gap-3 ${
                hasResume
                  ? "bg-[#0A8A00]/5 border-[#0A8A00]/30"
                  : "bg-white border-[#003399] shadow-xs ring-1 ring-[#003399]/20"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  hasResume ? "bg-[#0A8A00] text-white" : "bg-[#003399] text-white"
                }`}
              >
                {hasResume ? "✓" : "1"}
              </span>
              <div>
                <span className="text-xs font-bold text-[#111111] block">
                  1. Upload Resume
                </span>
                <span className="text-[11px] text-[#767676]">
                  {hasResume ? "Scanned & ready" : "Extract skills & score"}
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/profile"
              className={`p-3.5 rounded-xl sm:rounded-[4px] border transition-all tap-active flex items-start gap-3 ${
                hasPreferences
                  ? "bg-[#0A8A00]/5 border-[#0A8A00]/30"
                  : "bg-white border-[#DFDFDF] hover:border-[#003399]"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  hasPreferences ? "bg-[#0A8A00] text-white" : "bg-[#FFDA1A] text-[#111111]"
                }`}
              >
                {hasPreferences ? "✓" : "2"}
              </span>
              <div>
                <span className="text-xs font-bold text-[#111111] block">
                  2. Set Job Preferences
                </span>
                <span className="text-[11px] text-[#767676]">
                  {hasPreferences ? "Platforms & locations set" : "Gulf, Indeed, LinkedIn"}
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard/jobs"
              className={`p-3.5 rounded-xl sm:rounded-[4px] border transition-all tap-active flex items-start gap-3 ${
                hasApplied
                  ? "bg-[#0A8A00]/5 border-[#0A8A00]/30"
                  : "bg-white border-[#DFDFDF] hover:border-[#003399]"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                  hasApplied ? "bg-[#0A8A00] text-white" : "bg-[#111111] text-white"
                }`}
              >
                {hasApplied ? "✓" : "3"}
              </span>
              <div>
                <span className="text-xs font-bold text-[#111111] block">
                  3. Find & Apply to Jobs
                </span>
                <span className="text-[11px] text-[#767676]">
                  {hasApplied ? `${stats?.totalApplications} applications tracked` : "Run AI Job Finder"}
                </span>
              </div>
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="border border-[#CC0008] bg-[#CC0008]/10 text-[#CC0008] p-3.5 sm:p-4 rounded-xl sm:rounded-[4px] text-xs sm:text-sm font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="px-2.5 py-1 bg-white text-[#CC0008] border border-[#CC0008] rounded-[4px] hover:bg-[#CC0008] hover:text-white transition-colors text-xs font-bold cursor-pointer tap-active"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid Composition of Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 items-stretch">
        <AtsScoreTile
          score={stats?.atsScore ?? profile?.atsScore ?? 0}
          breakdown={profile?.atsBreakdown}
          analyzing={analyzing}
          onReanalyze={handleAnalyzeResume}
        />

        <JobsAppliedTile
          totalApplied={stats?.totalApplications || 0}
          byStage={stats?.statusDistribution || {}}
        />

        <ProfileSummaryTile profile={profile} />

        <RecommendedJobsTile jobs={recommendedJobs} />

        <ResumeRecommendationsTile
          recommendations={profile?.recommendations || []}
        />

        <JobSearchTipsTile tips={searchTips} />

        <QuickLinksTile />

        <RecentActivityTile />
      </div>
    </div>
  );
}
