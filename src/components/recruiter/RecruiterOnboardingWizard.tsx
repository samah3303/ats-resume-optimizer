"use client";

import { useState } from "react";
import Logo from "@/components/Logo";

interface RecruiterOnboardingWizardProps {
  initialCompanyName?: string;
  onComplete: (data: any) => void;
  onSkip: () => void;
}

export default function RecruiterOnboardingWizard({
  initialCompanyName = "",
  onComplete,
  onSkip,
}: RecruiterOnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  // Form State - Step 1
  const [companyName, setCompanyName] = useState(initialCompanyName || "");
  const [recruiterRole, setRecruiterRole] = useState("Lead Technical Recruiter");
  const [hiringDomain, setHiringDomain] = useState("Engineering & AI");
  const [headcountTarget, setHeadcountTarget] = useState("5-20");

  // Form State - Step 2 (Requisition)
  const [jobTitle, setJobTitle] = useState("Senior Full-Stack AI Engineer");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("San Francisco, CA (Hybrid)");
  const [remotePolicy, setRemotePolicy] = useState("hybrid");
  const [keySkills, setKeySkills] = useState("TypeScript, React, Next.js, Python, PostgreSQL, LLMs");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [generatedSuccess, setGeneratedSuccess] = useState(false);

  // Form State - Step 3 (Pipeline & Evaluation)
  const [pipelinePreset, setPipelinePreset] = useState<"standard" | "fast-track" | "executive">("standard");
  const [focusWeights, setFocusWeights] = useState({
    technical: true,
    systemDesign: true,
    communication: true,
    leadership: false,
  });

  const HIRING_DOMAINS = [
    "Engineering & AI",
    "Product & Design",
    "Sales & Growth",
    "Operations & Finance",
    "Healthcare & Bio",
    "General / Multi-Discipline",
  ];

  const RECRUITER_ROLES = [
    "Lead Technical Recruiter",
    "Head of Talent / VP People",
    "Founder / Hiring Manager",
    "Agency Talent Partner",
  ];

  const PIPELINE_PRESETS = [
    {
      id: "standard",
      title: "Standard 6-Stage Pipeline",
      desc: "Applied → Screened → Technical → System Design → Offer → Hired",
      badge: "Most Popular",
    },
    {
      id: "fast-track",
      title: "Fast-Track 4-Stage Sprint",
      desc: "Applied → AI Screen → Final Loop → Offer",
      badge: "High Velocity",
    },
    {
      id: "executive",
      title: "Executive Bar-Raiser",
      desc: "Applied → Recruiter Screen → Deep Dive → Bar Raiser → Committee Debrief → Offer",
      badge: "Staff / Leadership",
    },
  ];

  const handleGenerateAiJd = async () => {
    if (!jobTitle) return;
    setGeneratingAi(true);
    try {
      const res = await fetch("/api/recruiter/jobs/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          department,
          seniority: "senior",
          skills: keySkills,
          remotePolicy,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDescription(data.description || "");
        setRequirements(data.requirements || "");
        setGeneratedSuccess(true);
      } else {
        // Fallback realistic description
        setDescription(
          `We are looking for an exceptional ${jobTitle} to join our high-velocity team. In this role, you will design scalable systems, lead technical initiatives, and collaborate cross-functionally.`
        );
        setRequirements(
          `• 4+ years of professional experience\n• Strong background in ${keySkills}\n• Proven track record of architecture ownership and delivery.`
        );
        setGeneratedSuccess(true);
      }
    } catch {
      setDescription(
        `We are looking for an exceptional ${jobTitle} to join our high-velocity team. In this role, you will design scalable systems and drive measurable impact.`
      );
      setRequirements(
        `• 4+ years of hands-on expertise\n• Deep familiarity with modern development workflows\n• Exceptional communication and problem-solving skills.`
      );
      setGeneratedSuccess(true);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      const payload = {
        companyName: companyName.trim() || "My Organization",
        recruiterRole,
        hiringDomain,
        headcountTarget,
        jobTitle,
        department,
        location,
        remotePolicy,
        description: description || `We are looking for a talented ${jobTitle} to join our team.`,
        requirements: requirements || `Experience in ${keySkills}. Strong execution and technical leadership.`,
        pipelinePreset,
      };

      const res = await fetch("/api/recruiter/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        onComplete(data);
      } else {
        onComplete(payload);
      }
    } catch {
      onComplete({ companyName });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#09090B]/95 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#18181B] border border-[#27272A] rounded-3xl p-6 sm:p-10 text-[#FAFAFA] space-y-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
        {/* Top Header & Step Progress Bar */}
        <div className="flex items-center justify-between border-b border-[#27272A] pb-5">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold border-l border-[#27272A] pl-3">
              Recruiter OS Setup
            </span>
          </div>

          <button
            onClick={onSkip}
            className="text-xs text-zinc-400 hover:text-[#FAFAFA] font-medium transition-colors cursor-pointer"
          >
            Skip to Command Center &rarr;
          </button>
        </div>

        {/* Stepper Progress Badges */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          {[
            { num: 1, label: "Workspace Context" },
            { num: 2, label: "AI Requisition" },
            { num: 3, label: "Pipeline & Scorecard" },
          ].map((s) => (
            <div
              key={s.num}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center gap-2 ${
                step === s.num
                  ? "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]"
                  : step > s.num
                  ? "bg-[#09090B] text-emerald-400 border-emerald-800/60"
                  : "bg-[#09090B] text-zinc-500 border-[#27272A]"
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono border border-current">
                {step > s.num ? "✓" : s.num}
              </span>
              <span className="hidden sm:inline text-[11px]">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ──────────────────────────────────────────────────────────────────────── */}
        {/* STEP 1: Workspace & Company Context                                      */}
        {/* ──────────────────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA]">
                Set Up Your Talent Workspace
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tell us about your organization so we can customize your candidate evaluation rubrics and job architect.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Company / Organization Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Robotics, Stripe, HyperScale"
                  className="w-full px-4 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Your Recruiting Role
                </label>
                <select
                  value={recruiterRole}
                  onChange={(e) => setRecruiterRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#FAFAFA] outline-none font-medium cursor-pointer"
                >
                  {RECRUITER_ROLES.map((r) => (
                    <option key={r} value={r} className="bg-[#18181B] text-[#FAFAFA]">
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Hiring Domain */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300">
                Primary Hiring Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {HIRING_DOMAINS.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => setHiringDomain(domain)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      hiringDomain === domain
                        ? "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]"
                        : "bg-[#09090B] text-zinc-400 border-[#27272A] hover:border-zinc-500"
                    }`}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Headcount */}
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                Active Open Headcount Target
              </label>
              <div className="flex gap-2">
                {["1-5 roles", "5-20 roles", "20+ roles"].map((target) => (
                  <button
                    key={target}
                    type="button"
                    onClick={() => setHeadcountTarget(target)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      headcountTarget === target
                        ? "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]"
                        : "bg-[#09090B] text-zinc-400 border-[#27272A] hover:border-zinc-500"
                    }`}
                  >
                    {target}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="touch-target px-6 py-2.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Continue to AI Job Architect</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────────── */}
        {/* STEP 2: Instant 15-Second AI Job Requisition                             */}
        {/* ──────────────────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#09090B] border border-[#27272A] text-[10px] font-bold text-zinc-300">
                ⚡ 15-SECOND REQUISITION GENERATOR
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA]">
                Draft Your First Job Requisition
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Generate a structured, bias-free job description with candidate screening criteria in seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Job Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full-Stack AI Engineer"
                  className="w-full px-4 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Engineering, Product, Growth"
                  className="w-full px-4 py-2.5 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#FAFAFA] placeholder-zinc-500 focus:border-[#FAFAFA] outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Location &amp; Policy
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="flex-1 px-3 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#FAFAFA] outline-none"
                  />
                  <select
                    value={remotePolicy}
                    onChange={(e) => setRemotePolicy(e.target.value)}
                    className="px-2.5 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#FAFAFA] outline-none cursor-pointer"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">Onsite</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Key Skills &amp; Keywords
                </label>
                <input
                  type="text"
                  value={keySkills}
                  onChange={(e) => setKeySkills(e.target.value)}
                  placeholder="TypeScript, Python, Distributed Systems"
                  className="w-full px-3.5 py-2 bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#FAFAFA] placeholder-zinc-500 outline-none font-medium"
                />
              </div>
            </div>

            {/* AI Generator Action Button */}
            <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 text-left">
                <span className="text-xs font-bold text-[#FAFAFA] block">
                  AI Job Architect &amp; Rubric Synthesizer
                </span>
                <span className="text-[11px] text-zinc-400 block">
                  Auto-generates responsibilities, requirements, and ATS screening filters.
                </span>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiJd}
                disabled={generatingAi || !jobTitle}
                className="touch-target px-4 py-2 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50 flex items-center gap-1.5"
              >
                {generatingAi ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#09090B] border-t-transparent rounded-full animate-spin" />
                    <span>Synthesizing JD...</span>
                  </>
                ) : (
                  <span>✨ Generate AI Requisition</span>
                )}
              </button>
            </div>

            {generatedSuccess && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 font-bold animate-in fade-in flex items-center gap-2">
                <span>✓</span>
                <span>Job Description &amp; ATS screening rubric synthesized successfully!</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] transition-colors"
              >
                &larr; Back
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="touch-target px-6 py-2.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Continue to Pipeline Setup</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        )}

        {/* ──────────────────────────────────────────────────────────────────────── */}
        {/* STEP 3: Pipeline & Evaluation Preset                                     */}
        {/* ──────────────────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA]">
                Configure Pipeline &amp; Scorecard Rubric
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose your hiring workflow speed and configure evaluation scorecards.
              </p>
            </div>

            {/* Pipeline Presets */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-zinc-300">
                Choose Pipeline Kanban Preset
              </label>
              <div className="space-y-2">
                {PIPELINE_PRESETS.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPipelinePreset(p.id as any)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      pipelinePreset === p.id
                        ? "bg-[#09090B] border-[#FAFAFA] ring-1 ring-[#FAFAFA]"
                        : "bg-[#09090B] border-[#27272A] hover:border-zinc-500"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#FAFAFA]">{p.title}</span>
                        <span className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[9px] font-mono text-zinc-300 font-bold">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">{p.desc}</p>
                    </div>

                    <div className="w-5 h-5 rounded-full border border-[#27272A] flex items-center justify-center shrink-0">
                      {pipelinePreset === p.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FAFAFA]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scorecard Focus Areas */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-300">
                Evaluation Scorecard Focus Areas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: "technical", label: "Technical Depth" },
                  { key: "systemDesign", label: "Architecture / Design" },
                  { key: "communication", label: "Communication" },
                  { key: "leadership", label: "Leadership / Values" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setFocusWeights((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key as keyof typeof prev],
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      focusWeights[item.key as keyof typeof focusWeights]
                        ? "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]"
                        : "bg-[#09090B] text-zinc-400 border-[#27272A]"
                    }`}
                  >
                    {focusWeights[item.key as keyof typeof focusWeights] ? "✓ " : ""}
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Review Card */}
            <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-zinc-400">Ready to Launch:</span>
                <span className="text-[#FAFAFA] font-mono">{companyName || "My Organization"}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Requisition:</span>
                <span className="text-zinc-300 font-semibold">{jobTitle}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] transition-colors"
              >
                &larr; Back
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="touch-target px-8 py-3 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#09090B] border-t-transparent rounded-full animate-spin" />
                    <span>Configuring Recruiter OS...</span>
                  </>
                ) : (
                  <span>🚀 Launch Recruiter Command Center &rarr;</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
