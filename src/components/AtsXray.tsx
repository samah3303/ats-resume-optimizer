"use client";

import { useState } from "react";

interface XRayResult {
  rawText: string;
  wordCount: number;
  issues: Array<{ type: string; severity: "high" | "medium" | "low"; detail: string }>;
  hasEmail: boolean;
  hasPhone: boolean;
  sectionsFound: string[];
}

export default function AtsXray({ resumeId, resumeName }: { resumeId: string; resumeName: string }) {
  const [result, setResult] = useState<XRayResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  const runXray = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/xray", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      if (!res.ok) throw new Error("Failed");
      setResult(await res.json());
    } catch {
      setError("Failed to run ATS X-Ray");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
          <span aria-hidden="true">🔬</span> ATS Parser X-Ray
        </h2>
        {!result ? (
          <button
            onClick={runXray}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Scanning..." : `Scan ${resumeName}`}
          </button>
        ) : (
          <button
            onClick={() => { setResult(null); setShowRaw(false); }}
            className="text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
          >
            Reset
          </button>
        )}
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm mb-3">{error}</p>}

      {result && (
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{result.wordCount}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Words</p>
            </div>
            <div className={`p-3 rounded-lg text-center ${result.hasEmail ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
              <p className={`text-lg font-bold ${result.hasEmail ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {result.hasEmail ? "✓" : "✗"}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Email</p>
            </div>
            <div className={`p-3 rounded-lg text-center ${result.hasPhone ? "bg-green-50 dark:bg-green-900/30" : "bg-red-50 dark:bg-red-900/30"}`}>
              <p className={`text-lg font-bold ${result.hasPhone ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {result.hasPhone ? "✓" : "✗"}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Phone</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-slate-100">{result.sectionsFound.length}/5</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Sections</p>
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                Issues Found ({result.issues.length})
              </h3>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                      issue.severity === "high"
                        ? "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                        : issue.severity === "medium"
                          ? "bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300"
                          : "bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
                    }`}
                  >
                    <span className="font-bold shrink-0 mt-0.5">
                      {issue.severity === "high" ? "🔴" : issue.severity === "medium" ? "🟡" : "🔵"}
                    </span>
                    <div>
                      <p className="font-medium">{issue.type}</p>
                      <p className="text-xs opacity-80">{issue.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw text toggle */}
          <div>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
            >
              {showRaw ? "Hide" : "Show"} Raw Parsed Text (how ATS sees it)
            </button>
            {showRaw && (
              <pre className="mt-2 p-4 bg-gray-900 dark:bg-slate-950 text-green-400 text-xs rounded-lg overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                {result.rawText}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
