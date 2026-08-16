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
    <div className="text-center">
      {analyzing ? (
        <div className="py-8">
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-black rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <h2 className="text-lg font-black text-black mb-2">
            Analyzing Your Resume
          </h2>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto">
            Our AI is reviewing your experience against your target positions in{" "}
            {country}. This takes about 15–30 seconds.
          </p>
        </div>
      ) : (
        <div className="py-8">
          <h2 className="text-xl font-black text-black mb-2">
            Ready to Analyze
          </h2>
          <p className="text-xs text-zinc-600 mb-6">
            We&apos;ll analyze your resume and generate a personalized 8-week
            career roadmap.
          </p>

          {/* Summary */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-left mb-6 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Resume</span>
              <span className="font-bold text-black">{resumeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Target Positions</span>
              <span className="font-bold text-black truncate max-w-[200px]">
                {positions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 font-medium">Target Country</span>
              <span className="font-bold text-black">{country}</span>
            </div>
            {linkedin && (
              <div className="flex justify-between">
                <span className="text-zinc-500 font-medium">LinkedIn</span>
                <span className="font-bold text-black truncate max-w-[200px]">
                  {linkedin}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-black transition-colors"
            >
              ← Edit
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm border border-black"
            >
              Generate Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
