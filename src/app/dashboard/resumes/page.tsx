"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, type ChangeEvent } from "react";
import Link from "next/link";
import ResumeUploader from "@/components/ResumeUploader";
import DriveDocumentPreviewModal from "@/components/DriveDocumentPreviewModal";
import { isHumanReadableText } from "@/lib/resume-parser";
import { useToast } from "@/components/Toast";

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
  if (type === "pdf") return { label: "PDF", color: "bg-[#27272A] text-[#FAFAFA] border border-[#27272A]" };
  if (type === "docx") return { label: "DOCX", color: "bg-[#27272A] text-[#FAFAFA] border border-[#27272A]" };
  if (type === "doc") return { label: "DOC", color: "bg-[#27272A] text-[#FAFAFA] border border-[#27272A]" };
  return null;
}

export default function ResumesPage() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewResume, setPreviewResume] = useState<Resume | null>(null);

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
        toast("Resume deleted", "success");
      }
    } catch {
      toast("Failed to delete resume", "error");
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
        toast("Primary resume updated!", "success");
      }
    } catch {
      toast("Failed to update primary resume", "error");
    }
  };

  const handleUploaded = () => {
    fetchResumes();
    toast("Resume uploaded successfully!", "success");
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
        toast("Resume uploaded successfully!", "success");
      } else {
        toast("Failed to upload resume", "error");
      }
    } catch {
      toast("Failed to upload resume", "error");
    } finally {
      setCompactUploading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090B]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xs font-bold text-[#FAFAFA] hover:underline">
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#FAFAFA] tracking-tight mt-1">Resume Vault &amp; Document Viewer</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {resumes.length} resume{resumes.length !== 1 ? "s" : ""} stored with Google Drive-style document content preview
            </p>
          </div>
        </div>

        {/* Upload Action */}
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all cursor-pointer shadow-sm disabled:opacity-50 border border-black"
            >
              {compactUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Browse &amp; Upload New Resume</span>
                </>
              )}
            </label>
            <span className="text-xs text-zinc-400 font-mono">PDF, DOC, or DOCX up to 5MB</span>
          </div>
        )}

        {/* Resume Cards Grid */}
        {resumes.length === 0 ? (
          <div className="text-center py-12 bg-[#09090B] rounded-3xl border border-[#27272A] p-8 space-y-3">
            <p className="text-xs text-zinc-400 font-medium">
              No resumes yet. Upload your primary resume above to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => {
              const badge = getDocTypeBadge(resume.docType, resume.name);
              return (
                <div
                  key={resume.id}
                  className="bg-[#18181B] rounded-3xl border border-[#27272A] hover:border-zinc-400 p-6 shadow-sm transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Tile Header */}
                    <div className="flex items-start justify-between border-b border-[#27272A] pb-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-2xl">📄</span>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-[#FAFAFA] text-sm truncate group-hover:text-zinc-300 transition-colors">
                            {resume.name}
                          </h3>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {badge && (
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${badge.color}`}>
                                {badge.label}
                              </span>
                            )}
                            <p className="text-[10px] text-zinc-400 font-mono">
                              {new Date(resume.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      {resume.isPrimary && (
                        <span className="px-2.5 py-1 bg-black text-white text-[10px] font-bold rounded-full shrink-0 shadow-sm">
                          PRIMARY
                        </span>
                      )}
                    </div>

                    {/* Google Drive Style Document Sheet Container inside Tile */}
                    <div className="relative rounded-2xl bg-[#09090B] border border-[#27272A] p-4 h-52 overflow-y-auto space-y-2 group-hover:border-zinc-400 transition-colors">
                      <div className="flex items-center justify-between border-b border-[#27272A] pb-2 text-[10px] font-mono text-zinc-300">
                        <span className="font-bold uppercase tracking-wider">Document Preview Page</span>
                        <span className="text-zinc-400">Drive Style</span>
                      </div>
                      {resume.parsedText && isHumanReadableText(resume.parsedText) ? (
                        <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap break-words">
                          {resume.parsedText}
                        </p>
                      ) : (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5 text-center my-4">
                          <p className="text-xs font-bold text-rose-800">
                            ⚠️ Unreadable Custom Font Subset PDF
                          </p>
                          <p className="text-[10px] text-zinc-600 leading-snug">
                            This PDF was saved using custom font encodings (e.g. Canva/Figma subset fonts). Please re-upload as DOCX or a standard text PDF.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tile Actions */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewResume(resume)}
                        className="flex-1 px-3 py-2 bg-black text-white hover:bg-zinc-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 border border-black shadow-sm"
                      >
                        <span>🔍 Drive Full Page View</span>
                      </button>
                      <Link
                        href="/dashboard"
                        className="px-3 py-2 bg-[#27272A] hover:bg-[#27272A] text-[#FAFAFA] border border-[#27272A] hover:border-zinc-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>⚡ Run Scan</span>
                      </Link>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#27272A]">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-300">
                        <input
                          type="checkbox"
                          checked={resume.isPrimary}
                          onChange={(e) => handleSetPrimary(resume.id, e.target.checked)}
                          className="w-4 h-4 rounded text-[#FAFAFA] accent-[#FAFAFA] focus:ring-0"
                        />
                        <span>Set Primary</span>
                      </label>
                      <button
                        onClick={() => handleDelete(resume.id)}
                        disabled={deletingId === resume.id}
                        className="px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {deletingId === resume.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Inline Add Card */}
            <label
              htmlFor="resume-upload"
              className="bg-[#09090B] rounded-3xl border-2 border-dashed border-[#27272A] hover:border-zinc-400 flex flex-col items-center justify-center p-6 min-h-[300px] text-zinc-400 hover:text-[#FAFAFA] transition-all cursor-pointer group shadow-sm"
            >
              <span className="text-4xl mb-2 group-hover:scale-110 transition-transform text-[#FAFAFA]">+</span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FAFAFA]">Upload New Resume</span>
            </label>
          </div>
        )}
      </div>

      {/* Drive Document Viewer Modal */}
      {previewResume && (
        <DriveDocumentPreviewModal
          isOpen={Boolean(previewResume)}
          onClose={() => setPreviewResume(null)}
          resumeName={previewResume.name}
          parsedText={previewResume.parsedText}
          docType={previewResume.docType}
          createdAt={previewResume.createdAt}
          isPrimary={previewResume.isPrimary}
        />
      )}
    </div>
  );
}
