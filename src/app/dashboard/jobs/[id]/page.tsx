"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { JobListing } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
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
  const [resumeUpdates, setResumeUpdates] = useState<{
    suggestions: Array<{
      section: string;
      current: string;
      suggested: string;
      reason: string;
    }>;
    missingSkills: string[];
    atsScoreForJob: number;
  } | null>(null);
  const [followupEmail, setFollowupEmail] = useState("");
  const [followupContext, setFollowupContext] = useState("post_interview");
  const [linkedinMessage, setLinkedinMessage] = useState("");
  const [linkedinType, setLinkedinType] = useState("connection_request");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const [isApplied, setIsApplied] = useState(false);
  const [appliedDate, setAppliedDate] = useState<string | null>(null);
  const [markingApplied, setMarkingApplied] = useState(false);
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  // Helper to safely parse and normalize resume updates payload
  const normalizeResumeUpdates = (raw: unknown) => {
    if (!raw) return null;
    let parsed: any = raw;
    if (typeof raw === "string") {
      try {
        parsed = JSON.parse(raw);
      } catch {
        return null;
      }
    }
    const obj = parsed?.content || parsed;
    return {
      suggestions: Array.isArray(obj?.suggestions) ? obj.suggestions : [],
      missingSkills: Array.isArray(obj?.missingSkills) ? obj.missingSkills : [],
      atsScoreForJob: typeof obj?.atsScoreForJob === "number" ? obj.atsScoreForJob : 50,
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
    setMarkingApplied(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id, status: "applied" }),
      });
      if (res.ok) {
        setIsApplied(true);
        setAppliedDate(new Date().toISOString());
        setCopyFeedback("✓ Marked as Applied! Saved to your Application Tracker.");
        setTimeout(() => setCopyFeedback(null), 4000);
      }
    } catch (err) {
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
      setCopyFeedback(`✓ Added "${skill}" to your Candidate Profile skills!`);
      setTimeout(() => setCopyFeedback(null), 3500);
    } catch (err) {
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
    setCopyFeedback("✓ Cover letter downloaded as Word (.doc) document!");
    setTimeout(() => setCopyFeedback(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(`${label} copied to clipboard!`);
    setTimeout(() => setCopyFeedback(null), 3000);
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
        setCopyFeedback("✓ Cover letter generated successfully!");
        setTimeout(() => setCopyFeedback(null), 3000);
      } else {
        setCopyFeedback(`❌ ${data.error || "Failed to generate cover letter"}`);
        setTimeout(() => setCopyFeedback(null), 5000);
      }
    } catch (err) {
      console.error("Cover letter generation failed", err);
      setCopyFeedback("❌ Network error generating cover letter");
      setTimeout(() => setCopyFeedback(null), 5000);
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
        setCopyFeedback("✓ Resume suggestions generated!");
        setTimeout(() => setCopyFeedback(null), 3000);
      } else {
        setCopyFeedback(`❌ ${data.error || "Failed to generate suggestions"}`);
        setTimeout(() => setCopyFeedback(null), 5000);
      }
    } catch (err) {
      console.error("Resume updates generation failed", err);
      setCopyFeedback("❌ Network error generating suggestions");
      setTimeout(() => setCopyFeedback(null), 5000);
    } finally {
      setGenerating(false);
    }
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
        setCopyFeedback("✓ Follow-up email generated!");
        setTimeout(() => setCopyFeedback(null), 3000);
      } else {
        setCopyFeedback(`❌ ${data.error || "Failed to generate follow-up email"}`);
        setTimeout(() => setCopyFeedback(null), 5000);
      }
    } catch (err) {
      console.error("Follow-up generation failed", err);
      setCopyFeedback("❌ Network error generating email");
      setTimeout(() => setCopyFeedback(null), 5000);
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
        setCopyFeedback("✓ LinkedIn message generated!");
        setTimeout(() => setCopyFeedback(null), 3000);
      } else {
        setCopyFeedback(`❌ ${data.error || "Failed to generate LinkedIn message"}`);
        setTimeout(() => setCopyFeedback(null), 5000);
      }
    } catch (err) {
      console.error("LinkedIn outreach generation failed", err);
      setCopyFeedback("❌ Network error generating LinkedIn message");
      setTimeout(() => setCopyFeedback(null), 5000);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 border border-[#DFDFDF] bg-white rounded-[4px] animate-pulse" />
        <div className="h-96 border border-[#DFDFDF] bg-white rounded-[4px] animate-pulse" />
      </div>
    );
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
        <div className="flex overflow-x-auto gap-2 pt-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`h-10 px-4 rounded-[4px] text-xs font-bold uppercase tracking-wide cursor-pointer transition-colors whitespace-nowrap ${
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

      {copyFeedback && (
        <div className="border border-[#FFDA1A] bg-[#FFDA1A] text-[#111111] p-3 rounded-[4px] text-xs font-bold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>{copyFeedback}</span>
        </div>
      )}

      {/* Tab Panels */}
      <div className="nordic-card p-6 sm:p-8">
        
        {/* TAB 1: DETAILS */}
        {activeTab === "details" && (
          <div className="space-y-6">
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
                      <span className="w-1.5 h-1.5 rounded-full bg-[#003399] mt-1.5 shrink-0" />
                      <span className="text-[#111111] leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESUME UPDATES */}
        {activeTab === "resume_updates" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFDFDF] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  Resume Suggestions & Missing Skills
                </h2>
                <p className="text-xs text-[#767676] mt-0.5">
                  See which skills you are missing and how to improve your bullet points for this job.
                </p>
              </div>
              <button
                onClick={handleGenerateResumeUpdates}
                disabled={generating}
                className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {generating ? "Checking..." : "Get Suggestions"}
              </button>
            </div>

            {resumeUpdates ? (
              <div className="space-y-6">
                {(resumeUpdates.missingSkills?.length ?? 0) > 0 && (
                  <div className="border border-[#CC0008] bg-[#CC0008]/10 p-4 rounded-[4px]">
                    <span className="text-xs font-bold uppercase block mb-2 text-[#CC0008]">
                      Skills in Job Description Missing from Your Resume
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {resumeUpdates.missingSkills?.map((sk) => {
                        const isAdded = addedSkills.has(sk);
                        return (
                          <div
                            key={sk}
                            className="px-3 py-1.5 bg-white border border-[#DFDFDF] text-xs font-semibold rounded-[4px] text-[#111111] flex items-center gap-2 shadow-2xs"
                          >
                            <span>{sk}</span>
                            <button
                              onClick={() => handleAddSkillToProfile(sk)}
                              disabled={isAdded}
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

                {(resumeUpdates.suggestions?.length ?? 0) > 0 ? (
                  <div className="space-y-4">
                    {resumeUpdates.suggestions?.map((sug, i) => (
                      <div key={i} className="border border-[#DFDFDF] p-4 rounded-[4px] bg-[#F5F5F5]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold uppercase text-[#767676]">
                            Section: {sug.section}
                          </span>
                          <button
                            onClick={() => copyToClipboard(sug.suggested, "Suggested text")}
                            className="text-xs text-[#003399] hover:underline font-bold cursor-pointer"
                          >
                            Copy Text
                          </button>
                        </div>

                        <div className="mb-2 text-xs font-mono line-through text-[#767676]">
                          {sug.current}
                        </div>

                        <div className="p-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs font-mono font-bold text-[#111111]">
                          {sug.suggested}
                        </div>

                        <div className="mt-2 text-[11px] text-[#767676]">
                          Why this helps: {sug.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border border-[#DFDFDF] rounded-[4px] text-xs text-[#767676] bg-[#FAFAFA]">
                    No specific bullet edits needed for this role. Check your missing skills above.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 border border-dashed border-[#DFDFDF] rounded-[4px] text-center text-xs text-[#767676] bg-[#F5F5F5]">
                Click &ldquo;Get Suggestions&rdquo; to see recommendations and missing skills for this job.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COVER LETTER */}
        {activeTab === "cover_letter" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFDFDF] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  Cover Letter
                </h2>
                <p className="text-xs text-[#767676] mt-0.5">
                  A tailored cover letter written specifically for this job.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {coverLetter && (
                  <>
                    <button
                      onClick={() => copyToClipboard(coverLetter, "Cover Letter")}
                      className="nordic-btn-yellow text-xs h-10 px-3.5 cursor-pointer font-bold tap-active"
                    >
                      Copy Letter
                    </button>
                    <button
                      onClick={handleDownloadCoverLetterDoc}
                      className="nordic-btn-secondary text-xs h-10 px-3.5 cursor-pointer font-bold tap-active flex items-center gap-1.5"
                      title="Download as Word document"
                    >
                      📄 Download (.doc)
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="nordic-btn-outline text-xs h-10 px-3.5 cursor-pointer font-bold tap-active hidden sm:flex items-center gap-1"
                      title="Print or save as PDF"
                    >
                      🖨️ Print / PDF
                    </button>
                  </>
                )}
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={generating}
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
              <div className="p-8 border border-dashed border-[#DFDFDF] rounded-[4px] text-center text-xs text-[#767676] bg-[#F5F5F5]">
                Click &ldquo;Write Letter&rdquo; to generate a cover letter for this job.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FOLLOW-UP EMAIL */}
        {activeTab === "followup" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFDFDF] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  Follow-Up Email
                </h2>
                <p className="text-xs text-[#767676] mt-0.5">
                  Send a polite message after applying or interviewing.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={followupContext}
                  onChange={(e) => setFollowupContext(e.target.value)}
                  className="h-10 px-3 text-xs bg-white border border-[#DFDFDF] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#003399]"
                >
                  <option value="post_interview">Thank You (After Interview)</option>
                  <option value="status_check">Status Check (1-2 Weeks Later)</option>
                  <option value="offer_negotiation">Job Offer Response</option>
                </select>

                <button
                  onClick={handleGenerateFollowup}
                  disabled={generating}
                  className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer"
                >
                  {generating ? "Writing..." : "Write Email"}
                </button>
              </div>
            </div>

            {followupEmail ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(followupEmail, "Follow-up email")}
                    className="nordic-btn-yellow text-xs h-9 px-4 cursor-pointer"
                  >
                    Copy Email
                  </button>
                </div>
                <div className="border border-[#DFDFDF] p-6 bg-[#F5F5F5] rounded-[4px] font-mono text-xs whitespace-pre-line leading-relaxed text-[#111111]">
                  {followupEmail}
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-[#DFDFDF] rounded-[4px] text-center text-xs text-[#767676] bg-[#F5F5F5]">
                Choose an email type and click &ldquo;Write Email&rdquo;.
              </div>
            )}
          </div>
        )}

        {/* TAB 5: LINKEDIN OUTREACH */}
        {activeTab === "linkedin" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFDFDF] pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#111111]">
                  LinkedIn Message
                </h2>
                <p className="text-xs text-[#767676] mt-0.5">
                  Reach out directly to recruiters or hiring managers.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={linkedinType}
                  onChange={(e) => setLinkedinType(e.target.value)}
                  className="h-10 px-3 text-xs bg-white border border-[#DFDFDF] rounded-[4px] text-[#111111] focus:outline-none focus:border-[#003399]"
                >
                  <option value="connection_request">Connection Request Note</option>
                  <option value="inmail_recruiter">Message to Recruiter</option>
                  <option value="inmail_manager">Message to Hiring Manager</option>
                </select>

                <button
                  onClick={handleGenerateLinkedin}
                  disabled={generating}
                  className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer"
                >
                  {generating ? "Writing..." : "Write Message"}
                </button>
              </div>
            </div>

            {linkedinMessage ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => copyToClipboard(linkedinMessage, "LinkedIn message")}
                    className="nordic-btn-yellow text-xs h-9 px-4 cursor-pointer"
                  >
                    Copy Message
                  </button>
                </div>
                <div className="border border-[#DFDFDF] p-6 bg-[#F5F5F5] rounded-[4px] font-mono text-xs whitespace-pre-line leading-relaxed text-[#111111]">
                  {linkedinMessage}
                </div>
              </div>
            ) : (
              <div className="p-8 border border-dashed border-[#DFDFDF] rounded-[4px] text-center text-xs text-[#767676] bg-[#F5F5F5]">
                Choose a message type and click &ldquo;Write Message&rdquo;.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
