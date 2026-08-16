"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

interface AtsScreeningModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  candidateCount?: number;
  onScreeningCompleted: () => void;
}

export default function AtsScreeningModal({
  open,
  onClose,
  jobId,
  jobTitle,
  candidateCount = 0,
  onScreeningCompleted,
}: AtsScreeningModalProps) {
  const { toast } = useToast();
  const [screening, setScreening] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<any[] | null>(null);

  if (!open) return null;

  const steps = [
    "Parsing Candidate Resume Plaintext & Layout Structure...",
    "Extracting Domain Keywords & Technical Skills...",
    "Calculating Deterministic ATS Keyword Density & Semantic Overlap...",
    "Running LLM Evaluation against Role Requirements...",
    "Generating Recruiter Summary & Fit Scorecards...",
  ];

  const handleStartScreening = async () => {
    setScreening(true);
    setResults(null);
    setStepIndex(0);

    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await fetch(`/api/recruiter/pipeline/${jobId}/screen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      clearInterval(stepInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to complete AI screening");
      }

      const data = await res.json();
      setResults(data.results || []);
      toast(`Successfully screened ${data.screenedCount || 0} candidate(s)!`, "success");
      onScreeningCompleted();
    } catch (err: any) {
      clearInterval(stepInterval);
      toast(err.message || "Screening failed. Please try again.", "error");
    } finally {
      setScreening(false);
    }
  };

  const getFitBadge = (score: number) => {
    if (score >= 85) {
      return "bg-black text-white border-black";
    }
    if (score >= 70) {
      return "bg-zinc-100 text-zinc-900 border-zinc-300";
    }
    return "bg-zinc-100 text-zinc-600 border-zinc-200";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ats-screening-modal-title"
    >
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-zinc-900 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 text-black text-xl flex items-center justify-center font-bold">
              ⚡
            </span>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-black block">
                Batch AI ATS Screener
              </span>
              <h2
                id="ats-screening-modal-title"
                className="text-base sm:text-lg font-black text-black"
              >
                {jobTitle}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        {!screening && !results && (
          <div className="space-y-5">
            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
              <h3 className="text-sm font-black text-black flex items-center gap-2">
                <span>🤖 Autonomous Candidate Evaluation</span>
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                OmniJob AI will evaluate all {candidateCount > 0 ? candidateCount : "pipeline"} candidates for{" "}
                <span className="text-black font-bold">{jobTitle}</span> against the job description & requirements.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-600 pt-1">
                <li className="flex items-center gap-2">
                  <span className="text-black font-bold">✓</span> Computes 0-100% ATS Keyword & Skill Match Score
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-black font-bold">✓</span> Extracts Matched vs Missing Hard Skills
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-black font-bold">✓</span> Generates 2-Sentence Recruiter Executive Summary
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-black font-bold">✓</span> Auto-advances &quot;Applied&quot; applicants to &quot;Screened&quot;
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartScreening}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white transition-all shadow-sm flex items-center gap-2"
              >
                <span>⚡ Run AI ATS Screening</span>
              </button>
            </div>
          </div>
        )}

        {/* Screening Progress State */}
        {screening && (
          <div className="py-8 space-y-6 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-zinc-200 border-t-black animate-spin" />
              <span className="absolute inset-0 flex items-center justify-center text-xl">
                🤖
              </span>
            </div>

            <div className="space-y-2 max-w-md">
              <p className="text-sm font-black text-black">
                {steps[stepIndex]}
              </p>
              <p className="text-xs text-zinc-500">
                Evaluating candidate technical qualifications and matching keywords...
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex gap-2 justify-center w-full max-w-xs">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    i <= stepIndex ? "bg-black shadow-sm" : "bg-zinc-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Screening Results Summary */}
        {results && !screening && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-black text-base font-bold">✅</span>
                <h3 className="text-sm font-black text-black">
                  Screening Completed ({results.length} Evaluated)
                </h3>
              </div>
              <span className="text-xs text-zinc-500">
                Updated in candidate pipeline
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {results.map((cand) => (
                <div
                  key={cand.id}
                  className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-black truncate">
                        {cand.candidateName}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getFitBadge(
                          cand.fitScore
                        )}`}
                      >
                        {cand.fitScore}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 truncate">
                      {cand.fitSummary}
                    </p>
                    {cand.matchedSkills && cand.matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {cand.matchedSkills.slice(0, 4).map((skill: string) => (
                          <span
                            key={skill}
                            className="text-[9px] font-mono px-1.5 py-0.5 bg-white border border-zinc-200 rounded text-zinc-800"
                          >
                            ✓ {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white transition-all shadow-sm"
              >
                Done & View Pipeline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
