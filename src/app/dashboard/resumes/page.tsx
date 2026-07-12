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
  docType: string | null;
  createdAt: string;
}

function getDocTypeBadge(docType: string | null, name: string) {
  const type = docType || name.split(".").pop()?.toLowerCase() || null;
  if (type === "pdf") return { label: "PDF", color: "bg-red-100 text-red-700" };
  if (type === "docx") return { label: "DOCX", color: "bg-blue-100 text-blue-700" };
  if (type === "doc") return { label: "DOC", color: "bg-amber-100 text-amber-700" };
  return null;
}

export default function ResumesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchResumes();
    }
  }, [status, router, fetchResumes]);

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

      {/* Resume Cards */}
      {resumes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">
            No resumes yet. Upload your first one above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {resumes.map((resume) => {
            const badge = getDocTypeBadge(resume.docType, resume.name);
            return (
            <div
              key={resume.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover"
            >
              <div className="px-4 py-3 sm:px-5 sm:py-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 truncate max-w-[180px]">
                        {resume.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {badge && (
                          <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded ${badge.color}`}>
                            {badge.label}
                          </span>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(resume.createdAt).toLocaleDateString()}
                        </p>
                      </div>
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
                    className="ml-auto px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 min-h-[44px] sm:min-h-0"
                  >
                    {deletingId === resume.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )})}
          {/* Inline Add Card */}
          <label
            htmlFor="resume-upload"
            className="bg-white rounded-xl border-2 border-dashed border-gray-300 overflow-hidden card-hover flex flex-col items-center justify-center px-4 py-3 sm:px-5 sm:py-5 min-h-[200px] text-gray-400 hover:text-indigo-500 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            <span className="text-3xl mb-2">+</span>
            <span className="text-sm font-medium">Add Resume</span>
          </label>
        </div>
      )}
    </div>
  );
}
