"use client";

import Link from "next/link";

interface JobItem {
  id: string;
  title: string;
  company: string | null;
  matchScore: number | null;
}

interface RecommendedJobsTileProps {
  jobs: JobItem[];
}

export default function RecommendedJobsTile({ jobs }: RecommendedJobsTileProps) {
  const displayJobs = jobs.slice(0, 3);

  return (
    <div className="nordic-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DFDFDF] mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#FFDA1A] rounded-[2px]" />
            <h3 className="text-sm font-bold text-[#111111] uppercase tracking-wide">
              Job Matches
            </h3>
          </div>
          <span className="text-xs font-mono text-[#003399] font-semibold">MATCHED</span>
        </div>

        {displayJobs.length === 0 ? (
          <div className="p-6 border border-dashed border-[#DFDFDF] rounded-[4px] text-center text-xs my-4 text-[#767676] bg-[#F5F5F5]">
            No jobs added yet. Paste a job link or save a job to see your match score.
          </div>
        ) : (
          <div className="space-y-2.5 my-4">
            {displayJobs.map((job) => (
              <Link
                key={job.id}
                href={`/dashboard/jobs/${job.id}`}
                className="block border border-[#DFDFDF] p-3 rounded-[4px] hover:border-[#003399] hover:shadow-xs transition-all bg-white group"
              >
                <div className="flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-bold text-xs text-[#111111] block truncate group-hover:text-[#003399] transition-colors">
                      {job.title}
                    </span>
                    <span className="text-[11px] text-[#767676] block truncate">
                      {job.company || "Enterprise Employer"}
                    </span>
                  </div>
                  {job.matchScore !== null && (
                    <span className="px-2 py-0.5 bg-[#003399] text-white font-mono text-[11px] font-bold rounded-[2px] shrink-0">
                      {job.matchScore}%
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[#DFDFDF] mt-2">
        <Link
          href="/dashboard/jobs"
          className="nordic-btn-primary w-full text-xs h-10 font-bold uppercase tracking-wide text-center flex items-center justify-center"
        >
          View All Jobs
        </Link>
      </div>
    </div>
  );
}
