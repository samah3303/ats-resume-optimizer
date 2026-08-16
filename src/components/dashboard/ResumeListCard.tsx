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
    <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden text-black shadow-sm">
      <div className="flex items-center justify-between p-5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold text-black uppercase tracking-wider">
            Saved Resumes
          </h2>
          <span className="text-xs text-zinc-500">
            (Primary resume drives baseline analysis & roadmap)
          </span>
        </div>
        <Link
          href="/dashboard/resumes"
          className="text-xs font-bold text-black hover:underline"
        >
          Manage All ({resumes.length})
        </Link>
      </div>

      {resumes.length === 0 ? (
        <div className="py-8 text-center px-6">
          <p className="text-xs text-zinc-500 mb-3">
            No resumes uploaded yet.
          </p>
          <Link
            href="/dashboard/resumes"
            className="text-xs text-black font-bold hover:underline"
          >
            + Upload your first resume
          </Link>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resumes.slice(0, 6).map((res) => (
            <div
              key={res.id}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                res.isPrimary
                  ? "bg-zinc-50 border-black text-black shadow-sm"
                  : "bg-white border-zinc-200 text-zinc-800 hover:border-black"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-black truncate">
                      📄 {res.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Uploaded {new Date(res.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {res.isPrimary ? (
                  <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-bold rounded-full shrink-0">
                    ⭐ Primary
                  </span>
                ) : (
                  onChangePrimary && (
                    <button
                      onClick={() => onChangePrimary(res.id)}
                      className="text-[11px] font-bold text-black hover:underline shrink-0"
                      title="Make this your primary resume (triggers re-analysis & roadmap update)"
                    >
                      Make Primary
                    </button>
                  )
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 text-xs">
                <span className="text-zinc-500 text-[10px]">
                  {res.isPrimary ? "Drives Onboarding Analysis" : "Saved Resume"}
                </span>
                <Link
                  href={`/dashboard/resumes`}
                  className="text-xs font-bold text-black hover:underline"
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
