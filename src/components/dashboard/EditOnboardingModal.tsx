"use client";

import { useState } from "react";
import { COUNTRIES, INDUSTRIES, JOB_TYPES } from "@/components/home/constants";
import { Resume, OnboardingProfileData } from "@/types/dashboard";

interface EditOnboardingModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  resumes: Resume[];
  profile: OnboardingProfileData | null;
}

export default function EditOnboardingModal({
  open,
  onClose,
  onSaved,
  resumes,
  profile,
}: EditOnboardingModalProps) {
  const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];

  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    profile?.resumeId || primaryResume?.id || ""
  );
  const [positions, setPositions] = useState<string>(
    profile?.targetPositions || ""
  );
  const [country, setCountry] = useState<string>(
    profile?.targetCountry || "United Arab Emirates"
  );
  const [industry, setIndustry] = useState<string>(
    profile?.industry || ""
  );
  const [jobType, setJobType] = useState<string>(
    profile?.jobType || ""
  );
  const [linkedin, setLinkedin] = useState<string>(
    profile?.linkedinUrl || ""
  );
  const [portfolioUrl, setPortfolioUrl] = useState<string>(
    profile?.portfolioUrl || ""
  );
  const [githubUrl, setGithubUrl] = useState<string>(
    profile?.githubUrl || ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const isChangingPrimary = selectedResumeId !== (profile?.resumeId || primaryResume?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResumeId || !positions.trim() || !country) {
      setError("Primary resume, target positions, and country are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          targetPositions: positions
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          targetCountry: country,
          linkedinUrl: linkedin.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          industry: industry || undefined,
          jobType: jobType || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update onboarding");
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>✏️</span> Edit Onboarding & Target Goals
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update your primary resume and target preferences to recalculate your baseline ATS score.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Informational notification banner */}
        <div className="mt-4 p-3.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800/50 rounded-xl text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
          <strong>ℹ️ Re-Analysis Notice:</strong> Saving changes will mark your selected resume as your <strong>Primary Resume</strong>, re-run AI onboarding analysis, update your General ATS Baseline score, and regenerate your 8-week career roadmap.
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Primary Resume Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Primary Resume <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  📄 {r.name} {r.isPrimary ? " (Current Primary)" : ""}
                </option>
              ))}
            </select>
            {isChangingPrimary && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-semibold">
                ⚠️ Changing your Primary Resume will re-analyze your profile baseline and regenerate your roadmap.
              </p>
            )}
          </div>

          {/* Target Job Positions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Target Job Positions <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={positions}
              onChange={(e) => setPositions(e.target.value)}
              placeholder="e.g. Senior Software Engineer, Founding Engineer"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* Country + Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Country <span className="text-red-500">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Target Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select industry...</option>
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Job Type Preferences */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Job Types
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
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      selected
                        ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {selected ? "✓ " : "+ "}
                    {jt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="yourportfolio.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="github.com/..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-lg text-xs text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Regenerating Analysis...
                </>
              ) : (
                "Save & Regenerate Analysis"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
