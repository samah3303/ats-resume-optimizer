"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import {
  JobPostingData,
  CandidateApplicationData,
  PIPELINE_STAGES,
} from "@/components/recruiter/types";
import CandidatePipelineKanban from "@/components/recruiter/CandidatePipelineKanban";
import CandidateDetailModal from "@/components/recruiter/CandidateDetailModal";
import AtsScreeningModal from "@/components/recruiter/AtsScreeningModal";
import AddCandidateModal from "@/components/recruiter/AddCandidateModal";
import JobPostingModal from "@/components/recruiter/JobPostingModal";

export default function JobPipelinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const jobId = typeof params?.id === "string" ? params.id : "";

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<JobPostingData | null>(null);
  const [candidates, setCandidates] = useState<CandidateApplicationData[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateApplicationData | null>(null);
  const [showScreeningModal, setShowScreeningModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);

  const fetchPipelineData = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/recruiter/pipeline/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
        setCandidates(data.applications || []);
      } else if (res.status === 404) {
        toast("Job posting not found", "error");
        router.replace("/dashboard/recruiter");
      }
    } catch {
      toast("Failed to load candidate pipeline", "error");
    } finally {
      setLoading(false);
    }
  }, [jobId, router, toast]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated" && jobId) {
      fetchPipelineData();
    }
  }, [status, jobId, router, fetchPipelineData]);

  // Stage transition handler via PATCH /api/recruiter/pipeline/[id]/stage
  const handleStageChange = async (candidateId: string, newStage: string) => {
    // Optimistic UI Update
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );

    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate((prev) => (prev ? { ...prev, stage: newStage } : null));
    }

    try {
      const res = await fetch(`/api/recruiter/pipeline/${jobId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: candidateId,
          stage: newStage,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to transition candidate stage");
      }

      const stageInfo = PIPELINE_STAGES.find((s) => s.key === newStage);
      toast(`Candidate moved to ${stageInfo?.label || newStage}`, "success");
    } catch (err: any) {
      toast(err.message || "Failed to update stage", "error");
      // Revert on error
      fetchPipelineData();
    }
  };

  const formatSalary = (min: number | null, max: number | null, currency: string) => {
    if (!min && !max) return "Competitive Salary";
    const symbol = currency === "INR" ? "₹" : "$";
    if (min && max) return `${symbol}${min.toLocaleString()} - ${symbol}${max.toLocaleString()}`;
    if (min) return `From ${symbol}${min.toLocaleString()}`;
    return `Up to ${symbol}${max?.toLocaleString()}`;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900 py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-28 bg-zinc-100 rounded-3xl animate-pulse border border-zinc-200" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-72 h-[600px] bg-zinc-100 rounded-3xl animate-pulse border border-zinc-200 shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  // Calculate quick stats
  const screenedCount = candidates.filter((c) => c.fitScore !== null || c.stage !== "applied").length;
  const avgScore =
    candidates.length > 0
      ? Math.round(
          candidates.reduce((acc, c) => acc + (c.fitScore || 0), 0) /
            candidates.filter((c) => c.fitScore !== null).length || 0
        )
      : 0;

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-6 px-4 sm:px-6 lg:px-8 space-y-6 pb-20">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Top Bar: Back Link & Job Header */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link
              href="/dashboard/recruiter"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:underline transition-colors"
            >
              <span>← Back to Recruiter Hub</span>
            </Link>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                  job.status === "active"
                    ? "bg-zinc-900 text-white border border-black"
                    : "bg-zinc-100 text-zinc-800 border border-zinc-300"
                }`}
              >
                ● {job.status}
              </span>
              <button
                onClick={() => setShowEditJobModal(true)}
                className="px-3 py-1 bg-white hover:bg-zinc-100 border border-zinc-300 hover:border-black text-xs font-bold text-zinc-800 rounded-xl transition-colors shadow-sm"
              >
                ✏️ Edit Job
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-t border-zinc-200 pt-4">
            {/* Job Details */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight">
                  {job.title}
                </h1>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-900 border border-zinc-300">
                  {job.department}
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <span>📍</span> {job.location} ({job.remotePolicy})
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span>💼</span> {job.jobType}
                </span>
                <span>•</span>
                <span className="text-black font-bold font-mono">
                  💰 {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                </span>
                <span>•</span>
                <span className="font-bold text-black">
                  👥 {candidates.length} Candidate{candidates.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Top Action Buttons */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setShowAddCandidateModal(true)}
                className="px-4 py-2.5 bg-white hover:bg-zinc-100 border border-zinc-300 hover:border-black text-black font-bold text-xs rounded-2xl transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>+ Add Candidate</span>
              </button>

              <button
                onClick={() => setShowScreeningModal(true)}
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-2xl transition-all shadow-sm border border-black flex items-center gap-1.5 hover:scale-[1.02] active:scale-95"
              >
                <span>⚡ AI Screen Resumes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Metrics Sub-Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
          <div className="flex items-center gap-4 text-xs">
            <span className="text-zinc-600 font-bold">
              Screened: <span className="text-black font-mono font-bold">{screenedCount}/{candidates.length}</span>
            </span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-600 font-bold">
              Avg ATS Fit: <span className="text-black font-mono font-bold">{avgScore > 0 ? `${avgScore}%` : "N/A"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate name or skill..."
              className="px-3.5 py-1.5 bg-white border border-zinc-300 focus:border-black rounded-xl text-xs text-black placeholder-zinc-400 outline-none w-64 transition-colors shadow-sm"
            />
          </div>
        </div>

        {/* Kanban Board */}
        <CandidatePipelineKanban
          candidates={candidates}
          searchQuery={searchQuery}
          onCandidateClick={(c) => setSelectedCandidate(c)}
          onStageChange={handleStageChange}
        />

        {/* Modals */}
        {/* Candidate Detail Modal */}
        {selectedCandidate && (
          <CandidateDetailModal
            open={!!selectedCandidate}
            candidate={selectedCandidate}
            jobId={jobId}
            onClose={() => setSelectedCandidate(null)}
            onStageChange={handleStageChange}
            onCandidateUpdated={fetchPipelineData}
          />
        )}

        {/* Batch AI Screening Modal */}
        <AtsScreeningModal
          open={showScreeningModal}
          jobId={jobId}
          jobTitle={job.title}
          candidateCount={candidates.length}
          onClose={() => setShowScreeningModal(false)}
          onScreeningCompleted={fetchPipelineData}
        />

        {/* Add Candidate Modal */}
        <AddCandidateModal
          open={showAddCandidateModal}
          jobId={jobId}
          jobTitle={job.title}
          onClose={() => setShowAddCandidateModal(false)}
          onCandidateAdded={fetchPipelineData}
        />

        {/* Edit Job Modal */}
        <JobPostingModal
          open={showEditJobModal}
          initialData={job}
          onClose={() => setShowEditJobModal(false)}
          onSaved={(updated) => {
            setJob(updated);
            fetchPipelineData();
          }}
        />
      </div>
    </div>
  );
}
