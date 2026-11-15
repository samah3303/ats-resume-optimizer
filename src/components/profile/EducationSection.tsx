"use client";

import { EducationEntry } from "@/types";

interface EducationSectionProps {
  education: EducationEntry[];
  addEducation: () => void;
  updateEducation: (
    index: number,
    field: keyof EducationEntry,
    value: string
  ) => void;
  removeEducation: (index: number) => void;
}

export default function EducationSection({
  education,
  addEducation,
  updateEducation,
  removeEducation,
}: EducationSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-nordic-border pb-2">
        <div>
          <h2 className="text-lg font-bold text-nordic-text">
            Education & Credentials
          </h2>
          <p className="text-xs text-nordic-neutral mt-0.5">
            Degrees, diplomas, and university credentials.
          </p>
        </div>
        <button
          type="button"
          onClick={addEducation}
          className="nordic-btn-yellow h-9 px-3.5 text-xs font-bold uppercase tracking-wide cursor-pointer tap-active shrink-0"
        >
          + Add Education
        </button>
      </div>

      {education.length === 0 ? (
        <div className="p-6 border border-dashed border-nordic-border rounded-[4px] text-center text-xs text-nordic-neutral bg-[#F9FAFB]">
          No education added yet. Click &ldquo;+ Add Education&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {education.map((edu, idx) => (
            <div
              key={idx}
              className="p-4 border border-nordic-border rounded-xl sm:rounded-[4px] bg-[#F9FAFB] space-y-2 relative"
            >
              <button
                type="button"
                onClick={() => removeEducation(idx)}
                className="absolute top-3 right-3 text-xs text-nordic-error hover:underline font-bold cursor-pointer"
              >
                ×
              </button>
              <div>
                <label className="block text-[11px] font-bold text-nordic-text uppercase tracking-wide mb-1">
                  Degree / Program
                </label>
                <input
                  type="text"
                  value={edu.degree || ""}
                  onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                  placeholder="B.S. in Computer Science"
                  className="w-full h-9 px-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-nordic-text uppercase tracking-wide mb-1">
                  Institution / University
                </label>
                <input
                  type="text"
                  value={edu.institution || ""}
                  onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                  placeholder="Stanford University"
                  className="w-full h-9 px-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-nordic-text uppercase tracking-wide mb-1">
                  Graduation Year
                </label>
                <input
                  type="text"
                  value={edu.year || ""}
                  onChange={(e) => updateEducation(idx, "year", e.target.value)}
                  placeholder="e.g. 2020"
                  className="w-full h-9 px-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
