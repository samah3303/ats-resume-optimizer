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
import { Skeleton, DashboardMetricSkeleton } from "@/components/ui/Skeleton";
import Toast from "@/components/ui/Toast";

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

  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

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
      setToastMessage({
        text: "Failed to fetch dashboard updates. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAnalyzeResume = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/resume/analyze", { method: "POST" });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Analysis failed");
      }
      await loadData();
      setToastMessage({
        text: "✓ Resume scanned successfully! Your ATS score and recommendations have been refreshed.",
        type: "success",
      });
    } catch (err) {
      setToastMessage({
        text: err instanceof Error ? err.message : "Failed to run ATS analysis",
        type: "error",
      });
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
      <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-label="Loading dashboard content">
        {/* Context-aware Hero Skeleton */}
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-24 rounded-[2px]" />
            <Skeleton className="h-8 w-64 rounded-[4px]" />
            <Skeleton className="h-4 w-80 rounded-[2px]" />
          </div>
          <div className="flex gap-2.5">
            <Skeleton className="h-11 w-32 rounded-[4px]" />
            <Skeleton className="h-11 w-28 rounded-[4px]" />
          </div>
        </div>

        {/* 3-Step Checklist Skeleton */}
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-5 sm:p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#DFDFDF]">
            <div className="space-y-1">
              <Skeleton className="h-5 w-48 rounded-[2px]" />
              <Skeleton className="h-3.5 w-64 rounded-[2px]" />
            </div>
            <Skeleton className="h-6 w-28 rounded-[3px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5 border border-[#DFDFDF] rounded-xl sm:rounded-[4px] space-y-2">
                <Skeleton className="w-6 h-6 rounded-full" />
                <Skeleton className="h-4 w-3/4 rounded-[2px]" />
                <Skeleton className="h-3 w-5/6 rounded-[2px]" />
              </div>
            ))}
          </div>
        </div>

        {/* Metric Cards Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <DashboardMetricSkeleton key={i} />
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

      {/* Accessible Toast Notification */}
      <Toast
        message={toastMessage?.text || null}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
