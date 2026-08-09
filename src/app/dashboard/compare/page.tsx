"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Resume } from "@/types/dashboard";
import { ResumeComparison } from "@/types/ai";
import { useToast } from "@/components/Toast";

export default function BatchComparePage() {
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [results, setResults] = useState<ResumeComparison[] | null>(null);

  useEffect(() => {
    async function fetchResumes() {
      try {
        const res = await fetch("/api/resumes");
        if (res.ok) {
          const data = await res.json();
          setResumes(data.resumes || []);
        }
      } catch {
        toast("Failed to load resumes", "error");
      } finally {
        setLoadingResumes(false);
      }
    }
    fetchResumes();
  }, [toast]);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        toast("You can compare up to 4 resumes at a time.", "info");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleRunComparison = async () => {
    if (selectedIds.length < 2) {
      toast("Please select at least 2 resumes to run comparison.", "error");
      return;
    }

    setComparing(true);
    setResults(null);

    try {
      const selectedResumes = resumes.filter((r) => selectedIds.includes(r.id));
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumes: selectedResumes.map((r) => ({
            name: r.name,
            parsedText: r.parsedText,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.comparisons);
        toast("Batch comparison complete!", "success");
      } else {
        const errData = await res.json();
        toast(errData.error || "Failed to compare resumes", "error");
      }
    } catch {
      toast("Failed to run comparison", "error");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/tools"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              ← Back to All Tools
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
            <span>⚖️</span> Batch Resume Comparison Tool
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare multiple resume versions side-by-side to evaluate strengths, weak spots, and ATS readiness.
          </p>
        </div>
      </div>

      {/* Resume Selection Card */}
      <div className="card-premium p-6 dark:bg-slate-800 dark:border-slate-700 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Select Resumes to Compare ({selectedIds.length} of 4 Selected)
          </h2>
          <span className="text-xs text-slate-400">Select 2 to 4 resumes</span>
        </div>

        {loadingResumes ? (
          <div className="py-8 text-center text-sm text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading uploaded resumes...
          </div>
        ) : resumes.length === 0 ? (
          <div className="py-8 text-center px-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              No resumes uploaded yet. Upload at least 2 resumes to run batch comparison.
            </p>
            <Link
              href="/dashboard/resumes"
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg"
            >
              Upload Resumes →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {resumes.map((r) => {
              const selected = selectedIds.includes(r.id);
              return (
                <div
                  key={r.id}
                  onClick={() => toggleSelect(r.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selected
                      ? "bg-indigo-50/80 dark:bg-indigo-900/30 border-indigo-500 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-700/40 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      📄 {r.name}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Uploaded {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => {}}
                    className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer shrink-0 mt-0.5"
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunComparison}
            disabled={comparing || selectedIds.length < 2}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {comparing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Comparing Resumes...
              </>
            ) : (
              `Run Side-by-Side Comparison (${selectedIds.length})`
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {results && results.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            📊 Comparison Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    📄 {item.name}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                      item.overallScore >= 75
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                        : item.overallScore >= 60
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                    }`}
                  >
                    {item.overallScore}/100 Rating
                  </span>
                </div>

                {/* Strengths */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                    ✅ Key Strengths
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {item.strengths.map((str, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
                    ⚠️ Improvement Opportunities
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {item.improvements.map((imp, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
