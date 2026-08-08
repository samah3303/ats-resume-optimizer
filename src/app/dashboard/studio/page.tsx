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
      if (!res.ok) throw new Error(data.error || "Scraping failed");

      const title = data.title || "Job Posting";
      const company = data.company || "";
      const rawText = data.rawText || "";

      setPastedJdTitle(title);
      setPastedJdText(rawText);

      // Save imported JD to DB
      const saveRes = await fetch("/api/jds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: company ? `${title} at ${company}` : title,
          company: company || null,
          rawText,
          sourceUrl: data.sourceUrl,
        }),
      });

      if (saveRes.ok) {
        const savedData = await saveRes.json();
        if (savedData.jd?.id) {
          setJds((prev) => [savedData.jd, ...prev]);
          setSelectedJdId(savedData.jd.id);
        }
      }

      setStatusMessage("✅ Job requirements extracted successfully!");
    } catch (err) {
      setStatusMessage(`❌ Error importing URL: ${(err as Error).message}`);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleRunAudit = async () => {
    const resume = resumes.find((r) => r.id === selectedResumeId);
    let jdText = "";
    let targetJdId = selectedJdId;

    if (pastedJdText.trim().length > 0) {
      jdText = pastedJdText;
    } else {
      const jd = jds.find((j) => j.id === selectedJdId);
      jdText = jd?.rawText || "";
    }

    if (!resume) {
      setStatusMessage("Please select or upload a resume first.");
      return;
    }

    if (!jdText) {
      setStatusMessage("Please select a saved job or paste job description text.");
      return;
    }

    setIsScanning(true);
    setAuditResult(null);
    setStatusMessage(null);

    // Compute local fallback scan upfront
    const localScan = extractLocalKeywordMatch(resume.parsedText, jdText);

    try {
      // Build request body for POST /api/analyze
      const payload: Record<string, any> = {
        resumeId: resume.id,
      };

      if (targetJdId) {
        payload.jdId = targetJdId;
      } else {
        payload.pasteJdTitle = pastedJdTitle || "Target Job Posting";
        payload.pasteJdText = jdText;
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis API failed");

      const analysis = data.analysis || data;

      // Parse JSON skills gap if present
      let parsedGaps = { keywords: localScan.keywords, skills: localScan.skills };
      if (analysis.skillsGapJson) {
        try {
          const parsed = JSON.parse(analysis.skillsGapJson);
          if (parsed.keywords) parsedGaps.keywords = parsed.keywords;
          if (parsed.skills) parsedGaps.skills = parsed.skills;
        } catch {
          // fallback to localScan
        }
      }

      const overallScore =
        analysis.overallScore ??
        Math.round(
          ((analysis.keywordsMatchPct || localScan.keywordsMatchPct) +
            (analysis.formatScore || localScan.formatScore) +
            (analysis.impactScore || localScan.impactScore)) /
            3
        );

      setAuditResult({
        id: analysis.id,
        overallScore,
        keywordsMatchPct: analysis.keywordsMatchPct ?? localScan.keywordsMatchPct,
        formatScore: analysis.formatScore ?? localScan.formatScore,
        impactScore: analysis.impactScore ?? localScan.impactScore,
        keywords: parsedGaps.keywords || localScan.keywords,
        skills: parsedGaps.skills || localScan.skills,
        summaryText:
          analysis.summaryText ||
          `Resume matches ${localScan.keywordsMatchPct}% of key terms for this role. Incorporate missing hard skills to pass ATS filters.`,
        suggestions:
          analysis.suggestions?.length > 0
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
      // Fast Zero-Cost Fallback Analysis
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
      // Save pasted JD first if not saved yet
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
              ⚡ Unified Studio Workflow
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
              1-Click Application Studio
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-2 max-w-2xl">
              Select your resume, import a target job link or text, run instant ATS audits, apply STAR bullet fixes, and sync to your application tracker.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => router.push("/dashboard/resumes")}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-all"
            >
              + Upload Resume
            </button>
            <button
              onClick={() => router.push("/dashboard/builder")}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white text-indigo-950 hover:bg-indigo-50 transition-all shadow-md"
            >
              📄 ATS Builder
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
          {statusMessage}
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input Studio Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🎯</span> Step 1: Select Inputs
            </h2>

            {/* Resume Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Choose Target Resume
              </label>
              {resumes.length === 0 ? (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                  No resumes found. Upload your first PDF/DOCX resume to get started.
                </div>
              ) : (
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      📄 {r.name} ({new Date(r.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            {/* URL Job Importer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Option A: Extract Job from URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/..."
                  value={jdUrl}
                  onChange={(e) => setJdUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleFetchUrl}
                  disabled={isFetchingUrl}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-all shrink-0"
                >
                  {isFetchingUrl ? "Fetching..." : "Fetch Job"}
                </button>
              </div>
            </div>

            {/* Existing Saved JDs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Option B: Choose Saved Job Description
              </label>
              <select
                value={selectedJdId}
                onChange={(e) => {
                  setSelectedJdId(e.target.value);
                  setPastedJdText("");
                }}
                className="w-full px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
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
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Option C: Paste Job Description Text
              </label>
              <textarea
                rows={5}
                placeholder="Paste responsibilities, qualifications, and requirements..."
                value={pastedJdText}
                onChange={(e) => setPastedJdText(e.target.value)}
                className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <button
              onClick={handleRunAudit}
              disabled={isScanning || !selectedResumeId}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-700 to-indigo-600 hover:from-indigo-800 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isScanning ? "Running Deep Scan..." : "🚀 Run Instant ATS Audit"}
            </button>
          </div>
        </div>

        {/* Right Audit & Optimization Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <ScanProgressVisualizer isScanning={isScanning} />

          {!auditResult && !isScanning && (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <ScoreGauge score={auditResult.overallScore || 0} size={110} />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Overall ATS Match
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {auditResult.overallScore >= 80
                          ? "High Candidate Match 🎉"
                          : auditResult.overallScore >= 60
                          ? "Moderate Match ⚡"
                          : "Needs Optimization ⚠️"}
                      </h3>
                      {auditResult.summaryText && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                          {auditResult.summaryText}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                    {auditResult.id && (
                      <button
                        onClick={() => router.push(`/dashboard/analyze/${auditResult.id}`)}
                        className="w-full sm:w-auto px-4 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>📊 View Full Detailed Report</span>
                        <span>→</span>
                      </button>
                    )}
                    <button
                      onClick={handleSaveToKanban}
                      disabled={isSavingApp}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
                    >
                      {isSavingApp ? "Saving..." : "📌 Add to Application Kanban"}
                    </button>
                  </div>
                </div>

                {/* Sub Score Pills */}
                <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-xs text-slate-400 block font-medium">Keywords</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {Math.round(auditResult.keywordsMatchPct || 0)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-xs text-slate-400 block font-medium">Formatting</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {auditResult.formatScore || 0}/100
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-xs text-slate-400 block font-medium">Metrics & Impact</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
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
                onApplyFix={(original, updated) => {
                  setStatusMessage(`✅ Applied fix for "${original.slice(0, 20)}..."`);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
