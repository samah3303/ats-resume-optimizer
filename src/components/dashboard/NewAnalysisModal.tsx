"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Resume } from "@/types/dashboard";

interface NewAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  resumes: Resume[];
}

export default function NewAnalysisModal({
  open,
  onClose,
  resumes,
}: NewAnalysisModalProps) {
  const router = useRouter();
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdTitle, setJdTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [inputMode, setInputMode] = useState<"text" | "url">("text");

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      const primary = resumes.find((r) => r.isPrimary) || resumes[0];
      setSelectedResumeId(primary.id);
    }
  }, [resumes, selectedResumeId]);

  if (!open) return null;

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResumeId) {
      setStatusMessage("⚠️ Please select a resume.");
      return;
    }

    let finalJdText = jdText.trim();
    let finalJdTitle = jdTitle.trim() || "Target Job Posting";

    setLoading(true);
    setStatusMessage("Preparing job description...");

    try {
      // If URL mode, fetch text first
      if (inputMode === "url") {
        if (!jdUrl.trim()) {
          setStatusMessage("⚠️ Please enter a valid job URL.");
          setLoading(false);
          return;
        }

        setStatusMessage("Fetching job description from URL...");
        const urlRes = await fetch("/api/jds/parse-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: jdUrl.trim() }),
        });

        if (urlRes.ok) {
          const urlData = await urlRes.json();
          finalJdText = urlData.job?.rawText || "";
          finalJdTitle = urlData.job?.title || "Extracted Job Posting";
        } else {
          const errData = await urlRes.json();
          setStatusMessage(`⚠️ ${errData.error || "Failed to parse URL. Switch to text tab."}`);
          setLoading(false);
          return;
        }
      }

      if (!finalJdText) {
        setStatusMessage("⚠️ Please provide job description text.");
        setLoading(false);
        return;
      }

      // Step 1: Create JD record
      setStatusMessage("Saving job description...");
      const createJdRes = await fetch("/api/jds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: finalJdTitle,
          rawText: finalJdText,
          sourceUrl: inputMode === "url" ? jdUrl.trim() : undefined,
        }),
      });

      if (!createJdRes.ok) {
        setStatusMessage("⚠️ Failed to save job description.");
        setLoading(false);
        return;
      }

      const jdData = await createJdRes.json();
      const jdId = jdData.jobDescription?.id;

      if (!jdId) {
        setStatusMessage("⚠️ Unexpected error saving job description.");
        setLoading(false);
        return;
      }

      // Step 2: Run ATS scan
      setStatusMessage("Analyzing resume against job requirements with AI...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          jdId: jdId,
        }),
      });

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        const analysisId = analyzeData.analysis?.id;
        setStatusMessage("✅ Analysis complete! Opening details report...");
        
        // Reset form & close modal
        onClose();
        
        if (analysisId) {
          router.push(`/dashboard/analyze/${analysisId}`);
        } else {
          router.push("/dashboard");
        }
      } else {
        const errData = await analyzeRes.json();
        setStatusMessage(`⚠️ Scan failed: ${errData.error || "Please try again."}`);
      }
    } catch {
      setStatusMessage("⚠️ An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-analysis-title"
    >
      <div className="bg-[#14161D] border border-amber-500/30 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#242834] pb-4">
          <div>
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
              ⚡ Targeted Job Scan
            </span>
            <h2 id="new-analysis-title" className="text-xl font-black text-white mt-1">
              Run New Job Analysis
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-[#090A0C] border border-[#242834] text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleRunAnalysis} className="space-y-5">
          {/* Step 1: Select Resume */}
          <div className="space-y-2">
            <label className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              1. Select Resume:
            </label>
            {resumes.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 font-bold">
                ⚠️ No resumes uploaded yet. Please upload a resume first.
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-[#090A0C] border border-[#242834] rounded-2xl text-xs font-bold text-white focus:border-amber-500 focus:outline-none transition-colors"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.isPrimary ? "(Primary Baseline)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Job Details Mode Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                2. Target Job Description:
              </label>
              <div className="flex items-center gap-1 p-1 bg-[#090A0C] border border-[#242834] rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inputMode === "text"
                      ? "bg-amber-500 text-slate-950 font-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Paste Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("url")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inputMode === "url"
                      ? "bg-amber-500 text-slate-950 font-black"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Import Job Link
                </button>
              </div>
            </div>

            {inputMode === "text" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Job Title (e.g. Senior Software Engineer)"
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-[#090A0C] border border-[#242834] rounded-2xl text-xs font-medium text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
                <textarea
                  rows={6}
                  placeholder="Paste job posting description requirements & qualifications text here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  disabled={loading}
                  className="w-full p-4 bg-[#090A0C] border border-[#242834] rounded-2xl text-xs font-medium text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none resize-none"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/... or job posting link"
                  value={jdUrl}
                  onChange={(e) => setJdUrl(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#090A0C] border border-[#242834] rounded-2xl text-xs font-medium text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none"
                />
                <p className="text-[11px] text-zinc-400">
                  ResuMatch will extract job responsibilities and required skills directly from the URL.
                </p>
              </div>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-[#090A0C] border border-[#242834] rounded-xl text-xs font-bold text-amber-300 flex items-center gap-2">
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242834]">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-3 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || resumes.length === 0}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <span>⚡ Analyze Resume & Job</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
