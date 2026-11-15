"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { JobListing, GenerationTone } from "@/types";

export interface BulletUpgradeItem {
  section: string;
  original: string;
  updated: string;
  reason: string;
  keywordsAdded?: string[];
}

export interface NewPointItem {
  section: string;
  suggestedBullet: string;
  targetedRequirement: string;
  reason: string;
}

export interface SummaryUpgradeItem {
  suggestedSummary: string;
  reason: string;
}

export interface DetailedResumeUpdatesState {
  atsScoreForJob: number;
  missingSkills: string[];
  bulletUpgrades: BulletUpgradeItem[];
  newPointsToAdd: NewPointItem[];
  summaryUpgrade?: SummaryUpgradeItem;
  suggestions: Array<{
    section: string;
    current: string;
    suggested: string;
    reason: string;
  }>;
}

export type JobDetailTab =
  | "details"
  | "cover_letter"
  | "resume_updates"
  | "followup"
  | "linkedin";

export function normalizeResumeUpdates(raw: unknown): DetailedResumeUpdatesState | null {
  if (!raw) return null;
  let parsed: any = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  let obj = parsed?.content || parsed;
  if (typeof obj === "string") {
    try {
      obj = JSON.parse(obj);
    } catch {
      // keep as is
    }
  }

  const rawBulletUpgrades = Array.isArray(obj?.bulletUpgrades) ? obj.bulletUpgrades : [];
  const rawSuggestions = Array.isArray(obj?.suggestions) ? obj.suggestions : [];

  let bulletUpgrades: BulletUpgradeItem[] = rawBulletUpgrades;
  if (bulletUpgrades.length === 0 && rawSuggestions.length > 0) {
    bulletUpgrades = rawSuggestions.map((s: any) => ({
      section: s.section || "Experience",
      original: s.current || "",
      updated: s.suggested || "",
      reason: s.reason || "",
    }));
  }

  return {
    atsScoreForJob: typeof obj?.atsScoreForJob === "number" ? obj.atsScoreForJob : 65,
    missingSkills: Array.isArray(obj?.missingSkills) ? obj.missingSkills : [],
    bulletUpgrades,
    newPointsToAdd: Array.isArray(obj?.newPointsToAdd) ? obj.newPointsToAdd : [],
    summaryUpgrade:
      obj?.summaryUpgrade && typeof obj.summaryUpgrade.suggestedSummary === "string"
        ? obj.summaryUpgrade
        : undefined,
    suggestions: rawSuggestions,
  };
}

