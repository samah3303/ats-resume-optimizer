"use client";

interface PersonalInfoSectionProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  phone: string;
  setPhone: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  targetRoles: string;
  setTargetRoles: (val: string) => void;
  jobType: string;
  setJobType: (val: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (val: string) => void;
  githubUrl: string;
  setGithubUrl: (val: string) => void;
  portfolioUrl: string;
  setPortfolioUrl: (val: string) => void;
  summary: string;
  setSummary: (val: string) => void;
  fieldErrors: Record<string, string>;
  handleFieldChange: (field: string, val: string) => void;
  handleFieldBlur: (field: string, val: string) => void;
}

export default function PersonalInfoSection({
  name,
  setName,
  email,
  phone,
  setPhone,
  location,
  setLocation,
  targetRoles,
  setTargetRoles,
  jobType,
  setJobType,
  linkedinUrl,
  setLinkedinUrl,
  githubUrl,
  setGithubUrl,
  portfolioUrl,
  setPortfolioUrl,
  summary,
  setSummary,
  fieldErrors,
  handleFieldChange,
  handleFieldBlur,
}: PersonalInfoSectionProps) {
  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div>
        <h2 className="text-lg font-bold text-nordic-text border-b border-nordic-border pb-2 mb-4">
          Contact Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="input-name" className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Full Name *
            </label>
            <input
              id="input-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                handleFieldChange("name", e.target.value);
              }}
              onBlur={(e) => handleFieldBlur("name", e.target.value)}
              placeholder="e.g. Alex Morgan"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
              className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm text-nordic-text focus:outline-none transition-colors ${
                fieldErrors.name
                  ? "border-nordic-error focus:border-nordic-error ring-1 ring-nordic-error"
                  : "border-nordic-border focus:border-nordic-primary"
              }`}
            />
            {fieldErrors.name && (
              <p id="name-error" className="mt-1 text-xs text-nordic-error font-semibold flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="input-email" className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              id="input-email"
              type="email"
              disabled
              value={email}
              className="w-full h-11 px-3.5 bg-nordic-bg border border-nordic-border rounded-[4px] text-sm font-mono text-nordic-text-secondary cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="input-phone" className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Phone Number
            </label>
            <input
              id="input-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                handleFieldChange("phone", e.target.value);
              }}
              onBlur={(e) => handleFieldBlur("phone", e.target.value)}
              placeholder="+1 (555) 019-2834"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
              className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm font-mono text-nordic-text focus:outline-none transition-colors ${
                fieldErrors.phone
                  ? "border-nordic-error focus:border-nordic-error ring-1 ring-nordic-error"
                  : "border-nordic-border focus:border-nordic-primary"
              }`}
            />
            {fieldErrors.phone && (
              <p id="phone-error" className="mt-1 text-xs text-nordic-error font-semibold flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {fieldErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="input-location" className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Location
            </label>
            <input
              id="input-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA (or Remote)"
              className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
            />
          </div>
        </div>
      </div>

      {/* Target Roles & Job Type */}
      <div>
        <h2 className="text-lg font-bold text-nordic-text border-b border-nordic-border pb-2 mb-4">
          Target Roles & Job Type
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Target Job Titles (comma separated)
            </label>
            <input
              type="text"
              value={targetRoles}
              onChange={(e) => setTargetRoles(e.target.value)}
              placeholder="Senior Software Engineer, Tech Lead, Frontend Architect"
              className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Job Type
            </label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
            >
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Part-time">Part-time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Social Profiles & Links */}
      <div>
        <h2 className="text-lg font-bold text-nordic-text border-b border-nordic-border pb-2 mb-4">
          Links & Profiles
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="input-linkedin" className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              LinkedIn
            </label>
            <input
              id="input-linkedin"
              type="url"
              value={linkedinUrl}
              onChange={(e) => {
                setLinkedinUrl(e.target.value);
                handleFieldChange("linkedinUrl", e.target.value);
              }}
              onBlur={(e) => handleFieldBlur("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              aria-invalid={Boolean(fieldErrors.linkedinUrl)}
              aria-describedby={fieldErrors.linkedinUrl ? "linkedin-error" : undefined}
              className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm text-nordic-text focus:outline-none transition-colors ${
                fieldErrors.linkedinUrl
                  ? "border-nordic-error focus:border-nordic-error ring-1 ring-nordic-error"
                  : "border-nordic-border focus:border-nordic-primary"
              }`}
            />
            {fieldErrors.linkedinUrl && (
              <p id="linkedin-error" className="mt-1 text-xs text-nordic-error font-semibold flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {fieldErrors.linkedinUrl}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="input-github" className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              GitHub
            </label>
            <input
              id="input-github"
              type="url"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                handleFieldChange("githubUrl", e.target.value);
              }}
              onBlur={(e) => handleFieldBlur("githubUrl", e.target.value)}
              placeholder="https://github.com/username"
              aria-invalid={Boolean(fieldErrors.githubUrl)}
              aria-describedby={fieldErrors.githubUrl ? "github-error" : undefined}
              className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm text-nordic-text focus:outline-none transition-colors ${
                fieldErrors.githubUrl
                  ? "border-nordic-error focus:border-nordic-error ring-1 ring-nordic-error"
                  : "border-nordic-border focus:border-nordic-primary"
              }`}
            />
            {fieldErrors.githubUrl && (
              <p id="github-error" className="mt-1 text-xs text-nordic-error font-semibold flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {fieldErrors.githubUrl}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="input-portfolio" className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
              Portfolio or Website
            </label>
            <input
              id="input-portfolio"
              type="url"
              value={portfolioUrl}
              onChange={(e) => {
                setPortfolioUrl(e.target.value);
                handleFieldChange("portfolioUrl", e.target.value);
              }}
              onBlur={(e) => handleFieldBlur("portfolioUrl", e.target.value)}
              placeholder="https://yourportfolio.com"
              aria-invalid={Boolean(fieldErrors.portfolioUrl)}
              aria-describedby={fieldErrors.portfolioUrl ? "portfolio-error" : undefined}
              className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm text-nordic-text focus:outline-none transition-colors ${
                fieldErrors.portfolioUrl
                  ? "border-nordic-error focus:border-nordic-error ring-1 ring-nordic-error"
                  : "border-nordic-border focus:border-nordic-primary"
              }`}
            />
            {fieldErrors.portfolioUrl && (
              <p id="portfolio-error" className="mt-1 text-xs text-nordic-error font-semibold flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span> {fieldErrors.portfolioUrl}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* About You */}
      <div>
        <h2 className="text-lg font-bold text-nordic-text border-b border-nordic-border pb-2 mb-4">
          About You
        </h2>
        <textarea
          rows={4}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="A brief summary of your work experience, strengths, and what you are looking for next..."
          className="w-full p-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
        />
      </div>
    </div>
  );
}
