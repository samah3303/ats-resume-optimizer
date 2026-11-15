"use client";

import { ExperienceEntry } from "@/types";

interface ExperienceSectionProps {
  experience: ExperienceEntry[];
  addExperience: () => void;
  updateExperience: (
    index: number,
    field: keyof ExperienceEntry,
    value: string
  ) => void;
  removeExperience: (index: number) => void;
}

export default function ExperienceSection({
  experience,
  addExperience,
  updateExperience,
  removeExperience,
}: ExperienceSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-nordic-border pb-2">
        <div>
          <h2 className="text-lg font-bold text-nordic-text">
            Work Experience & Career History
          </h2>
          <p className="text-xs text-nordic-neutral mt-0.5">
            Positions extracted from your resume. AI Job Finder uses this to match seniority and skills.
          </p>
        </div>
        <button
          type="button"
          onClick={addExperience}
          className="nordic-btn-yellow h-9 px-3.5 text-xs font-bold uppercase tracking-wide cursor-pointer tap-active shrink-0"
        >
          + Add Position
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="p-6 border border-dashed border-nordic-border rounded-[4px] text-center text-xs text-nordic-neutral bg-[#F9FAFB]">
          No positions added yet. Click &ldquo;+ Add Position&rdquo; or upload a resume to extract your history.
        </div>
      ) : (
        <div className="space-y-4">
          {experience.map((exp, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 border border-nordic-border rounded-xl sm:rounded-[4px] bg-[#F9FAFB] space-y-3"
            >
              <div className="flex items-center justify-between border-b border-nordic-border pb-2">
                <span className="text-xs font-bold uppercase text-nordic-primary">
                  Position #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeExperience(idx)}
                  className="text-xs text-nordic-error hover:underline font-bold cursor-pointer"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-nordic-text uppercase tracking-wide mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={exp.title || ""}
                    onChange={(e) => updateExperience(idx, "title", e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-nordic-text uppercase tracking-wide mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={exp.company || ""}
                    onChange={(e) => updateExperience(idx, "company", e.target.value)}
                    placeholder="e.g. Acme Tech"
                    className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-nordic-text uppercase tracking-wide mb-1">
                    Start Date
                  </label>
                  <input
                    type="text"
                    value={exp.startDate || ""}
                    onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                    placeholder="e.g. 2021-03"
                    className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-nordic-text uppercase tracking-wide mb-1">
                    End Date
                  </label>
                  <input
                    type="text"
                    value={exp.endDate || ""}
                    onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                    placeholder="e.g. Present"
                    className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-nordic-text uppercase tracking-wide mb-1">
                  Responsibilities & Key Achievements
                </label>
                <textarea
                  rows={3}
                  value={exp.description || (Array.isArray(exp.highlights) ? exp.highlights.join("\n") : "")}
                  onChange={(e) => updateExperience(idx, "description", e.target.value)}
                  placeholder="Bullet points and key accomplishments..."
                  className="w-full p-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
