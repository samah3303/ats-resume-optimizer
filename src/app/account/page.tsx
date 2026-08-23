"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useWorkspaceMode } from "@/components/WorkspaceModeContext";
import Logo from "@/components/Logo";
import { useToast } from "@/components/Toast";
import { COUNTRIES, INDUSTRIES, JOB_TYPES } from "@/components/home/constants";

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  endDate: string;
  gpa?: string;
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { mode, toggleMode } = useWorkspaceMode();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Candidate Telemetry
  const [completeness, setCompleteness] = useState(85);
  const [generalAtsScore, setGeneralAtsScore] = useState(74);
  const [resumeName, setResumeName] = useState("Primary Resume");

  // Candidate Profile Sections State
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [targetPositions, setTargetPositions] = useState("");
  const [targetCountry, setTargetCountry] = useState("United States");
  const [industry, setIndustry] = useState("Technology / SaaS");
  const [jobType, setJobType] = useState("Full-time");

  // Recruiter Profile State
  const [companyName, setCompanyName] = useState("Acme Talent Studio");
  const [recruiterRole, setRecruiterRole] = useState("Head of Technical Recruiting");
  const [companyWebsite, setCompanyWebsite] = useState("https://acme.inc");
  const [companySize, setCompanySize] = useState("11-50 employees");
  const [companyLocation, setCompanyLocation] = useState("San Francisco, CA & Remote");
  const [culturePitch, setCulturePitch] = useState("Engineering-first, high-autonomy team building next-generation intelligent platforms.");
  const [hiringFocusRoles, setHiringFocusRoles] = useState("Staff Frontend Engineer, Senior Backend Engineer, Product Manager");
  const [hiringGeos, setHiringGeos] = useState("United States, United Arab Emirates, Remote");
  const [rubricTechWeight, setRubricTechWeight] = useState("40%");
  const [rubricStarWeight, setRubricStarWeight] = useState("30%");
  const [rubricDomainWeight, setRubricDomainWeight] = useState("30%");
  const [interviewInviteMsg, setInterviewInviteMsg] = useState("Hi [Candidate], We were impressed by your background and would love to invite you for a 30-minute technical discovery call.");

  // Accordion Expand/Collapse States (Default open first 3)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    skills: true,
    experience: true,
    education: false,
    projects: false,
    preferences: false,
    company: true,
    hiring: true,
    rubrics: false,
    comms: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const fetchProfile = useCallback(async () => {
    try {
      if (mode === "candidate") {
        const res = await fetch("/api/account/profile");
        if (res.ok) {
          const data = await res.json();
          setCompleteness(data.completeness ?? 85);
          setGeneralAtsScore(data.generalAtsScore ?? 74);
          setResumeName(data.resumeName || "Primary Resume");
          setSummary(data.summary || "");
          setSkills(data.skills || []);
          setExperience(data.experience || []);
          setEducation(data.education || []);
          setProjects(data.projects || []);
          setTargetPositions(data.targetPositions || "");
          setTargetCountry(data.targetCountry || "United States");
          setIndustry(data.industry || "Technology / SaaS");
          setJobType(data.jobType || "Full-time");
        }
      } else {
        const res = await fetch("/api/recruiter/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.profile?.companyName) setCompanyName(data.profile.companyName);
          if (data.profile?.role) setRecruiterRole(data.profile.role);
          if (data.profile?.organization?.industry) setIndustry(data.profile.organization.industry);
        }
      }
    } catch {
      toast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  }, [mode, toast]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router, fetchProfile]);

  const handleSaveCandidateProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary,
          skills,
          experience,
          education,
          projects,
          targetPositions,
          targetCountry,
          industry,
          jobType,
        }),
      });

      if (res.ok) {
        toast("Profile details updated & synced to resume graph!", "success");
      } else {
        throw new Error("Update failed");
      }
    } catch {
      toast("Failed to save profile changes", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRecruiterProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/recruiter/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          recruiterRole,
          hiringDomain: industry,
          headcountTarget: companySize,
        }),
      });

      if (res.ok) {
        toast("Recruiter Organization Profile updated successfully!", "success");
      } else {
        throw new Error("Update failed");
      }
    } catch {
      toast("Failed to save recruiter organization profile", "error");
    } finally {
      setSaving(false);
    }
  };

  // Candidate Skill Handlers
  const handleAddSkill = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newSkillInput.trim()) return;
    const trimmed = newSkillInput.trim();
    if (!skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  // Candidate Experience Handlers
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: "exp-" + Date.now(),
      title: "Senior Engineer / Specialist",
      company: "Company Name",
      location: "Remote",
      startDate: "2022",
      endDate: "Present",
      current: true,
      bullets: ["Quantified achievement resulting in measurable efficiency and ROI."],
    };
    setExperience([newExp, ...experience]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperience(experience.filter((exp) => exp.id !== id));
  };

  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, val: any) => {
    setExperience(
      experience.map((exp) => (exp.id === id ? { ...exp, [field]: val } : exp))
    );
  };

  const handleAddBullet = (expId: string) => {
    setExperience(
      experience.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              bullets: [...exp.bullets, "Spearheaded key initiative improving metric by 25%."],
            }
          : exp
      )
    );
  };

  const handleUpdateBullet = (expId: string, bulletIdx: number, val: string) => {
    setExperience(
      experience.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              bullets: exp.bullets.map((b, idx) => (idx === bulletIdx ? val : b)),
            }
          : exp
      )
    );
  };

  const handleRemoveBullet = (expId: string, bulletIdx: number) => {
    setExperience(
      experience.map((exp) =>
        exp.id === expId
          ? {
              ...exp,
              bullets: exp.bullets.filter((_, idx) => idx !== bulletIdx),
            }
          : exp
      )
    );
  };

  // Candidate Education Handlers
  const handleAddEducation = () => {
    const newEdu: EducationItem = {
      id: "edu-" + Date.now(),
      degree: "B.S. in Computer Science / Business",
      institution: "University Name",
      location: "San Francisco, CA",
      endDate: "2020",
    };
    setEducation([newEdu, ...education]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter((edu) => edu.id !== id));
  };

  const handleUpdateEducation = (id: string, field: keyof EducationItem, val: any) => {
    setEducation(
      education.map((edu) => (edu.id === id ? { ...edu, [field]: val } : edu))
    );
  };

  // Candidate Project Handlers
  const handleAddProject = () => {
    const newProj: ProjectItem = {
      id: "proj-" + Date.now(),
      name: "High-Impact Project",
      description: "Architected distributed system with sub-second latency handling 100k daily requests.",
      technologies: ["TypeScript", "Next.js", "PostgreSQL"],
    };
    setProjects([newProj, ...projects]);
  };

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
  };

  const handleUpdateProject = (id: string, field: keyof ProjectItem, val: any) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  if (status === "loading" || loading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[70vh] bg-[#09090B]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = (
    mode === "recruiter"
      ? companyName || "R"
      : session?.user?.name || session?.user?.email || "P"
  )
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200 p-4 sm:p-6 lg:p-8 pb-32">
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 1. TOP HEADER & IDENTITY OVERVIEW                                        */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] text-base font-bold flex items-center justify-center text-[#FAFAFA]">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
                {mode === "recruiter" ? companyName : session?.user?.name || "Candidate Profile"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#18181B] border border-[#27272A] text-[10px] font-bold uppercase text-zinc-300 font-mono">
                {mode === "recruiter" ? "Enterprise Recruiter OS" : "Candidate Suite"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              {mode === "recruiter"
                ? `${recruiterRole} • ${session?.user?.email}`
                : `${session?.user?.email} • Linked File: ${resumeName}`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={mode === "recruiter" ? handleSaveRecruiterProfile : handleSaveCandidateProfile}
            disabled={saving}
            className="touch-target px-5 py-2.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl transition-all border border-[#FAFAFA] flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#09090B] border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>💾 Save {mode === "recruiter" ? "Organization" : "Profile"}</span>
            )}
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="px-3.5 py-2.5 bg-[#18181B] hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 font-bold text-xs rounded-xl transition-all border border-[#27272A] hover:border-rose-800 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* CANDIDATE VIEW                                                           */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {mode === "candidate" ? (
        <div className="space-y-6">
          {/* Telemetry: Completeness & ATS Score Card (<80 CTA) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Profile Completeness Progress Card */}
            <div className="md:col-span-6 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  PROFILE COMPLETENESS
                </span>
                <span className="text-xs font-mono font-bold text-[#FAFAFA]">{completeness}% Complete</span>
              </div>

              <div className="w-full h-2 bg-[#09090B] rounded-full overflow-hidden border border-[#27272A]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    completeness >= 90
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                      : completeness >= 70
                      ? "bg-[#FAFAFA]"
                      : "bg-amber-400"
                  }`}
                  style={{ width: `${completeness}%` }}
                />
              </div>

              <p className="text-[11px] text-zinc-400">
                {completeness >= 90
                  ? "✓ Exceptional profile depth. Ready for ATS parsing and recruiter matching."
                  : "Complete your work experience and skills to maximize ATS keyword density and auto-matching."}
              </p>
            </div>

            {/* General ATS Score Card with < 80 Alert CTA */}
            <div className="md:col-span-6 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  STANDALONE ATS SCORE
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md font-mono text-xs font-bold border ${
                    generalAtsScore >= 80
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/60"
                      : "bg-amber-950/40 text-amber-300 border-amber-700/60"
                  }`}
                >
                  {generalAtsScore} / 100
                </span>
              </div>

              {generalAtsScore < 80 ? (
                <div className="space-y-2">
                  <p className="text-[11px] text-amber-300 font-medium">
                    ⚠️ Your resume is currently scoring below the Tier-1 80+ ATS benchmark.
                  </p>
                  <Link
                    href="/dashboard/analyze"
                    className="touch-target w-full py-2 px-3 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl transition-all border border-[#FAFAFA] flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <span>View Detailed ATS Breakdown &amp; 80+ Suggestions &rarr;</span>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-400 font-medium">
                    ✓ Tier-1 ATS Benchmark Met (80+)
                  </span>
                  <Link
                    href="/dashboard/analyze"
                    className="text-xs font-bold text-[#FAFAFA] hover:underline"
                  >
                    View ATS Analysis &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Candidate Collapsible Accordions */}
          <div className="space-y-4">
            {/* Executive Summary */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("summary")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    📝
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Executive Summary &amp; Professional Narrative</h3>
                    <span className="text-[11px] text-zinc-400">Distills your career trajectory, strengths, and leadership pitch.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.summary ? "▲" : "▼"}</span>
              </div>

              {expandedSections.summary && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-3 mt-1">
                  <textarea
                    rows={4}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Write your high-impact executive summary..."
                    className="w-full p-3.5 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs sm:text-sm focus:border-[#FAFAFA] outline-none leading-relaxed font-sans"
                  />
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span>{summary.length} characters</span>
                    <span>💡 Focus on quantifiable results and domain keywords</span>
                  </div>
                </div>
              )}
            </div>

            {/* Core Skills */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("skills")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    ⚡
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Core &amp; Domain Competencies ({skills.length})</h3>
                    <span className="text-[11px] text-zinc-400">Indexed keywords matched directly by ATS filters.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.skills ? "▲" : "▼"}</span>
              </div>

              {expandedSections.skills && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-4 mt-1">
                  <form onSubmit={handleAddSkill} className="flex gap-2">
                    <input
                      type="text"
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      placeholder="Type new skill (e.g. Next.js, Financial Modeling, Stakeholder Management)..."
                      className="flex-1 px-3.5 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs focus:border-[#FAFAFA] outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl cursor-pointer"
                    >
                      + Add Skill
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#09090B] border border-[#27272A] hover:border-zinc-400 text-xs font-bold text-[#FAFAFA] rounded-xl transition-all"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="text-zinc-500 hover:text-rose-400 text-xs font-bold ml-1 cursor-pointer"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Work Experience */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("experience")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    💼
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Work Experience ({experience.length})</h3>
                    <span className="text-[11px] text-zinc-400">Roles, achievements, and STAR quantified metrics.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.experience ? "▲" : "▼"}</span>
              </div>

              {expandedSections.experience && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-5 mt-1">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddExperience}
                      className="px-3.5 py-1.5 bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-bold text-[#FAFAFA] rounded-xl transition-all cursor-pointer"
                    >
                      + Add Position
                    </button>
                  </div>

                  <div className="space-y-4">
                    {experience.map((exp) => (
                      <div
                        key={exp.id}
                        className="p-4 bg-[#09090B] border border-[#27272A] rounded-2xl space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => handleUpdateExperience(exp.id, "title", e.target.value)}
                            placeholder="Job Title"
                            className="px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs font-bold text-[#FAFAFA]"
                          />
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => handleUpdateExperience(exp.id, "company", e.target.value)}
                            placeholder="Company Name"
                            className="px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-[#FAFAFA]"
                          />
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => handleUpdateExperience(exp.id, "startDate", e.target.value)}
                            placeholder="Start Date (e.g. 2022)"
                            className="px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-zinc-300"
                          />
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={exp.endDate}
                              onChange={(e) => handleUpdateExperience(exp.id, "endDate", e.target.value)}
                              placeholder="End Date (e.g. Present)"
                              className="flex-1 px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-zinc-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExperience(exp.id)}
                              className="px-2 py-1 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-900/60 cursor-pointer"
                            >
                              &times;
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 pt-1 border-t border-[#27272A]">
                          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                            <span>STAR Achievement Bullets</span>
                            <button
                              type="button"
                              onClick={() => handleAddBullet(exp.id)}
                              className="text-[#FAFAFA] font-bold hover:underline cursor-pointer"
                            >
                              + Add Bullet
                            </button>
                          </div>
                          {exp.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-start gap-2">
                              <span className="text-zinc-500 pt-1.5 text-xs">&bull;</span>
                              <textarea
                                rows={2}
                                value={bullet}
                                onChange={(e) => handleUpdateBullet(exp.id, bIdx, e.target.value)}
                                className="flex-1 p-2 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-zinc-200 focus:border-[#FAFAFA] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveBullet(exp.id, bIdx)}
                                className="text-zinc-500 hover:text-rose-400 text-xs font-bold pt-1.5"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("education")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    🎓
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Education &amp; Credentials ({education.length})</h3>
                    <span className="text-[11px] text-zinc-400">Degrees, academic honors, and verified institutions.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.education ? "▲" : "▼"}</span>
              </div>

              {expandedSections.education && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-4 mt-1">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddEducation}
                      className="px-3.5 py-1.5 bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-bold text-[#FAFAFA] rounded-xl transition-all cursor-pointer"
                    >
                      + Add Degree
                    </button>
                  </div>

                  <div className="space-y-3">
                    {education.map((edu) => (
                      <div
                        key={edu.id}
                        className="p-3.5 bg-[#09090B] border border-[#27272A] rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 items-center"
                      >
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => handleUpdateEducation(edu.id, "degree", e.target.value)}
                          placeholder="Degree / Major"
                          className="px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs font-bold text-[#FAFAFA]"
                        />
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => handleUpdateEducation(edu.id, "institution", e.target.value)}
                          placeholder="University / College"
                          className="px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-[#FAFAFA]"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={edu.endDate}
                            onChange={(e) => handleUpdateEducation(edu.id, "endDate", e.target.value)}
                            placeholder="Year"
                            className="flex-1 px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-zinc-300"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveEducation(edu.id)}
                            className="px-2 py-1 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-900/60 cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Projects */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("projects")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    🚀
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Projects &amp; Technical Highlights ({projects.length})</h3>
                    <span className="text-[11px] text-zinc-400">Featured builds, systems, or case studies.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.projects ? "▲" : "▼"}</span>
              </div>

              {expandedSections.projects && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-4 mt-1">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="px-3.5 py-1.5 bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-bold text-[#FAFAFA] rounded-xl transition-all cursor-pointer"
                    >
                      + Add Project
                    </button>
                  </div>

                  <div className="space-y-3">
                    {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-[#09090B] border border-[#27272A] rounded-2xl space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => handleUpdateProject(proj.id, "name", e.target.value)}
                        placeholder="Project Name"
                        className="flex-1 px-3 py-1.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs font-bold text-[#FAFAFA]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(proj.id)}
                        className="px-2 py-1 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-900/60 cursor-pointer"
                      >
                        &times;
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => handleUpdateProject(proj.id, "description", e.target.value)}
                      placeholder="Project description, metrics, or architecture..."
                      className="w-full p-2.5 bg-[#18181B] border border-[#27272A] rounded-xl text-xs text-zinc-200 focus:border-[#FAFAFA] outline-none"
                    />
                  </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Target Career Preferences */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("preferences")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    🎯
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Target Career Ambitions &amp; Location</h3>
                    <span className="text-[11px] text-zinc-400">Positions, geography, industry, and work type.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.preferences ? "▲" : "▼"}</span>
              </div>

              {expandedSections.preferences && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-4 mt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Target Positions</label>
                      <input
                        type="text"
                        value={targetPositions}
                        onChange={(e) => setTargetPositions(e.target.value)}
                        className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Target Country</label>
                      <select
                        value={targetCountry}
                        onChange={(e) => setTargetCountry(e.target.value)}
                        className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c} value={c} className="bg-[#18181B] text-[#FAFAFA]">
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Target Industry</label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                      >
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind} className="bg-[#18181B] text-[#FAFAFA]">
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Job Type</label>
                      <input
                        type="text"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null /* (
        /* ──────────────────────────────────────────────────────────────────────── */
        /* RECRUITER VIEW                                                           */
        /* ──────────────────────────────────────────────────────────────────────── */
        <div className="space-y-6">
          {/* Recruiter Telemetry Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">ORGANIZATION STATUS</span>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-base font-bold text-[#FAFAFA]">Verified Talent Studio</span>
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">Enterprise multi-tenant workspace active.</p>
            </div>

            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">HIRING PIPELINE CAPACITY</span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-bold font-mono text-[#FAFAFA]">3 Roles</span>
                <span className="text-[11px] text-zinc-500 font-mono">(Beta Requisitions)</span>
              </div>
              <p className="text-[11px] text-zinc-400">Unlimited candidate intake &amp; ATS indexing.</p>
            </div>

            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">AI SCREENING CREDITS</span>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-bold font-mono text-emerald-400">Unlimited</span>
                <span className="text-[11px] text-zinc-500 font-mono">Credits</span>
              </div>
              <p className="text-[11px] text-zinc-400">Automated 0-100 fit scorecards enabled.</p>
            </div>
          </div>

          {/* Recruiter Collapsible Accordions */}
          <div className="space-y-4">
            {/* Accordion 1: Company & Brand Identity */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("company")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    🏢
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Company &amp; Brand Identity</h3>
                    <span className="text-[11px] text-zinc-400">Organization name, website, industry, and talent pitch.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.company ? "▲" : "▼"}</span>
              </div>

              {expandedSections.company && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-4 mt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Company / Organization Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Recruiter Persona &amp; Title</label>
                      <input
                        type="text"
                        value={recruiterRole}
                        onChange={(e) => setRecruiterRole(e.target.value)}
                        className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Website</label>
                      <input
                        type="url"
                        value={companyWebsite}
                        onChange={(e) => setCompanyWebsite(e.target.value)}
                        className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">HQ Location</label>
                      <input
                        type="text"
                        value={companyLocation}
                        onChange={(e) => setCompanyLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">Company Size</label>
                      <input
                        type="text"
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Company Culture &amp; Mission Pitch</label>
                    <textarea
                      rows={2}
                      value={culturePitch}
                      onChange={(e) => setCulturePitch(e.target.value)}
                      className="w-full p-3 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs focus:border-[#FAFAFA] outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Active Hiring Focus */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("hiring")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    🎯
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Active Hiring Focus &amp; Talent Geographies</h3>
                    <span className="text-[11px] text-zinc-400">Primary positions and talent pools targeted.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.hiring ? "▲" : "▼"}</span>
              </div>

              {expandedSections.hiring && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-4 mt-1">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Primary Target Roles</label>
                    <input
                      type="text"
                      value={hiringFocusRoles}
                      onChange={(e) => setHiringFocusRoles(e.target.value)}
                      className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">Target Hiring Geographies</label>
                    <input
                      type="text"
                      value={hiringGeos}
                      onChange={(e) => setHiringGeos(e.target.value)}
                      className="w-full px-3 py-2 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Candidate Evaluation Rubrics */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("rubrics")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    ⚖️
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Candidate Evaluation Rubrics (Default Scorecard)</h3>
                    <span className="text-[11px] text-zinc-400">Define AI scoring weights across skill competencies.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.rubrics ? "▲" : "▼"}</span>
              </div>

              {expandedSections.rubrics && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-4 mt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-[#09090B] border border-[#27272A] rounded-xl space-y-1">
                      <span className="text-[11px] text-zinc-400 font-bold block">Technical Competency</span>
                      <input
                        type="text"
                        value={rubricTechWeight}
                        onChange={(e) => setRubricTechWeight(e.target.value)}
                        className="w-full px-2 py-1 bg-[#18181B] border border-[#27272A] rounded-lg text-xs font-mono font-bold text-[#FAFAFA]"
                      />
                    </div>
                    <div className="p-3 bg-[#09090B] border border-[#27272A] rounded-xl space-y-1">
                      <span className="text-[11px] text-zinc-400 font-bold block">Quantified STAR Impact</span>
                      <input
                        type="text"
                        value={rubricStarWeight}
                        onChange={(e) => setRubricStarWeight(e.target.value)}
                        className="w-full px-2 py-1 bg-[#18181B] border border-[#27272A] rounded-lg text-xs font-mono font-bold text-[#FAFAFA]"
                      />
                    </div>
                    <div className="p-3 bg-[#09090B] border border-[#27272A] rounded-xl space-y-1">
                      <span className="text-[11px] text-zinc-400 font-bold block">Domain Experience</span>
                      <input
                        type="text"
                        value={rubricDomainWeight}
                        onChange={(e) => setRubricDomainWeight(e.target.value)}
                        className="w-full px-2 py-1 bg-[#18181B] border border-[#27272A] rounded-lg text-xs font-mono font-bold text-[#FAFAFA]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Communication Templates */}
            <div className="bg-[#18181B] border border-[#27272A] rounded-2xl overflow-hidden transition-all">
              <div
                onClick={() => toggleSection("comms")}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-[#202024] select-none"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-sm">
                    ✉️
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#FAFAFA]">Default Candidate Outreach Templates</h3>
                    <span className="text-[11px] text-zinc-400">Automated interview invitations and candidate outreach.</span>
                  </div>
                </div>
                <span className="text-zinc-400 font-mono text-xs">{expandedSections.comms ? "▲" : "▼"}</span>
              </div>

              {expandedSections.comms && (
                <div className="p-4 sm:p-5 pt-0 border-t border-[#27272A] space-y-3 mt-1">
                  <label className="block text-xs font-bold text-zinc-300">1st-Round Interview Invitation Template</label>
                  <textarea
                    rows={3}
                    value={interviewInviteMsg}
                    onChange={(e) => setInterviewInviteMsg(e.target.value)}
                    className="w-full p-3 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs focus:border-[#FAFAFA] outline-none font-mono text-[11px]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )} */
    </div>
  );
}
