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
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/tools"
                className="text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] hover:underline"
              >
                ← Back to All Tools
              </Link>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#FAFAFA] tracking-tight flex items-center gap-2 mt-1">
              <span>⚖️</span> Batch Resume Comparison Tool
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Compare multiple resume versions side-by-side to evaluate strengths, weak spots, and ATS readiness.
            </p>
          </div>
        </div>

        {/* Resume Selection Card */}
        <div className="bg-[#18181B] rounded-3xl border border-[#27272A] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#FAFAFA]">
              Select Resumes to Compare ({selectedIds.length} of 4 Selected)
            </h2>
            <span className="text-xs text-zinc-400 font-medium">Select 2 to 4 resumes</span>
          </div>

          {loadingResumes ? (
            <div className="py-8 text-center text-xs text-zinc-400">
              <div className="w-5 h-5 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Loading uploaded resumes...
            </div>
          ) : resumes.length === 0 ? (
            <div className="py-8 text-center px-4 bg-[#09090B] border border-[#27272A] rounded-2xl space-y-3 shadow-sm">
              <p className="text-xs text-zinc-400">
                No resumes uploaded yet. Upload at least 2 resumes to run batch comparison.
              </p>
              <Link
                href="/dashboard/resumes"
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl inline-block border border-black shadow-sm transition-all"
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
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 shadow-sm ${
                      selected
                        ? "bg-[#27272A] border-black text-[#FAFAFA] font-semibold"
                        : "bg-[#09090B] border-[#27272A] hover:border-zinc-400 text-[#FAFAFA]"
                    }`}
                  >
                    <div className="truncate">
                      <p className="text-xs font-bold text-[#FAFAFA] truncate">
                        📄 {r.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-1">
                        Uploaded {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {}}
                      className="h-4 w-4 text-black accent-[#FAFAFA] rounded cursor-pointer shrink-0 mt-0.5"
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
              className="px-6 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm border border-black disabled:opacity-50 flex items-center gap-2 transition-all"
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
            <h2 className="text-sm font-black uppercase tracking-wider text-[#FAFAFA]">
              📊 Comparison Breakdown
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-[#18181B] rounded-3xl border border-[#27272A] p-6 shadow-sm space-y-4 hover:border-zinc-400 transition-all"
                >
                  <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
                    <h3 className="text-sm font-bold text-[#FAFAFA] truncate">
                      📄 {item.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black border shadow-sm ${
                        item.overallScore >= 75
                          ? "bg-black text-white border-black"
                          : item.overallScore >= 60
                          ? "bg-[#27272A] text-[#FAFAFA] border-[#27272A]"
                          : "bg-[#09090B] text-zinc-400 border-[#27272A]"
                      }`}
                    >
                      {item.overallScore}/100 Rating
                    </span>
                  </div>

                  {/* Strengths */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#FAFAFA] mb-2">
                      ✅ Key Strengths
                    </p>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {item.strengths.map((str, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-1.5">
                          <span className="text-[#FAFAFA] font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-2">
                      ⚠️ Improvement Opportunities
                    </p>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {item.improvements.map((imp, iIdx) => (
                        <li key={iIdx} className="flex items-start gap-1.5">
                          <span className="text-zinc-400 font-bold">•</span>
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
