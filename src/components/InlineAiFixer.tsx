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
    <div className="space-y-6 max-w-full overflow-hidden text-white">
      <div className="bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>⚡</span> 1-Click AI Bullet Optimizer
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Instantly rewrite weak bullets or generate scannable STAR metric points for missing skills.
            </p>
          </div>
        </div>

        {/* Custom Skill Bullet Generator Input */}
        <div className="bg-[#090A0C] p-4 rounded-2xl border border-[#242834] space-y-3">
          <label className="block text-xs font-black text-amber-300">
            Generate Custom STAR Bullet for Any Skill:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
            <input
              type="text"
              placeholder="e.g. Kubernetes, Redis, System Design..."
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              className="w-full flex-1 min-w-0 px-4 py-2.5 rounded-xl text-xs bg-[#14161D] border border-[#242834] text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => {
                if (customSkillInput.trim()) {
                  handleGenerateSkillFix(customSkillInput.trim());
                }
              }}
              disabled={!customSkillInput.trim() || loadingSkill === customSkillInput.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all disabled:opacity-50 shrink-0 shadow-md shadow-amber-500/20 whitespace-nowrap"
            >
              {loadingSkill === customSkillInput.trim() ? "Generating..." : "⚡ Generate STAR"}
            </button>
          </div>
        </div>

        {/* Missing Skill AI Bullet Generators */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4">
          <h4 className="text-xs font-black text-amber-300 mb-3 uppercase tracking-wider">
            Target Skill Optimization Badges:
          </h4>
          <div className="space-y-3">
            {displaySkills.slice(0, 5).map((skill) => {
              const generated = generatedBullets[skill];
              const isLoading = loadingSkill === skill;

              return (
                <div
                  key={skill}
                  className="bg-[#090A0C] rounded-2xl p-4 border border-[#242834] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="flex-1 min-w-0 w-full">
                    <span className="text-xs font-bold text-white block truncate">
                      Target Skill: {skill}
                    </span>
                    {generated && (
                      <p className="text-xs text-emerald-300 mt-2 font-mono bg-emerald-950/60 p-3 rounded-xl border border-emerald-800 break-words">
                        &quot;{generated}&quot;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    {!generated ? (
                      <button
                        onClick={() => handleGenerateSkillFix(skill)}
                        disabled={isLoading}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-1"
                      >
                        {isLoading ? "Generating..." : "⚡ Fix with AI"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCopy(generated, skill)}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm"
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
          <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
            Section Rewrites & Improvements ({displaySuggestions.length})
          </h4>
          {displaySuggestions.map((item, idx) => {
            const itemKey = item.id || `sugg-${idx}`;
            return (
              <div
                key={itemKey}
                className="bg-[#090A0C] rounded-2xl p-4 border border-[#242834] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.section}
                  </span>
                  <button
                    onClick={() => {
                      handleCopy(item.suggestedText, itemKey);
                      if (onApplyFix) onApplyFix(item.originalText, item.suggestedText);
                    }}
                    className="px-3.5 py-1.5 text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition-all shadow-sm"
                  >
                    {copiedId === itemKey ? "Copied! ✓" : "⚡ Apply Fix"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-rose-950/40 p-3 rounded-xl border border-rose-900/40 break-words">
                    <span className="font-bold text-rose-400 block mb-1">
                      Weak / Unquantified Bullet:
                    </span>
                    <p className="text-zinc-300 italic">{item.originalText}</p>
                  </div>

                  <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/40 break-words">
                    <span className="font-bold text-emerald-400 block mb-1">
                      Optimized STAR Metric Bullet:
                    </span>
                    <p className="text-white font-medium leading-relaxed">
                      {item.suggestedText}
                    </p>
                  </div>
                </div>

                {item.rationale && (
                  <p className="text-xs text-zinc-400 font-medium italic">
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
