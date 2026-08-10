"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";
import KeywordBadge from "@/components/KeywordBadge";
import SuggestionCard from "@/components/SuggestionCard";
import AtsXray from "@/components/AtsXray";
import SkillBridgeCard from "@/components/SkillBridgeCard";
import InlineAiFixer from "@/components/InlineAiFixer";
import { useToast } from "@/components/Toast";

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
  jobDescription?: { id: string; title: string; company: string | null; sourceUrl: string | null };
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
  stage?: string;
  answer?: string;
  keyTalkingPoints?: string[];
}

interface KeywordFrequency {
  word: string;
  count: number;
  matched: boolean;
}

type TabId = "overview" | "suggestions" | "coverletter" | "interview" | "share" | "salary";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "suggestions", label: "Suggestions" },
  { id: "coverletter", label: "Cover Letter" },
  { id: "interview", label: "Interview Qs" },
  { id: "share", label: "Share" },
  { id: "salary", label: "Salary" },
];

function AnalysisDetailContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const id = params.id as string;

  const tabFromUrl = searchParams.get("tab") as TabId | null;
  const activeTab: TabId = tabFromUrl && TABS.some((t) => t.id === tabFromUrl)
    ? tabFromUrl
    : "overview";

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [downloading, setDownloading] = useState(false);

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
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [scoreBoost, setScoreBoost] = useState(0);
  const [targetSalary, setTargetSalary] = useState("");
  const [negotiationResult, setNegotiationResult] = useState<Record<string, string> | null>(null);
  const [negotiating, setNegotiating] = useState(false);

  // Sync tab to URL
  const setActiveTab = (tab: TabId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
    // Force re-render by navigating (shallow)
    router.replace(`/dashboard/analyze/${id}?tab=${tab}`, { scroll: false });
  };

  const fetchAnalysis = useCallback(async () => {
    setFetchError(null);
    try {
      const res = await fetch(`/api/analyze/${id}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
        setSuggestions(data.analysis?.suggestions || []);
      } else {
        setFetchError("Failed to load analysis. Please try again.");
        toast("Failed to load analysis", "error");
      }
    } catch {
      setFetchError("Network error. Please check your connection and try again.");
      toast("Failed to load analysis", "error");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

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

    try {
      await fetch(`/api/analyze/${id}/suggestions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId: sugId, accepted }),
      });
    } catch {
      toast("Failed to save suggestion state", "error");
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
        toast("Failed to generate cover letter", "error");
      }
    } catch {
      setCoverLetterText("Failed to generate cover letter. Please try again.");
      toast("Failed to generate cover letter", "error");
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

  // Stage & Answer expander states for interview coach
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [expandedAnswers, setExpandedAnswers] = useState<Record<number, boolean>>({});

  const handleGenerateQuestions = async (stageKey: string = selectedStage) => {
    setSelectedStage(stageKey);
    setGeneratingQuestions(true);
    setInterviewQuestions(null);
    setShowQuestions(true);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: id, stage: stageKey }),
      });
      if (res.ok) {
        const data = await res.json();
        setInterviewQuestions(data.questions || []);
      } else {
        toast("Failed to generate interview questions", "error");
      }
    } catch {
      toast("Failed to generate interview questions", "error");
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
      } else {
        toast("Failed to create share link", "error");
      }
    } catch {
      toast("Failed to create share link", "error");
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

  const handleNegotiate = async () => {
    if (!targetSalary.trim()) return;
    setNegotiating(true);
    setNegotiationResult(null);
    try {
      const res = await fetch("/api/negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId: id, targetSalary }),
      });
      if (res.ok) setNegotiationResult(await res.json());
      else toast("Failed to generate negotiation guide", "error");
    } catch {
      toast("Failed to generate negotiation guide", "error");
    } finally {
      setNegotiating(false);
    }
  };

  const handleDownloadOptimized = async () => {
    let acceptedIds = suggestions.filter((s) => s.accepted).map((s) => s.id);
    if (acceptedIds.length === 0) {
      // Use all suggestions by default for 1-click PDF export
      acceptedIds = suggestions.map((s) => s.id);
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
      const contentType = res.headers.get("Content-Type") || "";
      const ext =
        contentType.includes("docx") ||
        contentType.includes("vnd.openxmlformats")
          ? ".docx"
          : ".pdf";
      a.download = `optimized-resume-${analysis?.resume?.name || "resume"}${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const acceptedCount = suggestions.filter((s) => s.accepted).length;
      const boost = Math.min(acceptedCount * 5, 25);
      setScoreBoost(boost);
      setDownloadSuccess(true);
      toast("Resume downloaded successfully!", "success");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Failed to download optimized resume",
        "error"
      );
    } finally {
      setDownloading(false);
    }
  };

  // --- Loading state ---
  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  // --- Error state ---
  if (fetchError) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md mx-auto">
          <p className="text-red-700 dark:text-red-300 mb-4">{fetchError}</p>
          <button
            onClick={fetchAnalysis}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-gray-500 dark:text-slate-400">Analysis not found.</p>
        <Link
          href="/dashboard/analyze"
          className="text-indigo-600 dark:text-indigo-400 mt-2 inline-block"
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
    // invalid JSON — already defaulted
  }

  const resumeText = analysis.resume?.name || "";
  const allKeywords = [...keywords.matched, ...keywords.missing];
  const matchedSet = new Set(keywords.matched.map((k) => k.toLowerCase()));

  keywordFrequencies = allKeywords.map((word) => {
    const regex = new RegExp(
      word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "gi"
    );
    const matches = resumeText.match(regex);
    return {
      word,
      count: matches ? matches.length : 0,
      matched: matchedSet.has(word.toLowerCase()),
    };
  });

  const maxFreq =
    keywordFrequencies.length > 0
      ? Math.max(...keywordFrequencies.map((k) => k.count), 1)
      : 1;

  const sections = [
    { label: "Format Score", value: analysis.formatScore },
    { label: "Impact Score", value: analysis.impactScore },
    { label: "Keyword Match", value: analysis.keywordsMatchPct, isPct: true },
  ];

  const acceptedCount = suggestions.filter((s) => s.accepted).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-[76px] md:pb-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-6" aria-label="Breadcrumb">
        <Link
          href="/dashboard"
          className="hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
        >
          Dashboard
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href="/dashboard/analyze"
          className="hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
        >
          Analyses
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900 dark:text-slate-100 font-medium truncate max-w-[200px]">
          {analysis.resume?.name} vs {analysis.jobDescription?.title}
        </span>
      </nav>

      {/* Tab Navigation */}
      <div
        className="flex gap-1 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-1 mb-6 overflow-x-auto"
        role="tablist"
        aria-label="Analysis sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`flex-1 min-w-fit px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <ScoreGauge score={analysis.overallScore ?? 0} size={140} />
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-1">
              Analysis Report
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {analysis.resume?.name} vs{" "}
              {analysis.jobDescription?.title}
              {analysis.jobDescription?.company &&
                ` at ${analysis.jobDescription.company}`}
            </p>
            {analysis.jobDescription?.sourceUrl && (
              <a
                href={analysis.jobDescription.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Apply for this Position
              </a>
            )}
            {analysis.summaryText && (
              <p className="text-sm text-gray-700 dark:text-slate-300 mt-3 leading-relaxed">
                {analysis.summaryText}
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
              {new Date(analysis.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={handleDownloadOptimized}
            disabled={downloading}
            className="px-6 py-2.5 min-h-[44px] sm:min-h-0 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>📥 Download ATS PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Download success message */}
      {downloadSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="text-2xl">🎉</span>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                Resume Downloaded!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                Estimated ATS score boost:{" "}
                <strong className="text-green-900 dark:text-green-200 text-lg">
                  +{scoreBoost}%
                </strong>
                {analysis?.overallScore && (
                  <>
                    {" "}
                    (from {analysis.overallScore}% → ~
                    {Math.min(100, analysis.overallScore + scoreBoost)}%)
                  </>
                )}
              </p>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-amber-500">⚠️</span>
                  <span>
                    Re-check the <strong>alignment and structure</strong> — AI
                    optimizations are great, but a human review catches nuances.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-blue-500">📄</span>
                  <span>
                    Convert to <strong>PDF</strong> before applying — many ATS
                    prefer PDF over DOCX.
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span aria-hidden="true" className="text-indigo-500">🔄</span>
                  <button
                    onClick={() => {
                      setDownloadSuccess(false);
                      router.push("/dashboard/analyze");
                    }}
                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 underline"
                  >
                    Upload the optimized version and analyze it again
                  </button>{" "}
                  before applying to verify the score improvement.
                </p>
              </div>
              <button
                onClick={() => setDownloadSuccess(false)}
                className="mt-3 text-xs text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ OVERVIEW TAB ============ */}
      {activeTab === "overview" && (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview">
          {analysis?.resume?.id && (
            <AtsXray
              resumeId={analysis.resume.id}
              resumeName={analysis.resume.name || "Resume"}
            />
          )}

          {/* Section Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
            {sections.map((section) => (
              <div
                key={section.label}
                className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 sm:p-5"
              >
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                  {section.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
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
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Keyword Match
              </h2>
              {keywords.matched.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">
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
                  <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                    ❌ Missing ({keywords.missing.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {keywords.missing.map((kw) => (
                      <KeywordBadge key={kw} keyword={kw} matched={false} />
                    ))}
                  </div>
                </div>
              )}
              {keywords.matched.length === 0 &&
                keywords.missing.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    No keyword data available.
                  </p>
                )}
            </div>
          )}

          {/* Skills Gap */}
          {(skillsGap.present.length > 0 || skillsGap.missing.length > 0) && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
                Skills Gap Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
                    Skills You Have
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsGap.present.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-300 text-xs rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2">
                    Skills to Add
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsGap.missing.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 bg-red-100 dark:bg-red-800/50 text-red-800 dark:text-red-300 text-xs rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skill Bridge */}
          {(skillsGap.missing.length > 0 || keywords.missing.length > 0) && (
            <div className="mb-6">
              <SkillBridgeCard
                missingSkills={Array.from(
                  new Set([...skillsGap.missing, ...keywords.missing])
                )}
              />
            </div>
          )}

          {/* Keyword Density Heatmap */}
          {keywordFrequencies.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
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
                          <span className="ml-1 text-[10px] opacity-70">
                            ×{kw.count}
                          </span>
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
        </div>
      )}

      {/* ============ SUGGESTIONS TAB ============ */}
      {activeTab === "suggestions" && (
        <div
          id="panel-suggestions"
          role="tabpanel"
          aria-labelledby="tab-suggestions"
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm space-y-4"
        >
          {/* Target Score Goal & Projection Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl border border-indigo-500/30 shadow-md space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase rounded-full">
                  🎯 Target Goal: 75%–80%+ ATS Score
                </span>
                <span className="text-xs text-indigo-300 font-semibold">
                  {suggestions.length} Tailored Suggestions
                </span>
              </div>
              {analysis?.overallScore !== null && analysis?.overallScore !== undefined && (
                <div className="text-xs font-bold text-emerald-400">
                  Current Score: {analysis.overallScore}% ➔ Projected Score:{" "}
                  <span className="text-sm font-extrabold text-white underline">
                    {Math.min(95, Math.max(78, analysis.overallScore + suggestions.length * 3))}%
                  </span>{" "}
                  (+{Math.min(95, Math.max(78, analysis.overallScore + suggestions.length * 3)) - analysis.overallScore}% Boost)
                </div>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              These suggestions are generated strictly by matching your uploaded resume against this target Job Description. Accept and apply these targeted bullet rewrites to push your resume into the <strong>75%–80%+ top ATS match bracket</strong>.
            </p>
          </div>

          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">
                Section-by-Section ATS Rewrites ({suggestions.length})
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Accept suggestions to apply them automatically to your downloadable optimized resume.
              </p>
            </div>
          </div>

          {suggestions.length === 0 ? (
            <div className="py-4">
              <InlineAiFixer
                missingSkills={skillsGap.missing}
                suggestions={[]}
                onApplyFix={(orig: string, _updated: string) => {
                  toast(`Accepted fix for "${orig.slice(0, 20)}..."`, "success");
                }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((sug) => (
                <SuggestionCard
                  key={sug.id}
                  suggestion={sug}
                  onChange={handleSuggestionChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ COVER LETTER TAB ============ */}
      {activeTab === "coverletter" && (
        <div
          id="panel-coverletter"
          role="tabpanel"
          aria-labelledby="tab-coverletter"
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
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
                  <span className="ml-3 text-sm text-gray-500 dark:text-slate-400">
                    Generating cover letter...
                  </span>
                </div>
              ) : coverLetterText ? (
                <div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {coverLetterText}
                    </pre>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={handleCopyCoverLetter}
                      className="px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-1.5"
                    >
                      {coverLetterCopied ? (
                        <>✓ Copied!</>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
                      className="px-4 py-1.5 text-sm font-medium text-gray-600 dark:text-slate-400 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-600 dark:text-red-400 py-4">
                  Failed to generate cover letter. Please try again.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ============ INTERVIEW TAB ============ */}
      {activeTab === "interview" && (
        <div
          id="panel-interview"
          role="tabpanel"
          aria-labelledby="tab-interview"
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                🎯 Stage-Wise Interview Coach & Model Answers
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Generate questions and high-scoring STAR-method model responses tailored by interview stage.
              </p>
            </div>

            <button
              onClick={() => handleGenerateQuestions(selectedStage)}
              disabled={generatingQuestions}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shrink-0"
            >
              {generatingQuestions ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Q&As...
                </>
              ) : (
                "🔄 Generate Questions & Answers"
              )}
            </button>
          </div>

          {/* Stage Filter Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { id: "all", label: "🌐 All Stages" },
              { id: "hr", label: "💼 HR Screening" },
              { id: "technical", label: "💻 Technical Deep-Dive" },
              { id: "coding", label: "⚡ Live Coding / System Design" },
              { id: "behavioral", label: "🤝 Behavioral & Leadership" },
              { id: "ceo", label: "👑 CEO / Executive Round" },
            ].map((stage) => {
              const active = selectedStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => handleGenerateQuestions(stage.id)}
                  disabled={generatingQuestions}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                  }`}
                >
                  {stage.label}
                </button>
              );
            })}
          </div>

          {showQuestions && (
            <>
              {generatingQuestions ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Analyzing resume & JD to build model answers for <strong>{selectedStage.toUpperCase()}</strong> stage...
                  </span>
                </div>
              ) : interviewQuestions && interviewQuestions.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {interviewQuestions.map((q, idx) => {
                    const isAnswerExpanded = Boolean(expandedAnswers[idx]);
                    return (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {q.stage && (
                              <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 font-extrabold text-[10px] rounded-full uppercase">
                                📌 {q.stage}
                              </span>
                            )}
                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-[10px] rounded-full">
                              {q.category}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                          ❓ {q.question}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                          💡 <strong>Why Asked:</strong> {q.rationale}
                        </p>

                        {/* Model Answer Expander Toggle */}
                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-600/60">
                          <button
                            onClick={() =>
                              setExpandedAnswers((prev) => ({
                                ...prev,
                                [idx]: !prev[idx],
                              }))
                            }
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                          >
                            <span>{isAnswerExpanded ? "▼ Hide Model Answer" : "► View High-Scoring STAR Model Answer & Talking Points"}</span>
                          </button>

                          {isAnswerExpanded && (
                            <div className="mt-3 p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-indigo-100 dark:border-indigo-900/50 space-y-3 animate-fadeIn">
                              {q.answer && (
                                <div>
                                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">
                                    ⭐ STAR Sample Response (Targeting Resume Experience)
                                  </p>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {q.answer}
                                  </p>
                                </div>
                              )}

                              {q.keyTalkingPoints && q.keyTalkingPoints.length > 0 && (
                                <div>
                                  <p className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide mb-1">
                                    🎯 Key Talking Points to Mention
                                  </p>
                                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                                    {q.keyTalkingPoints.map((tp, tpIdx) => (
                                      <li key={tpIdx} className="flex items-start gap-1.5">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        <span>{tp}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
                  Click a stage above to generate tailored interview questions and model answers.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ============ SHARE TAB ============ */}
      {activeTab === "share" && (
        <div
          id="panel-share"
          role="tabpanel"
          aria-labelledby="tab-share"
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
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
              <div className="flex-1 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600">
                <p className="text-sm text-gray-700 dark:text-slate-300 font-mono break-all">
                  {shareUrl}
                </p>
              </div>
              <button
                onClick={handleCopyShareLink}
                className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {shareCopied ? (
                  <>✓ Copied!</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============ SALARY TAB ============ */}
      {activeTab === "salary" && (
        <div
          id="panel-salary"
          role="tabpanel"
          aria-labelledby="tab-salary"
          className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            💰 Salary Negotiation Guide
          </h2>
          <div className="flex gap-3 mb-4">
            <input
              value={targetSalary}
              onChange={(e) => setTargetSalary(e.target.value)}
              placeholder="Target salary (e.g. $120,000)"
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 outline-none"
              aria-label="Target salary"
            />
            <button
              onClick={handleNegotiate}
              disabled={negotiating || !targetSalary.trim()}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {negotiating ? "..." : "Generate"}
            </button>
          </div>
          {negotiationResult?.marketRange && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                📊 Market Range
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {negotiationResult.marketRange}
              </p>
            </div>
          )}
          {negotiationResult?.negotiationScript && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-3">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                🎙️ Script
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
                {negotiationResult.negotiationScript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AnalysisDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AnalysisDetailContent />
    </Suspense>
  );
}
