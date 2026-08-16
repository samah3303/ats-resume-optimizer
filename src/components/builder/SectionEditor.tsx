"use client";

import React, { useState } from "react";
import {
  ResumeData,
  WorkExperience,
  Education,
  SkillCategory,
  Project,
  Certification,
} from "@/types/builder";

interface SectionEditorProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
  onAiAssist: (action: string, content: string, context?: any) => void;
}

const POPULAR_SKILL_SUGGESTIONS = [
  "TypeScript",
  "React 19",
  "Next.js 16",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Docker",
  "AWS",
  "Kubernetes",
  "GraphQL",
  "Tailwind CSS",
  "Prisma ORM",
  "Redis",
  "CI/CD",
  "System Design",
  "Microservices",
  "REST APIs",
  "Jest / Playwright",
  "Agile / Scrum",
  "Git & GitHub",
];

export default function SectionEditor({
  data,
  onChange,
  onAiAssist,
}: SectionEditorProps) {
  // Accordion state
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true,
    experience: true,
    skills: true,
    education: false,
    projects: false,
    certifications: false,
  });

  const [newSkillInputs, setNewSkillInputs] = useState<Record<string, string>>({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // ==========================================
  // Personal Info Handlers
  // ==========================================
  const handlePersonalChange = (field: keyof typeof data.personalInfo, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  // ==========================================
  // Work Experience Handlers
  // ==========================================
  const addExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: ["Led implementation of high-throughput backend services, improving processing speeds by 35%."],
    };
    onChange({
      ...data,
      experience: [newExp, ...data.experience],
    });
  };

  const updateExperience = (index: number, updated: Partial<WorkExperience>) => {
    const updatedList = [...data.experience];
    updatedList[index] = { ...updatedList[index], ...updated };
    onChange({ ...data, experience: updatedList });
  };

  const removeExperience = (index: number) => {
    const updatedList = data.experience.filter((_, i) => i !== index);
    onChange({ ...data, experience: updatedList });
  };

  const moveExperience = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === data.experience.length - 1)
    ) {
      return;
    }
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updatedList = [...data.experience];
    const temp = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = temp;
    onChange({ ...data, experience: updatedList });
  };

  const handleBulletChange = (expIndex: number, bulletIndex: number, text: string) => {
    const exp = data.experience[expIndex];
    const newBullets = [...exp.bullets];
    newBullets[bulletIndex] = text;
    updateExperience(expIndex, { bullets: newBullets });
  };

  const addBullet = (expIndex: number) => {
    const exp = data.experience[expIndex];
    updateExperience(expIndex, {
      bullets: [...exp.bullets, ""],
    });
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const exp = data.experience[expIndex];
    const newBullets = exp.bullets.filter((_, i) => i !== bulletIndex);
    updateExperience(expIndex, { bullets: newBullets });
  };

  // ==========================================
  // Education Handlers
  // ==========================================
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      degree: "",
      institution: "",
      location: "",
      graduationYear: "",
      gpa: "",
      honors: "",
    };
    onChange({
      ...data,
      education: [...data.education, newEdu],
    });
  };

  const updateEducation = (index: number, updated: Partial<Education>) => {
    const updatedList = [...data.education];
    updatedList[index] = { ...updatedList[index], ...updated };
    onChange({ ...data, education: updatedList });
  };

  const removeEducation = (index: number) => {
    const updatedList = data.education.filter((_, i) => i !== index);
    onChange({ ...data, education: updatedList });
  };

  // ==========================================
  // Skills Handlers
  // ==========================================
  const addSkillCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: SkillCategory = {
      id: `skill-${Date.now()}`,
      category: newCategoryName.trim(),
      skills: [],
    };
    onChange({
      ...data,
      skills: [...data.skills, newCat],
    });
    setNewCategoryName("");
    setShowAddCategory(false);
  };

  const removeSkillCategory = (index: number) => {
    const updatedSkills = data.skills.filter((_, i) => i !== index);
    onChange({ ...data, skills: updatedSkills });
  };

  const addSkillToCategory = (catId: string, skill: string) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    const updatedSkills = data.skills.map((cat) => {
      if (cat.id === catId && !cat.skills.includes(trimmed)) {
        return { ...cat, skills: [...cat.skills, trimmed] };
      }
      return cat;
    });
    onChange({ ...data, skills: updatedSkills });
    setNewSkillInputs((prev) => ({ ...prev, [catId]: "" }));
  };

  const removeSkillFromCategory = (catId: string, skillToRemove: string) => {
    const updatedSkills = data.skills.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          skills: cat.skills.filter((s) => s !== skillToRemove),
        };
      }
      return cat;
    });
    onChange({ ...data, skills: updatedSkills });
  };

  // ==========================================
  // Project Handlers
  // ==========================================
  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      name: "",
      role: "",
      description: "",
      technologies: [],
      link: "",
      githubLink: "",
      bullets: [""],
    };
    onChange({
      ...data,
      projects: [...data.projects, newProj],
    });
  };

  const updateProject = (index: number, updated: Partial<Project>) => {
    const updatedList = [...data.projects];
    updatedList[index] = { ...updatedList[index], ...updated };
    onChange({ ...data, projects: updatedList });
  };

  const removeProject = (index: number) => {
    const updatedList = data.projects.filter((_, i) => i !== index);
    onChange({ ...data, projects: updatedList });
  };

  // ==========================================
  // Certification Handlers
  // ==========================================
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: "",
      issuer: "",
      date: "",
      credentialId: "",
      credentialUrl: "",
    };
    onChange({
      ...data,
      certifications: [...data.certifications, newCert],
    });
  };

  const updateCertification = (index: number, updated: Partial<Certification>) => {
    const updatedList = [...data.certifications];
    updatedList[index] = { ...updatedList[index], ...updated };
    onChange({ ...data, certifications: updatedList });
  };

  const removeCertification = (index: number) => {
    const updatedList = data.certifications.filter((_, i) => i !== index);
    onChange({ ...data, certifications: updatedList });
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. PERSONAL INFO ACCORDION */}
      <div className="rounded-3xl bg-white border border-zinc-200 overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("personal")}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 text-black flex items-center justify-center font-bold text-sm">
              👤
            </div>
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                Personal Info & Header
                {data.personalInfo.fullName && (
                  <span className="text-[11px] font-medium text-zinc-500">
                    ({data.personalInfo.fullName})
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-zinc-500">
                Contact details, professional headline, and executive summary
              </p>
            </div>
          </div>
          <span className="text-zinc-400 text-xs font-mono">
            {openSections.personal ? "▲" : "▼"}
          </span>
        </button>

        {openSections.personal && (
          <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">
                  Full Name <span className="text-black">*</span>
                </label>
                <input
                  type="text"
                  value={data.personalInfo.fullName}
                  onChange={(e) => handlePersonalChange("fullName", e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">
                  Professional Target Title <span className="text-black">*</span>
                </label>
                <input
                  type="text"
                  value={data.personalInfo.jobTitle}
                  onChange={(e) => handlePersonalChange("jobTitle", e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">
                  Email Address <span className="text-black">*</span>
                </label>
                <input
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => handlePersonalChange("email", e.target.value)}
                  placeholder="alex.rivera@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={data.personalInfo.phone}
                  onChange={(e) => handlePersonalChange("phone", e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">
                  Location (City, State / Country)
                </label>
                <input
                  type="text"
                  value={data.personalInfo.location}
                  onChange={(e) => handlePersonalChange("location", e.target.value)}
                  placeholder="San Francisco, CA (Open to Remote)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="text"
                  value={data.personalInfo.linkedin}
                  onChange={(e) => handlePersonalChange("linkedin", e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">
                  GitHub URL
                </label>
                <input
                  type="text"
                  value={data.personalInfo.github}
                  onChange={(e) => handlePersonalChange("github", e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-900 mb-1">
                  Portfolio / Personal Website
                </label>
                <input
                  type="text"
                  value={data.personalInfo.website}
                  onChange={(e) => handlePersonalChange("website", e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors shadow-sm"
                />
              </div>
            </div>

            {/* Executive Summary */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-900">
                  Professional Summary
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onAiAssist("generate_summary", data.personalInfo.summary, {
                      jobTitle: data.personalInfo.jobTitle,
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300 hover:border-black text-xs font-bold transition-all shadow-sm"
                >
                  <span>✨ AI Generate Summary</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={data.personalInfo.summary}
                onChange={(e) => handlePersonalChange("summary", e.target.value)}
                placeholder="High-impact 3-4 sentence narrative highlighting your specialization, top metrics, core competencies, and career value proposition..."
                className="w-full p-3 rounded-xl bg-white border border-zinc-300 text-xs text-black leading-relaxed focus:outline-none focus:border-black transition-colors shadow-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. WORK EXPERIENCE ACCORDION */}
      <div className="rounded-3xl bg-white border border-zinc-200 overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("experience")}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 text-black flex items-center justify-center font-bold text-sm">
              💼
            </div>
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                Work Experience
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-800 border border-zinc-200">
                  {data.experience.length} roles
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                Positions, quantifiable achievements, and STAR-formatted metrics
              </p>
            </div>
          </div>
          <span className="text-zinc-400 text-xs font-mono">
            {openSections.experience ? "▲" : "▼"}
          </span>
        </button>

        {openSections.experience && (
          <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 space-y-4">
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={addExperience}
                className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm border border-black"
              >
                <span>+ Add Experience</span>
              </button>
            </div>

            {data.experience.map((exp, expIndex) => (
              <div
                key={exp.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3.5 relative group/item"
              >
                {/* Header with Title and Reorder/Delete */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-200 pb-2.5">
                  <span className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                      {expIndex + 1}
                    </span>
                    {exp.title || "Untitled Role"} {exp.company ? `@ ${exp.company}` : ""}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveExperience(expIndex, "up")}
                      disabled={expIndex === 0}
                      title="Move Up"
                      className="p-1 text-xs text-zinc-500 hover:text-black disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveExperience(expIndex, "down")}
                      disabled={expIndex === data.experience.length - 1}
                      title="Move Down"
                      className="p-1 text-xs text-zinc-500 hover:text-black disabled:opacity-30"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => removeExperience(expIndex)}
                      className="p-1 px-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-rose-600 hover:border-rose-300 text-xs font-bold transition-all ml-1 shadow-sm"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Job Title <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(expIndex, { title: e.target.value })}
                      placeholder="e.g. Senior Software Engineer"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Company / Organization <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(expIndex, { company: e.target.value })}
                      placeholder="e.g. Google, Stripe, Microsoft"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={exp.location || ""}
                      onChange={(e) => updateExperience(expIndex, { location: e.target.value })}
                      placeholder="e.g. New York, NY (Hybrid)"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(expIndex, { startDate: e.target.value })}
                        placeholder="e.g. 2021-03 or Mar 2021"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                        End Date
                      </label>
                      <input
                        type="text"
                        disabled={exp.current}
                        value={exp.current ? "Present" : exp.endDate}
                        onChange={(e) => updateExperience(expIndex, { endDate: e.target.value })}
                        placeholder="e.g. Present or 2024-01"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black disabled:opacity-50 shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id={`current-${exp.id}`}
                    checked={exp.current}
                    onChange={(e) => {
                      updateExperience(expIndex, {
                        current: e.target.checked,
                        endDate: e.target.checked ? "Present" : "",
                      });
                    }}
                    className="rounded border-zinc-300 text-black accent-black focus:ring-0"
                  />
                  <label htmlFor={`current-${exp.id}`} className="text-xs text-zinc-800 font-medium select-none">
                    I currently work here
                  </label>
                </div>

                {/* Bullets with STAR Rewrite Button */}
                <div className="space-y-2 pt-2 border-t border-zinc-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-zinc-900 uppercase tracking-wider">
                      Key Bullet Points (Quantified Achievements)
                    </label>
                    <button
                      type="button"
                      onClick={() => addBullet(expIndex)}
                      className="text-[11px] font-bold text-black hover:underline"
                    >
                      + Add Bullet
                    </button>
                  </div>

                  {exp.bullets.map((bullet, bulletIdx) => (
                    <div key={bulletIdx} className="flex items-start gap-2 group/bullet">
                      <span className="text-black mt-2 text-xs font-bold">●</span>
                      <textarea
                        rows={2}
                        value={bullet}
                        onChange={(e) => handleBulletChange(expIndex, bulletIdx, e.target.value)}
                        placeholder="Action verb + Context + Measurable Result (e.g. Architected microservices reducing p99 latency by 45%)..."
                        className="flex-1 p-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black transition-colors leading-relaxed shadow-sm"
                      />
                      <div className="flex flex-col gap-1">
                        {/* ⚡ STAR Rewrite Button */}
                        <button
                          type="button"
                          onClick={() =>
                            onAiAssist("star_rewrite", bullet, {
                              expIndex,
                              bulletIndex: bulletIdx,
                              jobTitle: exp.title,
                            })
                          }
                          title="⚡ Transform into STAR metric with AI"
                          className="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300 hover:border-black text-[10px] font-black uppercase tracking-wider flex items-center gap-1 whitespace-nowrap transition-all shadow-sm"
                        >
                          <span>⚡ STAR Rewrite</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => removeBullet(expIndex, bulletIdx)}
                          className="p-1 rounded-md bg-white border border-zinc-200 text-zinc-400 hover:text-rose-600 text-xs transition-colors self-end shadow-sm"
                          title="Remove bullet"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. SKILLS & TECHNOLOGIES ACCORDION */}
      <div className="rounded-3xl bg-white border border-zinc-200 overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("skills")}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 text-black flex items-center justify-center font-bold text-sm">
              🛠️
            </div>
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                Skills & Technologies
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-800 border border-zinc-200">
                  {data.skills.reduce((acc, cat) => acc + cat.skills.length, 0)} skills
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                Categorized technical stack, frameworks, tools, and high-impact keywords
              </p>
            </div>
          </div>
          <span className="text-zinc-400 text-xs font-mono">
            {openSections.skills ? "▲" : "▼"}
          </span>
        </button>

        {openSections.skills && (
          <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 space-y-4">
            {/* Quick Suggest & Category Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onAiAssist("suggest_skills", data.personalInfo.jobTitle, {
                      existingSkills: data.skills.flatMap((s) => s.skills),
                    })
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-300 hover:border-black text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                >
                  <span>🎯 Suggest Missing ATS Skills</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCategory(!showAddCategory)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-zinc-300 hover:border-black text-black text-xs font-bold transition-all shadow-sm"
              >
                + New Category
              </button>
            </div>

            {showAddCategory && (
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-300 flex items-center gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. AI & Machine Learning, Databases, Leadership"
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                />
                <button
                  type="button"
                  onClick={addSkillCategory}
                  className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs hover:bg-zinc-800 transition-colors border border-black"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(false)}
                  className="px-2 py-2 text-zinc-400 hover:text-black text-xs"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Categorized Skills */}
            <div className="space-y-3">
              {data.skills.map((category, catIndex) => (
                <div
                  key={category.id}
                  className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-black uppercase tracking-wider">
                      {category.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSkillCategory(catIndex)}
                      className="text-[10px] text-zinc-400 hover:text-rose-600 font-medium transition-colors"
                    >
                      Delete Category
                    </button>
                  </div>

                  {/* Skill Chips */}
                  <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                    {category.skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-zinc-300 text-xs text-zinc-800 font-medium group hover:border-black shadow-sm"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => removeSkillFromCategory(category.id, skill)}
                          className="text-zinc-400 group-hover:text-rose-600 text-xs ml-0.5 transition-colors"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Skill Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newSkillInputs[category.id] || ""}
                      onChange={(e) =>
                        setNewSkillInputs((prev) => ({
                          ...prev,
                          [category.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkillToCategory(category.id, newSkillInputs[category.id] || "");
                        }
                      }}
                      placeholder={`Add skill to ${category.category} (Press Enter)...`}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        addSkillToCategory(category.id, newSkillInputs[category.id] || "")
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold border border-black"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add Recommendations Cloud */}
            <div className="pt-2 border-t border-zinc-200">
              <label className="block text-[11px] font-bold text-zinc-600 uppercase tracking-wider mb-2">
                ⚡ Quick Add Popular Tech Chips:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILL_SUGGESTIONS.map((skill) => {
                  const alreadyAdded = data.skills.some((c) => c.skills.includes(skill));
                  if (alreadyAdded) return null;

                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (data.skills.length > 0) {
                          addSkillToCategory(data.skills[0].id, skill);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-700 hover:text-black border border-zinc-300 hover:border-black text-[11px] font-medium transition-all shadow-sm"
                    >
                      + {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. EDUCATION ACCORDION */}
      <div className="rounded-3xl bg-white border border-zinc-200 overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("education")}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 text-black flex items-center justify-center font-bold text-sm">
              🎓
            </div>
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                Education
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-800 border border-zinc-200">
                  {data.education.length} degrees
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                University degrees, GPA, honors, and graduation credentials
              </p>
            </div>
          </div>
          <span className="text-zinc-400 text-xs font-mono">
            {openSections.education ? "▲" : "▼"}
          </span>
        </button>

        {openSections.education && (
          <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 space-y-4">
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={addEducation}
                className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-all border border-black shadow-sm"
              >
                + Add Degree
              </button>
            </div>

            {data.education.map((edu, eduIndex) => (
              <div
                key={edu.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="text-xs font-bold text-black">
                    {edu.degree || "Degree Title"} {edu.institution ? `— ${edu.institution}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeEducation(eduIndex)}
                    className="p-1 px-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-rose-600 text-xs font-bold transition-all shadow-sm"
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Degree / Major <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(eduIndex, { degree: e.target.value })}
                      placeholder="e.g. B.S. in Computer Science"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      University / Institution <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(eduIndex, { institution: e.target.value })}
                      placeholder="e.g. Stanford University"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={edu.graduationYear}
                      onChange={(e) => updateEducation(eduIndex, { graduationYear: e.target.value })}
                      placeholder="e.g. 2021"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      GPA / Honors
                    </label>
                    <input
                      type="text"
                      value={edu.gpa || ""}
                      onChange={(e) => updateEducation(eduIndex, { gpa: e.target.value })}
                      placeholder="e.g. 3.9 / 4.0, Magna Cum Laude"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. PROJECTS ACCORDION */}
      <div className="rounded-3xl bg-white border border-zinc-200 overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("projects")}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 text-black flex items-center justify-center font-bold text-sm">
              🚀
            </div>
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                Projects & Open Source
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-800 border border-zinc-200">
                  {data.projects.length} projects
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                Key applications, system architectures, and live repositories
              </p>
            </div>
          </div>
          <span className="text-zinc-400 text-xs font-mono">
            {openSections.projects ? "▲" : "▼"}
          </span>
        </button>

        {openSections.projects && (
          <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 space-y-4">
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={addProject}
                className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-all border border-black shadow-sm"
              >
                + Add Project
              </button>
            </div>

            {data.projects.map((proj, projIndex) => (
              <div
                key={proj.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="text-xs font-bold text-black">
                    {proj.name || "Untitled Project"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProject(projIndex)}
                    className="p-1 px-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-rose-600 text-xs font-bold transition-all shadow-sm"
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Project Name <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => updateProject(projIndex, { name: e.target.value })}
                      placeholder="e.g. Distributed Cache Mesh"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Role / Subtitle
                    </label>
                    <input
                      type="text"
                      value={proj.role || ""}
                      onChange={(e) => updateProject(projIndex, { role: e.target.value })}
                      placeholder="e.g. Creator & Lead Maintainer"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Live URL
                    </label>
                    <input
                      type="text"
                      value={proj.link || ""}
                      onChange={(e) => updateProject(projIndex, { link: e.target.value })}
                      placeholder="https://myproject.io"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      GitHub Repository
                    </label>
                    <input
                      type="text"
                      value={proj.githubLink || ""}
                      onChange={(e) => updateProject(projIndex, { githubLink: e.target.value })}
                      placeholder="https://github.com/user/repo"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                    Description & Key Outcomes
                  </label>
                  <textarea
                    rows={2}
                    value={proj.description}
                    onChange={(e) => updateProject(projIndex, { description: e.target.value })}
                    placeholder="High-level description of architecture, throughput, and impact..."
                    className="w-full p-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black leading-relaxed shadow-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. CERTIFICATIONS ACCORDION */}
      <div className="rounded-3xl bg-white border border-zinc-200 overflow-hidden transition-all shadow-sm">
        <button
          type="button"
          onClick={() => toggleSection("certifications")}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors touch-target"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 text-black flex items-center justify-center font-bold text-sm">
              🏆
            </div>
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-2">
                Certifications & Credentials
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-800 border border-zinc-200">
                  {data.certifications.length} credentials
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                Industry accreditations (AWS, GCP, CKA, PMP) and verified certifications
              </p>
            </div>
          </div>
          <span className="text-zinc-400 text-xs font-mono">
            {openSections.certifications ? "▲" : "▼"}
          </span>
        </button>

        {openSections.certifications && (
          <div className="p-4 sm:p-5 pt-0 border-t border-zinc-100 space-y-4">
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={addCertification}
                className="px-3.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider transition-all border border-black shadow-sm"
              >
                + Add Certification
              </button>
            </div>

            {data.certifications.map((cert, certIndex) => (
              <div
                key={cert.id}
                className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3 relative"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span className="text-xs font-bold text-black">
                    {cert.name || "Certification Name"}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeCertification(certIndex)}
                    className="p-1 px-2 rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:text-rose-600 text-xs font-bold transition-all shadow-sm"
                  >
                    🗑️
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Certificate Name <span className="text-black">*</span>
                    </label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(certIndex, { name: e.target.value })}
                      placeholder="e.g. AWS Solutions Architect Professional"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Issuing Body / Organization
                    </label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(certIndex, { issuer: e.target.value })}
                      placeholder="e.g. Amazon Web Services, Linux Foundation"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Issue Date
                    </label>
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => updateCertification(certIndex, { date: e.target.value })}
                      placeholder="e.g. 2023-08"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-zinc-800 mb-1">
                      Credential ID / Verification Link
                    </label>
                    <input
                      type="text"
                      value={cert.credentialUrl || cert.credentialId || ""}
                      onChange={(e) =>
                        updateCertification(certIndex, {
                          credentialUrl: e.target.value,
                          credentialId: e.target.value,
                        })
                      }
                      placeholder="e.g. AWS-12345 or verification URL"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
