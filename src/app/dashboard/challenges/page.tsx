import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CHALLENGES } from "@/lib/challenges/data";

export const metadata = {
  title: "Coding Challenges & Assessment Sandbox | OmniJob AI",
  description: "Practice algorithmic and system design interview challenges with real-time test execution and AI Big-O complexity feedback.",
};

export default async function ChallengesHubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }

  const difficulties = ["All", "Easy", "Medium", "Hard"];
  const categories = [
    "All",
    "Arrays & Hashing",
    "Stack",
    "Dynamic Programming",
    "Sliding Window",
    "Trees & Graphs",
    "System Design",
  ];

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case "Easy":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "Medium":
        return "bg-amber-50 text-amber-700 border-amber-300";
      case "Hard":
        return "bg-rose-50 text-rose-700 border-rose-300";
      default:
        return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 pb-28">
      {/* Top Breadcrumb & Hero Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-black">Coding Assessment Sandbox</span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight flex items-center gap-3">
              <span>Coding Challenge & Assessment Sandbox</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-3xl mt-1.5 leading-relaxed">
              Sharpen your technical interview readiness with in-browser multi-language execution, algorithmic unit testing, and instant AI Big-O complexity reviews.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-black" />
              {CHALLENGES.length} Curated Challenges
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Total Challenges
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black font-mono mt-2">
            {CHALLENGES.length}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1">DSA & System Design</span>
        </div>

        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Easy Problems
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono mt-2">
            {CHALLENGES.filter((c) => c.difficulty === "Easy").length}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1">Fundamental Concepts</span>
        </div>

        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Medium Problems
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 font-mono mt-2">
            {CHALLENGES.filter((c) => c.difficulty === "Medium").length}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1">Core Tech Interview Standard</span>
        </div>

        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            AI Complexity Coach
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black font-mono mt-2">
            Active
          </div>
          <span className="text-[11px] text-zinc-500 mt-1">Real-time Big-O feedback</span>
        </div>
      </div>

      {/* Challenges List Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div>
            <h3 className="text-base sm:text-lg font-black text-black">
              Algorithmic Problem Catalog
            </h3>
            <p className="text-xs text-zinc-600">
              Select a challenge to launch the split-screen coding sandbox.
            </p>
          </div>
        </div>

        {/* Problems Table / Grid */}
        <div className="divide-y divide-zinc-200">
          {CHALLENGES.map((challenge, idx) => (
            <div
              key={challenge.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50 p-3 rounded-2xl transition-all group"
            >
              <div className="flex items-start sm:items-center gap-3">
                <span className="text-xs font-mono font-bold text-zinc-400 w-6 shrink-0 mt-0.5 sm:mt-0">
                  {idx + 1}.
                </span>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/challenges/${challenge.slug}`}
                      className="text-sm font-black text-black hover:underline group-hover:text-black"
                    >
                      {challenge.title}
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-wider ${getDifficultyBadge(
                        challenge.difficulty
                      )}`}
                    >
                      {challenge.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-100 border border-zinc-200 text-zinc-700">
                      {challenge.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <span className="text-xs font-mono text-zinc-500 font-bold">
                  {challenge.acceptanceRate}%
                </span>

                <Link
                  href={`/dashboard/challenges/${challenge.slug}`}
                  className="touch-target px-4 py-2 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>Code</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
