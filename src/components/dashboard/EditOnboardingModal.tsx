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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn text-zinc-900">
      <div
        className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto space-y-4 text-zinc-900"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-black text-black flex items-center gap-2">
              <span>✏️</span> Edit Onboarding & Target Goals
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Update your primary resume and target preferences to recalculate your baseline ATS score.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-black text-xl font-bold p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Informational notification banner */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-700 leading-relaxed">
          <strong>ℹ️ Re-Analysis Notice:</strong> Saving changes will mark your selected resume as your <strong>Primary Resume</strong>, re-run AI onboarding analysis, update your General ATS Baseline score, and regenerate your 8-week career roadmap.
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Primary Resume Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
              Primary Resume <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-black focus:bg-white transition-colors"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  📄 {r.name} {r.isPrimary ? " (Current Primary)" : ""}
                </option>
              ))}
            </select>
            {isChangingPrimary && (
              <p className="text-xs text-zinc-700 mt-1 font-bold">
                ⚠️ Changing your Primary Resume will re-analyze your profile baseline and regenerate your roadmap.
              </p>
            )}
          </div>

          {/* Target Job Positions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
              Target Job Positions <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={positions}
              onChange={(e) => setPositions(e.target.value)}
              placeholder="e.g. Senior Software Engineer, Founding Engineer"
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
            />
          </div>

          {/* Country + Industry */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                Target Country <span className="text-rose-500">*</span>
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-black focus:outline-none focus:border-black focus:bg-white transition-colors"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
                Target Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-black focus:outline-none focus:border-black focus:bg-white transition-colors"
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
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-900 mb-1.5">
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
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                      selected
                        ? "bg-black text-white border-black font-bold shadow-sm"
                        : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-black"
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
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                Portfolio URL
              </label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                placeholder="yourportfolio.com"
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="github.com/..."
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2 transition-all"
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
