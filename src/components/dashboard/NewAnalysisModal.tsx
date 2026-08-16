"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Resume } from "@/types/dashboard";

interface JdOption {
  id: string;
  title: string;
  company?: string | null;
  rawText: string;
}

interface NewAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  resumes: Resume[];
}

export default function NewAnalysisModal({
  open,
  onClose,
  resumes: initialResumes,
}: NewAnalysisModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localResumes, setLocalResumes] = useState<Resume[]>(initialResumes);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  const [savedJds, setSavedJds] = useState<JdOption[]>([]);
  const [selectedJdId, setSelectedJdId] = useState<string>("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdTitle, setJdTitle] = useState("");
  const [jdText, setJdText] = useState("");
  const [inputMode, setInputMode] = useState<"select" | "text" | "url">("select");

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Sync initial resumes
  useEffect(() => {
    setLocalResumes(initialResumes);
  }, [initialResumes]);

  // Set default resume
  useEffect(() => {
    if (localResumes.length > 0 && !selectedResumeId) {
      const primary = localResumes.find((r) => r.isPrimary) || localResumes[0];
      setSelectedResumeId(primary.id);
    }
  }, [localResumes, selectedResumeId]);

  // Fetch saved job descriptions
  useEffect(() => {
    if (open) {
      async function fetchJds() {
        try {
          const res = await fetch("/api/jds");
          if (res.ok) {
            const data = await res.json();
            const list: JdOption[] = data.jds || [];
            setSavedJds(list);
            if (list.length > 0) {
              setSelectedJdId(list[0].id);
              setInputMode("select");
            } else {
              setInputMode("text");
            }
          }
        } catch {
          setInputMode("text");
        }
      }
      fetchJds();
    }
  }, [open]);

  if (!open) return null;

  // Handle inline PDF upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    setStatusMessage("Parsing & uploading PDF resume...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const newResume: Resume = data.resume;
        setLocalResumes((prev) => [newResume, ...prev]);
        setSelectedResumeId(newResume.id);
        setStatusMessage(`✅ Uploaded "${newResume.name}" PDF successfully!`);
      } else {
        const errData = await res.json();
        setStatusMessage(`⚠️ ${errData.error || "Failed to upload PDF."}`);
      }
    } catch {
      setStatusMessage("⚠️ Failed to parse PDF resume.");
    } finally {
      setIsUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedResumeId) {
      setStatusMessage("⚠️ Please select or upload a resume.");
      return;
    }

    setLoading(true);
    setStatusMessage("Preparing job description...");

    try {
      let activeJdId: string | null = null;

      // Mode 1: Select already saved job
      if (inputMode === "select") {
        if (!selectedJdId) {
          setStatusMessage("⚠️ Please select a saved job description.");
          setLoading(false);
          return;
        }
        activeJdId = selectedJdId;
      }
      // Mode 2: Import Job Link
      else if (inputMode === "url") {
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
          const fetchedText = urlData.job?.rawText || "";
          const fetchedTitle = urlData.job?.title || "Extracted Job Posting";

          if (!fetchedText) {
            setStatusMessage("⚠️ Could not extract job text from link. Switch to Paste Text tab.");
            setLoading(false);
            return;
          }

          setStatusMessage("Saving job description...");
          const createJdRes = await fetch("/api/jds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: fetchedTitle,
              rawText: fetchedText,
              sourceUrl: jdUrl.trim(),
            }),
          });

          if (createJdRes.ok) {
            const createData = await createJdRes.json();
            activeJdId = createData.jobDescription?.id || null;
          }
        } else {
          const errData = await urlRes.json();
          setStatusMessage(`⚠️ ${errData.error || "Failed to parse URL. Switch to Paste Text tab."}`);
          setLoading(false);
          return;
        }
      }
      // Mode 3: Paste Text
      else {
        const finalJdText = jdText.trim();
        const finalJdTitle = jdTitle.trim() || "Target Job Posting";

        if (!finalJdText) {
          setStatusMessage("⚠️ Please paste the job description text.");
          setLoading(false);
          return;
        }

        setStatusMessage("Saving job description...");
        const createJdRes = await fetch("/api/jds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: finalJdTitle,
            rawText: finalJdText,
          }),
        });

        if (createJdRes.ok) {
          const createData = await createJdRes.json();
          activeJdId = createData.jobDescription?.id || null;
        }
      }

      if (!activeJdId) {
        setStatusMessage("⚠️ Failed to process job description. Please try again.");
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
          jdId: activeJdId,
        }),
      });

      if (analyzeRes.ok) {
        const analyzeData = await analyzeRes.json();
        const analysisId = analyzeData.analysis?.id;
        setStatusMessage("✅ Analysis complete! Opening details report...");
        
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn text-zinc-900"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-analysis-title"
    >
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 text-zinc-900 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div>
            <span className="text-[10px] font-black text-black uppercase tracking-wider">
              ⚡ Targeted Job Scan
            </span>
            <h2 id="new-analysis-title" className="text-xl font-black text-black mt-1">
              Run New Job Analysis
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-black flex items-center justify-center text-sm font-bold transition-colors"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleRunAnalysis} className="space-y-5">
          {/* Step 1: Select or Upload Resume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                1. Select or Upload Resume (PDF / DOCX):
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingResume || loading}
                className="px-3 py-1 bg-black hover:bg-zinc-800 text-white border border-black text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                {isUploadingResume ? (
                  <>
                    <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>📁 + Upload New PDF</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handlePdfUpload}
                className="hidden"
              />
            </div>

            {localResumes.length === 0 ? (
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-700 font-bold flex items-center justify-between">
                <span>⚠️ No resumes uploaded yet. Click "+ Upload New PDF" above to start.</span>
              </div>
            ) : (
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                disabled={loading || isUploadingResume}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold text-black focus:border-black focus:bg-white focus:outline-none transition-colors"
              >
                {localResumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    📄 {r.name} {r.isPrimary ? "(Primary Baseline)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 2: Target Job Selection Mode */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold text-zinc-900 uppercase tracking-wider block">
                2. Target Job Description:
              </label>
              <div className="flex items-center gap-1 p-1 bg-zinc-100 border border-zinc-200 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setInputMode("select")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inputMode === "select"
                      ? "bg-black text-white font-bold shadow-sm"
                      : "text-zinc-600 hover:text-black"
                  }`}
                >
                  Saved Jobs ({savedJds.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inputMode === "text"
                      ? "bg-black text-white font-bold shadow-sm"
                      : "text-zinc-600 hover:text-black"
                  }`}
                >
                  Paste Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("url")}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    inputMode === "url"
                      ? "bg-black text-white font-bold shadow-sm"
                      : "text-zinc-600 hover:text-black"
                  }`}
                >
                  Import Link
                </button>
              </div>
            </div>

            {/* Mode 1: Select Saved Job */}
            {inputMode === "select" && (
              <div className="space-y-2">
                {savedJds.length === 0 ? (
                  <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-500 text-center space-y-2">
                    <p>No saved job descriptions found in your library yet.</p>
                    <button
                      type="button"
                      onClick={() => setInputMode("text")}
                      className="text-black font-bold hover:underline"
                    >
                      + Paste job description text instead
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedJdId}
                    onChange={(e) => setSelectedJdId(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold text-black focus:border-black focus:bg-white focus:outline-none transition-colors"
                  >
                    {savedJds.map((j) => (
                      <option key={j.id} value={j.id}>
                        💼 {j.title} {j.company ? `(${j.company})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Mode 2: Paste Text */}
            {inputMode === "text" && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Job Title (e.g. Associate Staff Engineer)"
                  value={jdTitle}
                  onChange={(e) => setJdTitle(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-medium text-black placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
                />
                <textarea
                  rows={5}
                  placeholder="Paste job posting description requirements & qualifications text here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  disabled={loading}
                  className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-medium text-black placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none resize-none transition-colors"
                />
              </div>
            )}

            {/* Mode 3: Import Link */}
            {inputMode === "url" && (
              <div className="space-y-2">
                <input
                  type="url"
                  placeholder="https://linkedin.com/jobs/view/... or job posting link"
                  value={jdUrl}
                  onChange={(e) => setJdUrl(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-medium text-black placeholder-zinc-400 focus:border-black focus:bg-white focus:outline-none transition-colors"
                />
                <p className="text-[11px] text-zinc-500">
                  KYRO will extract job responsibilities and required skills directly from the URL.
                </p>
              </div>
            )}
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 flex items-center gap-2">
              {loading && (
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || isUploadingResume}
              className="px-5 py-3 text-xs font-bold text-zinc-600 hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isUploadingResume || localResumes.length === 0}
              className="px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
