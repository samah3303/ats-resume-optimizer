"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, type ChangeEvent } from "react";
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
  if (type === "pdf") return { label: "PDF", color: "bg-rose-950 text-rose-300 border border-rose-800" };
  if (type === "docx") return { label: "DOCX", color: "bg-blue-950 text-blue-300 border border-blue-800" };
  if (type === "doc") return { label: "DOC", color: "bg-amber-950 text-amber-300 border border-amber-800" };
  return null;
}

export default function ResumesPage() {
  const { status } = useSession();
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

  const handleUploaded = () => {
    fetchResumes();
  };

  const [compactUploading, setCompactUploading] = useState(false);
  const handleCompactUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompactUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/resumes", { method: "POST", body: formData });
      if (res.ok) {
        fetchResumes();
      }
    } catch {
      // silently fail
    } finally {
      setCompactUploading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090A0C]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Resume Vault</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {resumes.length} resume{resumes.length !== 1 ? "s" : ""} stored for ATS parsing & multi-agent optimization
            </p>
          </div>
        </div>

        {/* Upload Area */}
        {resumes.length === 0 ? (
          <div className="mb-8">
            <ResumeUploader onUploaded={handleUploaded} />
          </div>
        ) : (
          <div className="mb-4 flex items-center gap-3">
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleCompactUpload}
              className="hidden"
              id="resume-upload"
              disabled={compactUploading}
            />
            <label
              htmlFor="resume-upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl hover:bg-amber-400 transition-all cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {compactUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Browse & Upload Resume
                </>
              )}
            </label>
            <span className="text-xs text-zinc-400 font-mono">PDF, DOC, or DOCX up to 5MB</span>
          </div>
        )}

        {/* Resume Cards Grid */}
        {resumes.length === 0 ? (
          <div className="text-center py-12 bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-[#242834] p-8 space-y-3">
            <p className="text-xs text-zinc-400">
              No resumes yet. Upload your primary resume above to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume) => {
              const badge = getDocTypeBadge(resume.docType, resume.name);
              return (
                <div
                  key={resume.id}
                  className="bg-[#14161D]/80 backdrop-blur-xl rounded-3xl border border-[#242834] hover:border-amber-500/40 p-6 shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between border-b border-[#242834] pb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">📄</span>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-white text-sm truncate group-hover:text-amber-400 transition-colors">
                            {resume.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {badge && (
                              <span className={`px-2 py-0.5 text-[10px] font-black rounded-md ${badge.color}`}>
                                {badge.label}
                              </span>
                            )}
                            <p className="text-[10px] text-zinc-500 font-mono">
                              {new Date(resume.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      {resume.isPrimary && (
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black rounded-full">
                          PRIMARY
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 line-clamp-3 leading-relaxed break-words">
                      {resume.parsedText?.slice(0, 180) || "No text extracted"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#242834]">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
                      <input
                        type="checkbox"
                        checked={resume.isPrimary}
                        onChange={(e) => handleSetPrimary(resume.id, e.target.checked)}
                        className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                      />
                      <span>Set Primary</span>
                    </label>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      disabled={deletingId === resume.id}
                      className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-950/50 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {deletingId === resume.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Inline Add Card */}
            <label
              htmlFor="resume-upload"
              className="bg-[#14161D]/40 rounded-3xl border-2 border-dashed border-[#242834] hover:border-amber-500/50 flex flex-col items-center justify-center p-6 min-h-[220px] text-zinc-400 hover:text-amber-300 transition-all cursor-pointer group"
            >
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform text-amber-400">+</span>
              <span className="text-xs font-extrabold uppercase tracking-wider text-white">Upload New Resume</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
