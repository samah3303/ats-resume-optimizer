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
  const { status } = useSession();
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
      <div className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
          <div>
            <div className="h-8 bg-zinc-100 rounded w-32 animate-pulse" />
            <div className="h-4 bg-zinc-100 rounded w-24 mt-2 animate-pulse" />
          </div>
          <div className="h-10 bg-zinc-100 rounded w-32 animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">Saved Job Descriptions</h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
              {jds.length} Job Description{jds.length !== 1 ? "s" : ""} saved for ATS scans & application tracking
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 border border-black"
          >
            <span>+ Add Job Manually</span>
          </button>
        </div>

        {/* URL Quick Add Bar */}
        <div className="bg-zinc-50 rounded-3xl border border-zinc-200 p-5 shadow-sm space-y-3">
          <label className="block text-xs font-black uppercase text-black tracking-wider">
            ⚡ Quick Add Job From Web URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
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
              placeholder="Paste job posting URL (LinkedIn, Indeed, Company Careers page)..."
              className="flex-1 w-full min-w-0 px-4 py-3 rounded-xl bg-white border border-zinc-300 text-black placeholder-zinc-400 focus:border-black focus:outline-none text-xs font-medium shadow-sm"
            />
            <button
              onClick={handleQuickAdd}
              disabled={quickFetching || !quickUrl.trim()}
              className="w-full sm:w-auto shrink-0 px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5 border border-black"
            >
              {quickFetching ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Fetching Job...
                </>
              ) : (
                "📥 Fetch & Save Job"
              )}
            </button>
          </div>
          {quickError && (
            <p className="text-xs text-rose-600 font-bold">{quickError}</p>
          )}
        </div>

        {/* Add Job Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl border border-zinc-200 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl text-black">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h2 className="text-base font-black text-black">Add Job Description</h2>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-black flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold">
                    ⚠️ {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-black mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black font-medium shadow-sm"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black font-medium shadow-sm"
                    placeholder="e.g. Google / Stripe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-1">
                    Full Job Description Text *
                  </label>
                  <textarea
                    required
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={8}
                    className="w-full p-4 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black resize-y font-medium shadow-sm"
                    placeholder="Paste the full job requirements, responsibilities, and qualifications..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 border border-zinc-300 text-zinc-700 text-xs font-bold rounded-xl hover:bg-zinc-100 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 border border-black shadow-sm"
                  >
                    {submitting ? "Saving..." : "Save Job Description"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List / Empty State */}
        {jds.length === 0 ? (
          <div className="text-center py-12 bg-zinc-50 rounded-3xl border border-zinc-200 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-zinc-200 text-black border border-zinc-300 flex items-center justify-center text-2xl font-bold mx-auto">
              💼
            </div>
            <h3 className="text-base font-black text-black">No Job Descriptions Saved Yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto font-medium">
              Paste job requirements or paste a job posting URL to analyze your resume against target roles.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm border border-black inline-block"
            >
              Add Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jds.map((jd) => (
              <div
                key={jd.id}
                className="bg-white rounded-3xl border border-zinc-200 hover:border-black p-6 shadow-sm transition-all flex flex-col justify-between space-y-4 group text-black"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-zinc-200 pb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-black text-sm truncate group-hover:underline transition-colors">{jd.title}</h3>
                      {jd.company && (
                        <p className="text-xs font-medium text-zinc-500 truncate">{jd.company}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono shrink-0 font-bold">
                      {new Date(jd.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed break-words font-medium">
                    {jd.rawText.slice(0, 180)}...
                  </p>

                  <a
                    href={jd.sourceUrl || `https://www.google.com/search?q=${encodeURIComponent(jd.title + (jd.company ? " " + jd.company : "") + " job posting")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-black bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-xl border border-zinc-300 transition-colors shadow-sm self-start"
                  >
                    <span>🔗 View Job Posting</span>
                  </a>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-zinc-200">
                  <Link
                    href={`/dashboard/analyze?jdId=${jd.id}`}
                    className="flex-1 min-w-[90px] py-2.5 px-3 bg-black hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all text-center flex items-center justify-center shadow-sm border border-black"
                  >
                    Run Scan 🔍
                  </Link>
                  <button
                    onClick={() => handleAddToTracker(jd.id)}
                    disabled={trackingId === jd.id}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all border ${
                      trackedIds.has(jd.id)
                        ? "bg-zinc-200 text-black border-zinc-400"
                        : "bg-white text-zinc-800 border-zinc-300 hover:border-black"
                    } disabled:opacity-50 shadow-sm`}
                  >
                    {trackingId === jd.id
                      ? "..."
                      : trackedIds.has(jd.id)
                      ? "✓ Tracked"
                      : "+ Tracker"}
                  </button>
                  <button
                    onClick={() => handleDelete(jd.id)}
                    disabled={deletingId === jd.id}
                    className="py-2.5 px-2.5 text-xs font-bold text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors disabled:opacity-50"
                  >
                    {deletingId === jd.id ? "..." : "🗑️"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
