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
    <div className="space-y-6 text-[#FAFAFA]">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
          Tell Us About Your Goals
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          This helps us tailor the analysis, keyword coverage, and roadmap to your specific career ambitions.
        </p>
      </div>

      {/* Auto-fill indicator */}
      {autoFilling && (
        <div className="flex items-center gap-2.5 p-3.5 bg-[#09090B] border border-[#27272A] rounded-2xl text-xs font-semibold text-zinc-200 animate-in fade-in">
          <div className="w-4 h-4 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin shrink-0" />
          <span>AI is extracting details from your resume...</span>
        </div>
      )}

      {/* Uploaded resume info */}
      {resumeName && (
        <div className="flex items-center gap-3 p-3.5 bg-[#09090B] border border-[#27272A] rounded-2xl">
          <span className="text-base">📄</span>
          <span className="text-xs font-bold text-[#FAFAFA] truncate">
            {resumeName}
          </span>
          <button
            type="button"
            onClick={onChangeResume}
            className="ml-auto text-xs text-zinc-400 hover:text-[#FAFAFA] font-bold underline transition-colors cursor-pointer"
          >
            Change
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Target Positions */}
        <div className="space-y-1.5">
          <label
            htmlFor="positions"
            className="block text-xs font-bold text-zinc-300 uppercase tracking-wide"
          >
            Target Job Positions <span className="text-rose-400">*</span>
          </label>
          <input
            id="positions"
            type="text"
            value={positions}
            onChange={(e) => setPositions(e.target.value)}
            placeholder="e.g. Staff Engineer, Engineering Manager, Product Lead"
            className="w-full px-4 py-2.5 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs sm:text-sm focus:border-[#FAFAFA] focus:outline-none transition-colors placeholder-zinc-500 font-medium"
          />
          <p className="text-[11px] text-zinc-500">
            💡 Tell us where you want to go — this finds gap metrics between your current profile and target roles.
          </p>

          {/* Suggested position chips */}
          {suggestedPositions.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] text-zinc-400 font-medium">
                🤖 AI-suggested from your resume — click to add/remove:
              </p>
              <div className="flex flex-wrap gap-1.5">
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
                      className={`px-3 py-1 text-xs rounded-xl border transition-all font-bold cursor-pointer ${
                        isSelected
                          ? "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]"
                          : "bg-[#09090B] text-zinc-300 border-[#27272A] hover:border-zinc-500"
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
          <div className="space-y-1.5">
            <label
              htmlFor="industry"
              className="block text-xs font-bold text-zinc-300 uppercase tracking-wide"
            >
              Target Industry <span className="text-zinc-500 font-normal lowercase">(optional)</span>
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs sm:text-sm focus:border-[#FAFAFA] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#18181B] text-[#FAFAFA]">Select industry...</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i} className="bg-[#18181B] text-[#FAFAFA]">
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="country"
              className="block text-xs font-bold text-zinc-300 uppercase tracking-wide"
            >
              Target Country <span className="text-rose-400">*</span>
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs sm:text-sm focus:border-[#FAFAFA] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#18181B] text-[#FAFAFA]">Select a country...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-[#18181B] text-[#FAFAFA]">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Type (multi-select checkboxes) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
            Job Type Preferences{" "}
            <span className="text-zinc-500 font-normal lowercase">(optional)</span>
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
                  className={`px-3 py-1.5 text-xs rounded-xl border transition-all font-bold cursor-pointer ${
                    selected
                      ? "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]"
                      : "bg-[#09090B] text-zinc-300 border-[#27272A] hover:border-zinc-500"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {jt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Social / Portfolio Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-zinc-400 uppercase">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs focus:border-[#FAFAFA] outline-none placeholder-zinc-600"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-zinc-400 uppercase">
              Portfolio URL
            </label>
            <input
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://myportfolio.dev"
              className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs focus:border-[#FAFAFA] outline-none placeholder-zinc-600"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-zinc-400 uppercase">
              GitHub URL
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs focus:border-[#FAFAFA] outline-none placeholder-zinc-600"
            />
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] transition-colors cursor-pointer"
        >
          &larr; Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] transition-colors cursor-pointer"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!positions || !country}
            className="touch-target px-6 py-2.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95 border border-[#FAFAFA]"
          >
            Continue to Analysis &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
