"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SessionProvider from "@/components/SessionProvider";
import Link from "next/link";
import Logo from "@/components/Logo";

function CompleteProfileContent() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [targetCompanyTier, setTargetCompanyTier] = useState("Tier 1 Tech");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            const initialRole =
              (Array.isArray(data.targetRoles) && data.targetRoles[0]) ||
              data.targetRole ||
              "";
            setTargetRole(initialRole);
            setTargetIndustry(data.targetIndustry || "");
            setTargetCompanyTier(data.targetCompanyTier || "Tier 1 Tech");
            setMinSalary(data.minSalary ? String(data.minSalary) : "");
            setMaxSalary(data.maxSalary ? String(data.maxSalary) : "");
            setSkills(Array.isArray(data.skills) ? data.skills : []);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole,
          targetIndustry,
          targetCompanyTier,
          minSalary: minSalary ? parseInt(minSalary, 10) : null,
          maxSalary: maxSalary ? parseInt(maxSalary, 10) : null,
          skills,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save career target preferences.");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nordic-bg text-sm font-semibold text-nordic-text-secondary">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-nordic-primary border-t-transparent rounded-full animate-spin" />
          <span>Loading Career Target Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-nordic-bg px-4 py-12 selection:bg-nordic-secondary selection:text-nordic-text">
      {/* Brand Header */}
      <Logo size="lg" theme="on-light" subtitle="Career Target Configuration" className="mb-8" />

      <div className="w-full max-w-2xl bg-white border border-nordic-border rounded-[4px] shadow-sm overflow-hidden">
        {/* Accent Bar */}
        <div className="h-1.5 bg-nordic-primary w-full" />

        <div className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-nordic-text tracking-tight">
              Calibrate Career Targets
            </h1>
            <p className="text-sm text-nordic-text-secondary mt-1">
              These preferences configure the ATS matching engine and keyword alignment metrics.
            </p>
          </div>

          {error && (
            <div className="mb-6 border border-nordic-error bg-nordic-error/10 text-nordic-error p-3 rounded-[4px] text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                  Primary Target Role
                </label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Lead Software Engineer"
                  className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                  Target Industry
                </label>
                <input
                  type="text"
                  value={targetIndustry}
                  onChange={(e) => setTargetIndustry(e.target.value)}
                  placeholder="e.g. Cloud Computing / SaaS"
                  className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                  Company Tier
                </label>
                <select
                  value={targetCompanyTier}
                  onChange={(e) => setTargetCompanyTier(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
                >
                  <option value="Tier 1 Tech">Tier 1 Tech / FAANG</option>
                  <option value="Unicorn / High-Growth">High-Growth Unicorn</option>
                  <option value="Enterprise Global">Fortune 500 Enterprise</option>
                  <option value="Seed / Series A">Early Stage Startup</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                  Min Comp ($ / yr)
                </label>
                <input
                  type="number"
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  placeholder="140000"
                  className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm font-mono text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                  Max Comp ($ / yr)
                </label>
                <input
                  type="number"
                  value={maxSalary}
                  onChange={(e) => setMaxSalary(e.target.value)}
                  placeholder="220000"
                  className="w-full h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm font-mono text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
                />
              </div>
            </div>

            {/* Core Competency Chips */}
            <div>
              <label className="block text-xs font-bold text-nordic-text uppercase tracking-wide mb-1.5">
                Core ATS Keywords & Skills
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add skill (e.g. Next.js, Distributed Systems, Docker)"
                  className="flex-1 h-11 px-3.5 bg-white border border-nordic-border rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15 transition-all"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="nordic-btn-yellow h-11 px-4 text-xs font-bold uppercase tracking-wide cursor-pointer"
                >
                  Add Skill
                </button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-12 border border-nordic-border p-3 rounded-[4px] bg-nordic-bg">
                {skills.length === 0 ? (
                  <span className="text-xs text-nordic-neutral self-center">
                    No custom keywords added yet. Type a skill above and press Enter.
                  </span>
                ) : (
                  skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-nordic-border text-xs font-semibold rounded-[4px] text-nordic-text shadow-2xs"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-nordic-neutral hover:text-nordic-error font-bold cursor-pointer ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="nordic-btn-primary w-full h-11 text-sm font-bold tracking-wide mt-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? "Saving preferences..." : "Launch Application Workspace"}
            </button>
          </form>
        </div>

        <div className="border-t border-nordic-border bg-nordic-bg px-6 py-2.5 flex items-center justify-between text-xs text-nordic-neutral">
          <span>Step 2 of 2</span>
          <span className="font-semibold text-nordic-primary">Calibration</span>
        </div>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <SessionProvider>
      <CompleteProfileContent />
    </SessionProvider>
  );
}
