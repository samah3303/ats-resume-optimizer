"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface JDInfo {
  title: string;
  company: string | null;
  sourceUrl: string | null;
}

interface Application {
  id: string;
  jdId: string;
  status: string;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  jobDescription: JDInfo;
}

const STATUSES = [
  { key: "wishlist", label: "Wishlist", color: "bg-zinc-800 text-zinc-300 border border-zinc-700" },
  { key: "applied", label: "Applied", color: "bg-blue-950 text-blue-300 border border-blue-800" },
  { key: "phone_screen", label: "Phone Screen", color: "bg-amber-950 text-amber-300 border border-amber-800" },
  { key: "interview", label: "Interview", color: "bg-purple-950 text-purple-300 border border-purple-800" },
  { key: "offer", label: "Offer", color: "bg-emerald-950 text-emerald-300 border border-emerald-800" },
  { key: "rejected", label: "Rejected", color: "bg-rose-950 text-rose-300 border border-rose-800" },
] as const;

export default function TrackerPage() {
  const { status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/tracker");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchApplications();
    }
  }, [status, router, fetchApplications]);

  const moveApplication = async (appId: string, newStatus: string) => {
    setMovingId(appId);
    try {
      const res = await fetch("/api/tracker", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
      }
    } catch {
      // silently fail
    } finally {
      setMovingId(null);
    }
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm("Remove this application from tracker?")) return;
    setDeletingId(appId);
    try {
      const res = await fetch(`/api/tracker?id=${appId}`, { method: "DELETE" });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const getAppsByStatus = (statusKey: string) =>
    applications.filter((a) => a.status === statusKey);

  const statusIndex = (statusKey: string) =>
    STATUSES.findIndex((s) => s.key === statusKey);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="h-8 bg-[#14161D] rounded w-48 animate-pulse mb-8 max-w-7xl mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#14161D] rounded-2xl p-4 border border-[#242834]">
              <div className="h-6 bg-[#090A0C] rounded w-20 animate-pulse mb-4" />
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-24 bg-[#090A0C] rounded-xl mb-3 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/tools" className="text-xs font-bold text-amber-400 hover:underline">
                ← Back to All Tools
              </Link>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">Application Kanban Tracker</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {applications.length} application{applications.length !== 1 ? "s" : ""} tracked across active hiring stages
            </p>
          </div>
        </div>

        {/* Kanban board */}
        <div className="overflow-x-auto pb-4 md:overflow-visible">
          <div className="flex gap-4 min-w-[900px] md:min-w-0 md:grid md:grid-cols-6">
            {STATUSES.map((statusCol) => {
              const apps = getAppsByStatus(statusCol.key);
              const idx = statusIndex(statusCol.key);

              return (
                <div
                  key={statusCol.key}
                  className="flex-1 md:flex-none min-w-[260px] md:min-w-0 bg-[#14161D]/80 backdrop-blur-xl rounded-3xl border border-[#242834] p-4 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-[#242834] pb-2.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusCol.color}`}>
                        {statusCol.label}
                      </span>
                      <span className="text-xs text-amber-400 font-mono font-bold">
                        {apps.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {apps.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-6 italic font-medium">
                          No applications
                        </p>
                      ) : (
                        apps.map((app) => (
                          <div
                            key={app.id}
                            className="bg-[#090A0C] rounded-2xl border border-[#242834] hover:border-amber-500/40 p-4 shadow-md transition-all space-y-2 group"
                          >
                            <h4 className="font-extrabold text-xs text-white truncate group-hover:text-amber-400 transition-colors">
                              {app.jobDescription.title}
                            </h4>
                            {app.jobDescription.company && (
                              <p className="text-[11px] font-semibold text-zinc-400 truncate">
                                {app.jobDescription.company}
                              </p>
                            )}
                            {app.notes && (
                              <p className="text-[11px] text-zinc-400 line-clamp-2 italic">
                                {app.notes}
                              </p>
                            )}
                            {app.jobDescription.sourceUrl && (
                              <a
                                href={app.jobDescription.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-[10px] font-bold text-amber-400 hover:underline"
                              >
                                View Job ↗
                              </a>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t border-[#242834]">
                              <div className="flex gap-1">
                                {idx > 0 && (
                                  <button
                                    onClick={() => moveApplication(app.id, STATUSES[idx - 1].key)}
                                    disabled={movingId === app.id}
                                    className="p-1 text-zinc-400 hover:text-white hover:bg-[#14161D] rounded-lg transition-colors"
                                    title={`Move to ${STATUSES[idx - 1].label}`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                )}
                                {idx < STATUSES.length - 1 && (
                                  <button
                                    onClick={() => moveApplication(app.id, STATUSES[idx + 1].key)}
                                    disabled={movingId === app.id}
                                    className="p-1 text-zinc-400 hover:text-white hover:bg-[#14161D] rounded-lg transition-colors"
                                    title={`Move to ${STATUSES[idx + 1].label}`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => deleteApplication(app.id)}
                                disabled={deletingId === app.id}
                                className="text-xs font-bold text-rose-400 hover:bg-rose-950/50 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {deletingId === app.id ? "..." : "✕"}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
