"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";
import KeywordBadge from "@/components/KeywordBadge";
import SuggestionCard from "@/components/SuggestionCard";

interface Analysis {
  id: string;
  overallScore: number | null;
  keywordsMatchPct: number | null;
  skillsGapJson: string | null;
  formatScore: number | null;
  impactScore: number | null;
  summaryText: string | null;
  createdAt: string;
  resume?: { id: string; name: string };
  jobDescription?: { id: string; title: string; company: string | null };
  suggestions?: SuggestionItem[];
}

interface SuggestionItem {
  id: string;
  section: string;
  originalText: string;
  suggestedText: string;
  rationale: string;
  accepted: boolean;
}

interface KeywordData {
  matched: string[];
  missing: string[];
}

interface SkillsGapData {
  present: string[];
  missing: string[];
}

export default function AnalysisDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [downloading, setDownloading] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    try {
      const res = await fetch(`/api/analyze/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
        setSuggestions(data.analysis?.suggestions || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchAnalysis();
    }
  }, [status, router, fetchAnalysis]);

  const handleSuggestionChange = async (sugId: string, accepted: boolean) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === sugId ? { ...s, accepted } : s))
    );

    // Persist to API (fire and forget)
    try {
      await fetch(`/api/analyze/${id}/suggestions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId: sugId, accepted }),
      });
    } catch {
      // silently fail, UI is optimistic
    }
  };

  const handleDownloadOptimized = async () => {
    const acceptedIds = suggestions
      .filter((s) => s.accepted)
      .map((s) => s.id);

    if (acceptedIds.length === 0) {
      alert(
        "Please accept at least one suggestion before downloading the optimized resume."
      );
      return;
    }

    setDownloading(true);

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: id,
          acceptedSuggestionIds: acceptedIds,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate optimized resume");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Use extension matching the actual content type returned by the server
      const contentType = res.headers.get("Content-Type") || "";
      const ext = contentType.includes("docx") || contentType.includes("vnd.openxmlformats")
        ? ".docx"
        : ".pdf";
      a.download = `optimized-resume-${analysis?.resume?.name || "resume"}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Failed to download optimized resume"
      );
    } finally {
      setDownloading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-500">Analysis not found.</p>
        <Link
          href="/dashboard/analyze"
          className="text-indigo-600 mt-2 inline-block"
        >
          Run a new analysis →
        </Link>
      </div>
    );
  }

  // Parse JSON fields
  let keywords: KeywordData = { matched: [], missing: [] };
  let skillsGap: SkillsGapData = { present: [], missing: [] };

  try {
    const parsed = analysis.skillsGapJson
      ? JSON.parse(analysis.skillsGapJson)
      : null;
    if (parsed) {
      keywords = {
        matched: parsed.keywords?.matched || [],
        missing: parsed.keywords?.missing || [],
      };
      skillsGap = {
        present: parsed.skills?.present || [],
        missing: parsed.skills?.missing || [],
      };
    }
  } catch {
    // invalid JSON
  }

  const sections = [
    { label: "Format Score", value: analysis.formatScore },
    { label: "Impact Score", value: analysis.impactScore },
    { label: "Keyword Match", value: analysis.keywordsMatchPct, isPct: true },
  ];

  const acceptedCount = suggestions.filter((s) => s.accepted).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link
          href="/dashboard"
          className="hover:text-gray-700 transition-colors"
        >
          Dashboard
        </Link>
        <span>/</span>
        <Link
          href="/dashboard/analyze"
          className="hover:text-gray-700 transition-colors"
        >
          Analyses
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate max-w-[200px]">
          {analysis.resume?.name} vs {analysis.jobDescription?.title}
        </span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <ScoreGauge score={analysis.overallScore ?? 0} size={140} />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              Analysis Report
            </h1>
            <p className="text-sm text-gray-500">
              {analysis.resume?.name} vs{" "}
              {analysis.jobDescription?.title}
              {analysis.jobDescription?.company &&
                ` at ${analysis.jobDescription.company}`}
            </p>
            {analysis.summaryText && (
              <p className="text-sm text-gray-700 mt-3 leading-relaxed">
                {analysis.summaryText}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleDownloadOptimized}
            disabled={downloading || acceptedCount === 0}
            className="px-6 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Optimized ({acceptedCount})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Section Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {sections.map((section) => (
          <div
            key={section.label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <p className="text-sm text-gray-500 mb-1">{section.label}</p>
            <p className="text-2xl font-bold text-gray-900">
              {section.value !== null && section.value !== undefined
                ? section.isPct
                  ? `${Math.round(section.value)}%`
                  : `${section.value}/100`
                : "—"}
            </p>
          </div>
        ))}
      </div>

      {/* Keywords Section */}
      {(keywords.matched.length > 0 || keywords.missing.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Keyword Match
          </h2>
          {keywords.matched.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-green-700 mb-2">
                ✅ Matched ({keywords.matched.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {keywords.matched.map((kw) => (
                  <KeywordBadge key={kw} keyword={kw} matched />
                ))}
              </div>
            </div>
          )}
          {keywords.missing.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-700 mb-2">
                ❌ Missing ({keywords.missing.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {keywords.missing.map((kw) => (
                  <KeywordBadge key={kw} keyword={kw} matched={false} />
                ))}
              </div>
            </div>
          )}
          {keywords.matched.length === 0 && keywords.missing.length === 0 && (
            <p className="text-sm text-gray-500">
              No keyword data available.
            </p>
          )}
        </div>
      )}

      {/* Skills Gap */}
      {(skillsGap.present.length > 0 || skillsGap.missing.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Skills Gap Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-200">
              <p className="text-sm font-semibold text-green-800 mb-2">
                Skills You Have
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skillsGap.present.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-md"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm font-semibold text-red-800 mb-2">
                Skills to Add
              </p>
              <div className="flex flex-wrap gap-1.5">
                {skillsGap.missing.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-md"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Suggestions ({suggestions.length})
          </h2>
          <span className="text-sm text-gray-500">
            {acceptedCount} accepted
          </span>
        </div>

        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            No suggestions available for this analysis.
          </p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                onChange={handleSuggestionChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
