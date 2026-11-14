"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JobListing } from "@/types";
import { JobDetailSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Toast from "@/components/ui/Toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface BulletUpgradeItem {
  section: string;
  original: string;
  updated: string;
  reason: string;
  keywordsAdded?: string[];
}

interface NewPointItem {
  section: string;
  suggestedBullet: string;
  targetedRequirement: string;
  reason: string;
}

interface SummaryUpgradeItem {
  suggestedSummary: string;
  reason: string;
}

interface DetailedResumeUpdatesState {
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

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "details" | "cover_letter" | "resume_updates" | "followup" | "linkedin"
  >("details");

  // AI Generation States
  const [generating, setGenerating] = useState(false);
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

  // Helper to safely parse and normalize resume updates payload
  const normalizeResumeUpdates = (raw: unknown): DetailedResumeUpdatesState | null => {
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
  };

  useEffect(() => {
    async function fetchJob() {
      try {
        setLoading(true);
        const res = await fetch(`/api/jobs/${id}`);
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
    }
    fetchJob();
  }, [id, router]);

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage({
      text: `✓ ${label} copied to clipboard!`,
      type: "info",
    });
  };

  const handleGenerateCoverLetter = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
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
        body: JSON.stringify({ jobId: id }),
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

    copyToClipboard(lines.join("\n"), "All recommendations");
  };

  const handleGenerateFollowup = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate/followup-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, context: followupContext }),
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

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (!job) return null;

  const tabs = [
    { key: "details", label: "Job Info" },
    { key: "resume_updates", label: "Resume Fixes" },
    { key: "cover_letter", label: "Cover Letter" },
    { key: "followup", label: "Follow-Up Email" },
    { key: "linkedin", label: "LinkedIn Message" },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Breadcrumb & Job Header */}
      <div className="nordic-card p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs text-[#767676] mb-4">
          <Link href="/dashboard/jobs" className="hover:text-[#003399] font-medium flex items-center gap-1">
            ← Back to Jobs
          </Link>
          <span>/</span>
          <span className="text-[#111111] font-semibold">{job.company || "Company"}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#DFDFDF] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#003399]">
                {job.company || "Company"}
              </span>
              {job.source && (
                <span className="px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold bg-[#111111] text-white">
                  {job.source.toUpperCase()}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[#767676]">
              <span>📍 {job.location || "Remote / Hybrid"}</span>
              <span>•</span>
              <span className="font-mono text-[#111111] font-semibold">{job.salary || job.jobType}</span>
              {job.sourceUrl && (
                <>
                  <span>•</span>
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#003399] hover:underline font-semibold flex items-center gap-1"
                  >
                    View Original Post ↗
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isApplied ? (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-[#0A8A00]/10 border border-[#0A8A00]/30 rounded-[4px] text-xs font-bold text-[#0A8A00]">
                <span>✓ Applied</span>
                <Link
                  href="/dashboard/tracker"
                  className="underline text-[11px] hover:opacity-80 ml-1"
                >
                  Tracker ➔
                </Link>
              </div>
            ) : (
              <button
                onClick={handleMarkApplied}
                disabled={markingApplied}
                className="nordic-btn-primary h-11 px-5 text-xs font-bold uppercase tracking-wide cursor-pointer tap-active disabled:opacity-50"
              >
                {markingApplied ? "Saving..." : "✓ Mark as Applied"}
              </button>
            )}

            {job.matchScore !== null && (
              <div className="p-3 sm:p-4 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] text-center min-w-[100px]">
                <span className="text-[10px] text-[#767676] font-bold uppercase block">
                  Match Score
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#003399]">
                  {job.matchScore}%
                </span>
                <span className="text-[10px] font-semibold text-[#0A8A00] block mt-0.5">
                  {job.matchScore >= 75 ? "High Fit" : "Moderate Fit"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tab Controls */}
        <div role="tablist" aria-label="Job preparation tools" className="flex overflow-x-auto gap-2 pt-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                id={`tab-${tab.key}`}
                aria-controls={`panel-${tab.key}`}
                aria-selected={isActive}
                type="button"
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`h-10 px-4 rounded-[4px] text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors whitespace-nowrap touch-target ${
                  isActive
                    ? "bg-[#003399] text-white"
                    : "bg-white text-[#484848] border border-[#DFDFDF] hover:bg-[#F5F5F5]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      <div className="nordic-card p-6 sm:p-8">
        
        {/* TAB 1: DETAILS */}
        {activeTab === "details" && (
          <div
            role="tabpanel"
            id="panel-details"
            aria-labelledby="tab-details"
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold text-[#111111] border-b border-[#DFDFDF] pb-2 mb-4">
                Full Description
              </h2>
              <div className="whitespace-pre-line text-sm leading-relaxed text-[#111111]">
                {job.description || "No full description provided."}
              </div>
            </div>

            {Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#111111] border-b border-[#DFDFDF] pb-2 mb-4">
                  Key Requirements
                </h2>
                <ul className="space-y-2 text-xs">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#003399] mt-1.5 shrink-0" aria-hidden="true" />
                      <span className="text-[#111111] leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESUME UPDATES & DETAILED DIFF SUGGESTIONS */}
        {activeTab === "resume_updates" && (
          <div
            role="tabpanel"
            id="panel-resume_updates"
            aria-labelledby="tab-resume_updates"
            className="space-y-6"
          >
            {/* Header & Master Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DFDFDF] pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-[#111111]">
                    Tailored Resume Optimization Plan
                  </h2>
                  {resumeUpdates && (
                    <span className="px-2 py-0.5 bg-[#003399] text-white text-[11px] font-mono font-bold rounded-[3px]">
                      {resumeUpdates.atsScoreForJob}% ATS Match Potential
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#484848]">
                  Detailed itemized suggestions: missing keywords, bullet point upgrades (Old vs. Updated), and new accomplishment additions to paste into your resume.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {resumeUpdates && (
                  <button
                    type="button"
                    onClick={handleCopyAllRecommendations}
                    className="nordic-btn-yellow text-xs h-10 px-3.5 cursor-pointer font-bold tap-active flex items-center gap-1.5"
                    title="Copy all recommendations as Markdown checklist"
                  >
                    <span>📋</span>
                    <span>Copy All Recommendations</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleGenerateResumeUpdates}
                  disabled={generating}
                  aria-busy={generating}
                  className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  {generating ? "Analyzing Resume..." : resumeUpdates ? "Re-analyze" : "⚡ Get Suggestions"}
                </button>
              </div>
            </div>

            {resumeUpdates ? (
              <div className="space-y-8">
                {/* 1. MISSING KEYWORDS & SKILLS */}
                {(resumeUpdates.missingSkills?.length ?? 0) > 0 && (
                  <div className="border border-[#CC0008] bg-[#CC0008]/5 p-4 sm:p-5 rounded-[4px] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#CC0008]" />
                        <h3 className="text-xs font-bold uppercase tracking-wide text-[#CC0008]">
                          Missing Target Keywords ({resumeUpdates.missingSkills.length})
                        </h3>
                      </div>
                      <span className="text-[11px] text-[#767676] font-medium hidden sm:inline">
                        High ATS filter weighting
                      </span>
                    </div>

                    <p className="text-xs text-[#484848] leading-relaxed">
                      These keywords are explicitly prioritized in the job posting but are absent from your resume text. Add them to your skills list or weave them into your experience bullets.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {resumeUpdates.missingSkills.map((sk) => {
                        const isAdded = addedSkills.has(sk);
                        return (
                          <div
                            key={sk}
                            className="px-3 py-1.5 bg-white border border-[#DFDFDF] text-xs font-semibold rounded-[4px] text-[#111111] flex items-center gap-2 shadow-2xs hover:border-[#CC0008] transition-colors"
                          >
                            <span>{sk}</span>
                            <button
                              type="button"
                              onClick={() => handleAddSkillToProfile(sk)}
                              disabled={isAdded}
                              aria-label={`Add skill ${sk} to candidate profile`}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] transition-colors cursor-pointer tap-active ${
                                isAdded
                                  ? "bg-[#0A8A00] text-white cursor-default"
                                  : "bg-[#003399]/10 text-[#003399] hover:bg-[#003399] hover:text-white"
                              }`}
                            >
                              {isAdded ? "✓ Added to Profile" : "+ Add to My Skills"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. TAILORED PROFESSIONAL SUMMARY */}
                {resumeUpdates.summaryUpgrade && (
                  <div className="border border-[#003399] bg-[#003399]/5 p-4 sm:p-5 rounded-[4px] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#003399]" />
                        <h3 className="text-xs font-bold uppercase tracking-wide text-[#003399]">
                          Tailored Professional Summary
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            resumeUpdates.summaryUpgrade!.suggestedSummary,
                            "Tailored summary"
                          )
                        }
                        className="text-xs text-[#003399] font-bold hover:underline cursor-pointer flex items-center gap-1"
                      >
                        Copy Summary ➔
                      </button>
                    </div>

                    <blockquote className="p-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-xs sm:text-sm text-[#111111] leading-relaxed font-sans border-l-4 border-l-[#003399]">
                      &ldquo;{resumeUpdates.summaryUpgrade.suggestedSummary}&rdquo;
                    </blockquote>

                    <p className="text-[11px] text-[#484848]">
                      <span className="font-bold text-[#111111]">Why this works:</span>{" "}
                      {resumeUpdates.summaryUpgrade.reason}
                    </p>
                  </div>
                )}

                {/* 3. BULLET POINT UPGRADES (OLD VS. UPDATED POINT) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FFDA1A]" />
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[#111111]">
                        Bullet Point Upgrades (Old vs. Updated)
                      </h3>
                      <span className="px-2 py-0.5 bg-[#F5F5F5] border border-[#DFDFDF] text-[10px] font-bold rounded-full">
                        {resumeUpdates.bulletUpgrades?.length || resumeUpdates.suggestions?.length || 0}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#767676]">
                      Rewritten with action verbs, metrics & keywords
                    </span>
                  </div>

                  {resumeUpdates.bulletUpgrades && resumeUpdates.bulletUpgrades.length > 0 ? (
                    <div className="space-y-4">
                      {resumeUpdates.bulletUpgrades.map((item, idx) => (
                        <div
                          key={idx}
                          className="border border-[#DFDFDF] rounded-[4px] p-4 sm:p-5 bg-white space-y-3.5 hover:border-[#003399] transition-all shadow-xs"
                        >
                          {/* Header row */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F0F0] pb-2.5">
                            <span className="text-xs font-bold text-[#003399] uppercase tracking-wider font-mono">
                              Section: {item.section}
                            </span>
                            {item.keywordsAdded && item.keywordsAdded.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="text-[10px] text-[#767676] font-medium">Injected:</span>
                                {item.keywordsAdded.map((kw) => (
                                  <span
                                    key={kw}
                                    className="px-1.5 py-0.5 bg-[#0A8A00]/10 text-[#0A8A00] font-mono text-[10px] font-bold rounded-[2px]"
                                  >
                                    +{kw}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Old Point */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-[#767676] tracking-wider block">
                              Old Point (Generic / Lower Impact)
                            </span>
                            <div className="p-3 bg-[#F5F5F5] border border-[#DFDFDF] rounded-[4px] text-xs font-mono text-[#555555] line-through leading-relaxed">
                              {item.original}
                            </div>
                          </div>

                          {/* Updated Point */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-[#0A8A00] tracking-wider flex items-center gap-1">
                                <span>★</span> ATS-Optimized Point (High Impact)
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(item.updated, "Updated bullet")}
                                className="nordic-btn-primary text-xs h-7 px-2.5 cursor-pointer font-bold flex items-center gap-1 tap-active"
                              >
                                <span>Copy Point</span>
                              </button>
                            </div>
                            <div className="p-3.5 bg-white border-2 border-[#0A8A00]/40 rounded-[4px] text-xs font-mono font-bold text-[#111111] leading-relaxed shadow-2xs">
                              {item.updated}
                            </div>
                          </div>

                          {/* Explanation */}
                          <div className="pt-1 text-[11px] text-[#484848] flex items-start gap-1.5 bg-[#F9F9F9] p-2.5 rounded-[4px]">
                            <span className="text-[#003399] font-bold shrink-0">Why this helps:</span>
                            <span className="leading-snug">{item.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 border border-[#DFDFDF] rounded-[4px] text-xs text-[#484848] bg-[#FAFAFA]">
                      No existing bullet rewrites needed. Check the missing skills and new points below.
                    </div>
                  )}
                </div>

                {/* 4. BRAND NEW POINTS TO ADD */}
                {(resumeUpdates.newPointsToAdd?.length ?? 0) > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0A8A00]" />
                        <h3 className="text-xs font-bold uppercase tracking-wide text-[#111111]">
                          Brand New Points to Add ({resumeUpdates.newPointsToAdd.length})
                        </h3>
                      </div>
                      <span className="text-[11px] text-[#767676]">
                        Directly addresses unmet job requirements
                      </span>
                    </div>

                    <div className="space-y-4">
                      {resumeUpdates.newPointsToAdd.map((pt, idx) => (
                        <div
                          key={idx}
                          className="border border-[#DFDFDF] rounded-[4px] p-4 sm:p-5 bg-white space-y-3.5 hover:border-[#0A8A00] transition-all shadow-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0F0F0] pb-2">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-[#0A8A00] text-white text-[10px] font-bold uppercase tracking-wide rounded-[2px]">
                                New Addition
                              </span>
                              <span className="text-xs font-semibold text-[#111111]">
                                Target: {pt.targetedRequirement}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#767676] font-mono">
                              Placement: {pt.section}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase text-[#484848] tracking-wider">
                                Suggested Accomplishment Bullet
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(pt.suggestedBullet, "New bullet point")}
                                className="nordic-btn-yellow text-xs h-7 px-2.5 cursor-pointer font-bold flex items-center gap-1 tap-active"
                              >
                                <span>Copy New Bullet</span>
                              </button>
                            </div>
                            <div className="p-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-xs font-mono font-bold text-[#111111] leading-relaxed shadow-2xs border-l-4 border-l-[#0A8A00]">
                              • {pt.suggestedBullet}
                            </div>
                          </div>

                          <div className="pt-1 text-[11px] text-[#484848] bg-[#F9F9F9] p-2.5 rounded-[4px]">
                            <span className="font-bold text-[#111111]">Strategy:</span> {pt.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No Resume Optimization Plan Generated Yet"
                description="Scan your resume against this job posting to uncover missing target keywords, bullet point upgrades (Old vs. Updated), and new accomplishment additions."
                action={{
                  label: "⚡ Generate Resume Optimization Plan",
                  onClick: handleGenerateResumeUpdates,
                  variant: "primary",
                }}
              />
            )}
          </div>
        )}

        {/* TAB 3: COVER LETTER */}
        {activeTab === "cover_letter" && (
          <div
            role="tabpanel"
            id="panel-cover_letter"
            aria-labelledby="tab-cover_letter"
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFDFDF] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  Cover Letter
                </h2>
                <p className="text-xs text-[#484848] mt-0.5">
                  A tailored cover letter written specifically for this job.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {coverLetter && (
                  <>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(coverLetter, "Cover Letter")}
                      className="nordic-btn-yellow text-xs h-10 px-3.5 cursor-pointer font-bold tap-active"
                    >
                      Copy Letter
                    </button>
                    <button
                      type="button"
                      onClick={handleDownloadCoverLetterDoc}
                      className="nordic-btn-secondary text-xs h-10 px-3.5 cursor-pointer font-bold tap-active flex items-center gap-1.5"
                      title="Download as Word document"
                    >
                      📄 Download (.doc)
                    </button>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="nordic-btn-outline text-xs h-10 px-3.5 cursor-pointer font-bold tap-active hidden sm:flex items-center gap-1"
                      title="Print or save as PDF"
                    >
                      🖨️ Print / PDF
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleGenerateCoverLetter}
                  disabled={generating}
                  aria-busy={generating}
                  className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer font-bold tap-active"
                >
                  {generating ? "Writing..." : coverLetter ? "Re-write" : "Write Letter"}
                </button>
              </div>
            </div>

            {coverLetter ? (
              <div className="border border-[#DFDFDF] p-6 bg-[#F5F5F5] rounded-[4px] font-mono text-xs whitespace-pre-line leading-relaxed text-[#111111]">
                {coverLetter}
              </div>
            ) : (
              <EmptyState
                title="No Cover Letter Generated"
                description="Tailor a high-impact, ATS-optimized cover letter targeted to this specific position with 1 click."
                action={{
                  label: "✨ Write Cover Letter",
                  onClick: handleGenerateCoverLetter,
                  variant: "yellow",
                }}
              />
            )}
          </div>
        )}

        {/* TAB 4: FOLLOW-UP EMAIL */}
        {activeTab === "followup" && (
          <div
            role="tabpanel"
            id="panel-followup"
            aria-labelledby="tab-followup"
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFDFDF] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  Follow-Up Email
                </h2>
                <p className="text-xs text-[#484848] mt-0.5">
                  Send a polite message after applying or interviewing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={followupContext}
                  aria-label="Follow-up email context"
                  onChange={(e) => setFollowupContext(e.target.value)}
                  className="h-10 px-3 text-xs bg-white border border-[#DFDFDF] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#003399]"
                >
                  <option value="post_interview">Thank You (After Interview)</option>
                  <option value="status_check">Status Check (1-2 Weeks Later)</option>
                  <option value="offer_negotiation">Job Offer Response</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerateFollowup}
                  disabled={generating}
                  aria-busy={generating}
                  className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer font-bold"
                >
                  {generating ? "Writing..." : "Write Email"}
                </button>
              </div>
            </div>

            {followupEmail ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(followupEmail, "Follow-up email")}
                    className="nordic-btn-yellow text-xs h-9 px-4 cursor-pointer font-bold"
                  >
                    Copy Email
                  </button>
                </div>
                <div className="border border-[#DFDFDF] p-6 bg-[#F5F5F5] rounded-[4px] font-mono text-xs whitespace-pre-line leading-relaxed text-[#111111]">
                  {followupEmail}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Follow-Up Email Drafted"
                description="Draft a professional post-interview thank you or polite status check email."
                action={{
                  label: "✉️ Write Email",
                  onClick: handleGenerateFollowup,
                  variant: "primary",
                }}
              />
            )}
          </div>
        )}

        {/* TAB 5: LINKEDIN OUTREACH */}
        {activeTab === "linkedin" && (
          <div
            role="tabpanel"
            id="panel-linkedin"
            aria-labelledby="tab-linkedin"
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFDFDF] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  LinkedIn Message
                </h2>
                <p className="text-xs text-[#484848] mt-0.5">
                  Reach out directly to recruiters or hiring managers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={linkedinType}
                  aria-label="LinkedIn message type"
                  onChange={(e) => setLinkedinType(e.target.value)}
                  className="h-10 px-3 text-xs bg-white border border-[#DFDFDF] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#003399]"
                >
                  <option value="connection_request">Connection Request Note</option>
                  <option value="inmail_recruiter">Message to Recruiter</option>
                  <option value="inmail_manager">Message to Hiring Manager</option>
                </select>

                <button
                  type="button"
                  onClick={handleGenerateLinkedin}
                  disabled={generating}
                  aria-busy={generating}
                  className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer font-bold"
                >
                  {generating ? "Writing..." : "Write Message"}
                </button>
              </div>
            </div>

            {linkedinMessage ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(linkedinMessage, "LinkedIn message")}
                    className="nordic-btn-yellow text-xs h-9 px-4 cursor-pointer font-bold"
                  >
                    Copy Message
                  </button>
                </div>
                <div className="border border-[#DFDFDF] p-6 bg-[#F5F5F5] rounded-[4px] font-mono text-xs whitespace-pre-line leading-relaxed text-[#111111]">
                  {linkedinMessage}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No LinkedIn Message Drafted"
                description="Craft a high-converting, personalized LinkedIn message to recruiter or hiring team."
                action={{
                  label: "💼 Write Message",
                  onClick: handleGenerateLinkedin,
                  variant: "primary",
                }}
              />
            )}
          </div>
        )}

      </div>

      {/* Accessible Toast Notification System */}
      <Toast
        message={toastMessage?.text || null}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
