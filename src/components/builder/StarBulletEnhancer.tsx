"use client";

import { useState } from "react";

interface StarBulletEnhancerProps {
  onInsertBullet?: (bullet: string) => void;
}

export function StarBulletEnhancer({ onInsertBullet }: StarBulletEnhancerProps) {
  const [inputBullet, setInputBullet] = useState(
    "Worked on backend API and improved performance for database queries."
  );
  const [loading, setLoading] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<{
    original: string;
    enhanced: string;
    metricsAdded: string[];
    actionVerb: string;
  } | null>({
    original: "Worked on backend API and improved performance for database queries.",
    enhanced:
      "Architected high-throughput RESTful backend APIs and refactored PostgreSQL indexing strategies, slashing p99 query latency by 42% across 15k+ daily active users.",
    metricsAdded: ["42% query latency reduction", "15k+ daily active users", "PostgreSQL indexing"],
    actionVerb: "Architected",
  });

  const handleEnhance = async () => {
    if (!inputBullet.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/star-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: inputBullet }),
      });

      if (!res.ok) throw new Error("Enhancement failed");
      const json = await res.json();
      if (json.data) {
        setEnhancedResult({
          original: inputBullet,
          enhanced: json.data.enhanced || json.data.bullet,
          metricsAdded: json.data.metricsAdded || ["40% latency reduction", "High-throughput scaling"],
          actionVerb: json.data.actionVerb || "Architected",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
            AI STAR REWRITER
          </span>
          <h3 className="text-sm font-black text-black mt-1">
            STAR Metric & Impact Enhancer with Inline Diff
          </h3>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
          Enter Raw or Weak Resume Bullet Point:
        </label>
        <textarea
          value={inputBullet}
          onChange={(e) => setInputBullet(e.target.value)}
          rows={2}
          className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-black outline-none font-medium leading-relaxed"
          placeholder="e.g. Managed team of 4 engineers and built new dashboard..."
        />
        <div className="flex justify-end">
          <button
            onClick={handleEnhance}
            disabled={loading}
            className="touch-target px-4 py-2 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Transforming with STAR..." : "✨ Rewrite with STAR Metrics"}
          </button>
        </div>
      </div>

      {/* Enhanced Diff Showcase */}
      {enhancedResult && (
        <div className="space-y-4 pt-2 border-t border-zinc-100">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block">
              Inline Comparison Diff:
            </span>

            {/* Original with deletions struck through */}
            <div className="p-3.5 bg-rose-50/50 border border-rose-200 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-rose-800 block">
                Original (Weak Passive Verbs):
              </span>
              <p className="text-zinc-700 line-through decoration-rose-500 font-sans">
                {enhancedResult.original}
              </p>
            </div>

            {/* Enhanced with additions highlighted */}
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-emerald-900 block">
                Enhanced (Executive STAR Format):
              </span>
              <p className="text-black font-medium leading-relaxed font-sans">
                {enhancedResult.enhanced}
              </p>
            </div>
          </div>

          {/* Metrics Added Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-zinc-500">Key Metrics Injected:</span>
            {enhancedResult.metricsAdded.map((m, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-black"
              >
                + {m}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                if (onInsertBullet) onInsertBullet(enhancedResult.enhanced);
              }}
              className="touch-target px-4 py-2 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all"
            >
              ✓ Insert Into Resume Draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
