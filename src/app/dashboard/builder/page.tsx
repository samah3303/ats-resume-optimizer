"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface Resume {
  id: string;
  name: string;
  parsedText: string;
}

export default function ResumeBuilderPage() {
  const { status } = useSession();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [resumeName, setResumeName] = useState("My ATS Optimized Resume");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch {
      // ignore
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

  const handleSelectResume = (id: string) => {
    setSelectedResumeId(id);
    const found = resumes.find((r) => r.id === id);
    if (found) {
      setResumeName(found.name);
      setContent(found.parsedText);
    }
  };

  const handleDownloadPdf = async () => {
    if (!content.trim()) return;

    setDownloading(true);
    setError("");

    try {
      const res = await fetch("/api/resumes/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeName, content }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate ATS PDF.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resumeName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PDF export failed");
    } finally {
      setDownloading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090A0C]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
            <span>ATS Document Generator</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            One-Click ATS PDF Resume Builder & Exporter
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Edit, refine, and download clean single-column PDF resumes engineered to pass automated applicant tracking systems (ATS) with 100% readability.
          </p>
        </div>

        <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                Load From Existing Parsed Resume
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => handleSelectResume(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Start Fresh / Paste Custom Text --</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-300 mb-1.5">
                Resume Document Title
              </label>
              <input
                type="text"
                value={resumeName}
                onChange={(e) => setResumeName(e.target.value)}
                placeholder="e.g. John_Doe_Senior_Developer_Resume"
                className="w-full px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 font-bold">
              ⚠️ {error}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase text-amber-300 tracking-wider">
                Resume Content Editor (Plain Text / Markdown)
              </label>
              <span className="text-[11px] text-zinc-500 font-mono">
                {content.length} characters
              </span>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              placeholder={`SUMMARY\nResults-driven Software Engineer with 5+ years experience building scalable web apps...\n\nEXPERIENCE\nSenior Developer | TechCorp | 2021 - Present\n• Engineered React and Node.js microservices serving 500k+ daily users...\n\nSKILLS\nReact, TypeScript, Node.js, SQL, Docker, AWS`}
              className="w-full p-4 rounded-2xl bg-[#090A0C] border border-[#242834] text-xs font-mono text-zinc-200 leading-relaxed outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#242834]">
            <p className="text-xs text-zinc-400">
              💡 Single-column layout without graphics or tables guarantees maximum ATS parse rate.
            </p>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading || !content.trim()}
              className="py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Generating ATS PDF...
                </>
              ) : (
                "📥 Download 100% ATS-Friendly PDF"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
