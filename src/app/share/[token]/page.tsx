"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ScoreGauge from "@/components/ScoreGauge";

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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🔗</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Link Not Found
        </h1>
        <p className="text-sm text-gray-500 text-center max-w-md">
          This shared analysis link may have expired or been removed. Ask the
          owner to share a new link.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">ATS</span>
            </div>
            <span className="text-lg font-bold text-gray-900">
              ATS Optimizer
            </span>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
            Shared Analysis
          </span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title area */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {analysis.jobDescriptionTitle}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Resume: <span className="font-medium text-gray-700">{analysis.resumeName}</span>
          </p>
        </div>

        {/* Score card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ScoreGauge score={analysis.overallScore} size={140} />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Overall ATS Score
              </h2>
              <div className="flex flex-wrap gap-4 justify-center sm:justify-start mb-3">
                <div className="px-3 py-1.5 bg-indigo-50 rounded-lg">
                  <span className="text-2xl font-bold text-indigo-600">
                    {analysis.keywordsMatchPct}%
                  </span>
                  <span className="text-xs text-indigo-500 ml-1">
                    keyword match
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {analysis.summaryText}
              </p>
            </div>
          </div>
        </div>

        {/* Suggestions (read-only) */}
        {analysis.suggestions && analysis.suggestions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Suggestions ({analysis.suggestions.length})
            </h2>
            <div className="space-y-3">
              {analysis.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border border-gray-200 rounded-xl bg-white overflow-hidden"
                >
                  <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">
                      {suggestion.section}
                    </span>
                    <span className="text-sm text-gray-500">
                      Suggestion
                    </span>
                  </div>

                  <div className="px-5 py-3">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Why:</span>{" "}
                      {suggestion.rationale}
                    </p>
                  </div>

                  <div className="px-5 pb-4 space-y-3">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <p className="text-xs font-semibold text-red-700 mb-1">
                        Original
                      </p>
                      <p className="text-sm text-red-800">
                        {suggestion.originalText}
                      </p>
                    </div>

                    <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                      <p className="text-xs font-semibold text-green-700 mb-1">
                        Suggested
                      </p>
                      <p className="text-sm text-green-800">
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
          <p className="text-sm text-gray-400">
            Optimized by{" "}
            <Link
              href="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ATS Resume Optimizer
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
