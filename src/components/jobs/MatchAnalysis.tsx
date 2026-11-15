"use client";

import { JobListing } from "@/types";
import { JobDetailTab } from "@/hooks/useJobDetail";

interface MatchAnalysisProps {
  job: JobListing;
  onNavigateToResumeUpdates?: () => void;
}

export default function MatchAnalysis({
  job,
  onNavigateToResumeUpdates,
}: MatchAnalysisProps) {
  const matchScore = job.matchScore ?? 0;
  const isHighFit = matchScore >= 75;
  const isModerateFit = matchScore >= 50 && matchScore < 75;

  return (
    <div className="bg-[#F9FAFB] border border-nordic-border rounded-[6px] p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-nordic-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-nordic-primary" />
            <h3 className="text-base font-bold text-nordic-text">
              Candidate Compatibility Analysis
            </h3>
          </div>
          <p className="text-xs text-nordic-text-secondary mt-0.5">
            Based on your uploaded resume skills, target roles, and work history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-nordic-neutral font-bold uppercase block">
              Match Level
            </span>
            <span
              className={`text-xs font-bold ${
                isHighFit
                  ? "text-nordic-success"
                  : isModerateFit
                  ? "text-nordic-warning"
                  : "text-nordic-error"
              }`}
            >
              {isHighFit ? "High Fit" : isModerateFit ? "Moderate Fit" : "Low Fit"}
            </span>
          </div>
          <div className="px-3.5 py-1.5 bg-white border border-nordic-border rounded-[4px] font-mono text-xl font-bold text-nordic-primary shadow-xs">
            {job.matchScore !== null ? `${matchScore}%` : "N/A"}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-nordic-neutral mb-1.5 font-medium">
          <span>Profile Match</span>
          <span>{job.matchScore !== null ? `${matchScore} / 100` : "Needs Evaluation"}</span>
        </div>
        <div className="w-full h-2.5 bg-nordic-border/50 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isHighFit
                ? "bg-nordic-success"
                : isModerateFit
                ? "bg-nordic-primary"
                : "bg-nordic-warning"
            }`}
            style={{ width: `${Math.min(Math.max(matchScore, 5), 100)}%` }}
          />
        </div>
      </div>

      {/* Recommendations Banner */}
      <div className="p-4 bg-white border border-nordic-border rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-nordic-text leading-relaxed">
          <span className="font-bold text-nordic-primary">Pro Tip: </span>
          {isHighFit
            ? "Your resume strongly matches this job description. Generate a tailored cover letter to stand out."
            : "You can improve your ATS score for this job by injecting missing target keywords into your resume."}
        </div>
        {onNavigateToResumeUpdates && (
          <button
            type="button"
            onClick={onNavigateToResumeUpdates}
            className="nordic-btn-primary text-xs h-9 px-3.5 cursor-pointer font-bold whitespace-nowrap shrink-0 tap-active"
          >
            ⚡ View Resume Fixes
          </button>
        )}
      </div>
    </div>
  );
}
