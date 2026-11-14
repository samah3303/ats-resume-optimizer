"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { JobListing, JobPreferences } from "@/types";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Toast from "@/components/ui/Toast";
import { JobFilterBar, FilterKey, SortKey } from "@/components/jobs/JobFilterBar";
import { JobCard } from "@/components/jobs/JobCard";
import { AddJobModal } from "@/components/jobs/AddJobModal";
import { AiJobSearchModal } from "@/components/jobs/AiJobSearchModal";

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sortBy, setSortBy] = useState<SortKey>("match");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAiSearchModal, setShowAiSearchModal] = useState(false);
  const [profileSummary, setProfileSummary] = useState<{
    role: string;
    skills: string[];
    location: string;
    preferences?: JobPreferences | null;
  } | null>(null);

  const showToast = useCallback(
    (text: string, type: "success" | "error" | "info" = "info") => {
      setToastMessage({ text, type });
    },
    []
  );

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        filter === "bookmarked" ? "/api/jobs?bookmarked=true" : "/api/jobs";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to load jobs", err);
      showToast("Unable to fetch job listings.", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, showToast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const loadProfileContext = useCallback(async () => {
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
      }
    } catch {
      setProfileSummary({
        role: "Software Engineer",
        skills: ["React", "TypeScript", "Node.js"],
        location: "Dubai, UAE or Remote",
        preferences: null,
      });
    }
  }, []);

  const openAiSearchModal = () => {
    loadProfileContext();
    setShowAiSearchModal(true);
  };

  // Optimistic bookmark mutation with graceful rollback
  const handleToggleBookmark = useCallback(
    async (e: React.MouseEvent, job: JobListing) => {
      e.preventDefault();
      e.stopPropagation();

      const previousState = job.isBookmarked;
      const nextState = !previousState;

      // 1. Optimistic UI update
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, isBookmarked: nextState } : j))
      );
      showToast(
        nextState ? `Saved "${job.title}" to bookmarks` : `Removed "${job.title}" from bookmarks`,
        "info"
      );

      try {
        const res = await fetch(`/api/jobs/${job.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isBookmarked: nextState }),
        });

        if (!res.ok) {
          throw new Error("Server rejected bookmark update");
        }
      } catch (err) {
        // Rollback
        setJobs((prev) =>
          prev.map((j) =>
            j.id === job.id ? { ...j, isBookmarked: previousState } : j
          )
        );
        showToast("Failed to update bookmark. Reverted.", "error");
        console.error("Bookmark mutation failed", err);
      }
    },
    [showToast]
  );

  // Optimistic mark as applied mutation with graceful rollback
  const handleMarkApplied = useCallback(
    async (e: React.MouseEvent, jobId: string) => {
      e.preventDefault();
      e.stopPropagation();

      const targetJob = jobs.find((j) => j.id === jobId);
      if (!targetJob) return;

      const originalApplications = targetJob.applications || [];
      const now = new Date().toISOString();

      // 1. Optimistic UI update
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? {
                ...j,
                applications: [
                  ...originalApplications,
                  { id: `temp-${Date.now()}`, status: "applied", appliedAt: now },
                ],
              }
            : j
        )
      );
      showToast(`Marked "${targetJob.title}" as applied! Added to tracker.`, "success");

      try {
        const res = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId, status: "applied" }),
        });

        if (!res.ok) {
          throw new Error("Server error marking as applied");
        }
      } catch (err) {
        // Rollback
        setJobs((prev) =>
          prev.map((j) =>
            j.id === jobId ? { ...j, applications: originalApplications } : j
          )
        );
        showToast("Failed to mark as applied. Rolled back.", "error");
        console.error("Failed to mark job as applied", err);
      }
    },
    [jobs, showToast]
  );

  const handleJobCreated = useCallback((newJob: JobListing) => {
    setJobs((prev) => [newJob, ...prev]);
  }, []);

  // Performance Optimization: Memoized filter counts
  const counts = useMemo(
    () => ({
      total: jobs.length,
      applied: jobs.filter((j) =>
        j.applications?.some((a) => a.status === "applied")
      ).length,
      bookmarked: jobs.filter((j) => j.isBookmarked).length,
      naukri: jobs.filter((j) =>
        (j.source || "").toLowerCase().includes("naukri")
      ).length,
      indeed: jobs.filter((j) =>
        (j.source || "").toLowerCase().includes("indeed")
      ).length,
      linkedin: jobs.filter((j) =>
        (j.source || "").toLowerCase().includes("linkedin")
      ).length,
    }),
    [jobs]
  );

  // Performance Optimization: Memoized filtered & sorted list
  const filteredJobs = useMemo(() => {
    return jobs
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
  }, [jobs, searchQuery, filter, sortBy]);

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
            onClick={() => setShowAddModal(true)}
            className="nordic-btn-primary text-xs sm:text-sm h-11 px-3 sm:px-5 cursor-pointer flex items-center justify-center gap-1.5 tap-active font-bold"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            Add a Job
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Component */}
      <JobFilterBar
        filter={filter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
      />

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" aria-busy="true" aria-label="Loading job postings">
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          title="No Matching Jobs Found"
          description={
            searchQuery || filter !== "all"
              ? "No jobs matched your current search and filter criteria. Try clearing filters or running the AI Job Finder."
              : "You haven't tracked or saved any jobs yet. Run our AI Job Finder to discover open vacancies across top platforms."
          }
          action={{
            label: "✨ Open AI Job Finder",
            onClick: openAiSearchModal,
            variant: "yellow",
          }}
          secondaryAction={
            searchQuery || filter !== "all"
              ? {
                  label: "Clear Filters",
                  onClick: () => {
                    setFilter("all");
                    setSearchQuery("");
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onToggleBookmark={handleToggleBookmark}
              onMarkApplied={handleMarkApplied}
            />
          ))}
        </div>
      )}

      {/* Modular Add Job Modal */}
      <AddJobModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onJobCreated={handleJobCreated}
        onShowToast={showToast}
      />

      {/* Modular AI Job Search Modal */}
      <AiJobSearchModal
        isOpen={showAiSearchModal}
        onClose={() => setShowAiSearchModal(false)}
        profileSummary={profileSummary}
        onJobSaved={handleJobCreated}
        onShowToast={showToast}
      />

      {/* Accessible Toast Notification System */}
      <Toast
        message={toastMessage?.text || null}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
