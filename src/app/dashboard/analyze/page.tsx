"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, type FormEvent, Suspense } from "react";
import Link from "next/link";

interface Resume {
  id: string;
  name: string;
}

interface JD {
  id: string;
  title: string;
  company: string | null;
}

interface Position {
  id: string;
  title: string;
  targetRole: string;
}

interface AnalysisResult {
  id: string;
  overallScore: number;
  keywordsMatchPct: number;
  skillsGapJson: string;
  formatScore: number;
  impactScore: number;
  summaryText: string;
  resume?: { id: string; name: string };
  jobDescription?: { id: string; title: string; company: string | null };
}

interface BatchResult {
  jdTitle: string;
  analysis: AnalysisResult | null;
  error?: string;
}

function AnalyzePageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedJdId = searchParams.get("jdId") || "";

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jds, setJds] = useState<JD[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [resumeId, setResumeId] = useState("");
  const [jdId, setJdId] = useState(preselectedJdId);
  const [selectedJdIds, setSelectedJdIds] = useState<string[]>(
    preselectedJdId ? [preselectedJdId] : []
  );
  const [positionProfileId, setPositionProfileId] = useState("");
  const [pasteJdTitle, setPasteJdTitle] = useState("");
  const [pasteJdText, setPasteJdText] = useState("");
  const [usePastedJd, setUsePastedJd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // URL Importer State
  const [fetchUrlInput, setFetchUrlInput] = useState("");
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlFetchError, setUrlFetchError] = useState("");

  const handleFetchUrlDetails = async () => {
    if (!fetchUrlInput.trim()) {
      setUrlFetchError("Please enter a valid job URL.");
      return;
    }
    setUrlFetching(true);
    setUrlFetchError("");
    try {
      const res = await fetch("/api/jds/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fetchUrlInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch job URL");
      }
      if (data.title) setPasteJdTitle(data.title);
      if (data.rawText) setPasteJdText(data.rawText);
      setFetchUrlInput("");
    } catch (err) {
      setUrlFetchError(err instanceof Error ? err.message : "Failed to fetch URL");
    } finally {
      setUrlFetching(false);
    }
  };

  // Result state
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[] | null>(null);
  const [batchInProgress, setBatchInProgress] = useState(false);

  // Onboarding profile
  const [onboardingProfile, setOnboardingProfile] = useState<{
    targetPositions: string[] | null;
    country: string | null;
    jobType: string | null;
    industry: string | null;
  } | null>(null);
  const [selectedTargetPositions, setSelectedTargetPositions] = useState<string[]>([]);
  const [selectedJobType, setSelectedJobType] = useState<string>("");

  const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Remote", "Hybrid"] as const;

  const fetchData = useCallback(async () => {
    try {
      const [rRes, jRes, pRes] = await Promise.all([
        fetch("/api/resumes"),
        fetch("/api/jds"),
        fetch("/api/positions"),
      ]);
      if (rRes.ok) setResumes((await rRes.json()).resumes || []);
      if (jRes.ok) setJds((await jRes.json()).jds || []);
      if (pRes.ok) setPositions((await pRes.json()).positions || []);

      try {
        const oRes = await fetch("/api/onboarding");
        if (oRes.ok) {
          const oData = await oRes.json();
          if (oData.completed) {
            setOnboardingProfile({
              targetPositions: typeof oData.targetPositions === "string"
                ? oData.targetPositions.split(",").map((s: string) => s.trim()).filter(Boolean)
                : (oData.targetPositions || []),
              country: oData.country,
              jobType: oData.jobType,
              industry: oData.industry,
            });
            if (oData.jobType) setSelectedJobType(oData.jobType);
          }
        }
      } catch {
        // silently fail
      }
    } catch {
      // silently fail
    } finally {
      setLoadingData(false);
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

  useEffect(() => {
    setJdId(preselectedJdId);
    if (preselectedJdId) {
      setSelectedJdIds([preselectedJdId]);
    }
  }, [preselectedJdId]);

  const handleJdToggle = (id: string) => {
    setSelectedJdIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);
    setBatchResults(null);

    if (!resumeId) {
      setError("Please select a resume.");
      return;
    }

    if (!usePastedJd && selectedJdIds.length === 0 && !jdId) {
      setError("Please select at least one job description or paste one.");
      return;
    }

    if (usePastedJd && (!pasteJdTitle || !pasteJdText)) {
      setError("Please provide a title and text for the pasted job description.");
      return;
    }

    const jdsToAnalyze = usePastedJd
      ? [{ id: undefined as string | undefined, title: pasteJdTitle }]
      : selectedJdIds.length > 0
        ? selectedJdIds.map((id) => ({ id, title: jds.find((j) => j.id === id)?.title || id }))
        : jdId
          ? [{ id: jdId, title: jds.find((j) => j.id === jdId)?.title || jdId }]
          : [];

    if (jdsToAnalyze.length === 0) {
      setError("Please select at least one job description.");
      return;
    }

    const isBatch = jdsToAnalyze.length > 1;

    if (isBatch) {
      setBatchInProgress(true);
      const results: BatchResult[] = [];

      for (const jd of jdsToAnalyze) {
        try {
          const res = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              resumeId,
              jdId: usePastedJd ? undefined : jd.id,
              pasteJdTitle: usePastedJd ? pasteJdTitle : undefined,
              pasteJdText: usePastedJd ? pasteJdText : undefined,
              targetPositions: selectedTargetPositions.length > 0 ? selectedTargetPositions : undefined,
              jobType: selectedJobType || undefined,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            results.push({ jdTitle: jd.title, analysis: data.analysis });
          } else {
            const data = await res.json();
            results.push({ jdTitle: jd.title, analysis: null, error: data.error || "Analysis failed" });
          }
        } catch {
          results.push({ jdTitle: jd.title, analysis: null, error: "Analysis failed" });
        }
      }

      setBatchResults(results);
      setBatchInProgress(false);
    } else {
      setSubmitting(true);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resumeId,
            jdId: usePastedJd ? undefined : jdsToAnalyze[0].id,
            pasteJdTitle: usePastedJd ? pasteJdTitle : undefined,
            pasteJdText: usePastedJd ? pasteJdText : undefined,
            targetPositions: selectedTargetPositions.length > 0 ? selectedTargetPositions : undefined,
            jobType: selectedJobType || undefined,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Analysis failed");
        }

        const data = await res.json();
        setResult(data.analysis);

        if (data.analysis?.id) {
          router.push(`/dashboard/analyze/${data.analysis.id}`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
        setSubmitting(false);
      }
    }
  };

  const selectedResume = resumes.find((r) => r.id === resumeId);

  if (status === "loading" || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090A0C]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Run ATS Analysis</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Compare your resume against a target job posting using Multi-Agent RAG evaluation.
          </p>
        </div>

        {/* Glassmorphic Form Container */}
        <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 sm:p-8 shadow-2xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 font-bold animate-fadeIn">
                ⚠️ {error}
              </div>
            )}

            {/* Profile & Target Info */}
            {onboardingProfile && (
              <div className="p-5 bg-[#090A0C] rounded-2xl border border-[#242834] space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">📋 Your Target Profile</h3>

                {/* Target Positions Checkboxes */}
                {onboardingProfile.targetPositions && onboardingProfile.targetPositions.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">
                      Target Roles:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {onboardingProfile.targetPositions.map((pos) => {
                        const isChecked = selectedTargetPositions.includes(pos);
                        return (
                          <label
                            key={pos}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all border ${
                              isChecked
                                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                                : "bg-[#14161D] text-zinc-300 border-[#242834] hover:border-amber-500/50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() =>
                                setSelectedTargetPositions((prev) =>
                                  prev.includes(pos)
                                    ? prev.filter((p) => p !== pos)
                                    : [...prev, pos]
                                )
                              }
                              className="sr-only"
                            />
                            {pos}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Country Badge */}
                {onboardingProfile.country && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-400">Target Country:</span>
                    <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 text-xs font-black rounded-full border border-emerald-800">
                      {onboardingProfile.country}
                    </span>
                  </div>
                )}

                {/* Job Type */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 mb-1.5 uppercase">
                    Job Type Preference:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map((jt) => (
                      <label
                        key={jt}
                        className={`px-3 py-1 rounded-xl text-xs font-extrabold cursor-pointer transition-all border ${
                          selectedJobType === jt
                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                            : "bg-[#14161D] text-zinc-300 border-[#242834] hover:border-amber-500/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="jobType"
                          value={jt}
                          checked={selectedJobType === jt}
                          onChange={() => setSelectedJobType(jt)}
                          className="sr-only"
                        />
                        {jt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Select Resume */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-amber-300">
                Step 1: Select Resume
              </label>
              {resumes.length === 0 ? (
                <div className="p-4 bg-[#090A0C] rounded-2xl border border-[#242834] text-center space-y-2">
                  <p className="text-xs text-zinc-400">No resumes uploaded yet.</p>
                  <Link
                    href="/dashboard/resumes"
                    className="text-xs text-amber-400 font-bold hover:underline inline-block"
                  >
                    Upload a resume first →
                  </Link>
                </div>
              ) : (
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-xs bg-[#090A0C] border border-[#242834] text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select a resume...</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Step 2: Select or Paste JD */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-amber-300">
                Step 2: Select Job Description(s)
              </label>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-200">
                  <input
                    type="radio"
                    checked={!usePastedJd}
                    onChange={() => setUsePastedJd(false)}
                    className="w-4 h-4 text-amber-500 accent-amber-500"
                  />
                  <span>Saved JD</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-200">
                  <input
                    type="radio"
                    checked={usePastedJd}
                    onChange={() => setUsePastedJd(true)}
                    className="w-4 h-4 text-amber-500 accent-amber-500"
                  />
                  <span>Paste New JD</span>
                </label>
              </div>

              {!usePastedJd ? (
                jds.length === 0 ? (
                  <div className="p-4 bg-[#090A0C] rounded-2xl border border-[#242834] text-center space-y-2">
                    <p className="text-xs text-zinc-400">
                      No saved JDs found. Switch to &ldquo;Paste New JD&rdquo; or add one first.
                    </p>
                    <Link
                      href="/dashboard/jds"
                      className="text-xs text-amber-400 font-bold hover:underline inline-block"
                    >
                      Save a JD →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-[#090A0C] border border-[#242834] rounded-2xl">
                    <p className="text-[10px] text-zinc-500 px-2 pb-1 font-mono uppercase">
                      {selectedJdIds.length} selected
                      {selectedJdIds.length > 1 && " (batch scan)"}
                    </p>
                    {jds.map((j) => (
                      <label
                        key={j.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedJdIds.includes(j.id)
                            ? "bg-amber-500/10 border-amber-500/40 text-white"
                            : "hover:bg-[#14161D] border-transparent text-zinc-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedJdIds.includes(j.id)}
                          onChange={() => handleJdToggle(j.id)}
                          className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{j.title}</p>
                          {j.company && (
                            <p className="text-[11px] text-zinc-400 truncate">{j.company}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  {/* URL Importer Bar */}
                  <div className="p-4 bg-[#090A0C] border border-amber-500/30 rounded-2xl space-y-2">
                    <label className="block text-xs font-black uppercase text-amber-300 tracking-wider">
                      ⚡ Auto-Fetch Job Details From Web URL
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="url"
                        value={fetchUrlInput}
                        onChange={(e) => {
                          setFetchUrlInput(e.target.value);
                          setUrlFetchError("");
                        }}
                        placeholder="Paste job URL (LinkedIn, Indeed, Company careers)..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl text-xs bg-[#14161D] border border-[#242834] text-white focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={handleFetchUrlDetails}
                        disabled={urlFetching || !fetchUrlInput.trim()}
                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shrink-0"
                      >
                        {urlFetching ? "Fetching..." : "📥 Fetch Details"}
                      </button>
                    </div>
                    {urlFetchError && (
                      <p className="text-[11px] text-rose-400 font-medium">{urlFetchError}</p>
                    )}
                  </div>

                  <input
                    type="text"
                    value={pasteJdTitle}
                    onChange={(e) => setPasteJdTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 text-xs font-semibold"
                    placeholder="Job title (e.g. Senior Frontend Developer)"
                  />
                  <textarea
                    value={pasteJdText}
                    onChange={(e) => setPasteJdText(e.target.value)}
                    rows={8}
                    className="w-full p-4 rounded-xl bg-[#090A0C] border border-[#242834] text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-y text-xs"
                    placeholder="Paste the full job description here..."
                  />
                </div>
              )}
            </div>

            {/* Summary */}
            {selectedResume && (
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 text-xs text-amber-200">
                Ready to analyze <strong className="text-white">{selectedResume.name}</strong> against{" "}
                {usePastedJd ? (
                  <strong className="text-white">{pasteJdTitle || "(new JD)"}</strong>
                ) : selectedJdIds.length > 1 ? (
                  <strong className="text-white">{selectedJdIds.length} job descriptions</strong>
                ) : (
                  <strong className="text-white">
                    {jds.find((j) => j.id === selectedJdIds[0])?.title || "(select a JD)"}
                  </strong>
                )}
              </div>
            )}

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting || batchInProgress}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting || batchInProgress ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Running AI Analysis...
                </>
              ) : selectedJdIds.length > 1 ? (
                `Analyze All ${selectedJdIds.length} Selected`
              ) : (
                "Run Analysis →"
              )}
            </button>
          </form>

          {/* Batch Results */}
          {batchResults && batchResults.length > 0 && (
            <div className="mt-8 pt-6 border-t border-[#242834] space-y-4">
              <h2 className="text-sm font-black text-white uppercase tracking-wider">
                Batch Analysis Results
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#242834] text-[11px] font-bold text-zinc-400 uppercase">
                      <th className="text-left px-4 py-2">Job Description</th>
                      <th className="text-center px-4 py-2">Overall Score</th>
                      <th className="text-center px-4 py-2">Keyword Match</th>
                      <th className="text-center px-4 py-2">Format</th>
                      <th className="text-center px-4 py-2">Impact</th>
                      <th className="text-right px-4 py-2">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242834] text-xs">
                    {batchResults.map((br, idx) => (
                      <tr key={idx} className="hover:bg-[#1C1F2B] transition-colors">
                        <td className="px-4 py-3 font-bold text-white">{br.jdTitle}</td>
                        {br.analysis ? (
                          <>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-black ${
                                  br.analysis.overallScore >= 75
                                    ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                    : br.analysis.overallScore >= 60
                                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                                      : "bg-rose-950 text-rose-300 border border-rose-800"
                                }`}
                              >
                                {br.analysis.overallScore}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-zinc-300">
                              {Math.round(br.analysis.keywordsMatchPct)}%
                            </td>
                            <td className="px-4 py-3 text-center text-zinc-400">
                              {br.analysis.formatScore}/100
                            </td>
                            <td className="px-4 py-3 text-center text-zinc-400">
                              {br.analysis.impactScore}/100
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/dashboard/analyze/${br.analysis.id}`}
                                className="text-xs text-amber-400 hover:underline font-bold"
                              >
                                View →
                              </Link>
                            </td>
                          </>
                        ) : (
                          <td colSpan={5} className="px-4 py-3 text-rose-400 text-xs font-bold">
                            {br.error || "Analysis failed"}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#090A0C]">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
