"use client";

import { useState } from "react";
import { CandidateApplicationData, PIPELINE_STAGES } from "./types";

interface CandidatePipelineKanbanProps {
  candidates: CandidateApplicationData[];
  onCandidateClick: (candidate: CandidateApplicationData) => void;
  onStageChange: (candidateId: string, newStage: string) => Promise<void>;
  searchQuery?: string;
}

export default function CandidatePipelineKanban({
  candidates,
  onCandidateClick,
  onStageChange,
  searchQuery = "",
}: CandidatePipelineKanbanProps) {
  const [movingId, setMovingId] = useState<string | null>(null);

  // Filter candidates by search query
  const filteredCandidates = candidates.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.candidateName.toLowerCase().includes(q) ||
      c.candidateEmail.toLowerCase().includes(q) ||
      (c.matchedSkills && c.matchedSkills.some((s) => s.toLowerCase().includes(q)))
    );
  });

  const getCandidatesByStage = (stageKey: string) => {
    return filteredCandidates.filter((c) => (c.stage || "applied") === stageKey);
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null || score === undefined) {
      return "bg-zinc-100 text-zinc-500 border-zinc-200";
    }
    if (score >= 85) {
      return "bg-black text-white border-black font-black";
    }
    if (score >= 70) {
      return "bg-zinc-100 text-zinc-900 border-zinc-300 font-bold";
    }
    return "bg-zinc-50 text-zinc-600 border-zinc-200 font-medium";
  };

  const handleShiftStage = async (
    e: React.MouseEvent,
    candidateId: string,
    targetStage: string
  ) => {
    e.stopPropagation();
    setMovingId(candidateId);
    try {
      await onStageChange(candidateId, targetStage);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="overflow-x-auto pb-6 custom-scrollbar">
      <div className="flex gap-4 min-w-[1700px] items-start">
        {PIPELINE_STAGES.map((stage, stageIdx) => {
          const stageCandidates = getCandidatesByStage(stage.key);

          return (
            <div
              key={stage.key}
              className="w-[300px] shrink-0 bg-zinc-50 rounded-3xl border border-zinc-200 shadow-sm flex flex-col max-h-[calc(100vh-250px)]"
            >
              {/* Column Header */}
              <div className="p-4 rounded-t-3xl border-b border-zinc-200 bg-zinc-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{stage.emoji}</span>
                  <h3 className="font-extrabold text-xs text-black truncate tracking-wide">
                    {stage.label}
                  </h3>
                </div>
                <span className="text-[11px] font-black font-mono px-2 py-0.5 rounded-full bg-white border border-zinc-300 text-black shadow-sm">
                  {stageCandidates.length}
                </span>
              </div>

              {/* Candidates Stream */}
              <div className="p-3 overflow-y-auto flex-1 space-y-3 custom-scrollbar">
                {stageCandidates.length === 0 ? (
                  <div className="py-10 text-center space-y-1.5">
                    <p className="text-xs text-zinc-500 italic font-medium">
                      No candidates in {stage.shortLabel}
                    </p>
                  </div>
                ) : (
                  stageCandidates.map((candidate) => {
                    const initials = candidate.candidateName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={candidate.id}
                        onClick={() => onCandidateClick(candidate)}
                        className="bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-black rounded-2xl p-4 text-zinc-900 shadow-sm transition-all cursor-pointer space-y-3 group"
                        role="button"
                        tabIndex={0}
                        aria-label={`View candidate ${candidate.candidateName}`}
                      >
                        {/* Top: Candidate info & Score */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-300 text-black font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-xs text-black truncate group-hover:underline transition-colors">
                                {candidate.candidateName}
                              </h4>
                              <p className="text-[10px] text-zinc-500 truncate font-mono">
                                {candidate.candidateEmail}
                              </p>
                            </div>
                          </div>

                          {/* Fit Score Badge */}
                          {candidate.fitScore !== null && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 shadow-sm ${getScoreBadge(
                                candidate.fitScore
                              )}`}
                            >
                              {candidate.fitScore}%
                            </span>
                          )}
                        </div>

                        {/* Fit Summary Snippet */}
                        {candidate.fitSummary && (
                          <p className="text-[11px] text-zinc-600 leading-relaxed line-clamp-2 font-normal">
                            {candidate.fitSummary}
                          </p>
                        )}

                        {/* Matched Skills Chips */}
                        {candidate.matchedSkills && candidate.matchedSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {candidate.matchedSkills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="text-[9px] font-bold px-1.5 py-0.5 bg-zinc-100 border border-zinc-200 rounded text-zinc-800"
                              >
                                ✓ {skill}
                              </span>
                            ))}
                            {candidate.matchedSkills.length > 3 && (
                              <span className="text-[9px] font-mono px-1 py-0.5 bg-zinc-50 text-zinc-500 rounded border border-zinc-200">
                                +{candidate.matchedSkills.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Scorecards Indicator */}
                        {candidate.scorecards && candidate.scorecards.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-zinc-800 font-bold">
                            <span>⭐ {candidate.scorecards.length} Scorecard{candidate.scorecards.length > 1 ? "s" : ""}</span>
                          </div>
                        )}

                        {/* Stage Navigation Arrows & Quick Select */}
                        <div
                          className="flex items-center justify-between pt-2 border-t border-zinc-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-1">
                            {stageIdx > 0 && (
                              <button
                                disabled={movingId === candidate.id}
                                onClick={(e) =>
                                  handleShiftStage(
                                    e,
                                    candidate.id,
                                    PIPELINE_STAGES[stageIdx - 1].key
                                  )
                                }
                                title={`Move back to ${PIPELINE_STAGES[stageIdx - 1].shortLabel}`}
                                className="p-1 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-lg transition-colors text-xs font-black disabled:opacity-50"
                              >
                                ←
                              </button>
                            )}

                            {stageIdx < PIPELINE_STAGES.length - 1 && (
                              <button
                                disabled={movingId === candidate.id}
                                onClick={(e) =>
                                  handleShiftStage(
                                    e,
                                    candidate.id,
                                    PIPELINE_STAGES[stageIdx + 1].key
                                  )
                                }
                                title={`Advance to ${PIPELINE_STAGES[stageIdx + 1].shortLabel}`}
                                className="px-2.5 py-0.5 bg-black hover:bg-zinc-800 text-white border border-black rounded-lg transition-all text-[10px] font-bold disabled:opacity-50 flex items-center gap-1 shadow-sm"
                              >
                                <span>Advance</span>
                                <span>→</span>
                              </button>
                            )}
                          </div>

                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(candidate.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
