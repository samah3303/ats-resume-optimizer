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
      <h2 className="text-xl font-black text-black mb-2">
        Tell Us About Your Goals
      </h2>
      <p className="text-sm text-zinc-600 mb-4">
        This helps us tailor the analysis and roadmap to your specific career
        ambitions.
      </p>

      {/* Auto-fill indicator */}
      {autoFilling && (
        <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl mb-4 text-xs font-semibold text-black">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          AI is extracting details from your resume...
        </div>
      )}

      {/* Uploaded resume info */}
      {resumeName && (
        <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl mb-4">
          <span className="text-black text-base">📄</span>
          <span className="text-xs font-bold text-black truncate">
            {resumeName}
          </span>
          <button
            onClick={onChangeResume}
            className="ml-auto text-xs text-zinc-600 hover:text-black font-semibold underline"
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
            className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide"
          >
            Target Job Positions <span className="text-red-500">*</span>
          </label>
          <input
            id="positions"
            type="text"
            value={positions}
            onChange={(e) => setPositions(e.target.value)}
            placeholder="e.g. Senior Software Engineer, Engineering Manager"
            className="w-full px-4 py-2.5 bg-white text-black border border-zinc-300 rounded-xl text-sm focus:border-black focus:outline-none transition-colors"
          />
          <p className="text-xs text-zinc-500 mt-1">
            💡 Tell us where you want to go — this helps find gaps between your current profile and your dream roles.
          </p>
          {/* Suggested position chips */}
          {suggestedPositions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-zinc-600 font-medium mb-1.5">
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
                      className={`px-3 py-1 text-xs rounded-full border transition-colors font-medium ${
                        isSelected
                          ? "bg-black text-white border-black"
                          : "bg-white text-zinc-800 border-zinc-300 hover:border-black"
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
              className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide"
            >
              Target Industry <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2.5 bg-white text-black border border-zinc-300 rounded-xl text-sm focus:border-black focus:outline-none transition-colors"
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
              className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide"
            >
              Target Country <span className="text-red-500">*</span>
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 bg-white text-black border border-zinc-300 rounded-xl text-sm focus:border-black focus:outline-none transition-colors"
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
          <label className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide">
            Job Type Preferences{" "}
            <span className="text-zinc-400 font-normal lowercase">(optional)</span>
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
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors font-medium ${
                    selected
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-800 border-zinc-300 hover:border-black"
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
              className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide"
            >
              LinkedIn URL <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="linkedin"
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="linkedin.com/in/..."
              className="w-full px-4 py-2.5 bg-white text-black border border-zinc-300 rounded-xl text-sm focus:border-black focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="portfolio"
              className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide"
            >
              Portfolio URL <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="portfolio"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="yourportfolio.com"
              className="w-full px-4 py-2.5 bg-white text-black border border-zinc-300 rounded-xl text-sm focus:border-black focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="github"
              className="block text-xs font-bold text-black mb-1.5 uppercase tracking-wide"
            >
              GitHub URL <span className="text-zinc-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              id="github"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="github.com/username"
              className="w-full px-4 py-2.5 bg-white text-black border border-zinc-300 rounded-xl text-sm focus:border-black focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-8">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-black transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={onSkip}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-black transition-colors"
          >
            Skip for now
          </button>
        </div>
        <button
          onClick={onNext}
          disabled={!positions.trim() || !country}
          className="px-6 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm border border-black"
        >
          Start Analysis
        </button>
      </div>
    </div>
  );
}
