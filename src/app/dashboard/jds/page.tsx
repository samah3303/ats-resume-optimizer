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
      <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
          <div>
            <div className="h-8 bg-[#14161D] rounded w-32 animate-pulse" />
            <div className="h-4 bg-[#14161D] rounded w-24 mt-2 animate-pulse" />
          </div>
          <div className="h-10 bg-[#14161D] rounded w-32 animate-pulse" />
        </div>
        <div className="max-w-7xl mx-auto">
          <SkeletonGrid count={6} />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Saved Job Descriptions</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {jds.length} Job Description{jds.length !== 1 ? "s" : ""} saved for ATS scans & application tracking
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
          >
            <span>+ Add Job Manually</span>
          </button>
        </div>

        {/* URL Quick Add Bar (Glassmorphic Carbon Black & Amber) */}
        <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-5 shadow-2xl space-y-3">
          <label className="block text-xs font-black uppercase text-amber-300 tracking-wider">
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
              className="flex-1 w-full min-w-0 px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none text-xs font-semibold"
            />
            <button
              onClick={handleQuickAdd}
              disabled={quickFetching || !quickUrl.trim()}
              className="w-full sm:w-auto shrink-0 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {quickFetching ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Fetching Job...
                </>
              ) : (
                "📥 Fetch & Save Job"
              )}
            </button>
          </div>
          {quickError && (
            <p className="text-xs text-rose-400 font-semibold">{quickError}</p>
          )}
        </div>

        {/* Add Job Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="bg-[#14161D] rounded-3xl border border-amber-500/30 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#242834] pb-3">
                <h2 className="text-base font-black text-white">Add Job Description</h2>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 rounded-full bg-[#090A0C] border border-[#242834] text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-xs text-rose-300 font-bold">
                    ⚠️ {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Company Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                    placeholder="e.g. Google / Stripe"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-300 mb-1">
                    Full Job Description Text *
                  </label>
                  <textarea
                    required
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={8}
                    className="w-full p-4 rounded-xl bg-[#090A0C] border border-[#242834] text-xs text-white focus:outline-none focus:border-amber-500 resize-y"
                    placeholder="Paste the full job requirements, responsibilities, and qualifications..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 py-3 border border-[#242834] text-zinc-300 text-xs font-bold rounded-xl hover:bg-[#090A0C] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all disabled:opacity-50"
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
          <div className="text-center py-12 bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-[#242834] p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-2xl font-bold mx-auto">
              💼
            </div>
            <h3 className="text-base font-black text-white">No Job Descriptions Saved Yet</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Paste job requirements or paste a job posting URL to analyze your resume against target roles.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg inline-block"
            >
              Add Your First Job
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jds.map((jd) => (
              <div
                key={jd.id}
                className="bg-[#14161D]/80 backdrop-blur-xl rounded-3xl border border-[#242834] hover:border-amber-500/40 p-6 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-[#242834] pb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-white text-sm truncate group-hover:text-amber-400 transition-colors">{jd.title}</h3>
                      {jd.company && (
                        <p className="text-xs font-semibold text-amber-300/80 truncate">{jd.company}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                      {new Date(jd.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed break-words">
                    {jd.rawText.slice(0, 180)}...
                  </p>

                  {jd.sourceUrl && (
                    <a
                      href={jd.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-950/80 px-3 py-1 rounded-xl border border-emerald-800 transition-colors"
                    >
                      <span>🔗 View Job Posting</span>
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#242834]">
                  <Link
                    href={`/dashboard/analyze?jdId=${jd.id}`}
                    className="flex-1 min-w-[90px] py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all text-center flex items-center justify-center shadow-sm"
                  >
                    Run Scan 🔍
                  </Link>
                  <button
                    onClick={() => handleAddToTracker(jd.id)}
                    disabled={trackingId === jd.id}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl transition-all border ${
                      trackedIds.has(jd.id)
                        ? "bg-emerald-950 text-emerald-300 border-emerald-800"
                        : "bg-[#090A0C] text-zinc-300 border-[#242834] hover:border-amber-500/50 hover:text-white"
                    } disabled:opacity-50`}
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
                    className="py-2.5 px-2.5 text-xs font-bold text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors disabled:opacity-50"
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
