import Link from "next/link";

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-6 pb-24">
      <div className="bg-white border border-zinc-200 hover:border-black rounded-3xl p-8 sm:p-10 max-w-lg w-full text-center shadow-sm transition-all space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-3xl mx-auto shadow-sm">
          💰
        </div>
        <div className="space-y-2">
          <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300 font-bold text-xs">
            Compensation Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Offer Evaluation & Negotiation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Compare job offers side-by-side, calculate total compensation packages (Base + Bonus + Equity), and receive AI-powered negotiation scripts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">Feature 1</span>
            <span className="text-xs font-bold text-black block mt-0.5">Total Comp Model</span>
          </div>
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">Feature 2</span>
            <span className="text-xs font-bold text-black block mt-0.5">Equity Vesting</span>
          </div>
          <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">Feature 3</span>
            <span className="text-xs font-bold text-black block mt-0.5">Counter Scripts</span>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-200 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-bold text-zinc-600 hover:text-black transition-colors flex items-center gap-1"
          >
            <span>&larr;</span> Back to Dashboard
          </Link>

          <Link
            href="/dashboard/tools"
            className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border border-black shadow-sm transition-all"
          >
            Explore Tools &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
