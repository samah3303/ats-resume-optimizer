"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import ResumeUploader from "@/components/ResumeUploader";

interface Resume {
  id: string;
  name: string;
  parsedText: string;
  isPrimary: boolean;
  createdAt: string;
}

interface JD {
  id: string;
  title: string;
  company: string | null;
}

interface LinkedInResult {
  overallScore: number;
  keywordsMatchPct: number;
  summaryText: string;
  skillsGapJson: string;
}

export default function ResumesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // LinkedIn import state
  const [linkedInText, setLinkedInText] = useState("");
  const [linkedInJdId, setLinkedInJdId] = useState("");
  const [jds, setJds] = useState<JD[]>([]);
  const [linkedInSubmitting, setLinkedInSubmitting] = useState(false);
  const [linkedInResult, setLinkedInResult] = useState<LinkedInResult | null>(null);
  const [linkedInError, setLinkedInError] = useState("");

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchJds = useCallback(async () => {
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
      fetchResumes();
      fetchJds();
    }
  }, [status, router, fetchResumes, fetchJds]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id));
      }
    } catch {
      // silently fail
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (id: string, isPrimary: boolean) => {
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary }),
      });
      if (res.ok) {
        setResumes((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, isPrimary }
              : isPrimary
                ? { ...r, isPrimary: false }
                : r
          )
        );
      }
    } catch {
      // silently fail
    }
  };

  const handleUploaded = (resume: { id: string; name: string }) => {
    fetchResumes();
  };

  const handleLinkedInAnalyze = async () => {
    if (!linkedInText.trim()) {
      setLinkedInError("Please paste your LinkedIn profile text.");
      return;
    }

    setLinkedInError("");
    setLinkedInResult(null);
    setLinkedInSubmitting(true);

    try {
      const res = await fetch("/api/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileText: linkedInText,
          jdId: linkedInJdId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      if (data.analysis) {
        setLinkedInResult({
          overallScore: data.analysis.overallScore,
          keywordsMatchPct: data.analysis.keywordsMatchPct,
          summaryText: data.analysis.summaryText,
          skillsGapJson: data.analysis.skillsGapJson,
        });
      } else {
        setLinkedInResult({
          overallScore: 0,
          keywordsMatchPct: 0,
          summaryText: "Profile imported. Select a JD to get a score.",
          skillsGapJson: "{}",
        });
      }

      fetchResumes();
    } catch (err) {
      setLinkedInError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLinkedInSubmitting(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>
          <p className="text-sm text-gray-500 mt-1">
            {resumes.length} resume{resumes.length !== 1 ? "s" : ""} uploaded
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-8">
        <ResumeUploader onUploaded={handleUploaded} />
      </div>

      {/* LinkedIn Profile Import */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Import LinkedIn Profile
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste LinkedIn Profile Text
            </label>
            <textarea
              value={linkedInText}
              onChange={(e) => setLinkedInText(e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-y"
              placeholder="Paste your LinkedIn profile text (About, Experience, Skills, etc.)..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JD (optional)
            </label>
            <select
              value={linkedInJdId}
              onChange={(e) => setLinkedInJdId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            >
              <option value="">No JD (import profile only)</option>
              {jds.map((jd) => (
                <option key={jd.id} value={jd.id}>
                  {jd.title}
                  {jd.company ? ` — ${jd.company}` : ""}
                </option>
              ))}
            </select>
          </div>

          {linkedInError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {linkedInError}
            </div>
          )}

          <button
            onClick={handleLinkedInAnalyze}
            disabled={linkedInSubmitting}
            className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {linkedInSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing LinkedIn Profile...
              </>
            ) : (
              "Analyze LinkedIn Profile"
            )}
          </button>

          {linkedInResult && (
            <div className="p-4 bg-green-50 rounded-xl border border-green-200 mt-4">
              <p className="text-sm font-semibold text-green-800 mb-2">
                LinkedIn Profile Analyzed
              </p>
              {linkedInResult.overallScore > 0 && (
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="font-bold text-green-700">
                    Score: {linkedInResult.overallScore}%
                  </span>
                  <span className="text-green-700">
                    Keywords: {Math.round(linkedInResult.keywordsMatchPct)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-green-700 mt-1">
                {linkedInResult.summaryText}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Resume Cards */}
      {resumes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">
            No resumes yet. Upload your first one above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate max-w-[180px]">
                        {resume.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {new Date(resume.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {resume.isPrimary && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                      Primary
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {resume.parsedText?.slice(0, 200) || "No text extracted"}
                </p>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={resume.isPrimary}
                      onChange={(e) =>
                        handleSetPrimary(resume.id, e.target.checked)
                      }
                      className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs text-gray-600">Primary</span>
                  </label>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    disabled={deletingId === resume.id}
                    className="ml-auto px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deletingId === resume.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
