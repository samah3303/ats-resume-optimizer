"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { JobListing, JobPreferences } from "@/types";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "bookmarked" | "applied" | "naukrigulf" | "indeed" | "linkedin"
  >("all");
  const [sortBy, setSortBy] = useState<"match" | "newest">("match");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal / Add Job State
  const [showAddModal, setShowAddModal] = useState(false);
  const [parsingUrl, setParsingUrl] = useState(false);
  const [parseError, setParseError] = useState("");
  const [savingJob, setSavingJob] = useState(false);

  // Form Fields
  const [urlInput, setUrlInput] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [salary, setSalary] = useState("");
  const [jobType, setJobType] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");

  // AI Live Search State (Naukri Gulf, Indeed, LinkedIn, etc.)
  const [showAiSearchModal, setShowAiSearchModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLocation, setAiLocation] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSearchError, setAiSearchError] = useState("");
  const [aiJobs, setAiJobs] = useState<
    Array<{
      title: string;
      company: string;
      location: string;
      salary: string | null;
      jobType: string;
      description: string;
      requirements: string;
      sourceUrl: string;
      source: string;
      matchScore: number;
    }>
  >([]);
  const [savingAiIndex, setSavingAiIndex] = useState<number | null>(null);
  const [savingAll, setSavingAll] = useState(false);
  const [savedAiIndices, setSavedAiIndices] = useState<Set<number>>(new Set());
  const [profileSummary, setProfileSummary] = useState<{
    role: string;
    skills: string[];
    location: string;
    preferences?: JobPreferences | null;
  } | null>(null);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        filter === "bookmarked" ? "/api/jobs?bookmarked=true" : "/api/jobs";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error("Failed to load jobs", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleParseUrl = async () => {
    if (!urlInput.trim()) return;
    setParsingUrl(true);
    setParseError("");

    try {
      const res = await fetch("/api/jobs/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to extract job posting data");
      }

      const data = await res.json();
      if (data.title) setTitle(data.title);
      if (data.company) setCompany(data.company);
      if (data.location) setLocation(data.location);
      if (data.salary) setSalary(data.salary);
      if (data.jobType) setJobType(data.jobType);
      if (data.description) setDescription(data.description);
      if (data.requirements) {
        setRequirements(
          Array.isArray(data.requirements)
            ? data.requirements.join("\n")
            : data.requirements
        );
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse URL");
    } finally {
      setParsingUrl(false);
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingJob(true);

    try {
      const reqList = requirements
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          location,
          salary,
          jobType,
          description,
          requirements: reqList,
          url: urlInput || null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save job listing");
      }

      resetForm();
      setShowAddModal(false);
      loadJobs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error saving job");
    } finally {
      setSavingJob(false);
    }
  };

  const toggleBookmark = async (e: React.MouseEvent, job: JobListing) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBookmarked: !job.isBookmarked }),
      });

      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id ? { ...j, isBookmarked: !j.isBookmarked } : j
          )
        );
      }
    } catch (err) {
      console.error("Failed to bookmark job", err);
    }
  };

  const handleMarkApplied = async (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, status: "applied" }),
      });

      if (res.ok) {
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  applications: [
                    {
                      id: "applied-" + Date.now(),
                      status: "applied",
                      appliedAt: new Date().toISOString(),
                    },
                  ],
                }
              : j
          )
        );
        setToastMessage("✓ Marked as Applied! Track your interview status in the Tracker.");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error("Failed to mark job as applied", err);
    }
  };

  const resetForm = () => {
    setUrlInput("");
    setTitle("");
    setCompany("");
    setLocation("");
    setSalary("");
    setJobType("Full-time");
    setDescription("");
    setRequirements("");
    setParseError("");
  };

  const openAiSearchModal = async () => {
    setShowAiSearchModal(true);
    setAiSearchError("");
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        const targetRole =
          Array.isArray(data.targetRoles) && data.targetRoles.length > 0
            ? data.targetRoles[0]
            : "Software Engineer";
        const skillsList = Array.isArray(data.skills) ? data.skills : [];
        const pref = data.preferences || null;
        const loc =
          pref?.locations && pref.locations.length > 0
            ? pref.locations.join(", ")
            : data.location || "Dubai, UAE or Remote";

        setProfileSummary({
          role: targetRole,
          skills: skillsList,
          location: loc,
          preferences: pref,
        });

        if (!aiPrompt) {
          setAiPrompt(`${targetRole} (${skillsList.slice(0, 3).join(", ")})`);
        }
        if (!aiLocation) {
          setAiLocation(loc);
        }
      }
    } catch {
      // Fallback default
      setProfileSummary({
        role: "Software Engineer",
        skills: ["React", "TypeScript", "Node.js"],
        location: "Dubai, UAE or Remote",
        preferences: null,
      });
    }
  };

  const handleRunAiSearch = async () => {
    setAiSearching(true);
    setAiSearchError("");
    try {
      const res = await fetch("/api/jobs/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt.trim() || undefined,
          location: aiLocation.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to search jobs with AI");
      }

      const data = await res.json();
      setAiJobs(data.jobs || []);
      setSavedAiIndices(new Set());
    } catch (err) {
      setAiSearchError(err instanceof Error ? err.message : "AI Search failed");
    } finally {
      setAiSearching(false);
    }
  };

  const handleSaveAiJob = async (jobItem: typeof aiJobs[0], index: number) => {
    setSavingAiIndex(index);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobItem.title,
          company: jobItem.company,
          location: jobItem.location,
          salary: jobItem.salary,
          jobType: jobItem.jobType,
          description: jobItem.description,
          requirements: jobItem.requirements,
          sourceUrl: jobItem.sourceUrl,
          source: jobItem.source || "ai_search",
          matchScore: jobItem.matchScore,
        }),
      });

      if (res.ok) {
        setSavedAiIndices((prev) => new Set(prev).add(index));
        loadJobs();
      }
    } catch (err) {
      console.error("Save job error", err);
    } finally {
      setSavingAiIndex(null);
    }
  };

  const handleSaveAllAiJobs = async () => {
    setSavingAll(true);
    try {
      for (let i = 0; i < aiJobs.length; i++) {
        if (!savedAiIndices.has(i)) {
          const j = aiJobs[i];
          await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: j.title,
              company: j.company,
              location: j.location,
              salary: j.salary,
              jobType: j.jobType,
              description: j.description,
              requirements: j.requirements,
              sourceUrl: j.sourceUrl,
              source: j.source || "ai_search",
              matchScore: j.matchScore,
            }),
          });
          setSavedAiIndices((prev) => new Set(prev).add(i));
        }
      }
      loadJobs();
    } catch (err) {
      console.error("Save all error", err);
    } finally {
      setSavingAll(false);
    }
  };

  const savedCount = jobs.filter((j) => j.isBookmarked).length;
  const appliedCount = jobs.filter((j) =>
    j.applications?.some((a) => a.status === "applied")
  ).length;
  const naukriCount = jobs.filter((j) =>
    (j.source || "").toLowerCase().includes("naukri")
  ).length;
  const indeedCount = jobs.filter((j) =>
    (j.source || "").toLowerCase().includes("indeed")
  ).length;
  const linkedinCount = jobs.filter((j) =>
    (j.source || "").toLowerCase().includes("linkedin")
  ).length;

  const filteredJobs = jobs
    .filter((job) => {
      const q = searchQuery.toLowerCase();
      const textMatch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        (job.company && job.company.toLowerCase().includes(q)) ||
        (job.location && job.location.toLowerCase().includes(q));
      if (!textMatch) return false;

      if (filter === "bookmarked") return job.isBookmarked;
      if (filter === "applied")
        return job.applications?.some((a) => a.status === "applied");
      if (filter === "naukrigulf")
        return (job.source || "").toLowerCase().includes("naukri");
      if (filter === "indeed")
        return (job.source || "").toLowerCase().includes("indeed");
      if (filter === "linkedin")
        return (job.source || "").toLowerCase().includes("linkedin");

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return (b.matchScore || 0) - (a.matchScore || 0);
    });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFDA1A] text-[#111111] text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-[#003399]" />
            Jobs
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            Your Saved Jobs
          </h1>
          <p className="text-xs sm:text-sm text-[#484848] mt-0.5 sm:mt-1">
            Track jobs you want to apply for, check your match scores, and create tailored applications.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto shrink-0">
          <button
            onClick={openAiSearchModal}
            className="nordic-btn-yellow text-xs sm:text-sm h-11 px-3 sm:px-5 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 shadow-xs tap-active font-bold"
          >
            <span className="text-base">✨</span>
            <span>AI Job Finder</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="nordic-btn-primary text-xs sm:text-sm h-11 px-3 sm:px-5 cursor-pointer flex items-center justify-center gap-1.5 tap-active font-bold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add a Job
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="border border-[#0A8A00] bg-[#0A8A00]/10 text-[#0A8A00] p-3.5 rounded-xl sm:rounded-[4px] text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{toastMessage}</span>
          </div>
          <Link
            href="/dashboard/tracker"
            className="underline ml-4 hover:opacity-80 shrink-0"
          >
            View in Tracker ➔
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        {/* Horizontal filter tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {[
            { id: "all", label: `All Jobs (${jobs.length})` },
            { id: "applied", label: `✓ Applied (${appliedCount})` },
            { id: "bookmarked", label: `★ Saved (${savedCount})` },
            ...(naukriCount > 0
              ? [{ id: "naukrigulf", label: `Naukri Gulf (${naukriCount})` }]
              : []),
            ...(indeedCount > 0
              ? [{ id: "indeed", label: `Indeed (${indeedCount})` }]
              : []),
            ...(linkedinCount > 0
              ? [{ id: "linkedin", label: `LinkedIn (${linkedinCount})` }]
              : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`h-9 px-3.5 rounded-xl sm:rounded-[4px] text-xs font-bold transition-colors cursor-pointer tap-active whitespace-nowrap shrink-0 ${
                filter === tab.id
                  ? "bg-[#003399] text-white shadow-xs"
                  : "bg-white text-[#484848] border border-[#DFDFDF] hover:bg-[#F5F5F5]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, company, location..."
              className="w-full h-10 px-3.5 bg-white border border-[#DFDFDF] rounded-xl sm:rounded-[4px] text-sm text-[#111111] placeholder-[#767676] focus:outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#767676] font-medium hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 px-3 bg-white border border-[#DFDFDF] rounded-xl sm:rounded-[4px] text-xs font-bold text-[#111111] focus:outline-none focus:border-[#003399] cursor-pointer"
            >
              <option value="match">Highest Match %</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-48 border border-[#DFDFDF] bg-white rounded-[4px] animate-pulse"
            />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="nordic-card p-12 text-center rounded-2xl sm:rounded-[4px]">
          <div className="w-12 h-12 rounded-full bg-[#FFDA1A] text-[#111111] mx-auto mb-4 flex items-center justify-center font-bold text-lg">
            !
          </div>
          <h3 className="text-lg font-bold text-[#111111] mb-1">
            No Jobs Found
          </h3>
          <p className="text-sm text-[#484848] max-w-md mx-auto mb-6">
            Try adjusting your search filters or discover live vacancies with the AI Job Finder.
          </p>
          <button
            onClick={openAiSearchModal}
            className="nordic-btn-yellow text-sm h-10 px-6 cursor-pointer font-bold tap-active"
          >
            ✨ Open AI Job Finder
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredJobs.map((job) => {
            const isHighMatch = job.matchScore !== null && job.matchScore >= 75;
            const isMidMatch =
              job.matchScore !== null &&
              job.matchScore >= 50 &&
              job.matchScore < 75;

            const isApplied = job.applications?.some(
              (a) => a.status === "applied"
            );

            const sourceBadge =
              job.source?.toLowerCase().includes("naukri")
                ? { name: "Naukri Gulf", bg: "bg-[#0A8A00]", text: "text-white" }
                : job.source?.toLowerCase().includes("indeed")
                ? { name: "Indeed", bg: "bg-[#003399]", text: "text-white" }
                : job.source?.toLowerCase().includes("linkedin")
                ? { name: "LinkedIn", bg: "bg-[#0077B5]", text: "text-white" }
                : job.source?.toLowerCase().includes("greenhouse") || job.source?.toLowerCase().includes("lever")
                ? { name: "Direct Portal", bg: "bg-[#FF9900]", text: "text-white" }
                : null;

            return (
              <div
                key={job.id}
                className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-6 flex flex-col justify-between group hover:border-[#003399] transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="truncate">
                      <div className="flex items-center gap-2 mb-1">
                        {sourceBadge && (
                          <span
                            className={`px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold ${sourceBadge.bg} ${sourceBadge.text}`}
                          >
                            {sourceBadge.name}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-[#767676] uppercase tracking-wider block">
                          {job.company || "Enterprise Employer"}
                        </span>
                      </div>
                      <Link
                        href={`/dashboard/jobs/${job.id}`}
                        className="text-base sm:text-lg font-bold text-[#111111] hover:text-[#003399] transition-colors truncate block"
                      >
                        {job.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => toggleBookmark(e, job)}
                        className={`w-8 h-8 rounded-[4px] border border-[#DFDFDF] flex items-center justify-center text-sm font-bold transition-colors cursor-pointer tap-active ${
                          job.isBookmarked
                            ? "bg-[#FFDA1A] text-[#111111] border-[#FFDA1A]"
                            : "bg-white text-[#767676] hover:text-[#111111]"
                        }`}
                        title={job.isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
                      >
                        {job.isBookmarked ? "★" : "☆"}
                      </button>

                      {job.matchScore !== null && (
                        <div
                          className={`px-2 py-1 font-mono text-[11px] sm:text-xs font-bold rounded-[4px] ${
                            isHighMatch
                              ? "bg-[#0A8A00] text-white"
                              : isMidMatch
                              ? "bg-[#FFDA1A] text-[#111111]"
                              : "bg-[#CC0008] text-white"
                          }`}
                          title={`ATS Match: ${job.matchScore}%`}
                        >
                          {job.matchScore}% Match
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#484848] line-clamp-2 mb-3 leading-relaxed">
                    {job.description || "No full description ingested."}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#DFDFDF] flex flex-wrap items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 truncate font-medium text-[#767676]">
                    <span>{job.location || "Remote / Gulf"}</span>
                    <span>•</span>
                    <span className="font-mono text-[#111111]">
                      {job.salary || job.jobType}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isApplied ? (
                      <span className="px-2.5 py-1 bg-[#0A8A00]/10 text-[#0A8A00] border border-[#0A8A00]/30 rounded-[4px] text-xs font-bold flex items-center gap-1">
                        ✓ Applied
                      </span>
                    ) : (
                      <button
                        onClick={(e) => handleMarkApplied(e, job.id)}
                        className="px-2.5 py-1 bg-white hover:bg-[#003399] hover:text-white text-[#003399] border border-[#003399] rounded-[4px] text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer tap-active"
                        title="Mark as Applied and add to Tracker"
                      >
                        ✓ Mark as Applied
                      </button>
                    )}

                    <Link
                      href={`/dashboard/jobs/${job.id}`}
                      className="font-bold text-[#003399] hover:underline flex items-center gap-1 px-1.5 py-1"
                    >
                      View ➔
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Import Modal (Mobile Bottom Sheet / Desktop Dialog) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-2xl bg-white border-t sm:border border-[#DFDFDF] rounded-t-2xl sm:rounded-[8px] shadow-2xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Top Bar */}
            <div className="bg-[#003399] text-white p-4 flex flex-col rounded-t-2xl sm:rounded-t-[8px]">
              <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-2.5 sm:hidden" />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-bold tracking-tight">
                  Add a Job
                </span>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-[4px] bg-[#002B80] hover:bg-[#FFDA1A] hover:text-[#111111] text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center tap-active"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 space-y-5 sm:space-y-6">
              {/* URL Fast Import */}
              <div className="border border-[#DFDFDF] p-4 bg-[#F5F5F5] rounded-[4px]">
                <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-2">
                  Paste Job Link (LinkedIn, Indeed, or company site)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://boards.greenhouse.io/company/jobs/..."
                    className="flex-1 h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-xs text-[#111111] focus:outline-none focus:border-[#003399]"
                  />
                  <button
                    type="button"
                    onClick={handleParseUrl}
                    disabled={parsingUrl || !urlInput.trim()}
                    className="nordic-btn-yellow h-10 px-4 text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {parsingUrl ? "Fetching..." : "Auto-Fill"}
                  </button>
                </div>
                {parseError && (
                  <p className="mt-2 text-xs font-medium text-[#CC0008]">
                    {parseError}
                  </p>
                )}
              </div>

              <form onSubmit={handleSaveJob} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Staff Software Engineer"
                      className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                      Company *
                    </label>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Spotify"
                      className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Remote / Hybrid"
                      className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                      Salary (optional)
                    </label>
                    <input
                      type="text"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. $180,000 - $220,000"
                      className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm font-mono text-[#111111] focus:outline-none focus:border-[#003399]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                      Job Type
                    </label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Part-time">Part-time</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                    Job Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Paste the core responsibilities..."
                    className="w-full p-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                    Key Requirements (one per line)
                  </label>
                  <textarea
                    rows={3}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="5+ years Go or TypeScript&#10;Cloud infrastructure in AWS&#10;Kubernetes in production"
                    className="w-full p-3 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#DFDFDF]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="nordic-btn-outline h-10 px-4 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingJob}
                    className="nordic-btn-primary h-10 px-6 text-xs font-bold uppercase tracking-wide disabled:opacity-50 cursor-pointer"
                  >
                    {savingJob ? "Saving..." : "Save Job"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Job Finder Modal (Mobile Bottom Sheet / Desktop Dialog) */}
      {showAiSearchModal && (
        <div className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-4xl bg-white border-t sm:border border-[#DFDFDF] rounded-t-2xl sm:rounded-[8px] shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#003399] text-white p-4 sm:p-5 flex flex-col rounded-t-2xl sm:rounded-t-[8px] shrink-0">
              <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-2.5 sm:hidden" />
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#FFDA1A] text-[#003399] flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    ✨
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold tracking-tight text-white leading-tight">
                      AI Job Finder
                    </h2>
                    <p className="text-[11px] sm:text-xs text-white/80 mt-0.5 line-clamp-1">
                      Naukri Gulf, Indeed, LinkedIn, Greenhouse, and Lever
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiSearchModal(false)}
                  className="w-8 h-8 rounded-[4px] bg-[#002B80] hover:bg-[#FFDA1A] hover:text-[#111111] text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center tap-active shrink-0 ml-2"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
              {/* Platforms Covered & Profile Summary Banner */}
              <div className="border border-[#DFDFDF] p-4 bg-[#F5F5F5] rounded-[4px] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#111111] uppercase tracking-wide">
                      Active Platforms:
                    </span>
                    <span className="text-[11px] text-[#767676]">
                      (from your preferences)
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      {
                        id: "naukrigulf",
                        name: "Naukri Gulf",
                        color: "#0A8A00",
                      },
                      { id: "indeed", name: "Indeed", color: "#003399" },
                      { id: "linkedin", name: "LinkedIn", color: "#0077B5" },
                      {
                        id: "greenhouse_lever",
                        name: "Greenhouse / Lever",
                        color: "#FF9900",
                      },
                    ].map((plat) => {
                      const isActive =
                        !profileSummary?.preferences?.platforms ||
                        profileSummary.preferences.platforms.includes(plat.id);
                      return (
                        <span
                          key={plat.id}
                          className={`px-2.5 py-0.5 rounded-[3px] border font-bold text-xs flex items-center gap-1.5 shadow-2xs ${
                            isActive
                              ? "bg-white border-[#DFDFDF] text-[#111111]"
                              : "bg-[#DFDFDF]/40 border-transparent text-[#999] line-through"
                          }`}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: isActive ? plat.color : "#bbb",
                            }}
                          />
                          {plat.name}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {profileSummary && (
                  <div className="pt-2 border-t border-[#DFDFDF] flex flex-wrap items-center justify-between gap-3 text-xs text-[#484848]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[#111111]">
                        Profile Context:
                      </span>
                      <span className="px-2 py-0.5 bg-white border border-[#DFDFDF] rounded-[3px] font-mono text-[#003399] font-bold">
                        {profileSummary.role}
                      </span>
                      {profileSummary.preferences?.workModes &&
                        profileSummary.preferences.workModes.length > 0 && (
                          <span className="px-2 py-0.5 bg-white border border-[#DFDFDF] rounded-[3px] text-[#111111] font-medium">
                            💼 {profileSummary.preferences.workModes.join(", ")}
                          </span>
                        )}
                      {profileSummary.preferences?.minSalary && (
                        <span className="px-2 py-0.5 bg-white border border-[#DFDFDF] rounded-[3px] text-[#0A8A00] font-bold">
                          💰 Min {profileSummary.preferences.minSalary}
                        </span>
                      )}
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="text-[#003399] font-bold hover:underline flex items-center gap-1 ml-auto"
                    >
                      Update Preferences ↗
                    </Link>
                  </div>
                )}
              </div>

              {/* Search Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                    Job Title / Keywords
                  </label>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer (React, Node.js)"
                    className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={aiLocation}
                    onChange={(e) => setAiLocation(e.target.value)}
                    placeholder="e.g. Dubai, UAE / Gulf or Remote"
                    className="w-full h-11 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleRunAiSearch}
                  disabled={aiSearching}
                  className="nordic-btn-primary h-11 px-6 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 tap-active"
                >
                  {aiSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Searching Naukri Gulf, Indeed & LinkedIn...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span>Search Live Jobs</span>
                    </>
                  )}
                </button>

                {aiJobs.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSaveAllAiJobs}
                    disabled={savingAll}
                    className="nordic-btn-yellow h-11 px-5 text-xs font-bold uppercase tracking-wide cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 tap-active"
                  >
                    {savingAll ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[#111111] border-t-transparent rounded-full animate-spin" />
                        <span>Saving All...</span>
                      </>
                    ) : (
                      <>
                        <span>+ Save All ({aiJobs.length}) to My Jobs</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {aiSearchError && (
                <div className="p-3 bg-[#CC0008]/10 text-[#CC0008] border border-[#CC0008] rounded-[4px] text-xs font-semibold">
                  {aiSearchError}
                </div>
              )}

              {/* Results List */}
              {aiSearching && (
                <div className="space-y-4 pt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 border border-[#DFDFDF] bg-white rounded-[4px] animate-pulse" />
                  ))}
                </div>
              )}

              {!aiSearching && aiJobs.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs text-[#767676] font-semibold border-b border-[#DFDFDF] pb-2">
                    <span>FOUND {aiJobs.length} OPENINGS</span>
                    <span>CLICK &ldquo;SAVE TO MY JOBS&rdquo; TO ADD TO YOUR DASHBOARD</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {aiJobs.map((j, idx) => {
                      const isSaved = savedAiIndices.has(idx);
                      const isSaving = savingAiIndex === idx;

                      const sourceBadge =
                        j.source?.toLowerCase().includes("naukri")
                          ? { name: "Naukri Gulf", bg: "bg-[#0A8A00]", text: "text-white" }
                          : j.source?.toLowerCase().includes("indeed")
                          ? { name: "Indeed", bg: "bg-[#003399]", text: "text-white" }
                          : j.source?.toLowerCase().includes("linkedin")
                          ? { name: "LinkedIn", bg: "bg-[#0077B5]", text: "text-white" }
                          : { name: j.source?.toUpperCase() || "WEB", bg: "bg-[#111111]", text: "text-white" };

                      return (
                        <div
                          key={idx}
                          className="border border-[#DFDFDF] rounded-[4px] p-5 bg-white hover:border-[#003399] transition-all flex flex-col justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded-[2px] font-mono text-[10px] font-bold ${sourceBadge.bg} ${sourceBadge.text}`}>
                                    {sourceBadge.name}
                                  </span>
                                  <span className="text-xs font-semibold text-[#767676]">
                                    {j.company || "Enterprise Employer"}
                                  </span>
                                </div>
                                <h3 className="text-base font-bold text-[#111111]">
                                  {j.title}
                                </h3>
                              </div>

                              {j.matchScore && (
                                <div className="px-2.5 py-1 bg-[#003399] text-white font-mono text-xs font-bold rounded-[3px] shrink-0">
                                  {j.matchScore}% Match
                                </div>
                              )}
                            </div>

                            <p className="text-xs text-[#484848] leading-relaxed line-clamp-2 mb-3">
                              {j.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#767676]">
                              <span>📍 {j.location || "Remote / Gulf"}</span>
                              {j.salary && <span>💰 {j.salary}</span>}
                              <span>🏷️ {j.jobType || "Full-time"}</span>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-[#DFDFDF] flex flex-wrap items-center justify-between gap-3">
                            {j.sourceUrl ? (
                              <a
                                href={j.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-[#003399] hover:underline flex items-center gap-1"
                              >
                                View Listing on {sourceBadge.name} ↗
                              </a>
                            ) : (
                              <span className="text-xs text-[#767676]">Portal Listing</span>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSaveAiJob(j, idx)}
                              disabled={isSaved || isSaving}
                              className={`h-9 px-4 rounded-[4px] text-xs font-bold transition-all cursor-pointer ${
                                isSaved
                                  ? "bg-[#0A8A00] text-white cursor-default"
                                  : "nordic-btn-yellow"
                              }`}
                            >
                              {isSaving
                                ? "Saving..."
                                : isSaved
                                ? "✓ Saved to My Jobs"
                                : "+ Save to My Jobs"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {!aiSearching && aiJobs.length === 0 && (
                <div className="border border-dashed border-[#DFDFDF] p-8 text-center rounded-[4px] bg-[#F5F5F5] text-xs text-[#767676]">
                  <p className="font-bold text-[#111111] text-sm mb-1">
                    Ready to discover matching jobs
                  </p>
                  <p className="max-w-md mx-auto">
                    Click &ldquo;Search Live Jobs&rdquo; above to query live postings from Naukri Gulf, Indeed, LinkedIn, and company career portals.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
