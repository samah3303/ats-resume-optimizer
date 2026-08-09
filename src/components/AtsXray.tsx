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
    <div className="bg-white dark:bg-[#14161D] rounded-2xl border border-slate-200 dark:border-[#242834] p-4 sm:p-6 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          <span aria-hidden="true">🔬</span> ATS Parser X-Ray
        </h2>
        {!result ? (
          <button
            onClick={runXray}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl disabled:opacity-50 transition-colors shadow-sm"
          >
            {loading ? "Scanning..." : `Scan ${resumeName}`}
          </button>
        ) : (
          <button
            onClick={() => { setResult(null); setShowRaw(false); }}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
          >
            Reset Scan
          </button>
        )}
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-xs mb-3 font-semibold">{error}</p>}

      {result && (
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-[#1C1F2B] rounded-xl text-center border border-slate-100 dark:border-[#2E3345]">
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{result.wordCount}</p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Words</p>
            </div>
            <div className={`p-3 rounded-xl text-center border ${result.hasEmail ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/40" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40"}`}>
              <p className={`text-lg font-black ${result.hasEmail ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {result.hasEmail ? "✓" : "✗"}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Email</p>
            </div>
            <div className={`p-3 rounded-xl text-center border ${result.hasPhone ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800/40" : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/40"}`}>
              <p className={`text-lg font-black ${result.hasPhone ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
                {result.hasPhone ? "✓" : "✗"}
              </p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Phone</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-[#1C1F2B] rounded-xl text-center border border-slate-100 dark:border-[#2E3345]">
              <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{result.sectionsFound.length}/5</p>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">Sections</p>
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Issues Found ({result.issues.length})
              </h3>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${
                      issue.severity === "high"
                        ? "bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300"
                        : issue.severity === "medium"
                          ? "bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/40 dark:text-amber-300"
                          : "bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-900/40 dark:text-blue-300"
                    }`}
                  >
                    <span className="font-bold shrink-0 mt-0.5">
                      {issue.severity === "high" ? "🔴" : issue.severity === "medium" ? "🟡" : "🔵"}
                    </span>
                    <div>
                      <p className="font-bold">{issue.type}</p>
                      <p className="text-xs opacity-90 leading-snug">{issue.detail}</p>
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
              className="text-xs text-amber-600 dark:text-amber-400 hover:underline font-bold"
            >
              {showRaw ? "Hide" : "Show"} Raw Parsed Text (how ATS sees it)
            </button>
            {showRaw && (
              <pre className="mt-2 p-4 bg-[#090A0C] border border-[#242834] text-emerald-400 text-xs rounded-xl overflow-auto max-h-64 whitespace-pre-wrap font-mono break-words">
                {result.rawText}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
