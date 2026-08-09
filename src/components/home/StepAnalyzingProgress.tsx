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
                className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Analyzing Your Resume
          </h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Our AI is reviewing your experience against your target positions in{" "}
            {country}. This takes about 15–30 seconds.
          </p>
        </div>
      ) : (
        <div className="py-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Ready to Analyze
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            We&apos;ll analyze your resume and generate a personalized 8-week
            career roadmap.
          </p>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Resume</span>
              <span className="font-medium text-gray-900">{resumeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Target Positions</span>
              <span className="font-medium text-gray-900 truncate max-w-[200px]">
                {positions}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Target Country</span>
              <span className="font-medium text-gray-900">{country}</span>
            </div>
            {linkedin && (
              <div className="flex justify-between">
                <span className="text-gray-500">LinkedIn</span>
                <span className="font-medium text-gray-900 truncate max-w-[200px]">
                  {linkedin}
                </span>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Edit
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Generate Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
