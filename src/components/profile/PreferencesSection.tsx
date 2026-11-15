"use client";

interface PreferencesSectionProps {
  prefPlatforms: string[];
  togglePlatform: (platformId: string) => void;
  prefLocations: string[];
  newPrefLocation: string;
  setNewPrefLocation: (val: string) => void;
  addPrefLocation: (locToAdd?: string) => void;
  removePrefLocation: (locToRemove: string) => void;
  prefWorkModes: string[];
  toggleWorkMode: (mode: string) => void;
  prefMinSalary: string;
  setPrefMinSalary: (val: string) => void;
  prefExpLevel: string;
  setPrefExpLevel: (val: string) => void;
}

export default function PreferencesSection({
  prefPlatforms,
  togglePlatform,
  prefLocations,
  newPrefLocation,
  setNewPrefLocation,
  addPrefLocation,
  removePrefLocation,
  prefWorkModes,
  toggleWorkMode,
  prefMinSalary,
  setPrefMinSalary,
  prefExpLevel,
  setPrefExpLevel,
}: PreferencesSectionProps) {
  return (
    <div className="bg-[#F9FAFB] border border-nordic-border rounded-[6px] p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-nordic-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-nordic-primary" />
            <h2 className="text-lg font-bold text-nordic-text">
              Job Search Preferences
            </h2>
          </div>
          <p className="text-xs text-nordic-text-secondary mt-0.5">
            The AI Job Finder searches these platforms and locations automatically to match your profile.
          </p>
        </div>
        <span className="text-[11px] font-bold text-nordic-primary bg-nordic-primary/10 px-2.5 py-1 rounded-[3px] self-start sm:self-auto">
          Used in AI Job Finder
        </span>
      </div>

      {/* Preferred Platforms */}
      <div>
        <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
          Target Job Platforms
        </label>
        <p className="text-xs text-nordic-neutral mb-3">
          Select platforms you want to search. We include Gulf and international job boards.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {[
            {
              id: "naukrigulf",
              name: "Naukri Gulf",
              desc: "Gulf & Middle East openings",
              accent: "#0A8A00",
            },
            {
              id: "indeed",
              name: "Indeed",
              desc: "Global & regional job listings",
              accent: "#003399",
            },
            {
              id: "linkedin",
              name: "LinkedIn",
              desc: "Worldwide professional roles",
              accent: "#0077B5",
            },
            {
              id: "greenhouse_lever",
              name: "Greenhouse / Lever",
              desc: "Direct company portals",
              accent: "#FF9900",
            },
          ].map((plat) => {
            const active = prefPlatforms.includes(plat.id);
            return (
              <button
                key={plat.id}
                type="button"
                onClick={() => togglePlatform(plat.id)}
                className={`p-3 rounded-[4px] border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  active
                    ? "bg-white border-nordic-primary shadow-xs ring-1 ring-nordic-primary"
                    : "bg-nordic-bg border-nordic-border opacity-60 hover:opacity-85"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-nordic-text flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: active ? plat.accent : "#999" }}
                    />
                    {plat.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] ${
                      active
                        ? "bg-nordic-primary text-white"
                        : "bg-nordic-border text-nordic-neutral"
                    }`}
                  >
                    {active ? "Active" : "Off"}
                  </span>
                </div>
                <span className="text-[11px] text-nordic-neutral">
                  {plat.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Locations */}
      <div>
        <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
          Target Locations
        </label>
        <p className="text-xs text-nordic-neutral mb-2.5">
          Add cities, countries, or &quot;Remote&quot; where you want to work.
        </p>

        {/* Quick Add Suggestions */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          <span className="text-[11px] font-bold text-nordic-neutral mr-1 shrink-0">
            Quick Add:
          </span>
          {[
            "Dubai, UAE",
            "Abu Dhabi, UAE",
            "Riyadh, Saudi Arabia",
            "Doha, Qatar",
            "Remote",
            "India",
            "Worldwide",
          ].map((sug) => {
            const already = prefLocations.includes(sug);
            return (
              <button
                key={sug}
                type="button"
                disabled={already}
                onClick={() => addPrefLocation(sug)}
                className={`text-[11px] px-2.5 py-1 rounded-[3px] border font-medium transition-colors shrink-0 whitespace-nowrap tap-active ${
                  already
                    ? "bg-nordic-border/40 border-transparent text-[#999] cursor-default"
                    : "bg-white border-nordic-border text-nordic-text hover:border-nordic-primary hover:text-nordic-primary cursor-pointer"
                }`}
              >
                {already ? "✓ " : "+ "}
                {sug}
              </button>
            );
          })}
        </div>

        {/* Input for custom location */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newPrefLocation}
            onChange={(e) => setNewPrefLocation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPrefLocation();
              }
            }}
            placeholder="Add custom location (e.g. Berlin, Germany or Worldwide)"
            className="flex-1 h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
          />
          <button
            type="button"
            onClick={() => addPrefLocation()}
            className="nordic-btn-yellow h-10 px-4 text-xs font-bold uppercase tracking-wide cursor-pointer"
          >
            + Add
          </button>
        </div>

        {/* Active Location Chips */}
        <div className="flex flex-wrap gap-2 min-h-12 border border-nordic-border p-3 bg-white rounded-[4px]">
          {prefLocations.map((loc) => (
            <span
              key={loc}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-nordic-primary/5 border border-nordic-primary/30 text-xs font-bold text-nordic-primary rounded-[4px]"
            >
              📍 {loc}
              {prefLocations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removePrefLocation(loc)}
                  className="text-nordic-neutral hover:text-nordic-error font-bold cursor-pointer ml-1 text-sm leading-none"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Work Mode & Desired Salary & Experience */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
            Work Mode
          </label>
          <div className="flex flex-wrap gap-2">
            {["Remote", "Hybrid", "On-site"].map((mode) => {
              const active = prefWorkModes.includes(mode);
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => toggleWorkMode(mode)}
                  className={`text-xs px-3 py-2 rounded-[4px] border font-bold cursor-pointer transition-colors ${
                    active
                      ? "bg-nordic-primary text-white border-nordic-primary"
                      : "bg-white text-nordic-text-secondary border-nordic-border hover:border-nordic-text"
                  }`}
                >
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
            Minimum Desired Salary
          </label>
          <input
            type="text"
            value={prefMinSalary}
            onChange={(e) => setPrefMinSalary(e.target.value)}
            placeholder="e.g. AED 25,000 / month or $120k"
            className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
            Experience Level
          </label>
          <select
            value={prefExpLevel}
            onChange={(e) => setPrefExpLevel(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
          >
            <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
            <option value="Mid Level (3-5 yrs)">Mid Level (3-5 yrs)</option>
            <option value="Senior Level (6-9 yrs)">Senior Level (6-9 yrs)</option>
            <option value="Lead / Manager (10+ yrs)">Lead / Manager (10+ yrs)</option>
            <option value="Executive / Director">Executive / Director</option>
          </select>
        </div>
      </div>
    </div>
  );
}
