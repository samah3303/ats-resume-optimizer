"use client";

interface SkillBridgeProps {
  missingSkills: string[];
}

export default function SkillBridgeCard({ missingSkills }: SkillBridgeProps) {
  if (!missingSkills || missingSkills.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700 p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center font-bold text-lg border border-emerald-200 dark:border-emerald-700">
          🎓
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Skill Gap Remediation & Free Project Hub</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Close missing keyword gaps fast with free resources and weekend proof-of-work projects.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {missingSkills.slice(0, 6).map((skill, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-slate-600 hover:border-emerald-200 transition-all space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-900 dark:text-emerald-300">
                {skill}
              </span>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Missing Gap</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
              <strong>Weekend Project Blueprint:</strong> Build a micro <em>{skill}</em> project to demonstrate on your resume.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://www.youtube.com/results?search_query=free+${encodeURIComponent(skill)}+crash+course+for+beginners`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-300 px-2.5 py-1 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-1 transition-colors"
              >
                ▶️ Free YouTube Course
              </a>
              <a
                href={`https://github.com/search?q=${encodeURIComponent(skill)}+starter+project`}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-slate-800 hover:text-slate-900 bg-slate-200/70 dark:bg-slate-600 dark:text-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
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
