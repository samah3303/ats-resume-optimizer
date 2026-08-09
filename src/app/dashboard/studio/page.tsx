"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ScanProgressVisualizer from "@/components/ScanProgressVisualizer";
import KeywordDiffHighlighter from "@/components/KeywordDiffHighlighter";
import InlineAiFixer from "@/components/InlineAiFixer";
import ScoreGauge from "@/components/ScoreGauge";
import TrafficLightStatus from "@/components/TrafficLightStatus";
import FixMyResumeWizardModal from "@/components/FixMyResumeWizardModal";
import ConfettiCelebration from "@/components/ConfettiCelebration";
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

  // Audit State
  const [isScanning, setIsScanning] = useState(false);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [isSavingApp, setIsSavingApp] = useState(false);

  // 1-Click Fix Wizard Modal
  const [showFixWizard, setShowFixWizard] = useState(false);

  // Confetti celebration for 75%+ scores
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [resRes, jdsRes] = await Promise.all([
          fetch("/api/resumes"),
          fetch("/api/jds"),
        ]);
        if (resRes.ok) {
          const data = await resRes.json();
          const list: ResumeItem[] = data.resumes || [];
          setResumes(list);
          const primary = list.find((r: any) => r.isPrimary) || list[0];
          if (primary) setSelectedResumeId(primary.id);
        }
        if (jdsRes.ok) {
          const data = await jdsRes.json();
          const list: JdItem[] = data.jds || [];
          setJds(list);
          if (list[0]) setSelectedJdId(list[0].id);
        }
      } catch (err) {
        console.error("Studio failed to load initial data", err);
      }
    }
    loadData();
  }, []);

  const handleFetchUrl = async () => {
    if (!jdUrl.trim()) return;
    setIsFetchingUrl(true);
    setStatusMessage("Fetching job description from URL...");
    try {
      const res = await fetch("/api/jds/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jdUrl.trim() }),
      });

      if (res.ok) {
        const data = await res.json();
        const extractedText = data.job?.rawText || "";
        const extractedTitle = data.job?.title || "Extracted Job Posting";

        setPastedJdText(extractedText);
        setPastedJdTitle(extractedTitle);
        setSelectedJdId("custom_pasted");
        setStatusMessage(`Extracted: "${extractedTitle}"! Ready for scan.`);
      } else {
        const errData = await res.json();
        setStatusMessage(`⚠️ Failed to parse URL: ${errData.error || "Please paste text directly."}`);
      }
    } catch {
      setStatusMessage("⚠️ Failed to parse URL. Please paste the job description text manually below.");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleRunAudit = async () => {
    const resumeObj = resumes.find((r) => r.id === selectedResumeId);
    let jdText = "";
    let jdTitle = "";
    let jdIdToUse: string | null = null;

    if (selectedJdId === "custom_pasted") {
      jdText = pastedJdText;
      jdTitle = pastedJdTitle || "Custom Job Description";
    } else {
      const jdObj = jds.find((j) => j.id === selectedJdId);
      if (jdObj) {
        jdText = jdObj.rawText;
        jdTitle = jdObj.title;
        jdIdToUse = jdObj.id;
      }
    }

    if (!resumeObj || !jdText.trim()) {
      setStatusMessage("⚠️ Please select a valid resume and job description text before scanning.");
      return;
    }

    setIsScanning(true);
    setStatusMessage("Running multi-agent AI ATS scan...");
    setAuditResult(null);

    try {
      let activeJdId = jdIdToUse;
      if (!activeJdId) {
        const createJdRes = await fetch("/api/jds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: jdTitle || "Job Description",
            rawText: jdText,
            sourceUrl: jdUrl.trim() || undefined,
          }),
        });
        if (createJdRes.ok) {
          const createdData = await createJdRes.json();
          activeJdId = createdData.jobDescription?.id || null;
        }
      }

      if (activeJdId) {
        const apiRes = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeId: resumeObj.id,
            jdId: activeJdId,
          }),
        });

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          const analysisObj = apiData.analysis;
          const skillsGap = analysisObj.skillsGapJson
            ? JSON.parse(analysisObj.skillsGapJson)
            : { present: [], missing: [] };

          let parsedSuggestions: Array<{ section: string; originalText: string; suggestedText: string; rationale: string }> = [];
          if (analysisObj.suggestions && Array.isArray(analysisObj.suggestions)) {
            parsedSuggestions = analysisObj.suggestions;
          } else if (analysisObj.rawAiResponse) {
            try {
              const rawJson = JSON.parse(analysisObj.rawAiResponse);
              if (rawJson.suggestions) parsedSuggestions = rawJson.suggestions;
            } catch {
              // fallback
            }
          }

          const localMatch = extractLocalKeywordMatch(resumeObj.parsedText, jdText);

          setAuditResult({
            id: analysisObj.id,
            overallScore: analysisObj.overallScore ?? localMatch.keywordsMatchPct,
            keywordsMatchPct: analysisObj.keywordsMatchPct ?? localMatch.keywordsMatchPct,
            formatScore: analysisObj.formatScore ?? localMatch.formatScore,
            impactScore: analysisObj.impactScore ?? localMatch.impactScore,
            keywords: {
              matched: localMatch.keywords.matched,
              missing: localMatch.keywords.missing,
            },
            skills: {
              present: skillsGap.present || localMatch.skills.present,
              missing: skillsGap.missing || localMatch.skills.missing,
            },
            suggestions: parsedSuggestions,
            summaryText: analysisObj.summaryText || "AI audit complete. Apply STAR bullet rewrites to maximize interview callbacks.",
          });
          setStatusMessage("✅ Deep ATS Audit Complete!");
          if ((analysisObj.overallScore ?? localMatch.keywordsMatchPct) >= 75) {
            setShowConfetti(true);
          }
          setIsScanning(false);
          return;
        }
      }

      // Local fallback calculation
      const localMatch = extractLocalKeywordMatch(resumeObj.parsedText, jdText);
      setAuditResult({
        overallScore: localMatch.keywordsMatchPct,
        keywordsMatchPct: localMatch.keywordsMatchPct,
        formatScore: localMatch.formatScore,
        impactScore: localMatch.impactScore,
        keywords: {
          matched: localMatch.keywords.matched,
          missing: localMatch.keywords.missing,
        },
        skills: {
          present: localMatch.skills.present,
          missing: localMatch.skills.missing,
        },
        summaryText: "Fallback instant keyword scan performed. Connect database for full AI deep scan.",
      });
      setStatusMessage("✅ Audit Complete (Instant Match)");
    } catch {
      setStatusMessage("⚠️ Deep scan error. Displaying local keyword scan.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToKanban = async () => {
    let activeJdId = selectedJdId;
    if (activeJdId === "custom_pasted" || !activeJdId) {
      try {
        const createJdRes = await fetch("/api/jds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: pastedJdTitle || "Studio Target Job",
            rawText: pastedJdText,
            sourceUrl: jdUrl.trim() || undefined,
          }),
        });
        if (createJdRes.ok) {
          const data = await createJdRes.json();
          activeJdId = data.jobDescription?.id;
        }
      } catch {
        // fail gracefully
      }
    }

    if (!activeJdId || activeJdId === "custom_pasted") {
      setStatusMessage("⚠️ Please select or parse a valid job posting first.");
      return;
    }

    setIsSavingApp(true);
    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdId: activeJdId,
          status: "wishlist",
        }),
      });

      if (res.ok) {
        setStatusMessage("🎉 Job saved to Application Kanban Tracker!");
        router.push("/dashboard/tracker");
      } else {
        setStatusMessage("⚠️ Job already exists in your Kanban tracker.");
      }
    } catch {
      setStatusMessage("⚠️ Failed to save job to tracker.");
    } finally {
      setIsSavingApp(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      {/* Confetti burst on 75%+ score */}
      <ConfettiCelebration show={showConfetti} onComplete={() => setShowConfetti(false)} />

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
                    className="w-full px-4 py-3 bg-[#090A0C] border border-[#242834] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        📄 {r.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* URL Importer */}
              <div className="space-y-2 pt-2 border-t border-[#242834]">
                <label className="block text-xs font-bold text-amber-300">
                  Import Target Job Posting from Web URL:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://linkedin.com/jobs/view/..."
                    value={jdUrl}
                    onChange={(e) => setJdUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-[#090A0C] border border-[#242834] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleFetchUrl}
                    disabled={isFetchingUrl || !jdUrl.trim()}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all disabled:opacity-50 shrink-0"
                  >
                    {isFetchingUrl ? "Parsing..." : "Fetch Job"}
                  </button>
                </div>
              </div>

              {/* Saved JDs Dropdown */}
              <div className="space-y-2 pt-2 border-t border-[#242834]">
                <label className="block text-xs font-bold text-amber-300">
                  Or Pick Saved Job Description:
                </label>
                <select
                  value={selectedJdId}
                  onChange={(e) => setSelectedJdId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#090A0C] border border-[#242834] rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                >
                  {pastedJdText && (
                    <option value="custom_pasted">
                      🔗 Extracted Job: {pastedJdTitle || "Web URL Posting"}
                    </option>
                  )}
                  {jds.map((j) => (
                    <option key={j.id} value={j.id}>
                      💼 {j.title} {j.company ? `(${j.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Raw Text Input Fallback */}
              <div className="space-y-2 pt-2 border-t border-[#242834]">
                <label className="block text-xs font-bold text-amber-300">
                  Target Job Description Raw Text:
                </label>
                <textarea
                  rows={5}
                  placeholder="Paste job title & required skills text here..."
                  value={pastedJdText}
                  onChange={(e) => {
                    setPastedJdText(e.target.value);
                    if (selectedJdId !== "custom_pasted") {
                      setSelectedJdId("custom_pasted");
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#090A0C] border border-[#242834] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleRunAudit}
                disabled={isScanning || !selectedResumeId}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
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
                <div className="bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <ScoreGauge score={auditResult.overallScore || 0} size={110} />
                      <div className="space-y-2">
                        <TrafficLightStatus score={auditResult.overallScore || 0} size="sm" />
                        <h3 className="text-xl font-black text-white">
                          {auditResult.overallScore >= 75
                            ? "High Candidate Match 🎉"
                            : auditResult.overallScore >= 50
                            ? "Moderate Match ⚡"
                            : "Needs Optimization ⚠️"}
                        </h3>
                        {auditResult.summaryText && (
                          <p className="text-xs text-zinc-400 max-w-md">
                            {auditResult.summaryText}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
                      <button
                        onClick={() => setShowFixWizard(true)}
                        className="w-full sm:w-auto px-5 py-3 rounded-2xl font-black text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>⚡ Fix Everything (1-Click)</span>
                      </button>
                      <button
                        onClick={handleSaveToKanban}
                        disabled={isSavingApp}
                        className="w-full sm:w-auto px-4 py-3 rounded-2xl font-bold text-xs bg-[#090A0C] border border-[#242834] text-white hover:bg-[#1C1F2B] transition-all"
                      >
                        {isSavingApp ? "Saving..." : "📌 Save to Tracker"}
                      </button>
                    </div>
                  </div>

                  {/* Sub Score Pills */}
                  <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#242834] text-center">
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

                {/* 1-Click Fix Wizard Modal */}
                <FixMyResumeWizardModal
                  open={showFixWizard}
                  onClose={() => setShowFixWizard(false)}
                  overallScore={auditResult.overallScore || 70}
                  suggestions={auditResult.suggestions || []}
                  missingSkills={auditResult.skills.missing || []}
                />

                {/* Keyword Match Visualizer */}
                <KeywordDiffHighlighter
                  matched={auditResult.keywords.matched}
                  missing={auditResult.keywords.missing}
                  presentSkills={auditResult.skills.present}
                  missingSkills={auditResult.skills.missing}
                />

                {/* Inline AI STAR Bullet Rewriter */}
                <InlineAiFixer
                  suggestions={auditResult.suggestions}
                  missingSkills={auditResult.skills.missing}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
