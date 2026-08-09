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
  suggestions?: SuggestionItem[];
  missingSkills?: string[];
  onApplyFix?: (original: string, updated: string) => void;
}

const DEFAULT_SUGGESTIONS: SuggestionItem[] = [
  {
    id: "def-1",
    section: "Work Experience",
    originalText: "Responsible for developing software features and writing unit tests.",
    suggestedText: "Engineered scalable full-stack features and automated test suites, achieving 94% test coverage and reducing production bug reports by 35%.",
    rationale: "Quantifies achievements with metrics and emphasizes technical ownership.",
  },
  {
    id: "def-2",
    section: "Technical Skills",
    originalText: "Worked with databases, APIs, and cloud services.",
    suggestedText: "Architected high-concurrency RESTful APIs and PostgreSQL database schemas deployed on AWS, supporting 100k+ daily active requests.",
    rationale: "Replaces vague skill mentions with specific high-impact architecture bullet points.",
  },
  {
    id: "def-3",
    section: "Projects & Impact",
    originalText: "Helped team improve website performance and user interface.",
    suggestedText: "Optimized Core Web Vitals and front-end bundle sizes, boosting page load speeds by 42% and increasing user retention by 18%.",
    rationale: "Directly connects front-end improvements to key business outcome metrics.",
  },
];

export default function InlineAiFixer({
  suggestions = [],
  missingSkills = [],
  onApplyFix,
}: InlineAiFixerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loadingSkill, setLoadingSkill] = useState<string | null>(null);
  const [generatedBullets, setGeneratedBullets] = useState<Record<string, string>>({});
  const [customSkillInput, setCustomSkillInput] = useState("");

  const displaySuggestions = suggestions.length > 0 ? suggestions : DEFAULT_SUGGESTIONS;
  const displaySkills = missingSkills.length > 0 ? missingSkills : ["Docker", "GraphQL", "CI/CD Pipeline", "System Architecture"];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateSkillFix = async (skill: string) => {
    if (!skill.trim()) return;
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
      } else {
        throw new Error("Generation failed");
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
    <div className="space-y-6 max-w-full overflow-hidden">
      <div className="bg-white dark:bg-[#14161D] border border-slate-200 dark:border-[#242834] rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>⚡</span> 1-Click AI Bullet Optimizer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Instantly rewrite weak bullets or generate scannable STAR metric points for missing skills.
            </p>
          </div>
        </div>

        {/* Custom Skill Bullet Generator Input - Responsive Mobile Stacking */}
        <div className="bg-slate-50 dark:bg-[#1C1F2B] p-4 rounded-xl border border-slate-200 dark:border-[#2E3345] space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-amber-300">
            Generate Custom STAR Bullet for Any Skill:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
            <input
              type="text"
              placeholder="e.g. Kubernetes, Redis, System Design..."
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              className="w-full flex-1 min-w-0 px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-[#0D0E11] border border-slate-300 dark:border-[#2E3345] text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <button
              onClick={() => {
                if (customSkillInput.trim()) {
                  handleGenerateSkillFix(customSkillInput.trim());
                }
              }}
              disabled={!customSkillInput.trim() || loadingSkill === customSkillInput.trim()}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-amber-300 dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 transition-all disabled:opacity-50 shrink-0 shadow-sm whitespace-nowrap"
            >
              {loadingSkill === customSkillInput.trim() ? "Generating..." : "⚡ Generate STAR"}
            </button>
          </div>
        </div>

        {/* Missing Skill AI Bullet Generators */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/30 rounded-xl p-4">
          <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 mb-3">
            Target Skill Optimization Badges:
          </h4>
          <div className="space-y-3">
            {displaySkills.slice(0, 5).map((skill) => {
              const generated = generatedBullets[skill];
              const isLoading = loadingSkill === skill;

              return (
                <div
                  key={skill}
                  className="bg-white dark:bg-[#0D0E11] rounded-xl p-3.5 border border-amber-200/80 dark:border-[#2E3345] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex-1 min-w-0 w-full">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                      Target Skill: {skill}
                    </span>
                    {generated && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 font-mono bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60 break-words">
                        &quot;{generated}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    {!generated ? (
                      <button
                        onClick={() => handleGenerateSkillFix(skill)}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-sm flex items-center justify-center gap-1"
                      >
                        {isLoading ? "Generating..." : "⚡ Fix with AI"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCopy(generated, skill)}
                        className="w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
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

        {/* Existing AI Recommendations */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Section Rewrites & Improvements ({displaySuggestions.length})
          </h4>
          {displaySuggestions.map((item, idx) => {
            const itemKey = item.id || `sugg-${idx}`;
            return (
              <div
                key={itemKey}
                className="bg-slate-50 dark:bg-[#1C1F2B] rounded-xl p-4 border border-slate-200 dark:border-[#2E3345] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    {item.section}
                  </span>
                  <button
                    onClick={() => {
                      handleCopy(item.suggestedText, itemKey);
                      if (onApplyFix) onApplyFix(item.originalText, item.suggestedText);
                    }}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-sm"
                  >
                    {copiedId === itemKey ? "Copied! ✓" : "⚡ Apply Fix"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-rose-50/60 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 break-words">
                    <span className="font-bold text-rose-700 dark:text-rose-400 block mb-1">
                      Weak / Unquantified Bullet:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 italic">{item.originalText}</p>
                  </div>

                  <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 break-words">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Optimized STAR Metric Bullet:
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {item.suggestedText}
                    </p>
                  </div>
                </div>

                {item.rationale && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">
                    💡 {item.rationale}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
