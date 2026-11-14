"use client";

import React, { useState } from "react";
import Link from "next/link";
import Modal from "@/components/ui/Modal";
import { JobListing, JobPreferences } from "@/types";

export interface AiJobItem {
  title: string;
  company: string;
  location: string;
  salary: string | null;
  jobType: string;
  description: string;
  requirements: string;
  sourceUrl: string;
  source: string;
  matchScore: number;
}

interface AiJobSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileSummary: {
    role: string;
    skills: string[];
    location: string;
    preferences?: JobPreferences | null;
  } | null;
  onJobSaved: (job: JobListing) => void;
  onShowToast: (text: string, type: "success" | "error" | "info") => void;
}

export function AiJobSearchModal({
  isOpen,
  onClose,
  profileSummary,
  onJobSaved,
  onShowToast,
}: AiJobSearchModalProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLocation, setAiLocation] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState("");
  const [aiJobs, setAiJobs] = useState<AiJobItem[]>([]);
  const [savingAiIndex, setSavingAiIndex] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [savedAiIndices, setSavedAiIndices] = useState<Set<number>>(new Set());

  // Initialize defaults from profile summary if not set
  React.useEffect(() => {
    if (profileSummary && !aiPrompt) {
      setAiPrompt(profileSummary.role || "");
      const prefLoc = profileSummary.preferences?.locations?.[0];
      setAiLocation(prefLoc || profileSummary.location || "Dubai, UAE / Remote");
    }
  }, [profileSummary, aiPrompt]);

  const handleRunAiSearch = async () => {
    if (!aiPrompt.trim()) {
      onShowToast("Please enter a job title or target keywords", "error");
      return;
    }

    setAiSearching(true);
    setAiSearchError("");
    setAiJobs([]);
    setSavedAiIndices(new Set());

    try {
      const res = await fetch("/api/jobs/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          location: aiLocation,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to search jobs with AI");
      }

      const data = await res.json();
      const results: AiJobItem[] = data.jobs || [];
      setAiJobs(results);

      if (results.length === 0) {
        onShowToast("No active jobs found for those criteria. Try broadening your keywords.", "info");
      } else {
        onShowToast(`Found ${results.length} matching openings!`, "success");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "AI Job Search failed";
      setAiSearchError(msg);
      onShowToast(msg, "error");
    } finally {
      setAiSearching(false);
    }
  };

  const handleSaveAiJob = async (jobItem: AiJobItem, index: number) => {
    setSavingAiIndex(index);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobItem.title,
          company: jobItem.company,
          location: jobItem.location,
          salary: jobItem.salary,
          jobType: jobItem.jobType,
          description: jobItem.description,
          requirements: jobItem.requirements,
          sourceUrl: jobItem.sourceUrl,
          source: jobItem.source || "ai_search",
          matchScore: jobItem.matchScore,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save job");
      }

      const saved = await res.json();
      onJobSaved(saved);
      setSavedAiIndices((prev) => new Set(prev).add(index));
      onShowToast(`Saved "${jobItem.title}" to your jobs!`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save job";
      onShowToast(msg, "error");
    } finally {
      setSavingAiIndex(null);
    }
  };

  const handleSaveAllAiJobs = async () => {
    if (aiJobs.length === 0) return;
    setSavingAll(true);
    let count = 0;

    try {
      for (let i = 0; i < aiJobs.length; i++) {
        if (!savedAiIndices.has(i)) {
          const j = aiJobs[i];
          const res = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: j.title,
              company: j.company,
              location: j.location,
              salary: j.salary,
              jobType: j.jobType,
              description: j.description,
              requirements: j.requirements,
              sourceUrl: j.sourceUrl,
              source: j.source || "ai_search",
              matchScore: j.matchScore,
            }),
          });
          if (res.ok) {
            const saved = await res.json();
            onJobSaved(saved);
            setSavedAiIndices((prev) => new Set(prev).add(i));
            count++;
          }
        }
      }
      onShowToast(`Saved ${count} new jobs to your dashboard!`, "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save all jobs";
      onShowToast(msg, "error");
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Job Finder"
      subtitle="Live jobs from Naukri Gulf, Indeed, LinkedIn, Greenhouse, and Lever"
      maxWidth="4xl"
      headerBadge={
        <span
          className="w-8 h-8 rounded-full bg-[#FFDA1A] text-[#003399] flex items-center justify-center font-bold text-base shadow-xs shrink-0"
          aria-hidden="true"
        >
          ✨
        </span>
      }
    >
      <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
        {/* Platforms Covered & Profile Summary Banner */}
        <div className="border border-[#DFDFDF] p-4 bg-[#F5F5F5] rounded-[4px] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#111111] uppercase tracking-wide">
                Active Platforms:
              </span>
              <span className="text-[11px] text-[#767676]">
                (from your preferences)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "naukrigulf", name: "Naukri Gulf", color: "#0A8A00" },
                { id: "indeed", name: "Indeed", color: "#003399" },
                { id: "linkedin", name: "LinkedIn", color: "#0077B5" },
                { id: "greenhouse_lever", name: "Greenhouse / Lever", color: "#FF9900" },
              ].map((plat) => {
                const isActive =
                  !profileSummary?.preferences?.platforms ||
                  profileSummary.preferences.platforms.includes(plat.id);
                return (
                  <span
                    key={plat.id}
                    className={`px-2.5 py-0.5 rounded-[3px] border font-bold text-xs flex items-center gap-1.5 shadow-2xs ${
                      isActive
                        ? "bg-white border-[#DFDFDF] text-[#111111]"
                        : "bg-[#DFDFDF]/40 border-transparent text-[#999] line-through"
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: isActive ? plat.color : "#bbb",
                      }}
                    />
                    {plat.name}
                  </span>
                );
              })}
            </div>
          </div>

          {profileSummary && (
            <div className="pt-2 border-t border-[#DFDFDF] flex flex-wrap items-center justify-between gap-3 text-xs text-[#484848]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[#111111]">
                  Profile Context:
                </span>
                <span className="px-2 py-0.5 bg-white border border-[#DFDFDF] rounded-[3px] font-mono text-[#003399] font-bold">
                  {profileSummary.role}
                </span>
                {profileSummary.preferences?.workModes &&
                  profileSummary.preferences.workModes.length > 0 && (
                    <span className="px-2 py-0.5 bg-white border border-[#DFDFDF] rounded-[3px] text-[#111111] font-medium">
                      💼 {profileSummary.preferences.workModes.join(", ")}
                    </span>
                  )}
                {profileSummary.preferences?.minSalary && (
                  <span className="px-2 py-0.5 bg-white border border-[#DFDFDF] rounded-[3px] text-[#0A8A00] font-bold">
                    💰 Min {profileSummary.preferences.minSalary}
                  </span>
                )}
              </div>
              <Link
                href="/dashboard/profile"
                className="text-[#003399] font-bold hover:underline flex items-center gap-1 ml-auto"
              >
                Update Preferences ↗
              </Link>
            </div>
          )}
        </div>

        {/* Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
              Job Title / Keywords
            </label>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Senior Full Stack Engineer (React, Node.js)"
              className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
              Location
            </label>
            <input
              type="text"
              value={aiLocation}
              onChange={(e) => setAiLocation(e.target.value)}
              placeholder="e.g. Dubai, UAE / Gulf or Remote"
              className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleRunAiSearch}
            disabled={aiSearching}
            className="nordic-btn-primary h-11 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tap-active"
          >
            {aiSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching Naukri Gulf, Indeed & LinkedIn...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search Live Jobs</span>
              </>
            )}
          </button>

          {aiJobs.length > 0 && (
            <button
              type="button"
              onClick={handleSaveAllAiJobs}
              disabled={savingAll}
              className="nordic-btn-yellow h-11 px-5 text-xs font-bold uppercase tracking-wide cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 tap-active"
            >
              {savingAll ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                  <span>Saving All...</span>
                </>
              ) : (
                <>
                  <span>+ Save All ({aiJobs.length}) to My Jobs</span>
                </>
              )}
            </button>
          )}
        </div>

        {aiSearchError && (
          <div className="p-3 bg-[#CC0008]/10 text-[#CC0008] border border-[#CC0008] rounded-[4px] text-xs font-semibold">
            {aiSearchError}
          </div>
        )}

        {/* Results List */}
        {aiSearching && (
          <div className="space-y-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 border border-[#DFDFDF] bg-white rounded-[4px] animate-pulse" />
            ))}
          </div>
        )}

        {!aiSearching && aiJobs.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs text-[#767676] font-semibold border-b border-[#DFDFDF] pb-2">
              <span>FOUND {aiJobs.length} OPENINGS</span>
              <span>CLICK &ldquo;SAVE TO MY JOBS&rdquo; TO ADD TO YOUR DASHBOARD</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {aiJobs.map((j, idx) => {
                const isSaved = savedAiIndices.has(idx);
                const isSaving = savingAiIndex === idx;

                const sourceBadge =
                  j.source?.toLowerCase().includes("naukri")
                    ? { name: "Naukri Gulf", bg: "bg-[#0A8A00]", text: "text-white" }
                    : j.source?.toLowerCase().includes("indeed")
                    ? { name: "Indeed", bg: "bg-[#003399]", text: "text-white" }
                    : j.source?.toLowerCase().includes("linkedin")
                    ? { name: "LinkedIn", bg: "bg-[#0077B5]", text: "text-white" }
                    : { name: j.source?.toUpperCase() || "WEB", bg: "bg-[#111111]", text: "text-white" };

                return (
                  <div
                    key={idx}
                    className="border border-[#DFDFDF] rounded-[4px] p-5 bg-white hover:border-[#003399] transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold ${sourceBadge.bg} ${sourceBadge.text}`}>
                              {sourceBadge.name}
                            </span>
                            <span className="text-xs font-semibold text-[#767676]">
                              {j.company || "Enterprise Employer"}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#111111]">
                            {j.title}
                          </h3>
                        </div>

                        {j.matchScore && (
                          <div className="px-2.5 py-1 bg-[#003399] text-white font-mono text-xs font-bold rounded-[3px] shrink-0">
                            {j.matchScore}% Match
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#484848] leading-relaxed line-clamp-2 mb-3">
                        {j.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#767676]">
                        <span>📍 {j.location || "Remote / Gulf"}</span>
                        {j.salary && <span>💰 {j.salary}</span>}
                        <span>🏷️ {j.jobType || "Full-time"}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#DFDFDF] flex flex-wrap items-center justify-between gap-3">
                      {j.sourceUrl ? (
                        <a
                          href={j.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#003399] hover:underline flex items-center gap-1"
                        >
                          View Listing on {sourceBadge.name} ↗
                        </a>
                      ) : (
                        <span className="text-xs text-[#767676]">Portal Listing</span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleSaveAiJob(j, idx)}
                        disabled={isSaved || isSaving}
                        className={`h-9 px-4 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                          isSaved
                            ? "bg-[#0A8A00] text-white cursor-default"
                            : "nordic-btn-yellow"
                        }`}
                      >
                        {isSaving
                          ? "Saving..."
                          : isSaved
                          ? "✓ Saved to My Jobs"
                          : "+ Save to My Jobs"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!aiSearching && aiJobs.length === 0 && (
          <div className="border border-dashed border-[#DFDFDF] p-8 text-center rounded-[4px] bg-[#F5F5F5] text-xs text-[#767676]">
            <p className="font-bold text-[#111111] text-sm mb-1">
              Ready to discover matching jobs
            </p>
            <p className="max-w-md mx-auto">
              Click &ldquo;Search Live Jobs&rdquo; above to query live postings from Naukri Gulf, Indeed, LinkedIn, and company career portals.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
