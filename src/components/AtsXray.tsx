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
    <div className="bg-white rounded-3xl border border-zinc-200 p-6 mb-6 shadow-sm text-black">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-base sm:text-lg font-black text-black">
          <span aria-hidden="true">🔬</span> ATS Parser X-Ray
        </h2>
        {!result ? (
          <button
            onClick={runXray}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl disabled:opacity-50 transition-colors shadow-sm border border-black"
          >
            {loading ? "Scanning..." : `Scan ${resumeName}`}
          </button>
        ) : (
          <button
            onClick={() => { setResult(null); setShowRaw(false); }}
            className="text-xs text-zinc-500 hover:text-black font-semibold"
          >
            Reset Scan
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-xs mb-3 font-bold">{error}</p>}

      {result && (
        <div className="space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-50 rounded-xl text-center border border-zinc-200">
              <p className="text-xl sm:text-2xl font-black text-black">{result.wordCount}</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 font-bold">Words</p>
            </div>
            <div className={`p-3 rounded-xl text-center border ${result.hasEmail ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
              <p className={`text-lg font-black ${result.hasEmail ? "text-emerald-800" : "text-rose-800"}`}>
                {result.hasEmail ? "✓" : "✗"}
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-500 font-bold">Email</p>
            </div>
            <div className={`p-3 rounded-xl text-center border ${result.hasPhone ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}`}>
              <p className={`text-lg font-black ${result.hasPhone ? "text-emerald-800" : "text-rose-800"}`}>
                {result.hasPhone ? "✓" : "✗"}
              </p>
              <p className="text-[10px] sm:text-xs text-zinc-500 font-bold">Phone</p>
            </div>
            <div className="p-3 bg-zinc-50 rounded-xl text-center border border-zinc-200">
              <p className="text-lg sm:text-xl font-black text-black">{result.sectionsFound.length}/5</p>
              <p className="text-[10px] sm:text-xs text-zinc-500 font-bold">Sections</p>
            </div>
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-black mb-2">
                Issues Found ({result.issues.length})
              </h3>
              <div className="space-y-2">
                {result.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 p-3 rounded-xl text-xs ${
                      issue.severity === "high"
                        ? "bg-rose-50 border border-rose-200 text-rose-900"
                        : issue.severity === "medium"
                          ? "bg-amber-50 border border-amber-200 text-amber-900"
                          : "bg-zinc-100 border border-zinc-200 text-zinc-900"
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
              className="text-xs text-black hover:underline font-bold"
            >
              {showRaw ? "Hide" : "Show"} Raw Parsed Text (how ATS sees it)
            </button>
            {showRaw && (
              <pre className="mt-2 p-4 bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs rounded-xl overflow-auto max-h-64 whitespace-pre-wrap font-mono break-words shadow-sm">
                {result.rawText}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
