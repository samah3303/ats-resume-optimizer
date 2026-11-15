"use client";

import { useEffect, useState, useRef } from "react";
import { UserProfile, ExperienceEntry, EducationEntry } from "@/types";
import { ProfileSectionSkeleton, Skeleton } from "@/components/ui/Skeleton";
import BrowserExtensionCard from "@/components/profile/BrowserExtensionCard";
import Toast from "@/components/ui/Toast";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [analyzingAts, setAnalyzingAts] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Real-time inline field validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [targetRoles, setTargetRoles] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [experience, setExperience] = useState<ExperienceEntry[]>([]);
  const [education, setEducation] = useState<EducationEntry[]>([]);
  const [summary, setSummary] = useState("");

  const validateField = (field: string, val: string): string => {
    const trimmed = val.trim();
    if (field === "name") {
      if (!trimmed || trimmed.length < 2) {
        return "Full name must be at least 2 characters long.";
      }
    } else if (field === "phone") {
      if (trimmed && !/^[0-9+\-()\s]{6,25}$/.test(trimmed)) {
        return "Please enter a valid phone number (digits, +, -, spaces only).";
      }
    } else if (field === "linkedinUrl") {
      if (trimmed && (!trimmed.startsWith("http://") && !trimmed.startsWith("https://"))) {
        return "LinkedIn URL must start with https:// (e.g. https://linkedin.com/in/username).";
      }
    } else if (field === "githubUrl") {
      if (trimmed && (!trimmed.startsWith("http://") && !trimmed.startsWith("https://"))) {
        return "GitHub URL must start with https:// (e.g. https://github.com/username).";
      }
    } else if (field === "portfolioUrl") {
      if (trimmed && (!trimmed.startsWith("http://") && !trimmed.startsWith("https://"))) {
        return "Portfolio URL must start with https:// (e.g. https://yourportfolio.com).";
      }
    }
    return "";
  };

  const handleFieldBlur = (field: string, val: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, val);
    setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleFieldChange = (field: string, val: string) => {
    if (touchedFields[field]) {
      const errorMsg = validateField(field, val);
      setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  // Job Search Preferences
  const [prefPlatforms, setPrefPlatforms] = useState<string[]>([
    "naukrigulf",
    "indeed",
    "linkedin",
    "greenhouse_lever",
  ]);
  const [prefLocations, setPrefLocations] = useState<string[]>([
    "Dubai, UAE",
    "Remote",
  ]);
  const [newPrefLocation, setNewPrefLocation] = useState("");
  const [prefWorkModes, setPrefWorkModes] = useState<string[]>([
    "Remote",
    "Hybrid",
  ]);
  const [prefMinSalary, setPrefMinSalary] = useState("");
  const [prefExpLevel, setPrefExpLevel] = useState("Mid Level (3-5 yrs)");

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data: UserProfile = await res.json();
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setTargetRoles(
          Array.isArray(data.targetRoles) ? data.targetRoles.join(", ") : ""
        );
        setJobType(data.jobType || "Full-time");
        setLinkedinUrl(data.linkedinUrl || "");
        setPortfolioUrl(data.portfolioUrl || "");
        setGithubUrl(data.githubUrl || "");
        setSkills(Array.isArray(data.skills) ? data.skills : []);
        setExperience(Array.isArray(data.experience) ? data.experience : []);
        setEducation(Array.isArray(data.education) ? data.education : []);
        setSummary(data.summary || "");

        // Hydrate Preferences
        if (data.preferences) {
          const p = data.preferences;
          if (Array.isArray(p.platforms) && p.platforms.length > 0) {
            setPrefPlatforms(p.platforms);
          }
          if (Array.isArray(p.locations) && p.locations.length > 0) {
            setPrefLocations(p.locations);
          } else if (data.location) {
            setPrefLocations([data.location]);
          }
          if (Array.isArray(p.workModes) && p.workModes.length > 0) {
            setPrefWorkModes(p.workModes);
          }
          if (p.minSalary) setPrefMinSalary(p.minSalary);
          if (p.experienceLevel) setPrefExpLevel(p.experienceLevel);
        } else if (data.location) {
          setPrefLocations([data.location, "Remote"]);
        }
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Perform validation across all relevant fields
    const nameErr = validateField("name", name);
    const phoneErr = validateField("phone", phone);
    const linkErr = validateField("linkedinUrl", linkedinUrl);
    const gitErr = validateField("githubUrl", githubUrl);
    const portErr = validateField("portfolioUrl", portfolioUrl);

    const errors: Record<string, string> = {};
    if (nameErr) errors.name = nameErr;
    if (phoneErr) errors.phone = phoneErr;
    if (linkErr) errors.linkedinUrl = linkErr;
    if (gitErr) errors.githubUrl = gitErr;
    if (portErr) errors.portfolioUrl = portErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setTouchedFields({
        name: true,
        phone: true,
        linkedinUrl: true,
        githubUrl: true,
        portfolioUrl: true,
      });
      setMessage({
        text: "Please correct the highlighted form errors before saving.",
        type: "error",
      });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          location: location.trim(),
          targetRoles: targetRoles
            .split(",")
            .map((r) => r.trim())
            .filter(Boolean),
          jobType,
          linkedinUrl: linkedinUrl.trim(),
          portfolioUrl: portfolioUrl.trim(),
          githubUrl: githubUrl.trim(),
          skills,
          experience,
          education,
          summary,
          preferences: {
            platforms: prefPlatforms,
            locations: prefLocations,
            workModes: prefWorkModes,
            minSalary: prefMinSalary,
            experienceLevel: prefExpLevel,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save candidate dossier");
      }

      const updated = await res.json();
      setProfile(updated);
      setMessage({
        text: "✓ Candidate profile and job search preferences saved.",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Save failed",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      await loadProfile();
      setMessage({
        text: "New resume uploaded and extracted successfully.",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Upload failed",
        type: "error",
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleReanalyzeAts = async () => {
    setAnalyzingAts(true);
    setMessage(null);

    try {
      const res = await fetch("/api/resume/analyze", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Analysis failed");
      }

      await loadProfile();
      setMessage({
        text: "Resume scanned successfully.",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Resume scan failed",
        type: "error",
      });
    } finally {
      setAnalyzingAts(false);
    }
  };

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

  const togglePlatform = (platformId: string) => {
    if (prefPlatforms.includes(platformId)) {
      if (prefPlatforms.length > 1) {
        setPrefPlatforms(prefPlatforms.filter((p) => p !== platformId));
      }
    } else {
      setPrefPlatforms([...prefPlatforms, platformId]);
    }
  };

  const toggleWorkMode = (mode: string) => {
    if (prefWorkModes.includes(mode)) {
      if (prefWorkModes.length > 1) {
        setPrefWorkModes(prefWorkModes.filter((m) => m !== mode));
      }
    } else {
      setPrefWorkModes([...prefWorkModes, mode]);
    }
  };

  const addPrefLocation = (locToAdd?: string) => {
    const loc = (locToAdd || newPrefLocation).trim();
    if (loc && !prefLocations.includes(loc)) {
      setPrefLocations([...prefLocations, loc]);
      if (!locToAdd) setNewPrefLocation("");
    }
  };

  const removePrefLocation = (locToRemove: string) => {
    if (prefLocations.length > 1) {
      setPrefLocations(prefLocations.filter((l) => l !== locToRemove));
    }
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        title: "",
        company: "",
        startDate: "",
        endDate: "Present",
        description: "",
      },
    ]);
  };

  const updateExperience = (
    index: number,
    field: keyof ExperienceEntry,
    value: string
  ) => {
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    setExperience(updated);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([
      ...education,
      { degree: "", institution: "", year: "" },
    ]);
  };

  const updateEducation = (
    index: number,
    field: keyof EducationEntry,
    value: string
  ) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6" aria-busy="true" aria-label="Loading candidate profile">
        {/* Banner Skeleton */}
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-[2px]" />
              <Skeleton className="h-7 w-48 rounded-[3px]" />
              <Skeleton className="h-4 w-64 rounded-[2px]" />
            </div>
          </div>
          <Skeleton className="h-11 w-36 rounded-[4px]" />
        </div>

        {/* Section Cards Skeleton */}
        <ProfileSectionSkeleton />
        <ProfileSectionSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header Banner - Mobile App Hero & Desktop Card */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#003399] text-[#FFDA1A] font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-sm border-2 border-[#FFDA1A]">
            {(name || email || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFDA1A] text-[#111111] text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#003399]" />
              Candidate Profile
            </div>
            <h1 className="text-xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              {name || "Your Profile"}
            </h1>
            <p className="text-xs sm:text-sm text-[#484848] mt-0.5 line-clamp-1">
              {targetRoles || "Keep your preferences updated for the AI Job Finder."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleUploadResume}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingResume}
            className="nordic-btn-secondary text-xs h-10 sm:h-11 px-3 sm:px-4 cursor-pointer disabled:opacity-50 tap-active font-bold"
          >
            {uploadingResume ? "Uploading..." : "📄 New Resume"}
          </button>

          <button
            onClick={handleReanalyzeAts}
            disabled={analyzingAts}
            className="nordic-btn-primary text-xs h-10 sm:h-11 px-3 sm:px-4 cursor-pointer disabled:opacity-50 tap-active font-bold"
          >
            {analyzingAts ? "Scanning..." : "⚡ Scan Resume"}
          </button>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6" noValidate>
          {/* Identity Section */}
          <div>
            <h2 className="text-lg font-bold text-[#111111] border-b border-[#DFDFDF] pb-2 mb-4">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="input-name" className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
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
                  className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm text-[#111111] focus:outline-none transition-colors ${
                    fieldErrors.name
                      ? "border-[#CC0008] focus:border-[#CC0008] ring-1 ring-[#CC0008]"
                      : "border-[#DFDFDF] focus:border-[#003399]"
                  }`}
                />
                {fieldErrors.name && (
                  <p id="name-error" className="mt-1 text-xs text-[#CC0008] font-semibold flex items-center gap-1" role="alert">
                    <span aria-hidden="true">⚠</span> {fieldErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="input-email" className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                  Email
                </label>
                <input
                  id="input-email"
                  type="email"
                  disabled
                  value={email}
                  className="w-full h-11 px-3.5 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] text-sm font-mono text-[#484848] cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="input-phone" className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
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
                  className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm font-mono text-[#111111] focus:outline-none transition-colors ${
                    fieldErrors.phone
                      ? "border-[#CC0008] focus:border-[#CC0008] ring-1 ring-[#CC0008]"
                      : "border-[#DFDFDF] focus:border-[#003399]"
                  }`}
                />
                {fieldErrors.phone && (
                  <p id="phone-error" className="mt-1 text-xs text-[#CC0008] font-semibold flex items-center gap-1" role="alert">
                    <span aria-hidden="true">⚠</span> {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="input-location" className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                  Location
                </label>
                <input
                  id="input-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA (or Remote)"
                  className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                />
              </div>
            </div>
          </div>

          {/* Target Parameters */}
          <div>
            <h2 className="text-lg font-bold text-[#111111] border-b border-[#DFDFDF] pb-2 mb-4">
              Target Roles & Job Type
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                  Target Job Titles (comma separated)
                </label>
                <input
                  type="text"
                  value={targetRoles}
                  onChange={(e) => setTargetRoles(e.target.value)}
                  placeholder="Senior Software Engineer, Tech Lead, Frontend Architect"
                  className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                  Job Type
                </label>
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Search Preferences */}
          <div className="bg-[#F9FAFB] border border-[#DFDFDF] rounded-[6px] p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DFDFDF] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#003399]" />
                  <h2 className="text-lg font-bold text-[#111111]">
                    Job Search Preferences
                  </h2>
                </div>
                <p className="text-xs text-[#484848] mt-0.5">
                  The AI Job Finder searches these platforms and locations automatically to match your profile.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#003399] bg-[#003399]/10 px-2.5 py-1 rounded-[3px] self-start sm:self-auto">
                Used in AI Job Finder
              </span>
            </div>

            {/* Preferred Platforms */}
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                Target Job Platforms
              </label>
              <p className="text-xs text-[#767676] mb-3">
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
                          ? "bg-white border-[#003399] shadow-xs ring-1 ring-[#003399]"
                          : "bg-[#F5F5F5] border-[#DFDFDF] opacity-60 hover:opacity-85"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#111111] flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: active ? plat.accent : "#999" }}
                          />
                          {plat.name}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] ${
                            active
                              ? "bg-[#003399] text-white"
                              : "bg-[#DFDFDF] text-[#767676]"
                          }`}
                        >
                          {active ? "Active" : "Off"}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#767676]">
                        {plat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Locations */}
            <div>
              <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                Target Locations
              </label>
              <p className="text-xs text-[#767676] mb-2.5">
                Add cities, countries, or &quot;Remote&quot; where you want to work.
              </p>

              {/* Quick Add Suggestions */}
              <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
                <span className="text-[11px] font-bold text-[#767676] mr-1 shrink-0">
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
                          ? "bg-[#DFDFDF]/40 border-transparent text-[#999] cursor-default"
                          : "bg-white border-[#DFDFDF] text-[#111111] hover:border-[#003399] hover:text-[#003399] cursor-pointer"
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
                  className="flex-1 h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
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
              <div className="flex flex-wrap gap-2 min-h-12 border border-[#DFDFDF] p-3 bg-white rounded-[4px]">
                {prefLocations.map((loc) => (
                  <span
                    key={loc}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#003399]/5 border border-[#003399]/30 text-xs font-bold text-[#003399] rounded-[4px]"
                  >
                    📍 {loc}
                    {prefLocations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePrefLocation(loc)}
                        className="text-[#767676] hover:text-[#CC0008] font-bold cursor-pointer ml-1 text-sm leading-none"
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
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
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
                            ? "bg-[#003399] text-white border-[#003399]"
                            : "bg-white text-[#484848] border-[#DFDFDF] hover:border-[#111111]"
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                  Minimum Desired Salary
                </label>
                <input
                  type="text"
                  value={prefMinSalary}
                  onChange={(e) => setPrefMinSalary(e.target.value)}
                  placeholder="e.g. AED 25,000 / month or $120k"
                  className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                  Experience Level
                </label>
                <select
                  value={prefExpLevel}
                  onChange={(e) => setPrefExpLevel(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
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

          {/* 1-Click Job Clipper Browser Extension */}
          <BrowserExtensionCard />

          {/* Social Profiles */}
          <div>
            <h2 className="text-lg font-bold text-[#111111] border-b border-[#DFDFDF] pb-2 mb-4">
              Links & Profiles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="input-linkedin" className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
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
                  className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm text-[#111111] focus:outline-none transition-colors ${
                    fieldErrors.linkedinUrl
                      ? "border-[#CC0008] focus:border-[#CC0008] ring-1 ring-[#CC0008]"
                      : "border-[#DFDFDF] focus:border-[#003399]"
                  }`}
                />
                {fieldErrors.linkedinUrl && (
                  <p id="linkedin-error" className="mt-1 text-xs text-[#CC0008] font-semibold flex items-center gap-1" role="alert">
                    <span aria-hidden="true">⚠</span> {fieldErrors.linkedinUrl}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="input-github" className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
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
                  className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm text-[#111111] focus:outline-none transition-colors ${
                    fieldErrors.githubUrl
                      ? "border-[#CC0008] focus:border-[#CC0008] ring-1 ring-[#CC0008]"
                      : "border-[#DFDFDF] focus:border-[#003399]"
                  }`}
                />
                {fieldErrors.githubUrl && (
                  <p id="github-error" className="mt-1 text-xs text-[#CC0008] font-semibold flex items-center gap-1" role="alert">
                    <span aria-hidden="true">⚠</span> {fieldErrors.githubUrl}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="input-portfolio" className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
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
                  className={`w-full h-11 px-3.5 bg-white border rounded-[4px] text-sm text-[#111111] focus:outline-none transition-colors ${
                    fieldErrors.portfolioUrl
                      ? "border-[#CC0008] focus:border-[#CC0008] ring-1 ring-[#CC0008]"
                      : "border-[#DFDFDF] focus:border-[#003399]"
                  }`}
                />
                {fieldErrors.portfolioUrl && (
                  <p id="portfolio-error" className="mt-1 text-xs text-[#CC0008] font-semibold flex items-center gap-1" role="alert">
                    <span aria-hidden="true">⚠</span> {fieldErrors.portfolioUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Skills Management */}
          <div>
            <h2 className="text-lg font-bold text-[#111111] border-b border-[#DFDFDF] pb-2 mb-4">
              Skills
            </h2>

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
                placeholder="Add a skill (e.g. React, TypeScript, Python)"
                className="flex-1 h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
              />
              <button
                type="button"
                onClick={addSkill}
                className="nordic-btn-yellow h-11 px-4 text-xs font-bold uppercase tracking-wide cursor-pointer"
              >
                + Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-16 border border-[#DFDFDF] p-4 bg-[#F5F5F5] rounded-[4px]">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#DFDFDF] text-xs font-semibold rounded-[4px] text-[#111111] shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-[#767676] hover:text-[#CC0008] font-bold cursor-pointer ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-2">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  Work Experience & Career History
                </h2>
                <p className="text-xs text-[#767676] mt-0.5">
                  Positions extracted from your resume. AI Job Finder uses this to match seniority and skills.
                </p>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="nordic-btn-yellow h-9 px-3.5 text-xs font-bold uppercase tracking-wide cursor-pointer tap-active shrink-0"
              >
                + Add Position
              </button>
            </div>

            {experience.length === 0 ? (
              <div className="p-6 border border-dashed border-[#DFDFDF] rounded-[4px] text-center text-xs text-[#767676] bg-[#F9FAFB]">
                No positions added yet. Click &ldquo;+ Add Position&rdquo; or upload a resume to extract your history.
              </div>
            ) : (
              <div className="space-y-4">
                {experience.map((exp, idx) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 border border-[#DFDFDF] rounded-xl sm:rounded-[4px] bg-[#F9FAFB] space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-2">
                      <span className="text-xs font-bold uppercase text-[#003399]">
                        Position #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExperience(idx)}
                        className="text-xs text-[#CC0008] hover:underline font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wide mb-1">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          value={exp.title || ""}
                          onChange={(e) => updateExperience(idx, "title", e.target.value)}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wide mb-1">
                          Company *
                        </label>
                        <input
                          type="text"
                          value={exp.company || ""}
                          onChange={(e) => updateExperience(idx, "company", e.target.value)}
                          placeholder="e.g. Acme Tech"
                          className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wide mb-1">
                          Start Date
                        </label>
                        <input
                          type="text"
                          value={exp.startDate || ""}
                          onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                          placeholder="e.g. 2021-03"
                          className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wide mb-1">
                          End Date
                        </label>
                        <input
                          type="text"
                          value={exp.endDate || ""}
                          onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                          placeholder="e.g. Present"
                          className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wide mb-1">
                        Responsibilities & Key Achievements
                      </label>
                      <textarea
                        rows={3}
                        value={exp.description || (Array.isArray(exp.highlights) ? exp.highlights.join("\n") : "")}
                        onChange={(e) => updateExperience(idx, "description", e.target.value)}
                        placeholder="Bullet points and key accomplishments..."
                        className="w-full p-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-2">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  Education & Credentials
                </h2>
                <p className="text-xs text-[#767676] mt-0.5">
                  Degrees, diplomas, and university credentials.
                </p>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="nordic-btn-yellow h-9 px-3.5 text-xs font-bold uppercase tracking-wide cursor-pointer tap-active shrink-0"
              >
                + Add Education
              </button>
            </div>

            {education.length === 0 ? (
              <div className="p-6 border border-dashed border-[#DFDFDF] rounded-[4px] text-center text-xs text-[#767676] bg-[#F9FAFB]">
                No education added yet. Click &ldquo;+ Add Education&rdquo;.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-[#DFDFDF] rounded-xl sm:rounded-[4px] bg-[#F9FAFB] space-y-2 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="absolute top-3 right-3 text-xs text-[#CC0008] hover:underline font-bold cursor-pointer"
                    >
                      ×
                    </button>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wide mb-1">
                        Degree / Program
                      </label>
                      <input
                        type="text"
                        value={edu.degree || ""}
                        onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                        placeholder="B.S. in Computer Science"
                        className="w-full h-9 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wide mb-1">
                        Institution / University
                      </label>
                      <input
                        type="text"
                        value={edu.institution || ""}
                        onChange={(e) => updateEducation(idx, "institution", e.target.value)}
                        placeholder="Stanford University"
                        className="w-full h-9 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#111111] uppercase tracking-wide mb-1">
                        Graduation Year
                      </label>
                      <input
                        type="text"
                        value={edu.year || ""}
                        onChange={(e) => updateEducation(idx, "year", e.target.value)}
                        placeholder="e.g. 2020"
                        className="w-full h-9 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Executive Summary */}
          <div>
            <h2 className="text-lg font-bold text-[#111111] border-b border-[#DFDFDF] pb-2 mb-4">
              About You
            </h2>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief summary of your work experience, strengths, and what you are looking for next..."
              className="w-full p-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
            />
          </div>

          {/* Desktop Save Button */}
          <div className="hidden md:flex justify-end pt-4 border-t border-[#DFDFDF]">
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className="nordic-btn-primary h-11 px-8 text-sm font-bold tracking-wide disabled:opacity-50 cursor-pointer tap-active"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Mobile Sticky Save Bar */}
          <div className="md:hidden fixed bottom-15 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-[#DFDFDF] z-40 shadow-lg">
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className="nordic-btn-primary w-full h-12 text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-md tap-active cursor-pointer"
            >
              {saving ? "Saving Changes..." : "✓ Save Profile & Preferences"}
            </button>
          </div>
        </form>
      </div>

      {/* Accessible Toast Notification System */}
      <Toast
        message={message?.text || null}
        type={message?.type}
        onClose={() => setMessage(null)}
      />
    </div>
  );
}
