"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { UserProfile, ExperienceEntry, EducationEntry, GenerationTone } from "@/types";

export function useProfile() {
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
  const [preferredTone, setPreferredTone] = useState<GenerationTone>("professional");

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
      if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        return "LinkedIn URL must start with https:// (e.g. https://linkedin.com/in/username).";
      }
    } else if (field === "githubUrl") {
      if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        return "GitHub URL must start with https:// (e.g. https://github.com/username).";
      }
    } else if (field === "portfolioUrl") {
      if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
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

  const loadProfile = useCallback(async () => {
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
          if (p.preferredTone) setPreferredTone(p.preferredTone);
        } else if (data.location) {
          setPrefLocations([data.location, "Remote"]);
        }
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

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
      return false;
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
            preferredTone,
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
      return true;
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Save failed",
        type: "error",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleUploadResume = async (
    fileOrEvent: File | React.ChangeEvent<HTMLInputElement>
  ) => {
    let file: File | undefined;
    if (fileOrEvent instanceof File) {
      file = fileOrEvent;
    } else if (fileOrEvent && fileOrEvent.target && fileOrEvent.target.files) {
      file = fileOrEvent.target.files[0];
    }
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

  // Skill management
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

  // Preference toggles
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

  // Experience management
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

  // Education management
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

  return {
    profile,
    loading,
    saving,
    uploadingResume,
    analyzingAts,
    message,
    setMessage,
    fieldErrors,
    fileInputRef,
    // Fields
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
    portfolioUrl,
    setPortfolioUrl,
    githubUrl,
    setGithubUrl,
    summary,
    setSummary,
    skills,
    setSkills,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    experience,
    addExperience,
    updateExperience,
    removeExperience,
    education,
    addEducation,
    updateEducation,
    removeEducation,
    // Preferences
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
    preferredTone,
    setPreferredTone,
    // Handlers
    handleFieldBlur,
    handleFieldChange,
    handleSave,
    handleUploadResume,
    handleReanalyzeAts,
    loadProfile,
  };
}
