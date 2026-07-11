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
  const [positionProfileId, setPositionProfileId] = useState("");
  const [pasteJdTitle, setPasteJdTitle] = useState("");
  const [pasteJdText, setPasteJdText] = useState("");
  const [usePastedJd, setUsePastedJd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Result state
  const [result, setResult] = useState<AnalysisResult | null>(null);

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
  }, [preselectedJdId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!resumeId) {
      setError("Please select a resume.");
      return;
    }

    if (!usePastedJd && !jdId) {
      setError("Please select a job description or paste one.");
      return;
    }

    if (usePastedJd && (!pasteJdTitle || !pasteJdText)) {
      setError("Please provide a title and text for the pasted job description.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          jdId: usePastedJd ? undefined : jdId,
          positionProfileId: positionProfileId || undefined,
          pasteJdTitle: usePastedJd ? pasteJdTitle : undefined,
          pasteJdText: usePastedJd ? pasteJdText : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data.analysis);

      // Navigate to the analysis detail page
      if (data.analysis?.id) {
        router.push(`/dashboard/analyze/${data.analysis.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setSubmitting(false);
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
              Step 2: Select Job Description
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
                <select
                  value={jdId}
                  onChange={(e) => setJdId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  <option value="">Select a JD...</option>
                  {jds.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                      {j.company ? ` — ${j.company}` : ""}
                    </option>
                  ))}
                </select>
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

          {/* Summary */}
          {selectedResume && (
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-sm text-indigo-800">
                Ready to analyze <strong>{selectedResume.name}</strong> against{" "}
                {usePastedJd ? (
                  <strong>{pasteJdTitle || "(new JD)"}</strong>
                ) : (
                  <strong>
                    {jds.find((j) => j.id === jdId)?.title || "(select a JD)"}
                  </strong>
                )}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running AI Analysis...
              </>
            ) : (
              "Run Analysis"
            )}
          </button>
        </form>
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
