"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, type FormEvent } from "react";

interface Position {
  id: string;
  title: string;
  targetRole: string;
  industry: string | null;
  notes: string | null;
  createdAt: string;
}

export default function PositionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // AI recommendations
  const [recommended, setRecommended] = useState<
    Array<{ title: string; targetRole: string; industry: string; matchReason: string }>
  >([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [onboardingCountry, setOnboardingCountry] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch("/api/positions");
      if (res.ok) {
        const data = await res.json();
        setPositions(data.positions || []);
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
      fetchPositions();
      // Fetch country for recommendation subtext
      fetch("/api/onboarding")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => d?.country && setOnboardingCountry(d.country))
        .catch(() => {});
    }
  }, [status, router, fetchPositions]);

  const resetForm = () => {
    setTitle("");
    setTargetRole("");
    setIndustry("");
    setNotes("");
    setError("");
    setEditingId(null);
    setShowForm(false);
  };

  const loadRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch("/api/recommendations?type=positions");
      if (res.ok) {
        const data = await res.json();
        setRecommended(data.positions || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingRecs(false);
    }
  };

  const addRecommendedPosition = async (rec: typeof recommended[0]) => {
    try {
      const res = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rec.title,
          targetRole: rec.targetRole,
          industry: rec.industry,
        }),
      });
      if (res.ok) {
        fetchPositions();
        setRecommended((prev) => prev.filter((r) => r.title !== rec.title));
      }
    } catch {
      // silently fail
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title || !targetRole) {
      setError("Title and target role are required.");
      return;
    }

    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/positions/${editingId}`
        : "/api/positions";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          targetRole,
          industry: industry || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save position");
      }

      resetForm();
      fetchPositions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pos: Position) => {
    setEditingId(pos.id);
    setTitle(pos.title);
    setTargetRole(pos.targetRole);
    setIndustry(pos.industry || "");
    setNotes(pos.notes || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this position profile?")) return;
    try {
      const res = await fetch(`/api/positions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPositions((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // silently fail
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
          <h1 className="text-2xl font-bold text-gray-900">Positions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Target role profiles for your job search
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Add Position
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/40">
          <div className="bg-white sm:rounded-2xl shadow-xl w-full sm:max-w-md p-4 sm:p-6 max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Position" : "New Position"}
              </h2>
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
                  Profile Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Role
                </label>
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="e.g. React Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                  placeholder="e.g. Fintech, Healthcare"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                  placeholder="Any additional notes..."
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
                  {submitting ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Recommended Positions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              🤖 AI-Recommended Positions
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              🎯 Based on your work experience and target market{onboardingCountry ? ` (${onboardingCountry})` : ""}. Click to add any role you want to pursue.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommended.map((rec, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-indigo-50 to-white rounded-xl border border-indigo-200 p-4"
              >
                <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                <p className="text-sm text-indigo-600">{rec.targetRole}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                  {rec.industry}
                </span>
                <p className="text-xs text-green-600 mt-2 italic">🎯 {rec.matchReason}</p>
                <button
                  onClick={() => addRecommendedPosition(rec)}
                  className="mt-3 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Add Position
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Position Cards */}
      {positions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <span className="text-4xl block mb-3">🎯</span>
          <p className="text-gray-500 mb-3">No position profiles yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Your First Position
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {positions.map((pos) => (
            <div
              key={pos.id}
              className="bg-white rounded-xl border border-gray-200 px-4 py-3 sm:px-6 sm:py-5 card-hover"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{pos.title}</h3>
                  <p className="text-sm text-indigo-600">{pos.targetRole}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(pos.createdAt).toLocaleDateString()}
                </span>
              </div>

              {pos.industry && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full mb-2">
                  {pos.industry}
                </span>
              )}

              {pos.notes && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {pos.notes}
                </p>
              )}

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={() => handleEdit(pos)}
                  className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] sm:min-h-0"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(pos.id)}
                  className="px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] sm:min-h-0"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
