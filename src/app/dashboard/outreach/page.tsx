"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import StarBulletRewriter from "@/components/StarBulletRewriter";

interface Resume {
  id: string;
  name: string;
}

interface JD {
  id: string;
  title: string;
  company: string | null;
}

interface OutreachPack {
  coverLetter: string;
  linkedinMessage: string;
  coldEmailSubject: string;
  coldEmailBody: string;
  followupEmailBody: string;
  elevatorPitch: string;
}

export default function OutreachPage() {
  const { status } = useSession();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jds, setJds] = useState<JD[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [resumeId, setResumeId] = useState("");
  const [jdId, setJdId] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Output State
  const [pack, setPack] = useState<OutreachPack | null>(null);
  const [activeTab, setActiveTab] = useState<"cover" | "linkedin" | "email" | "followup" | "pitch">("cover");
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [rRes, jRes] = await Promise.all([
        fetch("/api/resumes"),
        fetch("/api/jds"),
      ]);
      if (rRes.ok) setResumes((await rRes.json()).resumes || []);
      if (jRes.ok) setJds((await jRes.json()).jds || []);
    } catch {
      // silently handle error
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId || !jdId) {
      setError("Please select both a resume and a job description.");
      return;
    }

    setGenerating(true);
    setError("");
    setPack(null);

    try {
      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jdId, recruiterName: recruiterName || undefined }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate outreach pack.");
      }

      const data = await res.json();
      setPack(data.pack);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate outreach pack.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async (text: string, tabName: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  if (status === "loading" || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          <span>Outreach & Networking Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application Booster & Cold Outreach Pack
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Generate job-tailored cover letters, high-converting LinkedIn notes, cold emails for hiring managers, and STAR bullet point rewrites to stand out from 100+ applicants.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-1">1. Select Target Application</h2>
            <p className="text-xs text-slate-500">Pick your parsed resume and saved target job description.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Your Resume
              </label>
              {resumes.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  No resumes found. <Link href="/dashboard/resumes" className="text-indigo-600 font-semibold">Upload one →</Link>
                </div>
              ) : (
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                  <option value="">-- Choose Resume --</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Target Job Description
              </label>
              {jds.length === 0 ? (
                <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                  No JDs saved. <Link href="/dashboard/jds" className="text-indigo-600 font-semibold">Add one →</Link>
                </div>
              ) : (
                <select
                  value={jdId}
                  onChange={(e) => setJdId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                  <option value="">-- Choose Job Description --</option>
                  {jds.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} {j.company ? `at ${j.company}` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recruiter / Manager Name (Optional)
              </label>
              <input
                type="text"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={generating || !resumeId || !jdId}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Outreach Pack...
                </>
              ) : (
                "⚡ Generate Outreach & Application Pack"
              )}
            </button>
          </form>

          {/* Quick Tip Card */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2 text-xs text-indigo-900">
            <span className="font-bold block text-indigo-950 flex items-center gap-1.5">
              💡 Outreach Tip for Job Seekers:
            </span>
            <p className="leading-relaxed">
              Sending a targeted 2-sentence LinkedIn note to a recruiter or engineering manager within 24 hours of applying boosts interview callback rates by up to 3x!
            </p>
          </div>
        </div>

        {/* Right Column: Outreach Output */}
        <div className="lg:col-span-7 space-y-6">
          {pack ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
              {/* Tab Navigation */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                <button
                  onClick={() => setActiveTab("cover")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "cover"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  📄 Cover Letter
                </button>
                <button
                  onClick={() => setActiveTab("linkedin")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "linkedin"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  💼 LinkedIn Note
                </button>
                <button
                  onClick={() => setActiveTab("email")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "email"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ✉️ Cold Email
                </button>
                <button
                  onClick={() => setActiveTab("followup")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "followup"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ⏳ Follow-Up Script
                </button>
                <button
                  onClick={() => setActiveTab("pitch")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "pitch"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  🎙️ Elevator Pitch
                </button>
              </div>

              {/* Tab Contents */}
              <div className="space-y-4">
                {/* 1. Cover Letter */}
                {activeTab === "cover" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Tailored Cover Letter
                      </h3>
                      <button
                        onClick={() => handleCopy(pack.coverLetter, "cover")}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-xs transition-colors"
                      >
                        {copiedTab === "cover" ? "✓ Copied!" : "📋 Copy Cover Letter"}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={pack.coverLetter}
                      rows={14}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed outline-none"
                    />
                  </div>
                )}

                {/* 2. LinkedIn Note */}
                {activeTab === "linkedin" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          LinkedIn Connection Note
                        </h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800">
                          {pack.linkedinMessage.length} / 300 chars
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(pack.linkedinMessage, "linkedin")}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-xs transition-colors"
                      >
                        {copiedTab === "linkedin" ? "✓ Copied!" : "📋 Copy Note"}
                      </button>
                    </div>
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-sans">
                      {pack.linkedinMessage}
                    </div>
                  </div>
                )}

                {/* 3. Cold Email */}
                {activeTab === "email" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Cold Email Pitch
                      </h3>
                      <button
                        onClick={() => handleCopy(`Subject: ${pack.coldEmailSubject}\n\n${pack.coldEmailBody}`, "email")}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-xs transition-colors"
                      >
                        {copiedTab === "email" ? "✓ Copied!" : "📋 Copy Email"}
                      </button>
                    </div>

                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900">
                      <span className="font-bold">Subject Line: </span>
                      <span className="font-medium text-indigo-950">{pack.coldEmailSubject}</span>
                    </div>

                    <textarea
                      readOnly
                      value={pack.coldEmailBody}
                      rows={10}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed outline-none"
                    />
                  </div>
                )}

                {/* 4. Follow Up Script */}
                {activeTab === "followup" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Follow-Up Email (5-7 Days Post Application)
                      </h3>
                      <button
                        onClick={() => handleCopy(pack.followupEmailBody, "followup")}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-xs transition-colors"
                      >
                        {copiedTab === "followup" ? "✓ Copied!" : "📋 Copy Follow-up"}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={pack.followupEmailBody}
                      rows={8}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 leading-relaxed outline-none"
                    />
                  </div>
                )}

                {/* 5. Elevator Pitch */}
                {activeTab === "pitch" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        60-Second Spoken Elevator Pitch
                      </h3>
                      <button
                        onClick={() => handleCopy(pack.elevatorPitch, "pitch")}
                        className="px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold rounded-lg text-xs transition-colors"
                      >
                        {copiedTab === "pitch" ? "✓ Copied!" : "📋 Copy Pitch"}
                      </button>
                    </div>
                    <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl text-xs text-amber-950 leading-relaxed font-sans">
                      {pack.elevatorPitch}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mx-auto">
                🚀
              </div>
              <h3 className="text-base font-bold text-slate-800">Your Outreach Pack Will Appear Here</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select your resume and job description on the left to instantly build your custom Cover Letter, LinkedIn Connection Note, and Cold Outreach Pitch.
              </p>
            </div>
          )}

          {/* Integrated STAR Method Rewriter Tool */}
          <StarBulletRewriter />
        </div>
      </div>
    </div>
  );
}
