"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScanProgressVisualizer from "@/components/ScanProgressVisualizer";
import KeywordDiffHighlighter from "@/components/KeywordDiffHighlighter";
import InlineAiFixer from "@/components/InlineAiFixer";
import ScoreGauge from "@/components/ScoreGauge";
import { extractLocalKeywordMatch } from "@/lib/keyword-matcher";

interface ResumeItem {
  id: string;
  name: string;
  parsedText: string;
  createdAt: string;
}

interface JdItem {
  id: string;
  title: string;
  company: string | null;
  rawText: string;
  createdAt: string;
}

interface AuditResult {
  id?: string;
  overallScore: number;
  keywordsMatchPct: number;
  formatScore: number;
  impactScore: number;
  keywords: { matched: string[]; missing: string[] };
  skills: { present: string[]; missing: string[] };
  suggestions?: Array<{ section: string; originalText: string; suggestedText: string; rationale: string }>;
  summaryText?: string;
}

export default function StudioPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [jds, setJds] = useState<JdItem[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [selectedJdId, setSelectedJdId] = useState<string>("");

  // URL Importer State
  const [jdUrl, setJdUrl] = useState("");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [pastedJdText, setPastedJdText] = useState("");
  const [pastedJdTitle, setPastedJdTitle] = useState("");

  // Scan & Result State
  const [isScanning, setIsScanning] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSavingApp, setIsSavingApp] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resumesRes, jdsRes] = await Promise.all([
        fetch("/api/resumes"),
        fetch("/api/jds"),
      ]);

      if (resumesRes.ok) {
        const data = await resumesRes.json();
        setResumes(data.resumes || []);
        if (data.resumes?.length > 0) setSelectedResumeId(data.resumes[0].id);
      }

      if (jdsRes.ok) {
        const data = await jdsRes.json();
        setJds(data.jds || []);
        if (data.jds?.length > 0) setSelectedJdId(data.jds[0].id);
      }
    } catch (err) {
      console.error("Failed to load studio data:", err);
    }
  };

  const handleFetchUrl = async () => {
    if (!jdUrl || !jdUrl.startsWith("http")) {
      setStatusMessage("Please enter a valid HTTP or HTTPS job URL.");
      return;
    }

    setIsFetchingUrl(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/jds/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jdUrl }),
      });

      const data = await res.json();
      if (res.ok && data.job) {
        setPastedJdTitle(data.job.title || "Fetched Job Posting");
        setPastedJdText(data.job.rawText || "");
        setSelectedJdId("");
        setStatusMessage(`✅ Extracted: "${data.job.title}"! Click Run Instant ATS Audit.`);
      } else {
        setStatusMessage(`⚠️ ${data.error || "Could not auto-extract job. Paste description text below."}`);
      }
    } catch {
      setStatusMessage("⚠️ Server error reading URL. Please paste description text below.");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleRunAudit = async () => {
    const selectedResume = resumes.find((r) => r.id === selectedResumeId);
    const selectedJd = jds.find((j) => j.id === selectedJdId);
    const rawJdContent = selectedJd?.rawText || pastedJdText;

    if (!selectedResume) {
      setStatusMessage("Please select a target resume to run scan.");
      return;
    }
    if (!rawJdContent.trim()) {
      setStatusMessage("Please select a job description or paste requirements.");
      return;
    }

    setIsScanning(true);
    setStatusMessage(null);
    setAuditResult(null);

    // Fast local client scan fallback
    const localScan = extractLocalKeywordMatch(selectedResume.parsedText, rawJdContent);

    try {
      let analysis: any = null;
      let parsedGaps: any = { keywords: localScan.keywords, skills: localScan.skills };

      // Call analyze endpoint if we have saved JD ID
      if (selectedJdId) {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeId: selectedResumeId, jdId: selectedJdId }),
        });

        if (res.ok) {
          const data = await res.json();
          analysis = data.analysis;
          if (analysis?.skillsGapJson) {
            try {
              parsedGaps = JSON.parse(analysis.skillsGapJson);
            } catch {}
          }
        }
      }

      // If no analysis created yet (e.g. pasted JD), create one
      if (!analysis) {
        const analyzeRes = await fetch("/api/analyze/standalone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeId: selectedResumeId,
            jdTitle: pastedJdTitle || "Custom Job Description",
            jdText: rawJdContent,
          }),
        });

        if (analyzeRes.ok) {
          const data = await analyzeRes.json();
          analysis = data.analysis;
          if (analysis?.skillsGapJson) {
            try {
              parsedGaps = JSON.parse(analysis.skillsGapJson);
            } catch {}
          }
        }
      }

      const overallScore =
        analysis?.overallScore ??
        Math.round(
          ((analysis?.keywordsMatchPct || localScan.keywordsMatchPct) +
            (analysis?.formatScore || localScan.formatScore) +
            (analysis?.impactScore || localScan.impactScore)) /
            3
        );

      setAuditResult({
        id: analysis?.id,
        overallScore,
        keywordsMatchPct: analysis?.keywordsMatchPct ?? localScan.keywordsMatchPct,
        formatScore: analysis?.formatScore ?? localScan.formatScore,
        impactScore: analysis?.impactScore ?? localScan.impactScore,
        keywords: parsedGaps.keywords || localScan.keywords,
        skills: parsedGaps.skills || localScan.skills,
        summaryText:
          analysis?.summaryText ||
          `Resume matches ${localScan.keywordsMatchPct}% of key terms for this role. Incorporate missing hard skills to pass ATS filters.`,
        suggestions:
          analysis?.suggestions?.length > 0
            ? analysis.suggestions
            : localScan.skills.missing.slice(0, 5).map((skill) => ({
                section: "Technical Skills",
                originalText: `Missing required technical skill: "${skill}"`,
                suggestedText: `Engineered high-performance modules leveraging ${skill}, improving delivery velocity by 25%.`,
                rationale: `Adding "${skill}" directly improves keyword search frequency for targeted job postings.`,
              })),
      });
    } catch (err) {
      console.warn("API audit failed, using local analysis fallback:", err);
      const overallScore = Math.round(
        (localScan.keywordsMatchPct + localScan.formatScore + localScan.impactScore) / 3
      );

      setAuditResult({
        overallScore,
        keywordsMatchPct: localScan.keywordsMatchPct,
        formatScore: localScan.formatScore,
        impactScore: localScan.impactScore,
        keywords: localScan.keywords,
        skills: localScan.skills,
        summaryText: `Your resume matches ${localScan.keywordsMatchPct}% of key technical requirements. Incorporate missing target skills to optimize ATS pass rates.`,
        suggestions: localScan.skills.missing.slice(0, 5).map((skill) => ({
          section: "Skills & Experience",
          originalText: `Missing target skill: "${skill}"`,
          suggestedText: `Leveraged ${skill} to develop and optimize scalable application features, increasing performance by 30%.`,
          rationale: `Directly adding "${skill}" aligns your resume with target recruiter screening filters.`,
        })),
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToKanban = async () => {
    let jdIdToSave = selectedJdId;

    if (!jdIdToSave && pastedJdText.trim().length > 0) {
      try {
        const saveRes = await fetch("/api/jds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: pastedJdTitle || "Job Application",
            rawText: pastedJdText,
          }),
        });

        if (saveRes.ok) {
          const saved = await saveRes.json();
          jdIdToSave = saved.jd?.id;
          setSelectedJdId(jdIdToSave);
        }
      } catch {}
    }

    if (!jdIdToSave) {
      setStatusMessage("Please select or import a Job Description first.");
      return;
    }

    setIsSavingApp(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdId: jdIdToSave,
          status: "wishlist",
          notes: `Target ATS score: ${auditResult?.overallScore || "N/A"}%`,
        }),
      });

      if (res.ok) {
        setStatusMessage("🎉 Application saved to Kanban Tracker!");
        setTimeout(() => router.push("/dashboard/tracker"), 1500);
      }
    } catch {
      setStatusMessage("Failed to save application to tracker.");
    } finally {
      setIsSavingApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 sm:p-8 text-white shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300">
                ⚡ Unified Studio Workflow
              </span>
              <h1 className="text-2xl sm:text-4xl font-black mt-3 tracking-tight text-white">
                1-Click Application Studio
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl">
                Select your resume, import a target job link or text, run instant ATS audits, apply STAR bullet fixes, and sync to your application tracker.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => router.push("/dashboard/resumes")}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-[#090A0C] border border-[#242834] text-white hover:border-amber-500/40 transition-all"
              >
                + Upload Resume
              </button>
              <button
                onClick={() => router.push("/dashboard/builder")}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20"
              >
                📄 ATS Builder
              </button>
            </div>
          </div>
        </div>

        {statusMessage && (
          <div className="p-4 rounded-2xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            {statusMessage}
          </div>
        )}

        {/* Main Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Input Studio Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 shadow-2xl space-y-6">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>🎯</span> Step 1: Select Inputs
              </h2>

              {/* Resume Selection */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-2">
                  Choose Target Resume
                </label>
                {resumes.length === 0 ? (
                  <div className="p-3 bg-[#090A0C] rounded-xl text-xs text-zinc-400 border border-[#242834]">
                    No resumes found. Upload your first PDF/DOCX resume to get started.
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl text-xs bg-[#090A0C] border border-[#242834] text-white font-medium focus:outline-none focus:border-amber-500"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        📄 {r.name} ({new Date(r.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <hr className="border-[#242834]" />

              {/* URL Job Importer */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-2">
                  Option A: Extract Job from URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://linkedin.com/jobs/view/..."
                    value={jdUrl}
                    onChange={(e) => setJdUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-[#090A0C] border border-[#242834] text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleFetchUrl}
                    disabled={isFetchingUrl}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 transition-all shrink-0 shadow-md shadow-amber-500/20"
                  >
                    {isFetchingUrl ? "Fetching..." : "Fetch Job"}
                  </button>
                </div>
              </div>

              {/* Existing Saved JDs */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-2">
                  Option B: Choose Saved Job Description
                </label>
                <select
                  value={selectedJdId}
                  onChange={(e) => {
                    setSelectedJdId(e.target.value);
                    setPastedJdText("");
                  }}
                  className="w-full px-4 py-3 rounded-xl text-xs bg-[#090A0C] border border-[#242834] text-white font-medium focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Select Saved Job --</option>
                  {jds.map((j) => (
                    <option key={j.id} value={j.id}>
                      🎯 {j.title} {j.company ? `@ ${j.company}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Raw JD Text Fallback */}
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-2">
                  Option C: Paste Job Description Text
                </label>
                <textarea
                  rows={5}
                  placeholder="Paste responsibilities, qualifications, and requirements..."
                  value={pastedJdText}
                  onChange={(e) => setPastedJdText(e.target.value)}
                  className="w-full p-4 rounded-xl text-xs bg-[#090A0C] border border-[#242834] text-white placeholder-zinc-500 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleRunAudit}
                disabled={isScanning || !selectedResumeId}
                className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isScanning ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Running Deep Scan...
                  </>
                ) : (
                  "🚀 Run Instant ATS Audit"
                )}
              </button>
            </div>
          </div>

          {/* Right Audit & Optimization Panel */}
          <div className="lg:col-span-7 space-y-6">
            <ScanProgressVisualizer isScanning={isScanning} />

            {!auditResult && !isScanning && (
              <div className="bg-[#14161D]/80 backdrop-blur-2xl border border-dashed border-[#242834] rounded-3xl p-12 text-center text-zinc-400 space-y-3">
                <div className="text-4xl">🔍</div>
                <h3 className="text-base font-black text-white">
                  Ready for Audit
                </h3>
                <p className="text-xs max-w-md mx-auto">
                  Select your resume and target job posting on the left, then click <strong>Run Instant ATS Audit</strong> to view scannability scores and 1-click STAR bullet fixes.
                </p>
              </div>
            )}

            {auditResult && (
              <div className="space-y-6">
                {/* Score Breakdown Header */}
                <div className="bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <ScoreGauge score={auditResult.overallScore || 0} size={110} />
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                          Overall ATS Match
                        </span>
                        <h3 className="text-2xl font-black text-white mt-1">
                          {auditResult.overallScore >= 80
                            ? "High Candidate Match 🎉"
                            : auditResult.overallScore >= 60
                            ? "Moderate Match ⚡"
                            : "Needs Optimization ⚠️"}
                        </h3>
                        {auditResult.summaryText && (
                          <p className="text-xs text-zinc-400 mt-1 max-w-md">
                            {auditResult.summaryText}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                      {auditResult.id && (
                        <button
                          onClick={() => router.push(`/dashboard/analyze/${auditResult.id}`)}
                          className="w-full sm:w-auto px-4 py-3 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>📊 View Full Detailed Report</span>
                          <span>→</span>
                        </button>
                      )}
                      <button
                        onClick={handleSaveToKanban}
                        disabled={isSavingApp}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all"
                      >
                        {isSavingApp ? "Saving..." : "📌 Add to Application Kanban"}
                      </button>
                    </div>
                  </div>

                  {/* Sub Score Pills */}
                  <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#242834] text-center">
                    <div className="p-3 rounded-2xl bg-[#090A0C] border border-[#242834]">
                      <span className="text-[10px] text-zinc-500 block font-bold uppercase">Keywords</span>
                      <span className="text-lg font-black text-white">
                        {Math.round(auditResult.keywordsMatchPct || 0)}%
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#090A0C] border border-[#242834]">
                      <span className="text-[10px] text-zinc-500 block font-bold uppercase">Formatting</span>
                      <span className="text-lg font-black text-white">
                        {auditResult.formatScore || 0}/100
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#090A0C] border border-[#242834]">
                      <span className="text-[10px] text-zinc-500 block font-bold uppercase">Metrics & Impact</span>
                      <span className="text-lg font-black text-white">
                        {auditResult.impactScore || 0}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Color-Coded Keyword Breakdown */}
                <KeywordDiffHighlighter
                  matched={auditResult.keywords?.matched}
                  missing={auditResult.keywords?.missing}
                  presentSkills={auditResult.skills?.present}
                  missingSkills={auditResult.skills?.missing}
                />

                {/* 1-Click AI Bullet Rewriter / Fixer */}
                <InlineAiFixer
                  suggestions={auditResult.suggestions || []}
                  missingSkills={auditResult.skills?.missing}
                  onApplyFix={(original) => {
                    setStatusMessage(`✅ Applied fix for "${original.slice(0, 20)}..."`);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
