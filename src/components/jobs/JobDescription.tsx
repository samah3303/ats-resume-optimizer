"use client";

import { JobListing } from "@/types";

interface JobDescriptionProps {
  job: JobListing;
}

export default function JobDescription({ job }: JobDescriptionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-nordic-text border-b border-nordic-border pb-2 mb-4">
          Full Description
        </h2>
        <div className="whitespace-pre-line text-sm leading-relaxed text-nordic-text">
          {job.description || "No full description provided."}
        </div>
      </div>

      {Array.isArray(job.requirements) && job.requirements.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-nordic-text border-b border-nordic-border pb-2 mb-4">
            Key Requirements
          </h2>
          <ul className="space-y-2 text-xs">
            {job.requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-nordic-primary mt-1.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="text-nordic-text leading-relaxed">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {Array.isArray(job.skills) && job.skills.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-nordic-text border-b border-nordic-border pb-2 mb-4">
            Required & Target Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-nordic-bg border border-nordic-border text-xs font-semibold rounded-[4px] text-nordic-text"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
