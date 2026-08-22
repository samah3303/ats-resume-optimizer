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

  // Telemetry
  const [completeness, setCompleteness] = useState(85);
  const [generalAtsScore, setGeneralAtsScore] = useState(74);
  const [resumeName, setResumeName] = useState("Primary Resume");

  // Profile Sections State
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  // Target Preferences
  const [targetPositions, setTargetPositions] = useState("");
  const [targetCountry, setTargetCountry] = useState("United States");
  const [industry, setIndustry] = useState("Technology / SaaS");
  const [jobType, setJobType] = useState("Full-time");

  // Accordion Expand/Collapse States (Default open first 3)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    summary: true,
    skills: true,
    experience: true,
    education: false,
    projects: false,
    preferences: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const fetchProfile = useCallback(async () => {
    try {
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
    } catch {
      toast("Failed to load profile data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router, fetchProfile]);

  const handleSaveProfile = async () => {
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

  // Skill Handlers
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

  // Experience Handlers
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

  // Education Handlers
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

  // Project Handlers
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
      <div className="h-full flex items-center justify-center min-h-[70vh]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = (session?.user?.name || session?.user?.email || "P")
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
                {session?.user?.name || "Candidate Profile"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#18181B] border border-[#27272A] text-[10px] font-bold uppercase text-zinc-300 font-mono">
                {mode === "recruiter" ? "Recruiter OS" : "Candidate Suite"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              {session?.user?.email} &bull; Linked File: <span className="text-zinc-200">{resumeName}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="touch-target px-5 py-2.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl transition-all border border-[#FAFAFA] flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-[#09090B] border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>💾 Save Profile Changes</span>
            )}
          </button>

          <button
            onClick={toggleMode}
            className="px-3.5 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-zinc-300 hover:text-[#FAFAFA] font-bold text-xs rounded-xl transition-all border border-[#27272A] flex items-center gap-1.5 cursor-pointer"
            title="Switch Workspace Mode"
          >
            <span>⇄ Switch to {mode === "candidate" ? "Recruiter OS" : "Candidate Suite"}</span>
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
      {/* 2. TELEMETRY: COMPLETENESS & ATS SCORE CARD (<80 CTA)                    */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Profile Completeness Progress Card */}
        <div className="md:col-span-6 bg-[#18181B] border border-[#27272A] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              PROFILE COMPLETENESS
            </span>
            <span className="text-xs font-mono font-bold text-[#FAFAFA]">{completeness}% Complete</span>
          </div>

          {/* Progress Bar */}
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

          {/* If Score < 80, Highlight CTA Button */}
          {generalAtsScore < 80 ? (
            <div className="space-y-2">
              <p className="text-[11px] text-amber-300 font-medium">
                ⚠️ Your resume is currently scoring below the Tier-1 80+ ATS benchmark.
              </p>
              <Link
                href="/dashboard#roadmap"
                className="touch-target w-full py-2 px-3 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl transition-all border border-[#FAFAFA] flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
              >
                <span>View Detailed ATS Breakdown &amp; 80+ Roadmap &rarr;</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-emerald-400 font-medium">
                ✓ Tier-1 ATS Benchmark Met (80+)
              </span>
              <Link
                href="/dashboard#roadmap"
                className="text-xs font-bold text-[#FAFAFA] hover:underline"
              >
                View Roadmap &rarr;
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 3. COLLAPSIBLE & EDITABLE RESUME ACCORDIONS                              */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* ── ACCORDION 1: EXECUTIVE SUMMARY ── */}
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

        {/* ── ACCORDION 2: CORE & DOMAIN SKILLS ── */}
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
              {/* Add Skill Input Form */}
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

              {/* Skills Tags Grid */}
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

        {/* ── ACCORDION 3: WORK EXPERIENCE ── */}
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

                    {/* Bullet Points */}
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

        {/* ── ACCORDION 4: EDUCATION & CERTIFICATIONS ── */}
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

        {/* ── ACCORDION 5: PROJECTS & HIGHLIGHTS ── */}
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

        {/* ── ACCORDION 6: TARGET CAREER PREFERENCES ── */}
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
  );
}
