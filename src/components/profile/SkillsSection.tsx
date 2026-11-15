"use client";

interface SkillsSectionProps {
  skills: string[];
  newSkill: string;
  setNewSkill: (val: string) => void;
  addSkill: () => void;
  removeSkill: (skill: string) => void;
}

export default function SkillsSection({
  skills,
  newSkill,
  setNewSkill,
  addSkill,
  removeSkill,
}: SkillsSectionProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-nordic-text border-b border-nordic-border pb-2 mb-4">
        Skills
      </h2>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder="Add a skill (e.g. React, TypeScript, Python)"
          className="flex-1 h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
        />
        <button
          type="button"
          onClick={addSkill}
          className="nordic-btn-yellow h-11 px-4 text-xs font-bold uppercase tracking-wide cursor-pointer"
        >
          + Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-16 border border-nordic-border p-4 bg-nordic-bg rounded-[4px]">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-nordic-border text-xs font-semibold rounded-[4px] text-nordic-text shadow-2xs"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="text-nordic-neutral hover:text-nordic-error font-bold cursor-pointer ml-1"
            >
              ×
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="text-xs text-nordic-neutral py-2">
            No skills added yet. Type a skill and click &ldquo;+ Add&rdquo; or scan a resume.
          </p>
        )}
      </div>
    </div>
  );
}
