"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";

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

interface Position {
  id: string;
  title: string;
  targetRole: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [resRes, anaRes, posRes] = await Promise.all([
        fetch("/api/resumes"),
        fetch("/api/analyze"),
        fetch("/api/positions"),
      ]);

      if (resRes.ok) setResumes((await resRes.json()).resumes || []);
      if (anaRes.ok) setAnalyses((await anaRes.json()).analyses || []);
      if (posRes.ok) setPositions((await posRes.json()).positions || []);
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

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome{", "}
            {session?.user?.name?.split(" ")[0] || "back"}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here&apos;s your resume optimization overview
          </p>
        </div>
        <Link
          href="/dashboard/analyze"
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          New Analysis
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Total Resumes",
            value: resumes.length,
            icon: "📄",
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Analyses Run",
            value: analyses.length,
            icon: "🔍",
            color: "bg-purple-50 text-purple-700",
          },
          {
            label: "Avg ATS Score",
            value: avgScore > 0 ? `${avgScore}%` : "N/A",
            icon: "⭐",
            color: "bg-yellow-50 text-yellow-700",
          },
          {
            label: "Active Positions",
            value: positions.length,
            icon: "🎯",
            color: "bg-green-50 text-green-700",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.color}`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Analyses */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Analyses
          </h2>
          {analyses.length > 0 && (
            <Link
              href="/dashboard/analyze"
              className="text-sm text-indigo-600 hover:text-indigo-700"
            >
              View all
            </Link>
          )}
        </div>
        {analyses.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500 mb-3">
              No analyses yet. Upload a resume and compare it against a job
              description.
            </p>
            <Link
              href="/dashboard/analyze"
              className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Run Your First Analysis
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Score
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Resume
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Job Description
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {analyses.slice(0, 10).map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      {analysis.overallScore !== null ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            analysis.overallScore >= 70
                              ? "bg-green-100 text-green-800"
                              : analysis.overallScore >= 50
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {analysis.overallScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {analysis.resume?.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {analysis.jobDescription?.title || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(analysis.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
        <Link
          href="/dashboard/resumes"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <span className="text-2xl">📤</span>
          <div>
            <p className="font-medium text-gray-900">Upload Resume</p>
            <p className="text-xs text-gray-500">PDF or DOCX</p>
          </div>
        </Link>
        <Link
          href="/dashboard/analyze"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <span className="text-2xl">🔍</span>
          <div>
            <p className="font-medium text-gray-900">New Analysis</p>
            <p className="text-xs text-gray-500">Match vs job description</p>
          </div>
        </Link>
        <Link
          href="/dashboard/positions"
          className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <span className="text-2xl">🎯</span>
          <div>
            <p className="font-medium text-gray-900">Add Position</p>
            <p className="text-xs text-gray-500">Target roles & profiles</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
