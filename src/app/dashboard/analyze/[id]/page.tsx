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

interface InterviewQuestion {
  category: string;
  question: string;
  rationale: string;
}

interface KeywordFrequency {
  word: string;
  count: number;
  matched: boolean;
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

  // Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Cover letter state
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [coverLetterCopied, setCoverLetterCopied] = useState(false);

  // Interview questions state
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[] | null>(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  // Share state
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

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

  const handleGenerateCoverLetter = async () => {
    setGeneratingCoverLetter(true);
    setCoverLetterText(null);
    setShowCoverLetter(true);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: analysis?.resume?.id,
          jdId: analysis?.jobDescription?.id,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCoverLetterText(data.coverLetter);
      } else {
        setCoverLetterText("Failed to generate cover letter. Please try again.");
      }
    } catch {
      setCoverLetterText("Failed to generate cover letter. Please try again.");
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleCopyCoverLetter = async () => {
    if (!coverLetterText) return;
    await navigator.clipboard.writeText(coverLetterText);
    setCoverLetterCopied(true);
    setTimeout(() => setCoverLetterCopied(false), 2000);
  };

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    setInterviewQuestions(null);
    setShowQuestions(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setInterviewQuestions(data.questions);
      }
    } catch {
      // silently fail
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleShare = async () => {
    setSharing(true);
    setShareUrl(null);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setShareUrl(data.shareUrl);
      }
    } catch {
      // silently fail
    } finally {
      setSharing(false);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
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
  let keywordFrequencies: KeywordFrequency[] = [];

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

  // Build keyword frequencies by counting occurrences in resume text
  const resumeText = analysis.resume?.name || "";
  const allKeywords = [...keywords.matched, ...keywords.missing];
  const matchedSet = new Set(keywords.matched.map((k) => k.toLowerCase()));

  keywordFrequencies = allKeywords.map((word) => {
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = resumeText.match(regex);
    return {
      word,
      count: matches ? matches.length : 0,
      matched: matchedSet.has(word.toLowerCase()),
    };
  });

  const maxFreq = keywordFrequencies.length > 0
    ? Math.max(...keywordFrequencies.map((k) => k.count), 1)
    : 1;

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

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6 overflow-x-auto">
        {[
          { id: "overview", label: "Overview" },
          { id: "suggestions", label: "Suggestions" },
          { id: "coverletter", label: "Cover Letter" },
          { id: "interview", label: "Interview Qs" },
          { id: "share", label: "Share" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
            className="px-6 py-2.5 min-h-[44px] sm:min-h-0 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {sections.map((section) => (
          <div
            key={section.label}
            className="bg-white rounded-xl border border-gray-200 px-4 py-3 sm:p-5"
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

      {/* Keyword Density Heatmap */}
      {keywordFrequencies.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Keyword Density Heatmap
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {keywordFrequencies.map((kw) => {
              const intensity = Math.max(0.25, kw.count / maxFreq);
              if (kw.matched) {
                const green = Math.round(200 - intensity * 160);
                return (
                  <span
                    key={kw.word}
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      backgroundColor: `rgb(220, ${green + 30}, 220)`,
                      color: `rgb(0, ${Math.round(100 - intensity * 60)}, 0)`,
                      borderColor: `rgb(150, ${green + 20}, 150)`,
                      opacity: 0.65 + intensity * 0.35,
                    }}
                    title={`${kw.word} (${kw.count}x)`}
                  >
                    ✓ {kw.word}
                    {kw.count > 1 && (
                      <span className="ml-1 text-[10px] opacity-70">×{kw.count}</span>
                    )}
                  </span>
                );
              }
              return (
                <span
                  key={kw.word}
                  className="px-3 py-1 rounded-full text-xs font-medium border"
                  style={{
                    backgroundColor: `rgb(255, ${Math.round(230 - intensity * 80)}, ${Math.round(230 - intensity * 80)})`,
                    color: `rgb(180, ${Math.round(40 - intensity * 30)}, ${Math.round(40 - intensity * 30)})`,
                    borderColor: `rgb(250, ${Math.round(180 - intensity * 60)}, ${Math.round(180 - intensity * 60)})`,
                  }}
                  title={`${kw.word} (missing)`}
                >
                  ✗ {kw.word}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Cover Letter Generator */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Cover Letter Generator
          </h2>
          {!showCoverLetter && (
            <button
              onClick={handleGenerateCoverLetter}
              disabled={generatingCoverLetter}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generatingCoverLetter ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Cover Letter"
              )}
            </button>
          )}
        </div>

        {showCoverLetter && (
          <>
            {generatingCoverLetter ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-sm text-gray-500">Generating cover letter...</span>
              </div>
            ) : coverLetterText ? (
              <div>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 max-h-96 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {coverLetterText}
                  </pre>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={handleCopyCoverLetter}
                    className="px-4 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5"
                  >
                    {coverLetterCopied ? (
                      <>✓ Copied!</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy to Clipboard
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowCoverLetter(false);
                      setCoverLetterText(null);
                    }}
                    className="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-600 py-4">
                Failed to generate cover letter. Please try again.
              </p>
            )}
          </>
        )}
      </div>

      {/* Interview Questions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Interview Questions
          </h2>
          {!showQuestions && (
            <button
              onClick={handleGenerateQuestions}
              disabled={generatingQuestions}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {generatingQuestions ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Interview Questions"
              )}
            </button>
          )}
        </div>

        {showQuestions && (
          <>
            {generatingQuestions ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-sm text-gray-500">Generating interview questions...</span>
              </div>
            ) : interviewQuestions && interviewQuestions.length > 0 ? (
              <div className="space-y-4">
                {Array.from(new Set(interviewQuestions.map((q) => q.category))).map(
                  (category) => {
                    const catQuestions = interviewQuestions.filter(
                      (q) => q.category === category
                    );
                    const catLabel =
                      category.charAt(0).toUpperCase() + category.slice(1);
                    return (
                      <div key={category}>
                        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              category === "technical"
                                ? "bg-blue-500"
                                : category === "behavioral"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                          />
                          {catLabel} ({catQuestions.length})
                        </h3>
                        <div className="space-y-2">
                          {catQuestions.map((q, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                            >
                              <p className="text-sm font-medium text-gray-800">
                                {q.question}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {q.rationale}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
                <button
                  onClick={() => {
                    setShowQuestions(false);
                    setInterviewQuestions(null);
                  }}
                  className="px-4 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Regenerate
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">
                No questions generated. Please try again.
              </p>
            )}
          </>
        )}
      </div>

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

      {/* Shareable Link */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Share Analysis
          </h2>
          {!shareUrl && (
            <button
              onClick={handleShare}
              disabled={sharing}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sharing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating link...
                </>
              ) : (
                "Share Analysis"
              )}
            </button>
          )}
        </div>

        {shareUrl && (
          <div className="flex items-center gap-3">
            <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 font-mono break-all">
                {shareUrl}
              </p>
            </div>
            <button
              onClick={handleCopyShareLink}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5 shrink-0"
            >
              {shareCopied ? (
                <>✓ Copied!</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
