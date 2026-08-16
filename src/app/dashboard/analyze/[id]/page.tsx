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

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "suggestions", label: "Bullet Fixes", icon: "⚡" },
  { id: "coverletter", label: "Cover Letter", icon: "✉️" },
  { id: "interview", label: "Interview Coach", icon: "🎙️" },
  { id: "salary", label: "Salary Guide", icon: "💰" },
  { id: "share", label: "Share Report", icon: "🔗" },
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
    toast("Cover letter copied to clipboard!", "success");
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
    toast("Share link copied to clipboard!", "success");
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleNegotiate = async () => {
    if (!targetSalary.trim()) return;
    setNegotiating(true);
    try {
      const res = await fetch("/api/salary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: id,
          targetSalary: targetSalary.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNegotiationResult(data);
      } else {
        toast("Failed to generate negotiation guide", "error");
      }
    } catch {
      toast("Failed to generate negotiation guide", "error");
    } finally {
      setNegotiating(false);
    }
  };

  const [selectedTemplate, setSelectedTemplate] = useState<"emerald_tech" | "classic_corporate">("emerald_tech");

  const handleDownloadOptimized = async (targetFormat: "pdf" | "docx" = "pdf") => {
    const safeSugs = Array.isArray(suggestions) ? suggestions : [];
    let acceptedIds = safeSugs.filter((s) => s.accepted).map((s) => s.id);
    if (acceptedIds.length === 0) {
      acceptedIds = safeSugs.map((s) => s.id);
    }

    setDownloading(true);
    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: id,
          acceptedSuggestionIds: acceptedIds,
          format: targetFormat,
          template: selectedTemplate,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate optimized resume");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `optimized-resume-${analysis?.resume?.name || "resume"}.${targetFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const acceptedCount = safeSugs.filter((s) => s.accepted).length;
      const boost = Math.min(acceptedCount * 5, 25);
      setScoreBoost(boost);
      setDownloadSuccess(true);
      toast(`Optimized ${targetFormat.toUpperCase()} downloaded successfully!`, "success");
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
      <div className="flex items-center justify-center min-h-[80vh] bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-black uppercase tracking-wider">
            Loading Analysis Report...
          </p>
        </div>
      </div>
    );
  }

  // --- Error state ---
  if (fetchError || !analysis) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-rose-200 rounded-3xl text-center space-y-4 text-black shadow-sm">
        <span className="text-4xl" aria-hidden="true">⚠️</span>
        <h2 className="text-lg font-black text-black">Analysis Report Not Found</h2>
        <p className="text-xs text-zinc-600 leading-relaxed">
          {fetchError || "The requested analysis details could not be retrieved."}
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={fetchAnalysis}
            className="px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm"
          >
            Try Again
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-white border border-zinc-300 text-zinc-800 text-xs font-bold rounded-xl hover:border-black transition-colors shadow-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Parse JSON data safely with strict array guarantees
  let keywords: KeywordData = { matched: [], missing: [] };
  try {
    const raw = (analysis as unknown as Record<string, unknown>).keywordsJson as string;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        keywords = {
          matched: Array.isArray(parsed.matched) ? parsed.matched : [],
          missing: Array.isArray(parsed.missing) ? parsed.missing : [],
        };
      }
    }
  } catch {
    keywords = { matched: [], missing: [] };
  }

  let skillsGap: SkillsGapData = { present: [], missing: [] };
  try {
    if (analysis.skillsGapJson) {
      const parsed = JSON.parse(analysis.skillsGapJson);
      if (parsed && typeof parsed === "object") {
        skillsGap = {
          present: Array.isArray(parsed.present) ? parsed.present : [],
          missing: Array.isArray(parsed.missing) ? parsed.missing : [],
        };
      }
    }
  } catch {
    skillsGap = { present: [], missing: [] };
  }

  // Ensure safe arrays
  const safeMatchedKeywords = keywords.matched || [];
  const safeMissingKeywords = keywords.missing || [];
  const safePresentSkills = skillsGap.present || [];
  const safeMissingSkills = skillsGap.missing || [];
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];

  // Frequency mapping for heatmap
  let keywordFrequencies: KeywordFrequency[] = [];
  try {
    const freqRaw = (analysis as unknown as Record<string, unknown>).keywordFrequenciesJson as string;
    if (freqRaw) {
      const parsed = JSON.parse(freqRaw);
      if (Array.isArray(parsed)) {
        keywordFrequencies = parsed;
      }
    }
  } catch {
    keywordFrequencies = [];
  }

  if (keywordFrequencies.length === 0) {
    keywordFrequencies = [
      ...safeMatchedKeywords.map((w) => ({ word: w, count: 1, matched: true })),
      ...safeMissingKeywords.map((w) => ({ word: w, count: 1, matched: false })),
    ];
  }

  const maxFreq = Math.max(1, ...keywordFrequencies.map((k) => k.count));

  const sections = [
    { label: "Keyword Match", value: analysis.keywordsMatchPct, isPct: true },
    { label: "Format Score", value: analysis.formatScore, isPct: false },
    { label: "Impact & STAR Bullet Score", value: analysis.impactScore, isPct: false },
  ];

  const overallScoreVal = analysis.overallScore ?? 0;
  const isHighMatch = overallScoreVal >= 75;
  const isMediumMatch = overallScoreVal >= 50 && overallScoreVal < 75;

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Navigation / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-bold text-black hover:underline transition-colors uppercase tracking-wider"
        >
          <span>← Back to Dashboard</span>
        </Link>
        <span className="text-[11px] font-mono text-zinc-500 font-bold">
          Scanned {new Date(analysis.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Main Analysis Header Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 text-black shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="shrink-0">
              <ScoreGauge score={overallScoreVal} size={130} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isHighMatch
                      ? "bg-emerald-50 text-emerald-950 border border-emerald-300"
                      : isMediumMatch
                      ? "bg-amber-50 text-amber-950 border border-amber-300"
                      : "bg-rose-50 text-rose-950 border border-rose-300"
                  }`}
                >
                  {isHighMatch ? "🟢 Ready to Apply" : isMediumMatch ? "🟡 Quick Fixes Needed" : "🔴 High ATS Rejection Risk"}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-black leading-tight">
                {analysis.jobDescription?.title || "Job Analysis Report"}
              </h1>
              <p className="text-xs text-zinc-500 font-medium">
                Comparing <span className="text-black font-bold">{analysis.resume?.name || "Resume"}</span> against{" "}
                <span className="text-black font-bold">{analysis.jobDescription?.company || "Target Job Posting"}</span>
              </p>
              {analysis.jobDescription?.sourceUrl && (
                <a
                  href={analysis.jobDescription.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300 text-xs font-bold rounded-xl transition-colors"
                >
                  <span>🔗 View Original Posting</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full lg:w-auto">
            {/* Template Selector Dropdown */}
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value as "emerald_tech" | "classic_corporate")}
              className="px-3.5 py-3 bg-white border border-zinc-300 text-black text-xs font-bold rounded-2xl outline-none cursor-pointer hover:border-black transition-colors shadow-sm"
            >
              <option value="emerald_tech">🎨 Template: Emerald Tech</option>
              <option value="classic_corporate">🏛️ Template: Classic Corporate</option>
            </select>

            <button
              onClick={() => handleDownloadOptimized("pdf")}
              disabled={downloading}
              className="px-5 py-3.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 border border-black"
            >
              {downloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <span>📥 Download ATS PDF</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleDownloadOptimized("docx")}
              disabled={downloading}
              className="px-5 py-3.5 bg-white hover:bg-zinc-100 text-black border border-zinc-300 text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span>📝 Download Editable DOCX</span>
            </button>

            <button
              onClick={handleShare}
              disabled={sharing}
              className="px-4 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300 text-xs font-bold rounded-2xl transition-all flex items-center gap-2 shadow-sm"
            >
              <span>🔗 Share</span>
            </button>
          </div>
        </div>

        {/* Smart Executive Guidance Banner */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs space-y-1">
          <p className="font-bold text-black flex items-center gap-1.5">
            <span>💡 Strategic Recommendation:</span>
          </p>
          <p className="text-zinc-700 leading-relaxed font-medium">
            {isHighMatch
              ? "Your resume shows strong ATS alignment (75%+). Download your ATS PDF and submit your application with confidence!"
              : `Your resume currently matches ${overallScoreVal}% of the job requirements. Accept the tailored bullet rewrites on the 'Bullet Fixes' tab to boost your score to 80%+.`}
          </p>
        </div>
      </div>

      {/* Download Success Banner */}
      {downloadSuccess && (
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl text-emerald-950 space-y-3 shadow-sm animate-fadeIn">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎉</span>
            <div className="flex-1 space-y-1">
              <h3 className="text-sm font-black text-emerald-900">
                Optimized Resume PDF Downloaded!
              </h3>
              <p className="text-xs text-emerald-800">
                Estimated ATS score boost: <strong className="text-black font-bold">+{scoreBoost}%</strong> (Projected Score: ~{Math.min(100, overallScoreVal + scoreBoost)}%)
              </p>
            </div>
            <button
              onClick={() => setDownloadSuccess(false)}
              className="text-xs font-bold text-emerald-700 hover:text-black"
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        className="flex gap-2 bg-zinc-100 border border-zinc-200 rounded-2xl p-1.5 overflow-x-auto"
        role="tablist"
        aria-label="Analysis sections"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={isActive}
              className={`flex-1 min-w-fit px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center justify-center gap-2 ${
                isActive
                  ? "bg-black text-white font-bold shadow-sm"
                  : "text-zinc-600 hover:text-black hover:bg-white"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === "suggestions" && safeSuggestions.length > 0 && (
                <span
                  className={`ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive ? "bg-white text-black" : "bg-zinc-200 text-black"
                  }`}
                >
                  {safeSuggestions.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ============ OVERVIEW TAB ============ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {analysis?.resume?.id && (
            <AtsXray
              resumeId={analysis.resume.id}
              resumeName={analysis.resume.name || "Resume"}
            />
          )}

          {/* Section Scores Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sections.map((sec) => {
              const val = sec.value !== null && sec.value !== undefined ? Math.round(sec.value) : 0;
              return (
                <div
                  key={sec.label}
                  className="p-5 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between text-xs text-zinc-600 font-bold">
                    <span>{sec.label}</span>
                    <span className="text-black font-mono font-bold">{sec.isPct ? `${val}%` : `${val}/100`}</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        val >= 75 ? "bg-black" : val >= 50 ? "bg-zinc-700" : "bg-zinc-400"
                      }`}
                      style={{ width: `${Math.min(100, val)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keywords Match & Missing */}
          {(safeMatchedKeywords.length > 0 || safeMissingKeywords.length > 0) && (
            <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-5">
              <h2 className="text-sm font-black text-black uppercase tracking-wider">
                Keyword Matching Breakdown
              </h2>
              {safeMatchedKeywords.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>✅ Matched Keywords ({safeMatchedKeywords.length}):</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {safeMatchedKeywords.map((kw) => (
                      <KeywordBadge key={kw} keyword={kw} matched />
                    ))}
                  </div>
                </div>
              )}

              {safeMissingKeywords.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-zinc-200">
                  <p className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <span>❌ Missing Keywords to Add ({safeMissingKeywords.length}):</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {safeMissingKeywords.map((kw) => (
                      <KeywordBadge key={kw} keyword={kw} matched={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Skills Gap Analysis */}
          {(safePresentSkills.length > 0 || safeMissingSkills.length > 0) && (
            <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-black uppercase tracking-wider">
                Technical Skills Gap Analysis
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Skills Found in Resume
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {safePresentSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-white text-emerald-950 border border-emerald-200 text-[11px] font-bold rounded-xl shadow-sm"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                  <p className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                    Missing Target Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {safeMissingSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-white text-rose-950 border border-rose-200 text-[11px] font-bold rounded-xl shadow-sm"
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Skill Bridge Card */}
          {(safeMissingSkills.length > 0 || safeMissingKeywords.length > 0) && (
            <SkillBridgeCard
              missingSkills={Array.from(
                new Set([...safeMissingSkills, ...safeMissingKeywords])
              )}
            />
          )}

          {/* Keyword Density Heatmap */}
          {keywordFrequencies.length > 0 && (
            <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-black uppercase tracking-wider">
                Keyword Frequency Heatmap
              </h2>
              <div className="flex flex-wrap gap-2">
                {keywordFrequencies.map((kw) => (
                  <span
                    key={kw.word}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      kw.matched
                        ? "bg-emerald-50 text-emerald-950 border-emerald-200"
                        : "bg-rose-50 text-rose-950 border-rose-200"
                    }`}
                  >
                    {kw.matched ? "✓" : "×"} {kw.word}
                    {kw.count > 1 && <span className="ml-1 opacity-70">({kw.count}x)</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ SUGGESTIONS / BULLET FIXES TAB ============ */}
      {activeTab === "suggestions" && (
        <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-6 text-black">
          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-black text-black uppercase tracking-wider">
                ⚡ Tailored STAR Bullet Rewrites ({safeSuggestions.length})
              </span>
              <span className="text-xs font-bold text-black">
                Current: {overallScoreVal}% ➔ Projected:{" "}
                <span className="text-black underline font-extrabold">
                  {Math.min(95, Math.max(78, overallScoreVal + safeSuggestions.length * 3))}% Match
                </span>
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              These suggestions are generated specifically by comparing your resume against this job posting. Apply these STAR bullets to boost your score to 80%+.
            </p>
          </div>

          {safeSuggestions.length === 0 ? (
            <InlineAiFixer
              missingSkills={safeMissingSkills}
              suggestions={[]}
              onApplyFix={(orig: string) => {
                toast(`Accepted fix for "${orig.slice(0, 20)}..."`, "success");
              }}
            />
          ) : (
            <div className="space-y-4">
              {safeSuggestions.map((sug) => (
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
        <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-5 text-black">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <h2 className="text-sm font-black text-black uppercase tracking-wider">
                ✉️ Tailored Cover Letter Generator
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Generates a 3-paragraph executive cover letter customized for this job posting.
              </p>
            </div>
            {!showCoverLetter && (
              <button
                onClick={handleGenerateCoverLetter}
                disabled={generatingCoverLetter}
                className="px-5 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center gap-2 border border-black"
              >
                {generatingCoverLetter ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <span>⚡ Generate Cover Letter</span>
                )}
              </button>
            )}
          </div>

          {showCoverLetter && (
            <div>
              {generatingCoverLetter ? (
                <div className="flex items-center justify-center py-12">
                  <span className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span className="ml-3 text-xs font-bold text-black uppercase tracking-wider">
                    Drafting custom cover letter...
                  </span>
                </div>
              ) : coverLetterText ? (
                <div className="space-y-4">
                  <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl max-h-96 overflow-y-auto shadow-sm">
                    <pre className="text-xs text-zinc-800 whitespace-pre-wrap font-sans leading-relaxed">
                      {coverLetterText}
                    </pre>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopyCoverLetter}
                      className="px-5 py-2.5 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 border border-black shadow-sm"
                    >
                      <span>{coverLetterCopied ? "✓ Copied!" : "📋 Copy to Clipboard"}</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowCoverLetter(false);
                        setCoverLetterText(null);
                      }}
                      className="px-4 py-2.5 text-xs text-zinc-500 hover:text-black font-bold transition-colors"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-rose-600 font-bold py-4">
                  Failed to generate cover letter. Please try again.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============ INTERVIEW COACH TAB ============ */}
      {activeTab === "interview" && (
        <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-5 text-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <h2 className="text-sm font-black text-black uppercase tracking-wider">
                🎙️ Stage-Wise Interview Coach & STAR Answers
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Predicted questions and STAR model answers tailored for this job description.
              </p>
            </div>
            <button
              onClick={() => handleGenerateQuestions(selectedStage)}
              disabled={generatingQuestions}
              className="px-5 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center gap-2 shrink-0 border border-black"
            >
              {generatingQuestions ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <span>🔄 Generate Questions</span>
              )}
            </button>
          </div>

          {/* Stage Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "🌐 All Stages" },
              { id: "hr", label: "💼 HR Screening" },
              { id: "technical", label: "💻 Technical Round" },
              { id: "coding", label: "⚡ System Design" },
              { id: "behavioral", label: "🤝 Behavioral" },
              { id: "ceo", label: "👑 Executive Round" },
            ].map((stage) => (
              <button
                key={stage.id}
                onClick={() => handleGenerateQuestions(stage.id)}
                disabled={generatingQuestions}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  selectedStage === stage.id
                    ? "bg-black text-white font-bold"
                    : "bg-white border border-zinc-300 text-zinc-700 hover:border-black shadow-sm"
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>

          {showQuestions && (
            <>
              {generatingQuestions ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <span className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-black uppercase tracking-wider">
                    Generating Q&As for {selectedStage.toUpperCase()} round...
                  </span>
                </div>
              ) : interviewQuestions && interviewQuestions.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {interviewQuestions.map((q, idx) => {
                    const isExpanded = Boolean(expandedAnswers[idx]);
                    return (
                      <div
                        key={idx}
                        className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          {q.stage && (
                            <span className="px-2 py-0.5 bg-zinc-200 text-black text-[10px] font-bold rounded-lg uppercase">
                              {q.stage}
                            </span>
                          )}
                          <span className="text-xs font-mono text-zinc-500 font-bold">{q.category}</span>
                        </div>
                        <h3 className="text-xs font-bold text-black leading-relaxed">
                          ❓ {q.question}
                        </h3>
                        <p className="text-[11px] text-zinc-600 italic">
                          💡 <strong className="text-black">Why Asked:</strong> {q.rationale}
                        </p>

                        <div className="pt-2 border-t border-zinc-200">
                          <button
                            onClick={() =>
                              setExpandedAnswers((prev) => ({
                                ...prev,
                                [idx]: !prev[idx],
                              }))
                            }
                            className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                          >
                            <span>{isExpanded ? "▼ Hide Model STAR Answer" : "► View STAR Model Answer & Talking Points"}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-3 p-4 bg-white border border-zinc-200 rounded-xl space-y-3 shadow-sm">
                              {q.answer && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">
                                    ⭐ Sample STAR Answer:
                                  </p>
                                  <p className="text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap font-medium">
                                    {q.answer}
                                  </p>
                                </div>
                              )}
                              {q.keyTalkingPoints && q.keyTalkingPoints.length > 0 && (
                                <div className="space-y-1">
                                  <p className="text-[10px] font-bold text-black uppercase tracking-wider">
                                    🎯 Key Talking Points:
                                  </p>
                                  <ul className="space-y-1 text-xs text-zinc-700">
                                    {q.keyTalkingPoints.map((tp, tpIdx) => (
                                      <li key={tpIdx} className="flex items-start gap-1.5">
                                        <span className="text-black font-bold">•</span>
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
                <p className="text-xs text-zinc-500 py-6 text-center font-medium">
                  Click a stage above to generate tailored interview questions.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ============ SALARY GUIDE TAB ============ */}
      {activeTab === "salary" && (
        <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-5 text-black">
          <h2 className="text-sm font-black text-black uppercase tracking-wider">
            💰 Salary Negotiation Script & Market Guide
          </h2>
          <div className="flex gap-3">
            <input
              value={targetSalary}
              onChange={(e) => setTargetSalary(e.target.value)}
              placeholder="Target salary (e.g. $120,000)"
              className="flex-1 px-4 py-3 bg-white border border-zinc-300 rounded-2xl text-xs font-bold text-black placeholder-zinc-400 focus:border-black focus:outline-none shadow-sm"
            />
            <button
              onClick={handleNegotiate}
              disabled={negotiating || !targetSalary.trim()}
              className="px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase rounded-2xl transition-all disabled:opacity-50 border border-black shadow-sm"
            >
              {negotiating ? "Generating..." : "Generate Guide"}
            </button>
          </div>

          {negotiationResult?.marketRange && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
              <p className="text-xs font-black text-black uppercase tracking-wider">
                📊 Estimated Market Salary Range:
              </p>
              <p className="text-xs text-zinc-800 font-medium">
                {negotiationResult.marketRange}
              </p>
            </div>
          )}

          {negotiationResult?.negotiationScript && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
              <p className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                🎙️ Counter-Offer Script:
              </p>
              <p className="text-xs text-emerald-950 leading-relaxed whitespace-pre-wrap font-sans font-medium">
                {negotiationResult.negotiationScript}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ============ SHARE REPORT TAB ============ */}
      {activeTab === "share" && (
        <div className="p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm space-y-5 text-black">
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
            <div>
              <h2 className="text-sm font-black text-black uppercase tracking-wider">
                🔗 Share Public Analysis Report
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Creates a read-only public share link for career coaches or recruiters.
              </p>
            </div>
            {!shareUrl && (
              <button
                onClick={handleShare}
                disabled={sharing}
                className="px-5 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center gap-2 border border-black"
              >
                {sharing ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Link...</span>
                  </>
                ) : (
                  <span>🔗 Create Share Link</span>
                )}
              </button>
            )}
          </div>

          {shareUrl && (
            <div className="flex items-center gap-3">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs font-mono text-black focus:outline-none"
              />
              <button
                onClick={handleCopyShareLink}
                className="px-5 py-3 bg-black text-white hover:bg-zinc-800 border border-black text-xs font-bold rounded-2xl transition-colors shrink-0 shadow-sm"
              >
                {shareCopied ? "✓ Copied!" : "📋 Copy Link"}
              </button>
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
        <div className="flex items-center justify-center min-h-[80vh] bg-white">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AnalysisDetailContent />
    </Suspense>
  );
}
