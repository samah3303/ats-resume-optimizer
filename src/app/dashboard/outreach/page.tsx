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
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-500 mb-1">
            <span>Outreach & Networking Studio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
            Application Booster & Cold Outreach Pack
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-3xl font-medium">
            Generate job-tailored cover letters, high-converting LinkedIn notes, cold emails for hiring managers, and STAR bullet point rewrites.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-black text-black mb-0.5">1. Select Target Application</h2>
              <p className="text-xs text-zinc-500 font-medium">Pick your parsed resume and saved target job description.</p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-black mb-1.5">
                  Select Your Resume
                </label>
                {resumes.length === 0 ? (
                  <div className="p-3 bg-zinc-50 rounded-xl text-center text-xs text-zinc-500 border border-zinc-200">
                    No resumes found. <Link href="/dashboard/resumes" className="text-black font-bold hover:underline">Upload one →</Link>
                  </div>
                ) : (
                  <select
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-black focus:outline-none focus:border-black shadow-sm"
                  >
                    <option value="">-- Choose Resume --</option>
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-black mb-1.5">
                  Select Target Job Description
                </label>
                {jds.length === 0 ? (
                  <div className="p-3 bg-zinc-50 rounded-xl text-center text-xs text-zinc-500 border border-zinc-200">
                    No JDs saved. <Link href="/dashboard/jds" className="text-black font-bold hover:underline">Add one →</Link>
                  </div>
                ) : (
                  <select
                    value={jdId}
                    onChange={(e) => setJdId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-black focus:outline-none focus:border-black shadow-sm"
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
                <label className="block text-xs font-black text-black mb-1.5">
                  Recruiter / Manager Name (Optional)
                </label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={(e) => setRecruiterName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={generating || !resumeId || !jdId}
                className="w-full py-3.5 px-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-black"
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

            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 text-xs text-zinc-800">
              <span className="font-bold block text-black flex items-center gap-1.5 uppercase">
                💡 Outreach Tip for Job Seekers:
              </span>
              <p className="leading-relaxed text-zinc-600 font-medium">
                Sending a targeted 2-sentence LinkedIn note to a recruiter or engineering manager within 24 hours of applying boosts interview callback rates by up to 3x!
              </p>
            </div>
          </div>

          {/* Right Column: Outreach Output */}
          <div className="lg:col-span-7 space-y-6">
            {pack ? (
              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-6 text-black">
                {/* Tab Navigation */}
                <div className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
                  {[
                    { id: "cover", label: "📄 Cover Letter" },
                    { id: "linkedin", label: "💼 LinkedIn Note" },
                    { id: "email", label: "✉️ Cold Email" },
                    { id: "followup", label: "⏳ Follow-Up Script" },
                    { id: "pitch", label: "🎙️ Elevator Pitch" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        activeTab === tab.id
                          ? "bg-black text-white font-bold shadow-sm"
                          : "bg-white text-zinc-600 border border-zinc-300 hover:border-black"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div className="space-y-4">
                  {/* 1. Cover Letter */}
                  {activeTab === "cover" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-black uppercase tracking-wider">
                          Tailored Cover Letter
                        </h3>
                        <button
                          onClick={() => handleCopy(pack.coverLetter, "cover")}
                          className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 border border-black font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          {copiedTab === "cover" ? "✓ Copied!" : "📋 Copy Cover Letter"}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={pack.coverLetter}
                        rows={14}
                        className="w-full p-4 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs font-mono text-zinc-800 leading-relaxed outline-none shadow-sm"
                      />
                    </div>
                  )}

                  {/* 2. LinkedIn Note */}
                  {activeTab === "linkedin" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xs font-black text-black uppercase tracking-wider">
                            LinkedIn Connection Note
                          </h3>
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-zinc-200 text-black">
                            {pack.linkedinMessage.length} / 300 chars
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(pack.linkedinMessage, "linkedin")}
                          className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 border border-black font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          {copiedTab === "linkedin" ? "✓ Copied!" : "📋 Copy Note"}
                        </button>
                      </div>
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-800 leading-relaxed font-sans font-medium">
                        {pack.linkedinMessage}
                      </div>
                    </div>
                  )}

                  {/* 3. Cold Email */}
                  {activeTab === "email" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-black uppercase tracking-wider">
                          Cold Email Pitch
                        </h3>
                        <button
                          onClick={() => handleCopy(`Subject: ${pack.coldEmailSubject}\n\n${pack.coldEmailBody}`, "email")}
                          className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 border border-black font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          {copiedTab === "email" ? "✓ Copied!" : "📋 Copy Email"}
                        </button>
                      </div>

                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-800">
                        <span className="font-bold text-black">Subject Line: </span>
                        <span className="font-mono text-black font-bold">{pack.coldEmailSubject}</span>
                      </div>

                      <textarea
                        readOnly
                        value={pack.coldEmailBody}
                        rows={10}
                        className="w-full p-4 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs font-mono text-zinc-800 leading-relaxed outline-none shadow-sm"
                      />
                    </div>
                  )}

                  {/* 4. Follow Up Script */}
                  {activeTab === "followup" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-black uppercase tracking-wider">
                          Follow-Up Email (5-7 Days Post Application)
                        </h3>
                        <button
                          onClick={() => handleCopy(pack.followupEmailBody, "followup")}
                          className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 border border-black font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          {copiedTab === "followup" ? "✓ Copied!" : "📋 Copy Follow-up"}
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={pack.followupEmailBody}
                        rows={8}
                        className="w-full p-4 bg-zinc-50 border border-zinc-300 rounded-2xl text-xs font-mono text-zinc-800 leading-relaxed outline-none shadow-sm"
                      />
                    </div>
                  )}

                  {/* 5. Elevator Pitch */}
                  {activeTab === "pitch" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-black uppercase tracking-wider">
                          60-Second Spoken Elevator Pitch
                        </h3>
                        <button
                          onClick={() => handleCopy(pack.elevatorPitch, "pitch")}
                          className="px-3 py-1.5 bg-black text-white hover:bg-zinc-800 border border-black font-bold rounded-xl text-xs transition-colors shadow-sm"
                        >
                          {copiedTab === "pitch" ? "✓ Copied!" : "📋 Copy Pitch"}
                        </button>
                      </div>
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-800 leading-relaxed font-sans font-medium">
                        {pack.elevatorPitch}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-3xl border border-dashed border-zinc-300 p-12 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-zinc-200 text-black border border-zinc-300 flex items-center justify-center font-bold text-xl mx-auto">
                  🚀
                </div>
                <h3 className="text-base font-black text-black">Your Outreach Pack Will Appear Here</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto font-medium">
                  Select your resume and job description on the left to instantly build your custom Cover Letter, LinkedIn Connection Note, and Cold Outreach Pitch.
                </p>
              </div>
            )}

            {/* Integrated STAR Method Rewriter Tool */}
            <StarBulletRewriter />
          </div>
        </div>
      </div>
    </div>
  );
}
