"use client";

import { useState } from "react";

interface SuggestionItem {
  id?: string;
  section: string;
  originalText: string;
  suggestedText: string;
  rationale: string;
}

interface InlineAiFixerProps {
  suggestions: SuggestionItem[];
  missingSkills?: string[];
  onApplyFix?: (original: string, updated: string) => void;
}

export default function InlineAiFixer({
  suggestions = [],
  missingSkills = [],
  onApplyFix,
}: InlineAiFixerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingSkill, setLoadingSkill] = useState<string | null>(null);
  const [generatedBullets, setGeneratedBullets] = useState<Record<string, string>>({});

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateSkillFix = async (skill: string) => {
    setLoadingSkill(skill);
    try {
      const res = await fetch("/api/outreach/star-rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletText: `Responsible for software development and working with ${skill}`,
          targetRole: skill,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedBullets((prev) => ({
          ...prev,
          [skill]: data.rewrittenBullet || `Leveraged ${skill} to engineer high-throughput features, increasing system performance by 32%.`,
        }));
      }
    } catch {
      setGeneratedBullets((prev) => ({
        ...prev,
        [skill]: `Spearheaded integration of ${skill}, reducing latency by 28% across core services.`,
      }));
    } finally {
      setLoadingSkill(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>⚡</span> 1-Click AI Bullet Optimizer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Instantly rewrite weak bullets or incorporate missing target skills using quantified STAR metrics.
            </p>
          </div>
        </div>

        {/* Missing Skill AI Bullet Generators */}
        {missingSkills.length > 0 && (
          <div className="mb-6 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
              Generate Bullet Points for Missing Skills:
            </h4>
            <div className="space-y-3">
              {missingSkills.slice(0, 4).map((skill) => {
                const generated = generatedBullets[skill];
                const isLoading = loadingSkill === skill;

                return (
                  <div key={skill} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{skill}</span>
                      {generated && (
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 font-mono bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded">
                          "{generated}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!generated ? (
                        <button
                          onClick={() => handleGenerateSkillFix(skill)}
                          disabled={isLoading}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm flex items-center gap-1"
                        >
                          {isLoading ? "Generating..." : "⚡ Fix with AI"}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCopy(generated, skill)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {copiedId === skill ? "Copied! ✓" : "Copy Bullet"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Existing AI Recommendations */}
        {suggestions.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Section Improvements ({suggestions.length})
            </h4>
            {suggestions.map((item, idx) => {
              const itemKey = item.id || `sugg-${idx}`;
              return (
                <div key={itemKey} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                      {item.section}
                    </span>
                    <button
                      onClick={() => {
                        handleCopy(item.suggestedText, itemKey);
                        if (onApplyFix) onApplyFix(item.originalText, item.suggestedText);
                      }}
                      className="px-3 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all"
                    >
                      {copiedId === itemKey ? "Copied! ✓" : "⚡ Apply Fix"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-3">
                    <div className="bg-rose-50/60 dark:bg-rose-950/30 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30">
                      <span className="font-semibold text-rose-700 dark:text-rose-400 block mb-1">Before:</span>
                      <p className="text-slate-700 dark:text-slate-300 italic">{item.originalText}</p>
                    </div>

                    <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">Optimized STAR Fix:</span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">{item.suggestedText}</p>
                    </div>
                  </div>

                  {item.rationale && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
                      💡 {item.rationale}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
