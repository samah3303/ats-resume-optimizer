"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ApplicationEntry,
  ApplicationStatus,
  APPLICATION_STATUSES,
} from "@/types";

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
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
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
      }
    } catch (err) {
      console.error("Failed to save application updates", err);
    } finally {
      setUpdating(false);
    }
  };

  const kanbanColumns: { status: ApplicationStatus; label: string; dot: string }[] = [
    { status: "wishlist", label: "Wishlist", dot: "bg-[#767676]" },
    { status: "applied", label: "Applied", dot: "bg-[#003399]" },
    { status: "phone_screen", label: "Screening", dot: "bg-[#FFDA1A]" },
    { status: "interview", label: "Interview", dot: "bg-[#E87400]" },
    { status: "offer", label: "Offer", dot: "bg-[#0A8A00]" },
    { status: "rejected", label: "Archived", dot: "bg-[#DFDFDF]" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header Banner */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFDA1A] text-[#111111] text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-[#003399]" />
            Tracker
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            Application Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#484848] mt-0.5 sm:mt-1">
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

      {/* Mobile Column Filter Pills */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        <button
          onClick={() => setMobileColumn("all")}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors tap-active shrink-0 ${
            mobileColumn === "all"
              ? "bg-[#003399] text-white"
              : "bg-white text-[#484848] border border-[#DFDFDF]"
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
              onClick={() => setMobileColumn(col.status)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors tap-active flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? "bg-[#003399] text-white"
                  : "bg-white text-[#484848] border border-[#DFDFDF]"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isSelected ? "bg-[#FFDA1A]" : col.dot
                }`}
              />
              {col.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 border border-[#DFDFDF] bg-white rounded-[4px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const colApps = applications.filter((a) => a.status === col.status);
            const isMatch = mobileColumn === "all" || mobileColumn === col.status;

            return (
              <div
                key={col.status}
                className={`bg-white border border-[#DFDFDF] rounded-2xl md:rounded-[4px] shadow-2xs flex-col min-h-[300px] md:min-h-[460px] ${
                  isMatch ? "flex" : "hidden md:flex"
                }`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-[#DFDFDF] bg-[#F5F5F5] rounded-t-[4px] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#111111]">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dot}`} />
                    <span>{col.label}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-white border border-[#DFDFDF] font-bold text-[11px] rounded-[2px] font-mono text-[#111111]">
                    {colApps.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
                  {colApps.length === 0 ? (
                    <div className="h-28 border border-dashed border-[#DFDFDF] rounded-[4px] flex items-center justify-center text-xs text-[#767676] text-center p-3">
                      No jobs here
                    </div>
                  ) : (
                    colApps.map((app) => (
                      <div
                        key={app.id}
                        className="border border-[#DFDFDF] rounded-[4px] bg-white p-3 hover:border-[#003399] transition-all shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-[11px] text-[#767676] uppercase tracking-wider truncate block font-medium">
                            {app.job?.company || "Company"}
                          </span>
                          {app.job?.matchScore !== null && (
                            <span className="text-[10px] font-mono font-bold bg-[#003399] text-white px-1.5 py-0.5 rounded-[2px]">
                              {app.job.matchScore}%
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs text-[#111111] line-clamp-1 mb-2">
                          {app.job?.title}
                        </h4>

                        {app.interviewDate && (
                          <div className="text-[11px] text-[#003399] font-semibold mb-2 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{app.interviewDate}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-[#DFDFDF] flex items-center justify-between">
                          <button
                            onClick={() => openModal(app)}
                            className="text-[11px] font-bold text-[#003399] hover:underline cursor-pointer"
                          >
                            Edit
                          </button>

                          <select
                            value={app.status}
                            onChange={(e) =>
                              handleStatusChange(
                                app.id,
                                e.target.value as ApplicationStatus
                              )
                            }
                            className="text-[10px] border border-[#DFDFDF] rounded-[2px] bg-white px-1 py-0.5 cursor-pointer font-semibold text-[#111111] focus:outline-none"
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

      {/* Detail & Notes Modal (Mobile Bottom Sheet / Desktop Dialog) */}
      {activeAppModal && (
        <div className="fixed inset-0 z-50 bg-[#111111]/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white border-t sm:border border-[#DFDFDF] rounded-t-2xl sm:rounded-[8px] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto">
            <div className="bg-[#003399] text-white p-4 flex flex-col rounded-t-2xl sm:rounded-t-[8px]">
              <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-2.5 sm:hidden" />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-bold tracking-tight">
                  Edit Application
                </span>
                <button
                  onClick={() => setActiveAppModal(null)}
                  className="w-7 h-7 rounded-[4px] bg-[#002B80] hover:bg-[#FFDA1A] hover:text-[#111111] text-white font-bold text-sm transition-colors cursor-pointer flex items-center justify-center tap-active"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <span className="text-[11px] text-[#767676] font-semibold uppercase block">Job</span>
                <div className="text-base font-bold text-[#111111] mt-0.5">
                  {activeAppModal.job?.title} @ {activeAppModal.job?.company}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#111111] uppercase mb-1">
                  Recruiter or Interviewer
                </label>
                <input
                  type="text"
                  value={editingContact}
                  onChange={(e) => setEditingContact(e.target.value)}
                  placeholder="e.g. Sarah Miller"
                  className="w-full h-10 px-3 border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] uppercase mb-1">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={editingDate}
                  onChange={(e) => setEditingDate(e.target.value)}
                  className="w-full h-10 px-3 border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#111111] uppercase mb-1">
                  Notes
                </label>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Add notes from interviews, questions asked, or salary discussed..."
                  className="w-full p-3 border border-[#DFDFDF] rounded-[4px] text-sm text-[#111111] focus:outline-none focus:border-[#003399]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#DFDFDF]">
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
                  className="nordic-btn-primary h-10 px-6 text-xs font-bold uppercase tracking-wide disabled:opacity-50 cursor-pointer"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
