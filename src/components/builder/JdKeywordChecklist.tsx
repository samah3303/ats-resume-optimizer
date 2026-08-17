"use client";

import { useState } from "react";

interface JdKeywordChecklistProps {
  resumeContentText?: string;
}

export function JdKeywordChecklist({ resumeContentText = "" }: JdKeywordChecklistProps) {
  const [targetJdText, setTargetJdText] = useState(
    "Looking for a Senior Backend Engineer proficient in PostgreSQL optimization, Kafka streaming, Redis caching, Kubernetes orchestration, Docker, TypeScript, and microservice architecture."
  );

  const EXTRACTED_KEYWORDS = [
    { skill: "PostgreSQL", category: "Database" },
    { skill: "Kafka", category: "Streaming" },
    { skill: "Redis", category: "Caching" },
    { skill: "Kubernetes", category: "Infra" },
    { skill: "Docker", category: "Infra" },
    { skill: "TypeScript", category: "Language" },
    { skill: "Microservice", category: "Architecture" },
    { skill: "REST API", category: "Networking" },
    { skill: "CI/CD", category: "DevOps" },
  ];

  const resumeLower = resumeContentText.toLowerCase();

  const matchedKeywords = EXTRACTED_KEYWORDS.filter((k) =>
    resumeLower.includes(k.skill.toLowerCase())
  );
  const missingKeywords = EXTRACTED_KEYWORDS.filter(
    (k) => !resumeLower.includes(k.skill.toLowerCase())
  );

  const coveragePercent = Math.round(
    (matchedKeywords.length / EXTRACTED_KEYWORDS.length) * 100
  );

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
            KEYWORD COVERAGE HEATMAP
          </span>
          <h3 className="text-sm font-black text-black mt-1">
            Target Job Description Skill Density
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xl font-black text-black font-mono font-bold">
            {coveragePercent}%
          </span>
          <span className="text-[9px] uppercase font-bold text-zinc-500 block">
            Coverage Index
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
          Target Job Description Snippet:
        </label>
        <textarea
          value={targetJdText}
          onChange={(e) => setTargetJdText(e.target.value)}
          rows={2}
          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 outline-none leading-relaxed resize-none"
        />
      </div>

      {/* Keywords Split View */}
      <div className="space-y-3 pt-2 border-t border-zinc-100">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
            ✓ Detected in Your Resume ({matchedKeywords.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.length > 0 ? (
              matchedKeywords.map((k, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-bold"
                >
                  ✓ {k.skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-zinc-400 italic">No exact matches yet</span>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
            ⚠️ Missing Target Skills ({missingKeywords.length}) — Recommended to Add:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((k, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-900 border border-rose-200 text-[11px] font-bold"
              >
                + {k.skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
