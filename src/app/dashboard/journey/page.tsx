import Link from "next/link";

export default function JourneyPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6 pb-24">
      <div className="bg-white border border-zinc-200 hover:border-black rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-sm transition-all space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-3xl mx-auto shadow-sm">
          🗺️
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300 font-bold text-xs">
            Career Journey Track
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Job Search Journey
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Your end-to-end execution roadmap from resume baseline optimization to Day 1 onboarding.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
          <Link
            href="/dashboard/roadmap"
            className="p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-black rounded-2xl transition-all shadow-sm group"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">Weekly Sprint</span>
            <span className="text-xs font-bold text-black block mt-0.5 group-hover:underline">
              8-Week AI Action Plan &rarr;
            </span>
          </Link>
          <Link
            href="/dashboard/tracker"
            className="p-4 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-black rounded-2xl transition-all shadow-sm group"
          >
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">Pipeline</span>
            <span className="text-xs font-bold text-black block mt-0.5 group-hover:underline">
              Application Tracker &rarr;
            </span>
          </Link>
        </div>

        <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-bold text-zinc-600 hover:text-black transition-colors flex items-center gap-1"
          >
            <span>&larr;</span> Back to Dashboard
          </Link>

          <Link
            href="/dashboard/roadmap"
            className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border border-black shadow-sm transition-all"
          >
            Open 8-Week Roadmap &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
