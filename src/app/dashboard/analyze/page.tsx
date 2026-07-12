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

const ATS_PLATFORMS = [
  "General ATS",
  "Workday",
  "Greenhouse",
  "Lever",
  "Taleo",
  "iCIMS",
  "SmartRecruiters",
] as const;

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
  const [atsPlatform, setAtsPlatform] = useState<string>("General ATS");

  // Result state
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchResult[] | null>(null);
  const [batchInProgress, setBatchInProgress] = useState(false);

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
              positionProfileId: positionProfileId || undefined,
              pasteJdTitle: usePastedJd ? pasteJdTitle : undefined,
              pasteJdText: usePastedJd ? pasteJdText : undefined,
              atsPlatform,
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
            positionProfileId: positionProfileId || undefined,
            pasteJdTitle: usePastedJd ? pasteJdTitle : undefined,
            pasteJdText: usePastedJd ? pasteJdText : undefined,
            atsPlatform,
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Run Analysis</h1>
        <p className="text-sm text-gray-500 mt-1">
          Compare your resume against a job description
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Select Resume */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1: Select Resume
            </label>
            {resumes.length === 0 ? (
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-500 mb-2">
                  No resumes uploaded yet.
                </p>
                <Link
                  href="/dashboard/resumes"
                  className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                >
                  Upload a resume first →
                </Link>
              </div>
            ) : (
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2: Select Job Description(s)
            </label>

            <div className="flex items-center gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!usePastedJd}
                  onChange={() => setUsePastedJd(false)}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm text-gray-700">Saved JD</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={usePastedJd}
                  onChange={() => setUsePastedJd(true)}
                  className="w-4 h-4 text-indigo-600"
                />
                <span className="text-sm text-gray-700">Paste New JD</span>
              </label>
            </div>

            {!usePastedJd ? (
              jds.length === 0 ? (
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    No JDs saved. Switch to &ldquo;Paste New JD&rdquo; or save
                    one first.
                  </p>
                  <Link
                    href="/dashboard/jds"
                    className="text-sm text-indigo-600 font-medium hover:text-indigo-700"
                  >
                    Save a JD →
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 px-2 pb-1">
                    {selectedJdIds.length} selected
                    {selectedJdIds.length > 1 && " (batch mode)"}
                  </p>
                  {jds.map((j) => (
                    <label
                      key={j.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                        selectedJdIds.includes(j.id)
                          ? "bg-indigo-50 border border-indigo-200"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedJdIds.includes(j.id)}
                        onChange={() => handleJdToggle(j.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {j.title}
                        </p>
                        {j.company && (
                          <p className="text-xs text-gray-500">{j.company}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={pasteJdTitle}
                  onChange={(e) => setPasteJdTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="Job title (e.g. Senior Frontend Developer)"
                />
                <textarea
                  value={pasteJdText}
                  onChange={(e) => setPasteJdText(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-y"
                  placeholder="Paste the full job description here..."
                />
              </div>
            )}
          </div>

          {/* Step 3: Position Profile (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 3: Position Profile (optional)
            </label>
            <select
              value={positionProfileId}
              onChange={(e) => setPositionProfileId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            >
              <option value="">None</option>
              {positions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {p.targetRole}
                </option>
              ))}
            </select>
          </div>

          {/* ATS Platform Tailoring */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 4: Target ATS Platform
            </label>
            <select
              value={atsPlatform}
              onChange={(e) => setAtsPlatform(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            >
              {ATS_PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Summary */}
          {selectedResume && (
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-sm text-indigo-800">
                Ready to analyze <strong>{selectedResume.name}</strong> against{" "}
                {usePastedJd ? (
                  <strong>{pasteJdTitle || "(new JD)"}</strong>
                ) : selectedJdIds.length > 1 ? (
                  <strong>{selectedJdIds.length} job descriptions</strong>
                ) : (
                  <strong>
                    {jds.find((j) => j.id === selectedJdIds[0])?.title ||
                      "(select a JD)"}
                  </strong>
                )}{" "}
                for <strong>{atsPlatform}</strong>
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || batchInProgress}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting || batchInProgress ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running AI Analysis...
              </>
            ) : selectedJdIds.length > 1 ? (
              `Analyze All ${selectedJdIds.length} Selected`
            ) : (
              "Run Analysis"
            )}
          </button>
        </form>

        {/* Batch Results */}
        {batchResults && batchResults.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Batch Analysis Results
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                      Job Description
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                      Overall Score
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                      Keyword Match
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                      Format
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                      Impact
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase px-4 py-2">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batchResults.map((br, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {br.jdTitle}
                      </td>
                      {br.analysis ? (
                        <>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                                br.analysis.overallScore >= 70
                                  ? "bg-green-100 text-green-800"
                                  : br.analysis.overallScore >= 50
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {br.analysis.overallScore}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            {Math.round(br.analysis.keywordsMatchPct)}%
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            {br.analysis.formatScore}/100
                          </td>
                          <td className="px-4 py-3 text-center text-sm">
                            {br.analysis.impactScore}/100
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/dashboard/analyze/${br.analysis.id}`}
                              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                            >
                              View →
                            </Link>
                          </td>
                        </>
                      ) : (
                        <td
                          colSpan={5}
                          className="px-4 py-3 text-sm text-red-600"
                        >
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
  );
}

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AnalyzePageContent />
    </Suspense>
  );
}
