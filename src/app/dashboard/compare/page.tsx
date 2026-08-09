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
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#242834]">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/tools"
                className="text-xs font-bold text-amber-400 hover:underline"
              >
                ← Back to All Tools
              </Link>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2 mt-1">
              <span>⚖️</span> Batch Resume Comparison Tool
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Compare multiple resume versions side-by-side to evaluate strengths, weak spots, and ATS readiness.
            </p>
          </div>
        </div>

        {/* Resume Selection Card */}
        <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-amber-300">
              Select Resumes to Compare ({selectedIds.length} of 4 Selected)
            </h2>
            <span className="text-xs text-zinc-400">Select 2 to 4 resumes</span>
          </div>

          {loadingResumes ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading uploaded resumes...
            </div>
          ) : resumes.length === 0 ? (
            <div className="py-8 text-center px-4 bg-[#090A0C] border border-[#242834] rounded-2xl space-y-3">
              <p className="text-xs text-zinc-400">
                No resumes uploaded yet. Upload at least 2 resumes to run batch comparison.
              </p>
              <Link
                href="/dashboard/resumes"
                className="px-5 py-2.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl inline-block"
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
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                      selected
                        ? "bg-amber-500/10 border-amber-500/40 text-white shadow-md"
                        : "bg-[#090A0C] border-[#242834] hover:border-amber-500/30 text-zinc-300"
                    }`}
                  >
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">
                        📄 {r.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-1">
                        Uploaded {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {}}
                      className="h-4 w-4 text-amber-500 accent-amber-500 rounded cursor-pointer shrink-0 mt-0.5"
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
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {comparing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-400">
              📊 Comparison Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-[#242834] p-6 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-[#242834] pb-3">
                    <h3 className="text-sm font-bold text-white truncate">
                      📄 {item.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        item.overallScore >= 75
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : item.overallScore >= 60
                          ? "bg-amber-950 text-amber-300 border border-amber-800"
                          : "bg-rose-950 text-rose-300 border border-rose-800"
                      }`}
                    >
                      {item.overallScore}/100 Rating
                    </span>
                  </div>

                  {/* Strengths */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-2">
                      ✅ Key Strengths
                    </p>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {item.strengths.map((str, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-amber-400 mb-2">
                      ⚠️ Improvement Opportunities
                    </p>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {item.improvements.map((imp, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
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
    </div>
  );
}
