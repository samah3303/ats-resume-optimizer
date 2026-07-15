"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

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
  { key: "wishlist", label: "Wishlist", color: "bg-gray-100 text-gray-700" },
  { key: "applied", label: "Applied", color: "bg-blue-100 text-blue-700" },
  { key: "phone_screen", label: "Phone Screen", color: "bg-yellow-100 text-yellow-700" },
  { key: "interview", label: "Interview", color: "bg-purple-100 text-purple-700" },
  { key: "offer", label: "Offer", color: "bg-green-100 text-green-700" },
  { key: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
] as const;

export default function TrackerPage() {
  const { data: session, status } = useSession();
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
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 bg-gray-200 rounded w-32 animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4">
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse mb-4" />
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-24 bg-gray-200 rounded-lg mb-3 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">
          {applications.length} application{applications.length !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4 md:overflow-visible">
        <div className="flex gap-4 min-w-[900px] md:min-w-0 md:grid md:grid-cols-6">
          {STATUSES.map((statusCol) => {
            const apps = getAppsBy(statusCol.key);
            const idx = statusIndex(statusCol.key);

            return (
              <div
                key={statusCol.key}
                className="flex-1 md:flex-none min-w-[260px] md:min-w-0 bg-gray-50 rounded-xl p-3 sm:p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCol.color}`}
                  >
                    {statusCol.label}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {apps.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {apps.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-6">
                      No applications
                    </p>
                  ) : (
                    apps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
                      >
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {app.jobDescription.title}
                        </h4>
                        {app.jobDescription.company && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {app.jobDescription.company}
                          </p>
                        )}
                        {app.notes && (
                          <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 italic">
                            {app.notes}
                          </p>
                        )}
                        {app.jobDescription.sourceUrl && (
                          <a
                            href={app.jobDescription.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-1.5 text-xs text-indigo-600 hover:underline"
                          >
                            View Job ↗
                          </a>
                        )}
                        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
                          <div className="flex gap-1">
                            {idx > 0 && (
                              <button
                                onClick={() =>
                                  moveApplication(app.id, STATUSES[idx - 1].key)
                                }
                                disabled={movingId === app.id}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                title={`Move to ${STATUSES[idx - 1].label}`}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                              </button>
                            )}
                            {idx < STATUSES.length - 1 && (
                              <button
                                onClick={() =>
                                  moveApplication(app.id, STATUSES[idx + 1].key)
                                }
                                disabled={movingId === app.id}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
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
                            className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-1.5 py-0.5 rounded transition-colors disabled:opacity-50"
                          >
                            {deletingId === app.id ? "..." : "✕"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
