"use client";

import React from "react";
import Link from "next/link";
import { JobListing } from "@/types";

interface JobCardProps {
  job: JobListing;
  onToggleBookmark: (e: React.MouseEvent, job: JobListing) => void;
  onMarkApplied: (e: React.MouseEvent, jobId: string) => void;
}

export const JobCard = React.memo(function JobCard({
  job,
  onToggleBookmark,
  onMarkApplied,
}: JobCardProps) {
  const isHighMatch = job.matchScore !== null && job.matchScore >= 75;
  const isMidMatch =
    job.matchScore !== null &&
    job.matchScore >= 50 &&
    job.matchScore < 75;

  const isApplied = job.applications?.some(
    (a) => a.status === "applied"
  );

  const sourceBadge =
    job.source?.toLowerCase().includes("naukri")
      ? { name: "Naukri Gulf", bg: "bg-nordic-success", text: "text-white" }
      : job.source?.toLowerCase().includes("indeed")
      ? { name: "Indeed", bg: "bg-nordic-primary", text: "text-white" }
      : job.source?.toLowerCase().includes("linkedin")
      ? { name: "LinkedIn", bg: "bg-[#0077B5]", text: "text-white" }
      : job.source?.toLowerCase().includes("greenhouse") || job.source?.toLowerCase().includes("lever")
      ? { name: "Direct Portal", bg: "bg-[#FF9900]", text: "text-white" }
      : null;

  return (
    <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-6 flex flex-col justify-between group hover:border-nordic-primary transition-all">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="truncate">
            <div className="flex items-center gap-2 mb-1">
              {sourceBadge && (
                <span
                  className={`px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold ${sourceBadge.bg} ${sourceBadge.text}`}
                >
                  {sourceBadge.name}
                </span>
              )}
              <span className="text-[11px] font-bold text-nordic-text-secondary uppercase tracking-wider block">
                {job.company || "Enterprise Employer"}
              </span>
            </div>
            <Link
              href={`/dashboard/jobs/${job.id}`}
              className="text-base sm:text-lg font-bold text-nordic-text hover:text-nordic-primary transition-colors truncate block"
            >
              {job.title}
            </Link>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => onToggleBookmark(e, job)}
              aria-label={
                job.isBookmarked
                  ? `Remove bookmark for ${job.title}`
                  : `Bookmark ${job.title}`
              }
              className={`touch-target w-10 h-10 rounded-[4px] border border-nordic-border flex items-center justify-center text-base font-bold transition-colors cursor-pointer tap-active ${
                job.isBookmarked
                  ? "bg-nordic-secondary text-nordic-text border-nordic-secondary"
                  : "bg-white text-nordic-text-secondary hover:text-nordic-text"
              }`}
              title={job.isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
            >
              <span aria-hidden="true">{job.isBookmarked ? "★" : "☆"}</span>
            </button>

            {job.matchScore !== null && (
              <div
                className={`px-2 py-1 font-mono text-[11px] sm:text-xs font-bold rounded-[4px] ${
                  isHighMatch
                    ? "bg-nordic-success text-white"
                    : isMidMatch
                    ? "bg-nordic-secondary text-nordic-text"
                    : "bg-nordic-error text-white"
                }`}
                title={`ATS Match: ${job.matchScore}%`}
              >
                {job.matchScore}% Match
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-nordic-text-secondary line-clamp-2 mb-3 leading-relaxed">
          {job.description || "No full description ingested."}
        </p>
      </div>

      <div className="pt-3 border-t border-nordic-border flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-2 truncate font-medium text-nordic-text-secondary">
          <span>{job.location || "Remote / Gulf"}</span>
          <span>•</span>
          <span className="font-mono text-nordic-text">
            {job.salary || job.jobType}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isApplied ? (
            <span className="px-2.5 py-1 bg-nordic-success/10 text-nordic-success border border-nordic-success/30 rounded-[4px] text-xs font-bold flex items-center gap-1">
              ✓ Applied
            </span>
          ) : (
            <button
              type="button"
              onClick={(e) => onMarkApplied(e, job.id)}
              aria-label={`Mark ${job.title} at ${job.company || "company"} as applied`}
              className="px-2.5 py-1.5 bg-white hover:bg-nordic-primary hover:text-white text-nordic-primary border border-nordic-primary rounded-[4px] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer tap-active min-h-[36px]"
              title="Mark as Applied and add to Tracker"
            >
              ✓ Mark as Applied
            </button>
          )}

          <Link
            href={`/dashboard/jobs/${job.id}`}
            aria-label={`View full details for ${job.title}`}
            className="font-bold text-nordic-primary hover:underline flex items-center gap-1 px-2 py-1.5 min-h-[36px]"
          >
            View ➔
          </Link>
        </div>
      </div>
    </div>
  );
});
