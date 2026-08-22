interface StepAnalyzingProgressProps {
  analyzing: boolean;
  resumeName: string | null;
  positions: string;
  country: string;
  linkedin: string;
  error: string | null;
  onBack: () => void;
  onSubmit: () => void;
}

export default function StepAnalyzingProgress({
  analyzing,
  resumeName,
  positions,
  country,
  linkedin,
  error,
  onBack,
  onSubmit,
}: StepAnalyzingProgressProps) {
  return (
    <div className="text-center text-[#FAFAFA]">
      {analyzing ? (
        <div className="py-8 space-y-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-[#FAFAFA] rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <h2 className="text-xl font-bold text-[#FAFAFA]">
            Analyzing Your Resume Graph
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Our AI is reviewing your experience against your target positions in{" "}
            <span className="text-[#FAFAFA] font-bold">{country}</span>. Calculating your standalone ATS compatibility score and keyword gap analysis...
          </p>
        </div>
      ) : (
        <div className="py-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
              Ready to Launch ATS Analysis
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              We&apos;ll analyze your resume keywords, format compliance, and calculate your standalone ATS compatibility score.
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-[#09090B] border border-[#27272A] rounded-2xl p-5 text-left space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">Resume File</span>
              <span className="font-bold text-[#FAFAFA] font-mono">{resumeName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">Target Positions</span>
              <span className="font-bold text-[#FAFAFA] truncate max-w-[240px]">
                {positions}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-medium">Target Country</span>
              <span className="font-bold text-[#FAFAFA]">{country}</span>
            </div>
            {linkedin && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400 font-medium">LinkedIn Profile</span>
                <span className="font-bold text-[#FAFAFA] truncate max-w-[240px]">
                  {linkedin}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-xs font-bold text-rose-300 animate-in fade-in">
              ⚠️ {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 pt-2 border-t border-[#27272A]">
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-2.5 text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] transition-colors cursor-pointer"
            >
              &larr; Edit Details
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="touch-target px-8 py-3 bg-[#FAFAFA] text-[#09090B] text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-sm border border-[#FAFAFA] cursor-pointer active:scale-95"
            >
              Launch ATS Analysis &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
