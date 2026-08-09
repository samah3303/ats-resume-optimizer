import { COUNTRIES, INDUSTRIES, JOB_TYPES } from "./constants";

interface StepTargetPreferencesProps {
  autoFilling: boolean;
  resumeName: string | null;
  positions: string;
  setPositions: (val: string) => void;
  suggestedPositions: string[];
  togglePosition: (pos: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  country: string;
  setCountry: (val: string) => void;
  jobType: string;
  setJobType: (val: string) => void;
  linkedin: string;
  setLinkedin: (val: string) => void;
  portfolioUrl: string;
  setPortfolioUrl: (val: string) => void;
  githubUrl: string;
  setGithubUrl: (val: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  onChangeResume: () => void;
}

export default function StepTargetPreferences({
  autoFilling,
  resumeName,
  positions,
  setPositions,
  suggestedPositions,
  togglePosition,
  industry,
  setIndustry,
  country,
  setCountry,
  jobType,
  setJobType,
  linkedin,
  setLinkedin,
  portfolioUrl,
  setPortfolioUrl,
  githubUrl,
  setGithubUrl,
  onBack,
  onSkip,
  onNext,
  onChangeResume,
}: StepTargetPreferencesProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Tell Us About Your Goals
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        This helps us tailor the analysis and roadmap to your specific career
        ambitions.
      </p>

      {/* Auto-fill indicator */}
      {autoFilling && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4 text-sm text-blue-700">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          AI is extracting details from your resume...
        </div>
      )}

      {/* Uploaded resume info */}
      {resumeName && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg mb-4">
          <span className="text-indigo-600">📄</span>
          <span className="text-sm font-medium text-indigo-700">
            {resumeName}
          </span>
          <button
            onClick={onChangeResume}
            className="ml-auto text-xs text-indigo-500 hover:text-indigo-700 underline"
          >
            Change
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Target Positions */}
        <div>
          <label
            htmlFor="positions"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Target Job Positions <span className="text-red-500">*</span>
          </label>
          <input
            id="positions"
            type="text"
            value={positions}
            onChange={(e) => setPositions(e.target.value)}
            placeholder="e.g. Senior Software Engineer, Engineering Manager"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-colors"
          />
          <p className="text-xs text-gray-400 mt-1">
            💡 We already extracted what you&apos;ve done. Tell us where you
            want to go — this helps find gaps between your current profile and
            your dream roles.
          </p>
          {/* Suggested position chips */}
          {suggestedPositions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1.5">
                🤖 AI-suggested from your resume — click to add/remove:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestedPositions.map((pos) => {
                  const isSelected = positions
                    .split(",")
                    .map((p) => p.trim())
                    .includes(pos);
                  return (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => togglePosition(pos)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {pos}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Industry + Country row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="industry"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Target Industry <span className="text-gray-400">(optional)</span>
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white transition-colors"
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Target Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white transition-colors"
            >
              <option value="">Select a country...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Type (multi-select checkboxes) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Job Type Preferences{" "}
            <span className="text-gray-400">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((jt) => {
              const selected = jobType
                .split(",")
                .map((j) => j.trim())
                .includes(jt);
              return (
                <button
                  key={jt}
                  type="button"
                  onClick={() => {
                    const current = jobType
                      .split(",")
                      .map((j) => j.trim())
                      .filter(Boolean);
                    if (current.includes(jt)) {
                      setJobType(current.filter((j) => j !== jt).join(", "));
                    } else {
                      setJobType([...current, jt].join(", "));
                    }
                  }}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    selected
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {jt}
                </button>
              );
            })}
          </div>
        </div>

        {/* LinkedIn, Portfolio, GitHub */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="linkedin"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              LinkedIn URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="linkedin"
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="portfolio"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Portfolio URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="portfolio"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="yourportfolio.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="github"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              GitHub URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="github"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="github.com/username"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip for now
          </button>
        </div>
        <button
          onClick={onNext}
          disabled={!positions.trim() || !country}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Start Analysis
        </button>
      </div>
    </div>
  );
}
