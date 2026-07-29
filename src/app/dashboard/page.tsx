"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";
import { SkeletonGrid } from "@/components/SkeletonCard";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";

interface Resume {
  id: string;
  name: string;
  parsedText: string;
  createdAt: string;
}

interface Analysis {
  id: string;
  overallScore: number | null;
  createdAt: string;
  resume?: { name: string };
  jobDescription?: { title: string };
}

interface WeekTask {
  id: string;
  weekNumber: number;
  phase: string;
  focusTitle: string;
  tasks: string[];
  milestone: string;
}

interface Roadmap {
  id: string;
  strategyOverview: string | null;
  generatedAt: string;
  weeks: WeekTask[];
}

interface OnboardingProfileData {
  targetPositions: string;
  targetCountry: string;
  linkedinUrl: string | null;
  generalAtsScore: number | null;
  linkedinOpts: string | null;
  resumeImprovements: string | null;
  coreSkills: string | null;
}

interface ResumeImprovement {
  section: string;
  current: string;
  suggested: string;
  reason: string;
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [onboardingProfile, setOnboardingProfile] =
    useState<OnboardingProfileData | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Accordion state for onboarding insights
  const [expandedInsight, setExpandedInsight] = useState<string | null>(
    searchParams.get("insight") || null
  );

  // Sync accordion to URL
  const setInsightWithUrl = (key: string | null) => {
    setExpandedInsight(key);
    const url = new URL(window.location.href);
    if (key) {
      url.searchParams.set("insight", key);
    } else {
      url.searchParams.delete("insight");
    }
    window.history.replaceState({}, "", url.toString());
  };

