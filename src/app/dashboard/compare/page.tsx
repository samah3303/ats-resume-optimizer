"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import ScoreGauge from "@/components/ScoreGauge";

interface Resume {
  id: string;
  name: string;
  parsedText: string;
  createdAt: string;
}

interface ComparisonData {
  overallAssessment?: string;
  strengths?: string[];
  improvements?: string[];
  score?: number;
  keywordOverlap?: string[];
  formatQuality?: string;
}

interface ComparisonResult {
  resumeName: string;
  comparison: ComparisonData;
}

function ComparePageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [resume1Id, setResume1Id] = useState("");
  const [resume2Id, setResume2Id] = useState("");
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<{
    resume1: ComparisonResult;
    resume2: ComparisonResult;
  } | null>(null);
  const [error, setError] = useState("");

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
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
      fetchResumes();
    }
  }, [status, router, fetchResumes]);

  const handleCompare = async () => {
    if (!resume1Id || !resume2Id) {
      setError("Please select two resumes to compare.");
      return;
    }
    if (resume1Id === resume2Id) {
      setError("Please select two different resumes.");
      return;
    }

    setError("");
    setComparisonResult(null);
    setComparing(true);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeIds: [resume1Id, resume2Id] }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Comparison failed");
      }

      const data = await res.json();
      // The API returns { comparisons: [...] } from generateResumeComparisons
      if (data.comparisons && Array.isArray(data.comparisons) && data.comparisons.length >= 2) {
        setComparisonResult({
          resume1: data.comparisons[0],
          resume2: data.comparisons[1],
        });
      } else {
        setError("Unexpected response format from comparison API.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setComparing(false);
    }
  };

  if (status === "loading" || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const resume1Name = resumes.find((r) => r.id === resume1Id)?.name;
  const resume2Name = resumes.find((r) => r.id === resume2Id)?.name;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Compare Resumes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Side-by-side comparison of two resume versions
        </p>
      </div>

      {/* Selection */}
      <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 sm:p-6 shadow-sm mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume A
            </label>
            <select
              value={resume1Id}
              onChange={(e) => setResume1Id(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            >
              <option value="">Select first resume...</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume B
            </label>
            <select
              value={resume2Id}
              onChange={(e) => setResume2Id(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            >
              <option value="">Select second resume...</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 mt-4">
            {error}
          </div>
        )}

        <button
          onClick={handleCompare}
          disabled={comparing || !resume1Id || !resume2Id}
          className="mt-6 w-full py-3 min-h-[44px] bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {comparing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Comparing Resumes...
            </>
          ) : (
            "Compare"
          )}
        </button>
      </div>

      {/* Comparison Results */}
      {comparisonResult && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Resume 1 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-indigo-500 rounded-full" />
              {resume1Name || "Resume A"}
            </h2>

            {comparisonResult.resume1.comparison.score != null && (
              <div className="mb-4">
                <ScoreGauge
                  score={comparisonResult.resume1.comparison.score}
                  size={100}
                />
              </div>
            )}

            {comparisonResult.resume1.comparison.overallAssessment && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {comparisonResult.resume1.comparison.overallAssessment}
              </p>
            )}

            {comparisonResult.resume1.comparison.strengths &&
              comparisonResult.resume1.comparison.strengths.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-green-700 mb-2">
                    ✅ Strengths
                  </p>
                  <ul className="space-y-1">
                    {comparisonResult.resume1.comparison.strengths.map(
                      (s, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-green-500 mt-0.5">•</span>
                          {s}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {comparisonResult.resume1.comparison.improvements &&
              comparisonResult.resume1.comparison.improvements.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-amber-700 mb-2">
                    🔧 Improvements
                  </p>
                  <ul className="space-y-1">
                    {comparisonResult.resume1.comparison.improvements.map(
                      (imp, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-amber-500 mt-0.5">•</span>
                          {imp}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {comparisonResult.resume1.comparison.keywordOverlap &&
              comparisonResult.resume1.comparison.keywordOverlap.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    🔑 Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {comparisonResult.resume1.comparison.keywordOverlap.map(
                      (kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-md"
                        >
                          {kw}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Resume 2 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full" />
              {resume2Name || "Resume B"}
            </h2>

            {comparisonResult.resume2.comparison.score != null && (
              <div className="mb-4">
                <ScoreGauge
                  score={comparisonResult.resume2.comparison.score}
                  size={100}
                />
              </div>
            )}

            {comparisonResult.resume2.comparison.overallAssessment && (
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                {comparisonResult.resume2.comparison.overallAssessment}
              </p>
            )}

            {comparisonResult.resume2.comparison.strengths &&
              comparisonResult.resume2.comparison.strengths.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-green-700 mb-2">
                    ✅ Strengths
                  </p>
                  <ul className="space-y-1">
                    {comparisonResult.resume2.comparison.strengths.map(
                      (s, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-green-500 mt-0.5">•</span>
                          {s}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {comparisonResult.resume2.comparison.improvements &&
              comparisonResult.resume2.comparison.improvements.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-amber-700 mb-2">
                    🔧 Improvements
                  </p>
                  <ul className="space-y-1">
                    {comparisonResult.resume2.comparison.improvements.map(
                      (imp, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 flex items-start gap-2"
                        >
                          <span className="text-amber-500 mt-0.5">•</span>
                          {imp}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

            {comparisonResult.resume2.comparison.keywordOverlap &&
              comparisonResult.resume2.comparison.keywordOverlap.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    🔑 Keywords
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {comparisonResult.resume2.comparison.keywordOverlap.map(
                      (kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded-md"
                        >
                          {kw}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {resumes.length < 2 && !loadingData && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">
            You need at least 2 resumes to compare. Upload more resumes first.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ComparePageContent />
    </Suspense>
  );
}
