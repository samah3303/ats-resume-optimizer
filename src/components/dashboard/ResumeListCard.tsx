import Link from "next/link";
import { Resume } from "@/types/dashboard";

interface ResumeListCardProps {
  resumes: Resume[];
  onChangePrimary?: (resumeId: string) => void;
}

export default function ResumeListCard({
  resumes,
  onChangePrimary,
}: ResumeListCardProps) {
  return (
    <div className="card-premium overflow-hidden mb-6 dark:bg-slate-800 dark:border-slate-700">
      <div className="flex items-center justify-between p-5 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Saved Resumes
          </h2>
          <span className="text-xs text-slate-400">
            (Primary resume drives baseline analysis & roadmap)
          </span>
        </div>
        <Link
          href="/dashboard/resumes"
          className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
        >
          Manage All ({resumes.length})
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="py-8 text-center px-6">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            No resumes uploaded yet.
          </p>
          <Link
            href="/dashboard/resumes"
            className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
          >
            + Upload your first resume
          </Link>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resumes.slice(0, 6).map((res) => (
            <div
              key={res.id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                res.isPrimary
                  ? "bg-indigo-50/70 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700/60 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-700/50 border-slate-200/80 dark:border-slate-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      📄 {res.name}
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Uploaded {new Date(res.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {res.isPrimary ? (
                  <span className="px-2 py-0.5 bg-indigo-600 text-white text-[10px] font-bold rounded-full shrink-0">
                    ⭐ Primary
                  </span>
                ) : (
                  onChangePrimary && (
                    <button
                      onClick={() => onChangePrimary(res.id)}
                      className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:underline shrink-0"
                      title="Make this your primary resume (triggers re-analysis & roadmap update)"
                    >
                      Make Primary
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 dark:border-slate-700/50 text-xs">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {res.isPrimary ? "Drives Onboarding Analysis" : "Saved Resume"}
                </span>
                <Link
                  href={`/dashboard/resumes`}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
