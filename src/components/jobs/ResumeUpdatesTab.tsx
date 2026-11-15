"use client";

import React from "react";
import { GenerationTone } from "@/types";
import { DetailedResumeUpdatesState } from "@/hooks/useJobDetail";
import EmptyState from "@/components/ui/EmptyState";

interface ResumeUpdatesTabProps {
  resumeUpdates: DetailedResumeUpdatesState | null;
  setResumeUpdates: React.Dispatch<
    React.SetStateAction<DetailedResumeUpdatesState | null>
  >;
  selectedTone: GenerationTone;
  handleToneChange: (tone: GenerationTone) => void;
  generating: boolean;
  copiedKey: string | null;
  copyToClipboard: (text: string, label: string, key?: string) => void;
  handleGenerateResumeUpdates: () => void;
  handleCopyAllRecommendations: () => void;
  handleAddSkillToProfile: (skill: string) => void;
  addedSkills: Set<string>;
}

export default function ResumeUpdatesTab({
  resumeUpdates,
  setResumeUpdates,
  selectedTone,
  handleToneChange,
  generating,
  copiedKey,
  copyToClipboard,
  handleGenerateResumeUpdates,
  handleCopyAllRecommendations,
  handleAddSkillToProfile,
  addedSkills,
}: ResumeUpdatesTabProps) {
  return (
    <div
      role="tabpanel"
      id="panel-resume_updates"
      aria-labelledby="tab-resume_updates"
      className="space-y-6"
    >
      {/* Header & Master Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-nordic-border pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-nordic-text">
              Tailored Resume Optimization Plan
            </h2>
            {resumeUpdates && (
              <span className="px-2 py-0.5 bg-nordic-primary text-white text-[11px] font-mono font-bold rounded-[3px]">
                {resumeUpdates.atsScoreForJob}% ATS Match Potential
              </span>
            )}
          </div>
          <p className="text-xs text-nordic-text-secondary">
            Detailed itemized suggestions: missing keywords, bullet point upgrades (Old vs. Updated), and new accomplishment additions to paste into your resume.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="tone-select-resume"
              className="text-xs font-semibold text-nordic-text-secondary shrink-0"
            >
              Tone:
            </label>
            <select
              id="tone-select-resume"
              value={selectedTone}
              onChange={(e) => handleToneChange(e.target.value as GenerationTone)}
              className="h-10 px-2.5 text-xs bg-white border border-nordic-border rounded-[4px] text-nordic-text font-medium focus:outline-none focus:border-nordic-primary"
              title="Tone for AI suggestions"
            >
              <option value="professional">Professional (Default)</option>
              <option value="conversational">Conversational</option>
              <option value="confident">Confident</option>
              <option value="humble">Humble</option>
            </select>
          </div>

          {resumeUpdates && (
            <button
              type="button"
              onClick={handleCopyAllRecommendations}
              className="nordic-btn-yellow text-xs h-10 px-3.5 cursor-pointer font-bold tap-active flex items-center gap-1.5"
              title="Copy all recommendations as Markdown checklist"
            >
              <span>📋</span>
              <span>
                {copiedKey === "all_recommendations"
                  ? "✓ Copied!"
                  : "Copy All Recommendations"}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={handleGenerateResumeUpdates}
            disabled={generating}
            aria-busy={generating}
            className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer shrink-0 font-bold flex items-center gap-1.5"
          >
            {generating ? (
              "Analyzing..."
            ) : resumeUpdates ? (
              <>
                <span className="text-sm font-bold">↻</span>
                <span>Regenerate Suggestions</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Get Suggestions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {resumeUpdates ? (
        <div className="space-y-8">
          {/* 1. MISSING KEYWORDS & SKILLS */}
          {(resumeUpdates.missingSkills?.length ?? 0) > 0 && (
            <div className="border border-nordic-error bg-nordic-error/5 p-4 sm:p-5 rounded-[4px] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-nordic-error" />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-nordic-error">
                    Missing Target Keywords ({resumeUpdates.missingSkills.length})
                  </h3>
                </div>
                <span className="text-[11px] text-nordic-neutral font-medium hidden sm:inline">
                  High ATS filter weighting
                </span>
              </div>

              <p className="text-xs text-nordic-text-secondary leading-relaxed">
                These keywords are explicitly prioritized in the job posting but are absent from your resume text. Add them to your skills list or weave them into your experience bullets.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {resumeUpdates.missingSkills.map((sk) => {
                  const isAdded = addedSkills.has(sk);
                  return (
                    <div
                      key={sk}
                      className="px-3 py-1.5 bg-white border border-nordic-border text-xs font-semibold rounded-[4px] text-nordic-text flex items-center gap-2 shadow-2xs hover:border-nordic-error transition-colors"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => handleAddSkillToProfile(sk)}
                        disabled={isAdded}
                        aria-label={`Add skill ${sk} to candidate profile`}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer tap-active ${
                          isAdded
                            ? "bg-nordic-success text-white cursor-default"
                            : "bg-nordic-primary/10 text-nordic-primary hover:bg-nordic-primary hover:text-white"
                        }`}
                      >
                        {isAdded ? "✓ Added to Profile" : "+ Add to My Skills"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. TAILORED PROFESSIONAL SUMMARY */}
          {resumeUpdates.summaryUpgrade && (
            <div className="border border-nordic-primary bg-nordic-primary/5 p-4 sm:p-5 rounded-[4px] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-nordic-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-nordic-primary">
                    Tailored Professional Summary
                  </h3>
                  <span className="text-[10px] text-nordic-neutral">(Editable)</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      resumeUpdates.summaryUpgrade!.suggestedSummary,
                      "Tailored summary",
                      "summary"
                    )
                  }
                  className="text-xs text-nordic-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  {copiedKey === "summary" ? "✓ Copied!" : "Copy Summary ➔"}
                </button>
              </div>

              <textarea
                value={resumeUpdates.summaryUpgrade.suggestedSummary}
                onChange={(e) => {
                  const val = e.target.value;
                  setResumeUpdates((prev) =>
                    prev && prev.summaryUpgrade
                      ? {
                          ...prev,
                          summaryUpgrade: {
                            ...prev.summaryUpgrade,
                            suggestedSummary: val,
                          },
                        }
                      : prev
                  );
                }}
                rows={3}
                aria-label="Editable tailored professional summary"
                className="w-full p-3.5 bg-white border border-nordic-border rounded-[4px] text-xs sm:text-sm text-nordic-text leading-relaxed font-sans border-l-4 border-l-nordic-primary focus:outline-none focus:border-nordic-primary resize-y"
              />

              <p className="text-[11px] text-nordic-text-secondary">
                <span className="font-bold text-nordic-text">Why this works:</span>{" "}
                {resumeUpdates.summaryUpgrade.reason}
              </p>
            </div>
          )}

          {/* 3. BULLET POINT UPGRADES (OLD VS. UPDATED POINT) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-nordic-border pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-nordic-secondary" />
                <h3 className="text-xs font-bold uppercase tracking-wide text-nordic-text">
                  Bullet Point Upgrades (Old vs. Updated)
                </h3>
                <span className="px-2 py-0.5 bg-nordic-bg border border-nordic-border text-[10px] font-bold rounded-full">
                  {resumeUpdates.bulletUpgrades?.length ||
                    resumeUpdates.suggestions?.length ||
                    0}
                </span>
              </div>
              <span className="text-[11px] text-nordic-neutral">
                Rewritten with action verbs, metrics & keywords
              </span>
            </div>

            {resumeUpdates.bulletUpgrades && resumeUpdates.bulletUpgrades.length > 0 ? (
              <div className="space-y-4">
                {resumeUpdates.bulletUpgrades.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-nordic-border rounded-[4px] p-4 sm:p-5 bg-white space-y-3.5 hover:border-nordic-primary transition-all shadow-xs"
                  >
                    {/* Header row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F0F0] pb-2.5">
                      <span className="text-xs font-bold text-nordic-primary uppercase tracking-wider font-mono">
                        Section: {item.section}
                      </span>
                      {item.keywordsAdded && item.keywordsAdded.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] text-nordic-neutral font-medium">
                            Injected:
                          </span>
                          {item.keywordsAdded.map((kw) => (
                            <span
                              key={kw}
                              className="px-1.5 py-0.5 bg-nordic-success/10 text-nordic-success font-mono text-[10px] font-bold rounded-[2px]"
                            >
                              +{kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Old Point */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase text-nordic-neutral tracking-wider block">
                        Old Point (Generic / Lower Impact)
                      </span>
                      <div className="p-3 bg-nordic-bg border border-nordic-border rounded-[4px] text-xs font-mono text-[#555555] line-through leading-relaxed">
                        {item.original}
                      </div>
                    </div>

                    {/* Updated Point */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-nordic-success tracking-wider flex items-center gap-1">
                          <span>★</span> ATS-Optimized Point (Editable)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(
                              item.updated,
                              "Updated bullet",
                              `bullet_${idx}`
                            )
                          }
                          className="nordic-btn-primary text-xs h-7 px-2.5 cursor-pointer font-bold flex items-center gap-1 tap-active"
                        >
                          <span>
                            {copiedKey === `bullet_${idx}` ? "✓ Copied!" : "Copy Point"}
                          </span>
                        </button>
                      </div>
                      <textarea
                        value={item.updated}
                        onChange={(e) => {
                          const val = e.target.value;
                          setResumeUpdates((prev) => {
                            if (!prev) return null;
                            const updatedList = [...prev.bulletUpgrades];
                            updatedList[idx] = {
                              ...updatedList[idx],
                              updated: val,
                            };
                            return { ...prev, bulletUpgrades: updatedList };
                          });
                        }}
                        rows={2}
                        aria-label={`Editable bullet for ${item.section}`}
                        className="w-full p-3 bg-white border-2 border-nordic-success/40 rounded-[4px] text-xs font-mono font-bold text-nordic-text leading-relaxed shadow-2xs focus:outline-none focus:border-nordic-success resize-y"
                      />
                    </div>

                    {/* Explanation */}
                    <div className="pt-1 text-[11px] text-nordic-text-secondary flex items-start gap-1.5 bg-[#F9F9F9] p-2.5 rounded-[4px]">
                      <span className="text-nordic-primary font-bold shrink-0">
                        Why this helps:
                      </span>
                      <span className="leading-snug">{item.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 border border-nordic-border rounded-[4px] text-xs text-nordic-text-secondary bg-[#FAFAFA]">
                No existing bullet rewrites needed. Check the missing skills and new points below.
              </div>
            )}
          </div>

          {/* 4. BRAND NEW POINTS TO ADD */}
          {(resumeUpdates.newPointsToAdd?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-nordic-border pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-nordic-success" />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-nordic-text">
                    Brand New Points to Add ({resumeUpdates.newPointsToAdd.length})
                  </h3>
                </div>
                <span className="text-[11px] text-nordic-neutral">
                  Directly addresses unmet job requirements
                </span>
              </div>

              <div className="space-y-4">
                {resumeUpdates.newPointsToAdd.map((pt, idx) => (
                  <div
                    key={idx}
                    className="border border-nordic-border rounded-[4px] p-4 sm:p-5 bg-white space-y-3.5 hover:border-nordic-success transition-all shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F0F0] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-nordic-success text-white text-[10px] font-bold uppercase tracking-wide rounded-[2px]">
                          New Addition
                        </span>
                        <span className="text-xs font-semibold text-nordic-text">
                          Target: {pt.targetedRequirement}
                        </span>
                      </div>
                      <span className="text-[11px] text-nordic-neutral font-mono">
                        Placement: {pt.section}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-nordic-text-secondary tracking-wider">
                          Suggested Accomplishment Bullet
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            copyToClipboard(pt.suggestedBullet, "New bullet point")
                          }
                          className="nordic-btn-yellow text-xs h-7 px-2.5 cursor-pointer font-bold flex items-center gap-1 tap-active"
                        >
                          <span>Copy New Bullet</span>
                        </button>
                      </div>
                      <div className="p-3.5 bg-white border border-nordic-border rounded-[4px] text-xs font-mono font-bold text-nordic-text leading-relaxed shadow-2xs border-l-4 border-l-nordic-success">
                        • {pt.suggestedBullet}
                      </div>
                    </div>

                    <div className="pt-1 text-[11px] text-nordic-text-secondary bg-[#F9F9F9] p-2.5 rounded-[4px]">
                      <span className="font-bold text-nordic-text">Strategy:</span>{" "}
                      {pt.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No Resume Optimization Plan Generated Yet"
          description="Scan your resume against this job posting to uncover missing target keywords, bullet point upgrades (Old vs. Updated), and new accomplishment additions."
          action={{
            label: "⚡ Generate Resume Optimization Plan",
            onClick: handleGenerateResumeUpdates,
            variant: "primary",
          }}
        />
      )}
    </div>
  );
}