export function useJobDetail(id: string) {
  const router = useRouter();

  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<JobDetailTab>("details");

  // AI Generation States
  const [generating, setGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<GenerationTone>("professional");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUpdates, setResumeUpdates] = useState<DetailedResumeUpdatesState | null>(null);
  const [followupEmail, setFollowupEmail] = useState("");
  const [followupContext, setFollowupContext] = useState("post_interview");
  const [linkedinMessage, setLinkedinMessage] = useState("");
  const [linkedinType, setLinkedinType] = useState("connection_request");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [appliedDate, setAppliedDate] = useState<string | null>(null);
  const [markingApplied, setMarkingApplied] = useState(false);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  const fetchJobAndProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [res, profRes] = await Promise.all([
        fetch(`/api/jobs/${id}`),
        fetch("/api/profile"),
      ]);

      if (profRes.ok) {
        try {
          const profData = await profRes.json();
          if (profData?.preferences?.preferredTone) {
            setSelectedTone(profData.preferences.preferredTone);
          }
        } catch {
          // ignore
        }
      }

      if (res.ok) {
        const data = await res.json();
        setJob(data);
        if (data.applications && data.applications.length > 0) {
          const latestApp = data.applications[0];
          if (latestApp.status === "applied") {
            setIsApplied(true);
            setAppliedDate(latestApp.appliedAt || latestApp.createdAt);
          }
          if (latestApp.coverLetter) setCoverLetter(latestApp.coverLetter);
          if (latestApp.resumeUpdates) {
            setResumeUpdates(normalizeResumeUpdates(latestApp.resumeUpdates));
          }
        }

        // Hydrate from saved generated contents
        if (Array.isArray(data.generatedContents)) {
          for (const item of data.generatedContents) {
            if (item.type === "cover_letter" && item.content) {
              setCoverLetter((prev) => prev || item.content);
            } else if (item.type === "resume_updates" && item.content) {
              setResumeUpdates((prev) => prev || normalizeResumeUpdates(item.content));
            } else if (item.type === "followup_email" && item.content) {
              setFollowupEmail((prev) => prev || item.content);
            } else if (item.type === "linkedin_message" && item.content) {
              setLinkedinMessage((prev) => prev || item.content);
            }
          }
        }
      } else if (res.status === 404) {
        router.replace("/dashboard/jobs");
      }
    } catch (err) {
      console.error("Failed to fetch job", err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchJobAndProfile();
  }, [fetchJobAndProfile]);

  const handleToneChange = async (newTone: GenerationTone) => {
    setSelectedTone(newTone);
    try {
      const profRes = await fetch("/api/profile");
      if (profRes.ok) {
        const profData = await profRes.json();
        const existingPrefs = profData?.preferences || {};
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            preferences: {
              ...existingPrefs,
              preferredTone: newTone,
            },
          }),
        });
      }
      setToastMessage({
        text: `✓ Tone set to ${newTone.charAt(0).toUpperCase() + newTone.slice(1)} (saved to your profile)`,
        type: "success",
      });
    } catch (err) {
      console.error("Failed to persist preferred tone", err);
    }
  };

  const handleMarkApplied = async () => {
    const prevApplied = isApplied;
    const prevDate = appliedDate;

    // 1. Optimistic update
    setIsApplied(true);
    setAppliedDate(new Date().toISOString());
    setToastMessage({
      text: "✓ Marked as Applied! Saved to your Application Tracker.",
      type: "success",
    });

    setMarkingApplied(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, status: "applied" }),
      });
      if (!res.ok) {
        throw new Error("Failed to register application status");
      }
    } catch (err) {
      // 2. Rollback on failure
      setIsApplied(prevApplied);
      setAppliedDate(prevDate);
      setToastMessage({
        text: "Could not mark job as applied. Reverted.",
        type: "error",
      });
      console.error("Failed to mark as applied", err);
    } finally {
      setMarkingApplied(false);
    }
  };

  const handleAddSkillToProfile = async (skill: string) => {
    try {
      const profRes = await fetch("/api/profile");
      if (!profRes.ok) return;
      const prof = await profRes.json();
      const currentSkills = Array.isArray(prof.skills) ? prof.skills : [];
      if (!currentSkills.includes(skill)) {
        const newSkills = [...currentSkills, skill];
        await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills: newSkills }),
        });
      }
      setAddedSkills((prev) => new Set(prev).add(skill));
      setToastMessage({
        text: `✓ Added "${skill}" to your Candidate Profile skills!`,
        type: "success",
      });
    } catch (err) {
      setToastMessage({
        text: "Failed to add skill to profile.",
        type: "error",
      });
      console.error("Failed to add skill", err);
    }
  };

  const handleDownloadCoverLetterDoc = () => {
    if (!coverLetter || !job) return;
    const headerHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Cover Letter - ${job.company || 'Paniund'}</title>
      <style>
        body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #111111; margin: 1in; }
        p { margin-bottom: 12pt; }
      </style>
      </head><body>
      ${coverLetter
        .split('\n\n')
        .map((p) => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
        .join('')}
      </body></html>
    `;
    const blob = new Blob(['\ufeff' + headerHtml], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(job.company || 'Job').replace(/[^a-zA-Z0-9]/g, '_')}_Cover_Letter.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMessage({
      text: "✓ Cover letter downloaded as Word (.doc) document!",
      type: "success",
    });
  };

  const copyToClipboard = (text: string, label: string, key?: string) => {
    navigator.clipboard.writeText(text);
    if (key) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
    setToastMessage({
      text: `✓ ${label} copied to clipboard!`,
      type: "success",
    });
  };

  const handleGenerateCoverLetter = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, tone: selectedTone }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoverLetter(data.coverLetter || data.content || "");
        setToastMessage({
          text: "✓ Cover letter generated successfully!",
          type: "success",
        });
      } else {
        setToastMessage({
          text: data.error || "Failed to generate cover letter",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Cover letter generation failed", err);
      setToastMessage({
        text: "Network error generating cover letter",
        type: "error",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateResumeUpdates = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/resume-updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, tone: selectedTone }),
      });
      const data = await res.json();
      if (res.ok) {
        setResumeUpdates(normalizeResumeUpdates(data));
        setToastMessage({
          text: "✓ Detailed resume suggestions and optimizations generated!",
          type: "success",
        });
      } else {
        setToastMessage({
          text: data.error || "Failed to generate suggestions",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Resume updates generation failed", err);
      setToastMessage({
        text: "Network error generating suggestions",
        type: "error",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyAllRecommendations = () => {
    if (!resumeUpdates) return;
    const lines: string[] = [];
    lines.push(`# Resume Optimization Plan for ${job?.title || "Role"} at ${job?.company || "Company"}`);
    lines.push(`\n**Targeted ATS Match Score:** ${resumeUpdates.atsScoreForJob}%\n`);

    if (resumeUpdates.missingSkills.length > 0) {
      lines.push(`## 🔴 Missing Keywords & Skills`);
      lines.push(resumeUpdates.missingSkills.map((s) => `- [ ] ${s}`).join("\n"));
      lines.push("");
    }

    if (resumeUpdates.summaryUpgrade) {
      lines.push(`## 🔵 Tailored Professional Summary`);
      lines.push(`> ${resumeUpdates.summaryUpgrade.suggestedSummary}`);
      lines.push(`*Why: ${resumeUpdates.summaryUpgrade.reason}*\n`);
    }

    if (resumeUpdates.bulletUpgrades.length > 0) {
      lines.push(`## 🟡 Bullet Point Upgrades (Before vs. After)`);
      resumeUpdates.bulletUpgrades.forEach((b, idx) => {
        lines.push(`### Upgrade ${idx + 1} (${b.section})`);
        lines.push(`- **Original:** ${b.original}`);
        lines.push(`- **Updated:** ${b.updated}`);
        lines.push(`- **Why:** ${b.reason}`);
        if (b.keywordsAdded && b.keywordsAdded.length > 0) {
          lines.push(`- **Keywords Injected:** ${b.keywordsAdded.join(", ")}`);
        }
        lines.push("");
      });
    }

    if (resumeUpdates.newPointsToAdd.length > 0) {
      lines.push(`## 🟢 New Accomplishment Bullets to Add`);
      resumeUpdates.newPointsToAdd.forEach((n, idx) => {
        lines.push(`### Addition ${idx + 1} (${n.section})`);
        lines.push(`- **Target Requirement:** ${n.targetedRequirement}`);
        lines.push(`- **Suggested Bullet:** ${n.suggestedBullet}`);
        lines.push(`- **Why:** ${n.reason}`);
        lines.push("");
      });
    }

    copyToClipboard(lines.join("\n"), "All recommendations", "all_recommendations");
  };

  const handleGenerateFollowup = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/followup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, context: followupContext, tone: selectedTone }),
      });
      const data = await res.json();
      if (res.ok) {
        setFollowupEmail(data.email || data.content || "");
        setToastMessage({
          text: "✓ Follow-up email generated!",
          type: "success",
        });
      } else {
        setToastMessage({
          text: data.error || "Failed to generate follow-up email",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Follow-up email generation failed", err);
      setToastMessage({
        text: "Network error generating follow-up email",
        type: "error",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateLinkedin = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/linkedin-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: id,
          type: linkedinType,
          messageType: linkedinType,
          tone: selectedTone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLinkedinMessage(data.message || data.content || "");
        setToastMessage({
          text: "✓ LinkedIn message generated!",
          type: "success",
        });
      } else {
        setToastMessage({
          text: data.error || "Failed to generate LinkedIn message",
          type: "error",
        });
      }
    } catch (err) {
      console.error("LinkedIn outreach generation failed", err);
      setToastMessage({
        text: "Network error generating LinkedIn message",
        type: "error",
      });
    } finally {
      setGenerating(false);
    }
  };

  return {
    job,
    loading,
    activeTab,
    setActiveTab,
    generating,
    selectedTone,
    setSelectedTone,
    copiedKey,
    coverLetter,
    setCoverLetter,
    resumeUpdates,
    setResumeUpdates,
    followupEmail,
    setFollowupEmail,
    followupContext,
    setFollowupContext,
    linkedinMessage,
    setLinkedinMessage,
    linkedinType,
    setLinkedinType,
    toastMessage,
    setToastMessage,
    isApplied,
    appliedDate,
    markingApplied,
    addedSkills,
    // Handlers
    handleToneChange,
    handleMarkApplied,
    handleAddSkillToProfile,
    handleDownloadCoverLetterDoc,
    copyToClipboard,
    handleGenerateCoverLetter,
    handleGenerateResumeUpdates,
    handleCopyAllRecommendations,
    handleGenerateFollowup,
    handleGenerateLinkedin,
  };
}
