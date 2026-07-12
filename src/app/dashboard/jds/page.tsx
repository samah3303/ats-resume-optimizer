"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, type FormEvent } from "react";
import Link from "next/link";

interface JD {
  id: string;
  title: string;
  company: string | null;
  rawText: string;
  sourceUrl: string | null;
  positionProfileId: string | null;
  createdAt: string;
}

interface Position {
  id: string;
  title: string;
}

export default function JDsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jds, setJds] = useState<JD[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [rawText, setRawText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [positionProfileId, setPositionProfileId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // AI recommendations
  const [recommended, setRecommended] = useState<
    Array<{ title: string; company: string; rawText: string; matchReason: string }>
  >([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [onboardingCountry, setOnboardingCountry] = useState<string | null>(null);

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

  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch("/api/positions");
      if (res.ok) {
        const data = await res.json();
        setPositions(data.positions || []);
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
      Promise.all([fetchJDs(), fetchPositions()]).finally(() =>
        setLoading(false)
      );
      // Fetch country for recommendation subtext
      fetch("/api/onboarding")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => d?.country && setOnboardingCountry(d.country))
        .catch(() => {});
    }
  }, [status, router, fetchJDs, fetchPositions]);

  const resetForm = () => {
    setTitle("");
    setCompany("");
    setRawText("");
    setSourceUrl("");
    setPositionProfileId("");
    setError("");
    setShowForm(false);
  };

  const loadRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch("/api/recommendations?type=jds");
      if (res.ok) {
        const data = await res.json();
        setRecommended(data.jds || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingRecs(false);
    }
  };

  const addRecommendedJD = async (rec: typeof recommended[0]) => {
    try {
      const res = await fetch("/api/jds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rec.title,
          company: rec.company,
          rawText: rec.rawText,
        }),
      });
      if (res.ok) {
        fetchJDs();
        // Remove from recommendations
        setRecommended((prev) => prev.filter((r) => r.title !== rec.title));
      }
    } catch {
      // silently fail
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !rawText) {
      setError("Title and job description text are required.");
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
          sourceUrl: sourceUrl || null,
          positionProfileId: positionProfileId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save JD");
      }

      resetForm();
      fetchJDs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Job Descriptions
          </h1>
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
          Add JD
        </button>
      </div>

      {/* Add JD Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white sm:rounded-2xl shadow-xl w-full sm:max-w-lg p-4 sm:p-6 max-h-screen sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">New Job Description</h2>
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
                  Position Profile
                </label>
                <select
                  value={positionProfileId}
                  onChange={(e) => setPositionProfileId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                >
                  <option value="">None</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Source URL
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description Text *
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
                  {submitting ? "Saving..." : "Save JD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Recommended JDs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              🤖 AI-Recommended JDs
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              🎯 Based on your resume skills + target country{onboardingCountry ? ` (${onboardingCountry})` : ""}. These are practice job descriptions tailored to your profile.
            </p>
          </div>
          <button
            onClick={loadRecommendations}
            disabled={loadingRecs}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50"
          >
            {loadingRecs ? "Generating..." : recommended.length > 0 ? "Regenerate" : "Generate Recommendations"}
          </button>
        </div>
        {loadingRecs && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-gray-500">AI is analyzing your profile...</span>
          </div>
        )}
        {!loadingRecs && recommended.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommended.map((rec, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-indigo-50 to-white rounded-xl border border-indigo-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                    <p className="text-sm text-indigo-600">{rec.company}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{rec.rawText.slice(0, 150)}...</p>
                    <p className="text-xs text-green-600 mt-2 italic">🎯 {rec.matchReason}</p>
                  </div>
                </div>
                <button
                  onClick={() => addRecommendedJD(rec)}
                  className="mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Add JD
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JD Cards */}
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
                  className="text-xs text-indigo-600 hover:text-indigo-700 truncate block mb-3"
                >
                  {jd.sourceUrl}
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
