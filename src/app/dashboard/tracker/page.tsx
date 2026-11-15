"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ApplicationEntry,
  ApplicationStatus,
  APPLICATION_STATUSES,
} from "@/types";
import Modal from "@/components/ui/Modal";
import { TrackerColumnSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import Toast from "@/components/ui/Toast";

export default function ApplicationTrackerPage() {
  const [applications, setApplications] = useState<ApplicationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileColumn, setMobileColumn] = useState<string>("all");
  const [activeAppModal, setActiveAppModal] = useState<ApplicationEntry | null>(
    null
  );
  const [editingNotes, setEditingNotes] = useState("");
  const [editingContact, setEditingContact] = useState("");
  const [editingDate, setEditingDate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Drag and Drop States
  const [draggingAppId, setDraggingAppId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [justDroppedAppId, setJustDroppedAppId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Failed to load applications", err);
      setToastMessage({
        text: "Failed to load tracked applications.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleStatusChange = async (
    appId: string,
    newStatus: ApplicationStatus
  ) => {
    const target = applications.find((a) => a.id === appId);
    if (!target || target.status === newStatus) return;
    const oldStatus = target.status;

    // 1. Optimistic status update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    setToastMessage({
      text: `✓ Moved to ${newStatus.replace("_", " ")}`,
      type: "info",
    });

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Server rejected status transition");
      }
    } catch (err) {
      // 2. Rollback on failure
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: oldStatus } : a))
      );
      setToastMessage({
        text: "Could not update application status. Reverted.",
        type: "error",
      });
      console.error("Failed to update status", err);
    }
  };

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData("text/plain", appId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingAppId(appId);
  };

  const handleDragEnd = () => {
    setDraggingAppId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: ApplicationStatus) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverColumn === status) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: ApplicationStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("text/plain") || draggingAppId;
    setDragOverColumn(null);
    setDraggingAppId(null);
    if (appId) {
      const target = applications.find((a) => a.id === appId);
      if (target && target.status !== newStatus) {
        setJustDroppedAppId(appId);
        setTimeout(() => setJustDroppedAppId(null), 800);
        handleStatusChange(appId, newStatus);
      }
    }
  };

  const openModal = (app: ApplicationEntry) => {
    setActiveAppModal(app);
    setEditingNotes(app.notes || "");
    setEditingContact(app.contactPerson || "");
    setEditingDate(app.interviewDate || "");
  };

  const handleSaveModal = async () => {
    if (!activeAppModal) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/applications/${activeAppModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: editingNotes,
          contactPerson: editingContact,
          interviewDate: editingDate || null,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setApplications((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
        setActiveAppModal(null);
        setToastMessage({
          text: "✓ Application notes and interview details updated.",
          type: "success",
        });
      } else {
        throw new Error("Failed to save changes");
      }
    } catch (err) {
      setToastMessage({
        text: "Failed to save application updates.",
        type: "error",
      });
      console.error("Failed to save application updates", err);
    } finally {
      setUpdating(false);
    }
  };

  const kanbanColumns: { status: ApplicationStatus; label: string; dot: string }[] = [
    { status: "wishlist", label: "Wishlist", dot: "bg-nordic-neutral" },
    { status: "applied", label: "Applied", dot: "bg-nordic-primary" },
    { status: "phone_screen", label: "Screening", dot: "bg-nordic-secondary" },
    { status: "interview", label: "Interview", dot: "bg-nordic-warning" },
    { status: "offer", label: "Offer", dot: "bg-nordic-success" },
    { status: "rejected", label: "Archived", dot: "bg-nordic-border" },
  ];

  const submittedCount = applications.filter((a) => a.status !== "wishlist").length;
  const interviewCount = applications.filter((a) =>
    ["phone_screen", "interview", "offer", "accepted"].includes(a.status),
  ).length;
  const offerCount = applications.filter((a) =>
    ["offer", "accepted"].includes(a.status),
  ).length;
  const responseRate =
    submittedCount > 0
      ? Math.round((interviewCount / submittedCount) * 1000) / 10
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header Banner */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-nordic-secondary text-nordic-text text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-nordic-primary" />
            Tracker
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-nordic-text tracking-tight">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-nordic-text-secondary mt-0.5 sm:mt-1">
            Track your job applications, upcoming interviews, and offers in one place.
          </p>
        </div>

        <Link
          href="/dashboard/jobs"
          className="nordic-btn-primary text-xs sm:text-sm h-11 px-4 sm:px-5 cursor-pointer text-center shrink-0 flex items-center justify-center gap-2 tap-active font-bold"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add a Job
        </Link>
      </div>

      {/* Funnel Velocity & Response Rate Strip */}
      <div className="p-3.5 sm:p-4 bg-white border border-nordic-border rounded-xl sm:rounded-[4px] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] text-nordic-neutral">
              Funnel Conversion:
            </span>
            <span className="font-mono font-bold text-sm text-nordic-text">
              {submittedCount} Submitted
            </span>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-nordic-border">
            <span className="w-2 h-2 rounded-full bg-nordic-warning" />
            <span className="font-medium text-nordic-text-secondary">Interviews:</span>
            <span className="font-mono font-bold text-sm text-nordic-primary">
              {responseRate}%
            </span>
            <span className="text-nordic-neutral text-[11px]">
              ({interviewCount} calls)
            </span>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-nordic-border">
            <span className="w-2 h-2 rounded-full bg-nordic-success" />
            <span className="font-medium text-nordic-text-secondary">Offers:</span>
            <span className="font-mono font-bold text-sm text-nordic-success">
              {offerCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {responseRate >= 15 ? (
            <span className="font-bold text-nordic-success bg-nordic-success/10 px-2.5 py-1 rounded-[3px] flex items-center gap-1">
              <span>🔥</span> Response rate outperforming industry avg (6%)
            </span>
          ) : (
            <span className="text-nordic-neutral">
              Benchmark: ~6% tech industry average
            </span>
          )}
          <Link
            href="/dashboard"
            className="text-nordic-primary font-bold hover:underline ml-2"
          >
            Funnel Analytics &rarr;
          </Link>
        </div>
      </div>

      {/* Mobile Column Filter Pills */}
      <div
        role="tablist"
        aria-label="Application stages"
        className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileColumn === "all"}
          onClick={() => setMobileColumn("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors tap-active shrink-0 ${
            mobileColumn === "all"
              ? "bg-nordic-primary text-white"
              : "bg-white text-nordic-text-secondary border border-nordic-border"
          }`}
        >
          All ({applications.length})
        </button>
        {kanbanColumns.map((col) => {
          const count = applications.filter((a) => a.status === col.status).length;
          const isSelected = mobileColumn === col.status;
          return (
            <button
              key={col.status}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setMobileColumn(col.status)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors tap-active flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? "bg-nordic-primary text-white"
                  : "bg-white text-nordic-text-secondary border border-nordic-border"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSelected ? "bg-nordic-secondary" : col.dot
                }`}
                aria-hidden="true"
              />
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4" aria-busy="true" aria-label="Loading application pipeline">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <TrackerColumnSkeleton key={i} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Job Applications Tracked Yet"
          description="Track every stage of your job hunt from screening to offer. Save or apply to jobs to start tracking your pipeline."
          action={{
            label: "✨ Find Matching Jobs",
            href: "/dashboard/jobs",
            variant: "yellow",
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colApps = applications.filter((a) => a.status === col.status);
            const isMatch = mobileColumn === "all" || mobileColumn === col.status;
            const isOver = dragOverColumn === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={(e) => handleDragLeave(e, col.status)}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`bg-white border rounded-2xl md:rounded-[4px] shadow-2xs flex-col min-h-[300px] md:min-h-[480px] transition-all duration-200 ${
                  isOver
                    ? "border-2 border-nordic-primary bg-nordic-primary/5 ring-2 ring-nordic-primary/20"
                    : "border-nordic-border"
                } ${isMatch ? "flex" : "hidden md:flex"}`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-nordic-border bg-nordic-bg rounded-t-[4px] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-nordic-text">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} aria-hidden="true" />
                    <span>{col.label}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-white border border-nordic-border font-bold text-[11px] rounded-[2px] font-mono text-nordic-text">
                    {colApps.length}
                  </span>
                </div>

                {/* Cards Container with Drop Zone feedback */}
                <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
                  {/* Drop indicator line at top of column when dragging over */}
                  {isOver && (
                    <div
                      className="h-1 bg-nordic-primary rounded-full mx-1 my-1 animate-pulse shadow-xs"
                      aria-label="Drop target indicator"
                    />
                  )}

                  {colApps.length === 0 ? (
                    <div
                      className={`h-28 border border-dashed rounded-[4px] flex items-center justify-center text-xs text-center p-3 transition-colors ${
                        isOver
                          ? "border-nordic-primary bg-nordic-primary/10 text-nordic-primary font-bold"
                          : "border-nordic-border text-nordic-neutral"
                      }`}
                    >
                      {isOver ? "Drop application here" : "No jobs in this stage"}
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onDragEnd={handleDragEnd}
                        className={`border rounded-[4px] bg-white p-3 hover:border-nordic-primary transition-all duration-200 shadow-2xs group cursor-grab active:cursor-grabbing ${
                          draggingAppId === app.id
                            ? "opacity-40 scale-95 border-dashed border-nordic-primary"
                            : justDroppedAppId === app.id
                            ? "animate-cardDrop ring-2 ring-nordic-primary"
                            : "border-nordic-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* Subtle drag handle icon (⠿) */}
                            <span
                              className="text-sm font-mono text-[#A0A0A0] group-hover:text-nordic-primary select-none shrink-0 leading-none cursor-grab active:cursor-grabbing hidden md:inline-block"
                              title="Drag to change stage"
                              aria-hidden="true"
                            >
                              ⠿
                            </span>
                            <span className="text-[11px] text-nordic-text-secondary uppercase tracking-wider truncate block font-bold">
                              {app.job?.company || "Company"}
                            </span>
                          </div>
                          {app.job?.matchScore !== null && (
                            <span className="text-[10px] font-mono font-bold bg-nordic-primary text-white px-1.5 py-0.5 rounded-[2px] shrink-0">
                              {app.job.matchScore}%
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs text-nordic-text line-clamp-1 mb-2">
                          {app.job?.title}
                        </h4>

                        {app.interviewDate && (
                          <div className="text-[11px] text-nordic-primary font-semibold mb-2 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{app.interviewDate}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-nordic-border flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => openModal(app)}
                            aria-label={`Edit application notes for ${app.job?.title}`}
                            className="text-[11px] font-bold text-nordic-primary hover:underline cursor-pointer touch-target min-w-[32px] min-h-[32px] flex items-center justify-center"
                          >
                            Edit
                          </button>

                          {/* Fallback stage selector for mobile */}
                          <select
                            value={app.status}
                            aria-label={`Move stage for ${app.job?.title}`}
                            onChange={(e) =>
                              handleStatusChange(
                                app.id,
                                e.target.value as ApplicationStatus
                              )
                            }
                            className="text-[10px] border border-nordic-border rounded-[2px] bg-white px-1 py-1 cursor-pointer font-semibold text-nordic-text focus:outline-none"
                          >
                            {APPLICATION_STATUSES.map((st) => (
                              <option key={st.value} value={st.value}>
                                → {st.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail & Notes Modal */}
      <Modal
        isOpen={Boolean(activeAppModal)}
        onClose={() => setActiveAppModal(null)}
        title="Edit Application"
        subtitle={activeAppModal ? `${activeAppModal.job?.title} @ ${activeAppModal.job?.company}` : undefined}
        maxWidth="md"
      >
        <div className="p-4 sm:p-6 space-y-4 text-xs">
          <div>
            <span className="text-[11px] text-nordic-text-secondary font-semibold uppercase block">Job</span>
            <div className="text-base font-bold text-nordic-text mt-0.5">
              {activeAppModal?.job?.title} @ {activeAppModal?.job?.company}
            </div>
          </div>

          <div>
            <label htmlFor="modal-recruiter" className="block font-bold text-nordic-text uppercase mb-1">
              Recruiter or Interviewer
            </label>
            <input
              id="modal-recruiter"
              type="text"
              value={editingContact}
              onChange={(e) => setEditingContact(e.target.value)}
              placeholder="e.g. Sarah Miller"
              className="w-full h-10 px-3 border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
            />
          </div>

          <div>
            <label htmlFor="modal-interview-date" className="block font-bold text-nordic-text uppercase mb-1">
              Interview Date
            </label>
            <input
              id="modal-interview-date"
              type="date"
              value={editingDate}
              onChange={(e) => setEditingDate(e.target.value)}
              className="w-full h-10 px-3 border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
            />
          </div>

          <div>
            <label htmlFor="modal-notes" className="block font-bold text-nordic-text uppercase mb-1">
              Notes
            </label>
            <textarea
              id="modal-notes"
              rows={4}
              value={editingNotes}
              onChange={(e) => setEditingNotes(e.target.value)}
              placeholder="Add notes from interviews, questions asked, or salary discussed..."
              className="w-full p-3 border border-nordic-border rounded-[4px] text-sm text-nordic-text focus:outline-none focus:border-nordic-primary"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-nordic-border">
            <button
              type="button"
              onClick={() => setActiveAppModal(null)}
              className="nordic-btn-outline h-10 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveModal}
              disabled={updating}
              aria-busy={updating}
              className="nordic-btn-primary h-10 px-6 text-xs font-bold uppercase tracking-wide disabled:opacity-50 cursor-pointer"
            >
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Accessible Toast Notification System */}
      <Toast
        message={toastMessage?.text || null}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
