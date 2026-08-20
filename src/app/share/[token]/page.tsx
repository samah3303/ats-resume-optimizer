"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";
import Logo from "@/components/Logo";

interface SharedAnalysis {
  id: string;
  jobDescriptionTitle: string;
  resumeName: string;
  overallScore: number;
  keywordsMatchPct: number;
  summaryText: string;
  suggestions: SharedSuggestion[];
}

interface SharedSuggestion {
  id: string;
  section: string;
  originalText: string;
  suggestedText: string;
  rationale: string;
}

export default function SharedAnalysisPage() {
  const params = useParams();
  const token = params.token as string;

  const [analysis, setAnalysis] = useState<SharedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchShared = useCallback(async () => {
    try {
      const res = await fetch(`/api/share/${token}`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data.analysis);
      } else if (res.status === 404) {
        setNotFound(true);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchShared();
  }, [fetchShared]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-white">
        <div className="w-16 h-16 bg-zinc-100 border border-zinc-200 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🔗</span>
        </div>
        <h1 className="text-xl font-bold text-black mb-2">
          Link Not Found
        </h1>
        <p className="text-sm text-zinc-500 text-center max-w-md">
          This shared analysis link may have expired or been removed. Ask the
          owner to share a new link.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA]">
      {/* Header */}
      <header className="bg-[#09090B] border-b border-[#27272A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Logo size="md" />
          <span className="px-3 py-1 bg-[#18181B] text-[#FAFAFA] border border-[#27272A] text-xs font-bold rounded-full">
            Shared Analysis
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title area */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-black">
            {analysis.jobDescriptionTitle}
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Resume: <span className="font-semibold text-black">{analysis.resumeName}</span>
          </p>
        </div>

        {/* Score card */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ScoreGauge score={analysis.overallScore} size={140} />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-bold text-black mb-2">
                Overall ATS Score
              </h2>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start mb-3">
                <div className="px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-lg">
                  <span className="text-2xl font-black text-black">
                    {analysis.keywordsMatchPct}%
                  </span>
                  <span className="text-xs text-zinc-500 ml-1 font-semibold">
                    keyword match
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                {analysis.summaryText}
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions (read-only) */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm mb-6 space-y-4">
            <h2 className="text-lg font-bold text-black mb-4">
              Suggestions ({analysis.suggestions.length})
            </h2>
            <div className="space-y-4">
              {analysis.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-sm hover:border-black transition-all"
                >
                  <div className="flex items-center gap-3 px-5 py-3 bg-zinc-50 border-b border-zinc-200">
                    <span className="px-2.5 py-0.5 bg-zinc-200 text-black text-xs font-bold rounded">
                      {suggestion.section}
                    </span>
                    <span className="text-xs font-bold text-zinc-500">
                      Suggestion
                    </span>
                  </div>

                  <div className="px-5 py-3">
                    <p className="text-xs text-zinc-700 font-medium">
                      <span className="font-bold text-black">Why:</span>{" "}
                      {suggestion.rationale}
                    </p>
                  </div>

                  <div className="px-5 pb-4 space-y-3">
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                      <p className="text-xs font-bold text-rose-900 mb-1">
                        Original
                      </p>
                      <p className="text-xs text-rose-950 font-medium leading-relaxed">
                        {suggestion.originalText}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-xs font-bold text-emerald-900 mb-1">
                        Suggested
                      </p>
                      <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                        {suggestion.suggestedText}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-xs text-zinc-500">
            Optimized with{" "}
            <Link
              href="/"
              className="text-[#FAFAFA] hover:underline font-bold"
            >
              paniund
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
