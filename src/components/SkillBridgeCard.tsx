"use client";

interface SkillBridgeProps {
  missingSkills: string[];
}

export default function SkillBridgeCard({ missingSkills }: SkillBridgeProps) {
  if (!missingSkills || missingSkills.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4 text-black">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold text-lg border border-zinc-200">
          🎓
        </div>
        <div>
          <h3 className="text-base font-black text-black">Skill Gap Remediation & Free Project Hub</h3>
          <p className="text-xs text-zinc-500">
            Close missing keyword gaps fast with free resources and weekend proof-of-work projects.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missingSkills.slice(0, 6).map((skill, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 hover:border-black transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-200 text-black">
                {skill}
              </span>
              <span className="text-[11px] font-medium text-zinc-500">Missing Gap</span>
            </div>

            <p className="text-xs text-zinc-700 leading-snug">
              <strong className="text-black">Weekend Project Blueprint:</strong> Build a micro <em>{skill}</em> project to demonstrate on your resume.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://www.youtube.com/results?search_query=free+${encodeURIComponent(skill)}+crash+course+for+beginners`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-black bg-white hover:bg-zinc-100 px-2.5 py-1 rounded-xl border border-zinc-300 flex items-center gap-1 transition-colors shadow-sm"
              >
                ▶️ Free YouTube Course
              </a>
              <a
                href={`https://github.com/search?q=${encodeURIComponent(skill)}+starter+project`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-black bg-white hover:bg-zinc-100 px-2.5 py-1 rounded-xl border border-zinc-300 flex items-center gap-1 transition-colors shadow-sm"
              >
                🐙 GitHub Projects
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
