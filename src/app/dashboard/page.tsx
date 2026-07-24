"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";
import { SkeletonGrid } from "@/components/SkeletonCard";

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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [onboardingProfile, setOnboardingProfile] = useState<OnboardingProfileData | null>(null);
  const [activeTab, setActiveTab] = useState<"analyses" | "roadmap" | "linkedin" | "improvements">("analyses");

  const fetchData = useCallback(async () => {
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
    } catch {
      // silently fail, show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  // Scroll to hash on mount
  useEffect(() => {
    if (window.location.hash === "#roadmap") {
      setTimeout(() => {
        document.getElementById("roadmap")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    }
  }, [loading]);

  const handleRegenRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await fetch("/api/roadmap", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap);
      }
    } catch {
      // silently fail
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleResetOnboarding = async () => {
    if (!confirm("Reset all onboarding data? This cannot be undone.")) return;
    try {
      await fetch("/api/onboarding", { method: "DELETE" });
      router.push("/");
    } catch {
      // silently fail
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse" />
        </div>
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-12" />
            </div>
          ))}
        </div>
        {/* Tab skeleton */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 bg-gray-200 rounded w-24 animate-pulse" />
          ))}
        </div>
        {/* Content skeleton */}
        <SkeletonGrid count={6} />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

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
      return onboardingProfile?.linkedinOpts ? JSON.parse(onboardingProfile.linkedinOpts) : [];
    } catch {
      return [];
    }
  })();
  const resumeImprovements: ResumeImprovement[] = (() => {
    try {
      return onboardingProfile?.resumeImprovements ? JSON.parse(onboardingProfile.resumeImprovements) : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome{", "}
            {session?.user?.name?.split(" ")[0] || "back"}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here&apos;s your resume optimization overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/how-to-use"
            className="px-4 py-2 text-sm font-medium border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <span>📖 How to Use</span>
          </Link>
          <Link
            href="/dashboard/analyze"
            className="btn-primary-gradient px-4 py-2 text-sm font-medium inline-flex items-center min-h-[44px] sm:min-h-0"
          >
            New Analysis
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Resumes",
            value: resumes.length,
            icon: "📄",
            color: "bg-blue-50 text-blue-700",
            href: "/dashboard/resumes",
          },
          {
            label: "Analyses Run",
            value: analyses.length,
            icon: "🔍",
            color: "bg-purple-50 text-purple-700",
            href: "/dashboard/analyze",
          },
          {
            label: "Avg ATS Score",
            value: avgScore > 0 ? `${avgScore}%` : "N/A",
            icon: "⭐",
            color: "bg-amber-50 text-amber-700",
            href: null,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="card-premium px-4 py-3 sm:p-5 relative group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.color}`}
              >
                {stat.icon}
              </div>
            </div>
            {stat.href && (
              <Link
                href={stat.href}
                className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-gradient-to-r from-indigo-800 to-indigo-600 text-white flex items-center justify-center text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:shadow-lg hover:scale-110"
                title={`Add ${stat.label}`}
              >
                +
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* General ATS Score (from onboarding) */}
      {generalAtsScore !== null && (
        <div className="card-premium p-5 mb-8 flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <ScoreGauge score={generalAtsScore} size={100} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Resume ATS Compatibility
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              This score reflects how well your resume is structured for applicant
              tracking systems — based on format, keywords, action verbs, and
              quantifiable results. Generated during onboarding.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card-premium overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200/60 px-2 pt-2">
          <button
            onClick={() => setActiveTab("analyses")}
            className={`px-4 sm:px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 min-h-[44px] sm:min-h-0 ${
              activeTab === "analyses"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Recent Analyses
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-4 sm:px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 min-h-[44px] sm:min-h-0 ${
              activeTab === "roadmap"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Career Roadmap
          </button>
          <button
            onClick={() => setActiveTab("linkedin")}
            className={`px-4 sm:px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 min-h-[44px] sm:min-h-0 ${
              activeTab === "linkedin"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            LinkedIn Tips
          </button>
          <button
            onClick={() => setActiveTab("improvements")}
            className={`px-4 sm:px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 min-h-[44px] sm:min-h-0 ${
              activeTab === "improvements"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Resume Improvements
          </button>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === "analyses" && (
            <>
              {/* ATS Score Trend */}
              {scoredAnalyses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-slate-800 mb-4">
                    ATS Score History
                  </h3>
                  <ScoreTrendChart analyses={scoredAnalyses.slice(0, 10).reverse()} />
                </div>
              )}

              {/* Analyses table */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-800">
                    All Analyses
                  </h3>
                  {analyses.length > 0 && (
                    <Link
                      href="/dashboard/analyze"
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View all
                    </Link>
                  )}
                </div>
                {analyses.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-slate-500 mb-3">
                      No analyses yet. Upload a resume and compare it against a job description.
                    </p>
                    <Link
                      href="/dashboard/analyze"
                      className="btn-primary-gradient inline-block px-4 py-2 text-sm font-medium"
                    >
                      Run Your First Analysis
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-6">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                            Score
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                            Resume
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                            Job Description
                          </th>
                          <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyses.slice(0, 10).map((analysis) => (
                          <tr
                            key={analysis.id}
                            onClick={() => router.push(`/dashboard/analyze/${analysis.id}`)}
                            className="border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-4">
                              {analysis.overallScore !== null ? (
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                    analysis.overallScore >= 70
                                      ? "bg-green-100 text-green-800"
                                      : analysis.overallScore >= 50
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {analysis.overallScore}%
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">Pending</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              {analysis.resume?.name || "—"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700">
                              {analysis.jobDescription?.title || "—"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {new Date(analysis.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "roadmap" && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-800">
                  🗺️ Career Roadmap
                </h3>
                <div className="flex items-center gap-2">
                  {roadmap && (
                    <>
                      <button
                        onClick={handleRegenRoadmap}
                        disabled={roadmapLoading}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
                      >
                        {roadmapLoading ? "Generating..." : "Regenerate"}
                      </button>
                      <button
                        onClick={handleResetOnboarding}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!roadmap ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500 mb-3">
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
                  {/* Strategy Overview */}
                  {roadmap.strategyOverview && (
                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                      {roadmap.strategyOverview}
                    </p>
                  )}

                  {/* Timeline */}
                  <div className="space-y-0">
                    {roadmap.weeks.map((week, i) => {
                      const phaseBorder =
                        week.phase === "Foundation"
                          ? "border-l-blue-500"
                          : week.phase === "High Velocity"
                            ? "border-l-amber-500"
                            : "border-l-green-500";
                      const phaseBg =
                        week.phase === "Foundation"
                          ? "bg-blue-50 text-blue-700"
                          : week.phase === "High Velocity"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-green-50 text-green-700";

                      return (
                        <div
                          key={week.id}
                          className={`relative pl-6 pb-6 border-l-2 ${phaseBorder} ${i === roadmap.weeks.length - 1 ? "border-l-transparent" : ""} last:pb-0`}
                        >
                          {/* Dot */}
                          <div
                            className={`absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white ${
                              week.phase === "Foundation"
                                ? "bg-blue-500"
                                : week.phase === "High Velocity"
                                  ? "bg-amber-500"
                                  : "bg-green-500"
                            }`}
                          />

                          {/* Card */}
                          <div className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-bold text-slate-900">
                                Week {week.weekNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${phaseBg}`}
                              >
                                {week.phase}
                              </span>
                            </div>

                            <h4 className="text-sm font-semibold text-slate-800 mb-2">
                              {week.focusTitle}
                            </h4>

                            {/* Tasks */}
                            <ul className="space-y-1.5 mb-3">
                              {week.tasks.map((task, ti) => (
                                <li
                                  key={ti}
                                  className="flex items-start gap-2 text-sm text-slate-600"
                                >
                                  <input
                                    type="checkbox"
                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    readOnly
                                  />
                                  <span>{task}</span>
                                </li>
                              ))}
                            </ul>

                            {/* Milestone */}
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <span>🏁</span>
                              <span className="font-medium">Milestone:</span>
                              <span>{week.milestone}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Generated date */}
                  <p className="text-xs text-slate-400 mt-6 text-center">
                    Generated{" "}
                    {new Date(roadmap.generatedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </>
              )}
            </>
          )}

          {activeTab === "linkedin" && (
            <>
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                💼 LinkedIn Profile Optimizations
              </h3>
              {linkedinTips.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-slate-500 mb-2">
                    Complete your onboarding with a LinkedIn URL to get AI-powered profile tips.
                  </p>
                  <button onClick={() => router.push("/")} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">
                    Set up onboarding →
                  </button>
                </div>
              ) : (
                <>
                  <ul className="space-y-3 mb-6">
                    {linkedinTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
                        <span className="text-indigo-600 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                        <p className="text-sm text-slate-700">{tip}</p>
                      </li>
                    ))}
                  </ul>

                  <h4 className="text-sm font-semibold text-slate-700 mb-3">⚡ Quick Wins to Boost Visibility</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">⭐</span>
                      Try <strong>LinkedIn Premium</strong> free trial — unlocks InMail, profile views, and applicant insights
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">🔗</span>
                      Connect with <strong>3-5 recruiters per day</strong> in your target industry — personalized invites get 3x response
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">🔔</span>
                      Set up <strong>job alerts</strong> for your target roles — filter by <strong>posted in last 24 hours</strong> or <strong>last week</strong>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">📊</span>
                      Enable <strong>Open to Work</strong> (recruiters only) to appear in recruiter searches — 40% more InMail
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500">✍️</span>
                      Post <strong>1 industry insight per week</strong> — profile views increase 6x with consistent posting
                    </li>
                  </ul>
                </>
              )}
            </>
          )}

          {activeTab === "improvements" && (
            <>
              <h3 className="text-base font-semibold text-slate-800 mb-4">
                📝 Resume Improvements
              </h3>
              {resumeImprovements.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500">
                    Complete your onboarding to get AI-powered resume improvement suggestions.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {resumeImprovements.map((imp, i) => (
                    <div
                      key={i}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <span className="text-sm font-semibold text-slate-700">
                          {imp.section}
                        </span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
                            Current
                          </p>
                          <p className="text-sm text-slate-600 bg-red-50 p-2 rounded">
                            {imp.current}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                            Suggested
                          </p>
                          <p className="text-sm text-slate-700 bg-green-50 p-2 rounded">
                            {imp.suggested}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 italic">
                          💡 {imp.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ScoreTrendChart({
  analyses,
}: {
  analyses: { overallScore: number | null; createdAt: string; jobDescription?: { title: string } }[];
}) {
  if (analyses.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-4 text-center">No scored analyses yet.</p>
    );
  }

  const width = 600;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const scores = analyses.map((a) => a.overallScore ?? 0);
  const maxScore = Math.max(100, ...scores);
  const barWidth = Math.max(8, (chartWidth / analyses.length) * 0.6);
  const gap = chartWidth / analyses.length;

  const colorForScore = (score: number) => {
    if (score >= 70) return "#22c55e";
    if (score >= 50) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ maxHeight: 220 }}
      >
        {/* Y axis grid lines */}
        {[0, 25, 50, 75, 100].map((val) => {
          const y = padding.top + chartHeight - (val / maxScore) * chartHeight;
          return (
            <g key={val}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray={val === 0 ? undefined : "4,4"}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-[10px] fill-gray-400"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {analyses.map((a, i) => {
          const score = a.overallScore ?? 0;
          const barHeight = (score / maxScore) * chartHeight;
          const x = padding.left + i * gap + (gap - barWidth) / 2;
          const y = padding.top + chartHeight - barHeight;
          const color = colorForScore(score);
          const date = new Date(a.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={3}
                fill={color}
                opacity={0.85}
              >
                <title>
                  {a.jobDescription?.title}: {score}% on {date}
                </title>
              </rect>
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="text-[10px] font-semibold"
                fill={color}
              >
                {score}%
              </text>
              {/* Date label */}
              <text
                x={x + barWidth / 2}
                y={height - 8}
                textAnchor="middle"
                className="text-[9px] fill-gray-400"
              >
                {date}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