  const fetchData = useCallback(async () => {
    setDataError(null);
    try {
      const [resRes, anaRes, roadmapRes, onboardRes] = await Promise.all([
        fetch("/api/resumes"),
        fetch("/api/analyze"),
        fetch("/api/roadmap"),
        fetch("/api/onboarding"),
      ]);

      if (resRes.ok) setResumes((await resRes.json()).resumes || []);
      if (anaRes.ok) setAnalyses((await anaRes.json()).analyses || []);
      if (roadmapRes.ok) setRoadmap((await roadmapRes.json()).roadmap || null);
      if (onboardRes.ok) {
        const onboardData = await onboardRes.json();
        if (onboardData.profile) {
          setOnboardingProfile(onboardData.profile);
        }
      }
    } catch (err) {
      setDataError("Failed to load dashboard data. Please refresh the page.");
      toast("Failed to load dashboard data", "error");
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

  const handleRegenRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await fetch("/api/roadmap", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap);
        toast("Roadmap regenerated", "success");
      } else {
        toast("Failed to regenerate roadmap", "error");
      }
    } catch {
      toast("Failed to regenerate roadmap", "error");
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleResetOnboarding = async () => {
    setShowResetConfirm(false);
    try {
      const res = await fetch("/api/onboarding", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      } else {
        toast("Failed to reset onboarding", "error");
      }
    } catch {
      toast("Failed to reset onboarding", "error");
    }
  };

  // --- Loading state ---
  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-64 mt-2 animate-pulse" />
        </div>
        <SkeletonGrid count={4} />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  // --- Computed values ---
  const scoredAnalyses = analyses.filter((a) => a.overallScore !== null);
  const avgScore =
    scoredAnalyses.length > 0
      ? Math.round(
          scoredAnalyses.reduce((sum, a) => sum + (a.overallScore ?? 0), 0) /
            scoredAnalyses.length
        )
      : 0;

  const generalAtsScore = onboardingProfile?.generalAtsScore ?? null;
  const linkedinTips: string[] = (() => {
    try {
      return onboardingProfile?.linkedinOpts
        ? JSON.parse(onboardingProfile.linkedinOpts)
        : [];
    } catch {
      return [];
    }
  })();
  const resumeImprovements: ResumeImprovement[] = (() => {
    try {
      return onboardingProfile?.resumeImprovements
        ? JSON.parse(onboardingProfile.resumeImprovements)
        : [];
    } catch {
      return [];
    }
  })();

  const hasOnboardingData =
    !!roadmap || linkedinTips.length > 0 || resumeImprovements.length > 0;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-[76px] md:pb-8">
        {/* ════════════════════════════════════════════════════════════════
            ZONE 1: Header & Action Bar
            ════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Welcome{", "}
              {session?.user?.name?.split(" ")[0] || "back"}!
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Here&apos;s your resume optimization overview
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Compact metrics pill */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <span>
                📄 {resumes.length} Resume{resumes.length !== 1 ? "s" : ""}
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>
                🔍 {analyses.length} Anal{analyses.length !== 1 ? "yses" : "ysis"}
              </span>
              {generalAtsScore !== null && (
                <>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span>⭐ {generalAtsScore}% Baseline</span>
                </>
              )}
            </div>
            <Link
              href="/dashboard/how-to-use"
              className="px-4 py-2 text-sm font-medium border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-all inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-0"
            >
              <span aria-hidden="true">📖</span> How to Use
            </Link>
            <Link
              href="/dashboard/analyze"
              className="btn-primary-gradient px-5 py-2.5 text-sm font-medium inline-flex items-center min-h-[44px] sm:min-h-0"
            >
              + New Analysis
            </Link>
          </div>
        </div>

        {/* Error banner */}
        {dataError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
            <span>{dataError}</span>
            <button
              onClick={fetchData}
              className="px-3 py-1 text-xs font-medium bg-red-100 dark:bg-red-800/50 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors min-h-[32px]"
            >
              Retry
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            ZONE 2: Core Focal Workspace — Recent Analyses
            ════════════════════════════════════════════════════════════════ */}
        {/* General ATS Score (from onboarding) — compact */}
        {generalAtsScore !== null && (
          <div className="card-premium p-5 mb-6 flex flex-col sm:flex-row items-center gap-6 dark:bg-slate-800 dark:border-slate-700">
            <div className="shrink-0">
              <ScoreGauge score={generalAtsScore} size={100} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                Resume ATS Compatibility
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                This score reflects how well your resume is structured for
                applicant tracking systems — based on format, keywords, action
                verbs, and quantifiable results. Generated during onboarding.
              </p>
            </div>
          </div>
        )}

        {/* Analyses table — the focal centerpiece */}
        <div className="card-premium overflow-hidden mb-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between p-5 border-b border-slate-200/60 dark:border-slate-700/60">
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Recent Analyses
            </h2>
            {analyses.length > 0 && (
              <Link
                href="/dashboard/analyze"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
              >
                + New Analysis
              </Link>
            )}
          </div>

          {analyses.length === 0 ? (
            <div className="py-16 text-center px-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <span className="text-3xl" aria-hidden="true">🔍</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                Upload a resume and compare it against a job description to get
                your first ATS score and tailored suggestions.
              </p>
              <Link
                href="/dashboard/analyze"
                className="btn-primary-gradient inline-block px-5 py-2.5 text-sm font-medium"
              >
                Run Your First Analysis
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/60">
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                      Score
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                      Resume
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                      Job Description
                    </th>
                    <th className="text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-6 py-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.slice(0, 10).map((analysis) => (
                    <tr
                      key={analysis.id}
                      onClick={() =>
                        router.push(`/dashboard/analyze/${analysis.id}`)
                      }
                      className="border-b border-slate-50 dark:border-slate-700/40 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                      role="link"
                      tabIndex={0}
                      aria-label={`Analysis: ${analysis.resume?.name || "unknown"} vs ${analysis.jobDescription?.title || "unknown"}, score ${analysis.overallScore ?? "pending"}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          router.push(`/dashboard/analyze/${analysis.id}`);
                        }
                      }}
                    >
                      <td className="px-6 py-4">
                        {analysis.overallScore !== null ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                              analysis.overallScore >= 70
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                                : analysis.overallScore >= 50
                                  ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
                            }`}
                          >
                            {analysis.overallScore}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {analysis.resume?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                        {analysis.jobDescription?.title || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════════════════
            ZONE 3: Collapsible Onboarding Insights Accordion
            ════════════════════════════════════════════════════════════════ */}
        {hasOnboardingData && (
          <div className="card-premium overflow-hidden dark:bg-slate-800 dark:border-slate-700">
            <div className="p-5 border-b border-slate-200/60 dark:border-slate-700/60">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                📋 Onboarding Audit Insights
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Insights from your onboarding — click to expand
              </p>
            </div>

            {/* Career Roadmap */}
            <div className="border-b border-slate-100 dark:border-slate-700/50">
              <button
                onClick={() =>
                  setInsightWithUrl(
                    expandedInsight === "roadmap" ? null : "roadmap"
                  )
                }
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-h-[44px]"
                aria-expanded={expandedInsight === "roadmap"}
                aria-controls="insight-roadmap"
              >
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-lg">🗺️</span>
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Career Roadmap
                    </span>
                    {roadmap && (
                      <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                        {roadmap.weeks.length}-week plan
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${expandedInsight === "roadmap" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                id="insight-roadmap"
                className={`${expandedInsight === "roadmap" ? "" : "hidden"} px-5 pb-5`}
                role="region"
                aria-labelledby="insight-roadmap-heading"
              >
                {!roadmap ? (
                  <div className="py-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400 mb-3">
                      Complete your onboarding to get a personalized 8-week career roadmap.
                    </p>
                    <Link
                      href="/"
                      className="btn-primary-gradient inline-block px-4 py-2 text-sm font-medium"
                    >
                      Complete Your Onboarding
                    </Link>
                  </div>
                ) : (
                  <>
                    {roadmap.strategyOverview && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        {roadmap.strategyOverview}
                      </p>
                    )}
                    <div className="space-y-0">
                      {roadmap.weeks.map((week, i) => {
                        const phaseBorder =
                          week.phase === "Foundation"
                            ? "border-l-blue-500 dark:border-l-blue-400"
                            : week.phase === "High Velocity"
                              ? "border-l-amber-500 dark:border-l-amber-400"
                              : "border-l-green-500 dark:border-l-green-400";
                        const phaseBg =
                          week.phase === "Foundation"
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : week.phase === "High Velocity"
                              ? "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                              : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300";

                        return (
                          <div
                            key={week.id}
                            className={`relative pl-6 pb-6 border-l-2 ${phaseBorder} ${i === roadmap.weeks.length - 1 ? "border-l-transparent" : ""} last:pb-0`}
                          >
                            <div
                              className={`absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                                week.phase === "Foundation"
                                  ? "bg-blue-500"
                                  : week.phase === "High Velocity"
                                    ? "bg-amber-500"
                                    : "bg-green-500"
                              }`}
                            />
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                  Week {week.weekNumber}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${phaseBg}`}
                                >
                                  {week.phase}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                                {week.focusTitle}
                              </h4>
                              <ul className="space-y-1.5 mb-3">
                                {week.tasks.map((task, ti) => (
                                  <li
                                    key={ti}
                                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                                  >
                                    <input
                                      type="checkbox"
                                      className="mt-0.5 h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                      readOnly
                                    />
                                    <span>{task}</span>
                                  </li>
                                ))}
                              </ul>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                <span aria-hidden="true">🏁</span>
                                <span className="font-medium">Milestone:</span>
                                <span>{week.milestone}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Generated{" "}
                        {new Date(roadmap.generatedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleRegenRoadmap}
                          disabled={roadmapLoading}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors disabled:opacity-50"
                        >
                          {roadmapLoading ? "Generating..." : "Regenerate"}
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(true)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* LinkedIn Tips */}
            <div className="border-b border-slate-100 dark:border-slate-700/50">
              <button
                onClick={() =>
                  setInsightWithUrl(
                    expandedInsight === "linkedin" ? null : "linkedin"
                  )
                }
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-h-[44px]"
                aria-expanded={expandedInsight === "linkedin"}
                aria-controls="insight-linkedin"
              >
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-lg">💼</span>
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      LinkedIn Tips
                    </span>
                    {linkedinTips.length > 0 && (
                      <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                        {linkedinTips.length} tips
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${expandedInsight === "linkedin" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                id="insight-linkedin"
                className={`${expandedInsight === "linkedin" ? "" : "hidden"} px-5 pb-5`}
                role="region"
              >
                {linkedinTips.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400 mb-2">
                      Complete your onboarding with a LinkedIn URL to get AI-powered profile tips.
                    </p>
                    <button
                      onClick={() => router.push("/")}
                      className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300"
                    >
                      Set up onboarding →
                    </button>
                  </div>
                ) : (
                  <>
                    <ul className="space-y-3 mb-6">
                      {linkedinTips.map((tip, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                        >
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold shrink-0 mt-0.5">
                            {i + 1}.
                          </span>
                          <p className="text-sm text-slate-700 dark:text-slate-300">
                            {tip}
                          </p>
                        </li>
                      ))}
                    </ul>
                    <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      ⚡ Quick Wins to Boost Visibility
                    </h4>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-amber-500">⭐</span>
                        Try <strong>LinkedIn Premium</strong> free trial — unlocks InMail, profile views, and applicant insights
                      </li>
                      <li className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-amber-500">🔗</span>
                        Connect with <strong>3-5 recruiters per day</strong> in your target industry — personalized invites get 3x response
                      </li>
                      <li className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-amber-500">🔔</span>
                        Set up <strong>job alerts</strong> for your target roles — filter by <strong>posted in last 24 hours</strong> or <strong>last week</strong>
                      </li>
                      <li className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-amber-500">📊</span>
                        Enable <strong>Open to Work</strong> (recruiters only) to appear in recruiter searches — 40% more InMail
                      </li>
                      <li className="flex items-start gap-2">
                        <span aria-hidden="true" className="text-amber-500">✍️</span>
                        Post <strong>1 industry insight per week</strong> — profile views increase 6x with consistent posting
                      </li>
                    </ul>
                  </>
                )}
              </div>
            </div>

            {/* Resume Improvements */}
            <div>
              <button
                onClick={() =>
                  setInsightWithUrl(
                    expandedInsight === "improvements"
                      ? null
                      : "improvements"
                  )
                }
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors min-h-[44px]"
                aria-expanded={expandedInsight === "improvements"}
                aria-controls="insight-improvements"
              >
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="text-lg">📝</span>
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      Resume Improvements
                    </span>
                    {resumeImprovements.length > 0 && (
                      <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                        {resumeImprovements.length} suggestions
                      </span>
                    )}
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${expandedInsight === "improvements" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                id="insight-improvements"
                className={`${expandedInsight === "improvements" ? "" : "hidden"} px-5 pb-5`}
                role="region"
              >
                {resumeImprovements.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                      Complete your onboarding to get AI-powered resume improvement suggestions.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resumeImprovements.map((imp, i) => (
                      <div
                        key={i}
                        className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                      >
                        <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {imp.section}
                          </span>
                        </div>
                        <div className="p-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-1">
                              Current
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                              {imp.current}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide mb-1">
                              Suggested
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                              {imp.suggested}
                            </p>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                            💡 {imp.reason}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm dialog for resetting onboarding */}
      <ConfirmDialog
        open={showResetConfirm}
        title="Reset Onboarding Data"
        message="This will delete all your onboarding data, including the career roadmap, LinkedIn tips, and resume improvements. This action cannot be undone."
        confirmLabel="Reset All Data"
        variant="danger"
        onConfirm={handleResetOnboarding}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
