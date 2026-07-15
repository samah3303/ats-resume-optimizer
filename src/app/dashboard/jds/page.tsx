"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, type FormEvent } from "react";
import Link from "next/link";
import { SkeletonGrid } from "@/components/SkeletonCard";

interface JD {
  id: string;
  title: string;
  company: string | null;
  rawText: string;
  sourceUrl: string | null;
  positionProfileId: string | null;
  createdAt: string;
}

export default function JDsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jds, setJds] = useState<JD[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [trackedIds, setTrackedIds] = useState<Set<string>>(new Set());

  // Form state
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [rawText, setRawText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Quick URL add
  const [quickUrl, setQuickUrl] = useState("");
  const [quickFetching, setQuickFetching] = useState(false);
  const [quickError, setQuickError] = useState("");

  const fetchJDs = useCallback(async () => {
    try {
      const res = await fetch("/api/jds");
      if (res.ok) {
        const data = await res.json();
        setJds(data.jds || []);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchJDs().finally(() => setLoading(false));
    }
  }, [status, router, fetchJDs]);

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setRawText("");
    setError("");
    setShowForm(false);
  };

  const handleQuickAdd = async () => {
    if (!quickUrl.trim()) {
      setQuickError("Please enter a URL first.");
      return;
    }

    setQuickFetching(true);
    setQuickError("");

    try {
      // Step 1: Fetch the URL to extract job details
      const fetchRes = await fetch("/api/jds/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: quickUrl.trim() }),
      });

      if (!fetchRes.ok) {
        const data = await fetchRes.json();
        throw new Error(data.error || "Failed to fetch URL");
      }

      const fetchData = await fetchRes.json();

      // Step 2: Auto-create the job
      const createRes = await fetch("/api/jds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: fetchData.title || "Untitled Job",
          company: fetchData.company || null,
          rawText: fetchData.rawText || "",
          sourceUrl: quickUrl.trim(),
        }),
      });

      if (!createRes.ok) {
        const data = await createRes.json();
        throw new Error(data.error || "Failed to save job");
      }

      // Step 3: Refresh list and clear input
      setQuickUrl("");
      fetchJDs();
    } catch (err) {
      setQuickError(err instanceof Error ? err.message : "Failed to fetch & add job");
    } finally {
      setQuickFetching(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !rawText) {
      setError("Title and job details are required.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/jds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company: company || null,
          rawText,
          sourceUrl: null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save job");
      }

      resetForm();
      fetchJDs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToTracker = async (jdId: string) => {
    setTrackingId(jdId);
    try {
      const res = await fetch("/api/tracker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdId }),
      });
      if (res.ok) {
        setTrackedIds((prev) => new Set(prev).add(jdId));
        setTimeout(() => {
          setTrackedIds((prev) => {
            const next = new Set(prev);
            next.delete(jdId);
            return next;
          });
        }, 2000);
      }
    } catch (err) {
      console.error("Tracker add failed:", err);
      // silently fail
    } finally {
      setTrackingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job description?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/jds/${id}`, { method: "DELETE" });
      if (res.ok) {
        setJds((prev) => prev.filter((j) => j.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-16 mt-2 animate-pulse" />
          </div>
          <div className="h-9 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <SkeletonGrid count={6} />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {jds.length} JD{jds.length !== 1 ? "s" : ""} saved
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Job
        </button>
      </div>

      {/* URL Quick Add Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="url"
            value={quickUrl}
            onChange={(e) => {
              setQuickUrl(e.target.value);
              setQuickError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleQuickAdd();
            }}
            placeholder="Paste job URL to fetch & add instantly..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-sm"
          />
          <button
            onClick={handleQuickAdd}
            disabled={quickFetching || !quickUrl.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {quickFetching ? "Fetching..." : "Fetch & Add Job"}
          </button>
        </div>
        {quickError && (
          <p className="mt-2 text-sm text-red-600">{quickError}</p>
        )}
      </div>

      {/* Add Job Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white sm:rounded-2xl shadow-xl w-full sm:max-w-lg p-4 sm:p-6 max-h-screen sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Job</h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Details *
                </label>
                <textarea
                  required
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-y"
                  placeholder="Paste the full job description here..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-2 min-h-[44px] sm:min-h-0 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 min-h-[44px] sm:min-h-0 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty state */}
      {jds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <span className="text-4xl block mb-3">📋</span>
          <p className="text-gray-500 mb-3">No job descriptions saved yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Your First JD
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {jds.map((jd) => (
            <div
              key={jd.id}
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 sm:px-6 sm:py-5 card-hover flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{jd.title}</h3>
                  {jd.company && (
                    <p className="text-sm text-gray-500">{jd.company}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(jd.createdAt).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                {jd.rawText.slice(0, 200)}...
              </p>

              {jd.sourceUrl && (
                <a
                  href={jd.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors mb-3"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Apply Now
                </a>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Link
                  href={`/dashboard/analyze?jdId=${jd.id}`}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors min-h-[44px] sm:min-h-0 flex items-center"
                >
                  Analyze
                </Link>
                <button
                  onClick={() => handleAddToTracker(jd.id)}
                  disabled={trackingId === jd.id}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors min-h-[44px] sm:min-h-0 ${
                    trackedIds.has(jd.id)
                      ? "bg-green-100 text-green-700"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  } disabled:opacity-50`}
                >
                  {trackingId === jd.id
                    ? "..."
                    : trackedIds.has(jd.id)
                    ? "✓ Added"
                    : "+ Tracker"}
                </button>
                <button
                  onClick={() => handleDelete(jd.id)}
                  disabled={deletingId === jd.id}
                  className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 min-h-[44px] sm:min-h-0"
                >
                  {deletingId === jd.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
