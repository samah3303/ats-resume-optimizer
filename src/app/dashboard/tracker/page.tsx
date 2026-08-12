"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";

interface JDInfo {
  id: string;
  title: string;
  company: string | null;
  sourceUrl: string | null;
  rawText?: string;
}

interface Application {
  id: string;
  jdId: string;
  status: string;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  jobDescription: JDInfo;
}

interface OutreachPack {
  coverLetter?: string;
  linkedinMessage?: string;
  whatsappMessage?: string;
  coldEmailSubject?: string;
  coldEmailBody?: string;
  followupEmailBody?: string;
  postInterviewEmailBody?: string;
}

const STATUSES = [
  { key: "wishlist", label: "Wishlist", color: "bg-zinc-800 text-zinc-300 border border-zinc-700" },
  { key: "applied", label: "Applied", color: "bg-blue-950 text-blue-300 border border-blue-800" },
  { key: "phone_screen", label: "Phone Screen", color: "bg-amber-950 text-amber-300 border border-amber-800" },
  { key: "interview", label: "Interview", color: "bg-purple-950 text-purple-300 border border-purple-800" },
  { key: "offer", label: "Offer", color: "bg-emerald-950 text-emerald-300 border border-emerald-800" },
  { key: "rejected", label: "Rejected", color: "bg-rose-950 text-rose-300 border border-rose-800" },
] as const;

export default function TrackerPage() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Outreach Modal State
  const [activeOutreachApp, setActiveOutreachApp] = useState<Application | null>(null);
  const [generatingOutreach, setGeneratingOutreach] = useState(false);
  const [outreachPack, setOutreachPack] = useState<OutreachPack | null>(null);
  const [activeChannelTab, setActiveChannelTab] = useState<"linkedin" | "whatsapp" | "email">("linkedin");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/tracker");
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
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
      fetchApplications();
    }
  }, [status, router, fetchApplications]);

  const moveApplication = async (appId: string, newStatus: string) => {
    setMovingId(appId);
    try {
      const res = await fetch("/api/tracker", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status: newStatus }),
      });
      if (res.ok) {
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
        );
        toast(`Moved to ${STATUSES.find(s => s.key === newStatus)?.label}`, "info");
      }
    } catch {
      toast("Failed to update status", "error");
    } finally {
      setMovingId(null);
    }
  };

  const deleteApplication = async (appId: string) => {
    if (!confirm("Remove this application from tracker?")) return;
    setDeletingId(appId);
    try {
      const res = await fetch(`/api/tracker?id=${appId}`, { method: "DELETE" });
      if (res.ok) {
        setApplications((prev) => prev.filter((a) => a.id !== appId));
        toast("Application removed", "success");
      }
    } catch {
      toast("Failed to remove application", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenOutreach = async (app: Application) => {
    setActiveOutreachApp(app);
    setOutreachPack(null);
    setGeneratingOutreach(true);

    try {
      // Get primary resume ID if available
      const rRes = await fetch("/api/resumes/primary");
      let primaryResumeId: string | undefined;
      if (rRes.ok) {
        const rData = await rRes.json();
        primaryResumeId = rData.resume?.id;
      }

      const res = await fetch("/api/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: primaryResumeId,
          resumeText: "Experienced Software & AI Engineer",
          jdId: app.jdId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOutreachPack(data.pack);
      } else {
        toast("Failed to generate outreach templates", "error");
      }
    } catch {
      toast("Failed to generate outreach templates", "error");
    } finally {
      setGeneratingOutreach(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getAppsByStatus = (statusKey: string) =>
    applications.filter((a) => a.status === statusKey);

  const statusIndex = (statusKey: string) =>
    STATUSES.findIndex((s) => s.key === statusKey);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="h-8 bg-[#14161D] rounded w-48 animate-pulse mb-8 max-w-7xl mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-7xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#14161D] rounded-2xl p-4 border border-[#242834]">
              <div className="h-6 bg-[#090A0C] rounded w-20 animate-pulse mb-4" />
              {[...Array(2)].map((_, j) => (
                <div key={j} className="h-24 bg-[#090A0C] rounded-xl mb-3 animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xs font-bold text-amber-400 hover:underline">
                ← Back to Dashboard
              </Link>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">Application Kanban Tracker</h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {applications.length} application{applications.length !== 1 ? "s" : ""} tracked with 1-click multi-channel outreach
            </p>
          </div>
        </div>

        {/* Kanban board */}
        <div className="overflow-x-auto pb-4 md:overflow-visible">
          <div className="flex gap-4 min-w-[900px] md:min-w-0 md:grid md:grid-cols-6">
            {STATUSES.map((statusCol) => {
              const apps = getAppsByStatus(statusCol.key);
              const idx = statusIndex(statusCol.key);

              return (
                <div
                  key={statusCol.key}
                  className="flex-1 md:flex-none min-w-[260px] md:min-w-0 bg-[#14161D]/80 backdrop-blur-xl rounded-3xl border border-[#242834] p-4 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-[#242834] pb-2.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${statusCol.color}`}>
                        {statusCol.label}
                      </span>
                      <span className="text-xs text-amber-400 font-mono font-bold">
                        {apps.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {apps.length === 0 ? (
                        <p className="text-xs text-zinc-500 text-center py-6 italic font-medium">
                          No applications
                        </p>
                      ) : (
                        apps.map((app) => (
                          <div
                            key={app.id}
                            className="bg-[#090A0C] rounded-2xl border border-[#242834] hover:border-amber-500/40 p-4 shadow-md transition-all space-y-2 group"
                          >
                            <h4 className="font-extrabold text-xs text-white truncate group-hover:text-amber-400 transition-colors">
                              {app.jobDescription.title}
                            </h4>
                            {app.jobDescription.company && (
                              <p className="text-[11px] font-semibold text-zinc-400 truncate">
                                {app.jobDescription.company}
                              </p>
                            )}
                            
                            <button
                              onClick={() => handleOpenOutreach(app)}
                              className="w-full mt-1 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1"
                            >
                              <span>🚀 Multi-Channel Outreach</span>
                            </button>

                            <div className="flex items-center justify-between pt-2 border-t border-[#242834]">
                              <div className="flex gap-1">
                                {idx > 0 && (
                                  <button
                                    onClick={() => moveApplication(app.id, STATUSES[idx - 1].key)}
                                    disabled={movingId === app.id}
                                    className="p-1 text-zinc-400 hover:text-white hover:bg-[#14161D] rounded-lg transition-colors"
                                    title={`Move to ${STATUSES[idx - 1].label}`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                  </button>
                                )}
                                {idx < STATUSES.length - 1 && (
                                  <button
                                    onClick={() => moveApplication(app.id, STATUSES[idx + 1].key)}
                                    disabled={movingId === app.id}
                                    className="p-1 text-zinc-400 hover:text-white hover:bg-[#14161D] rounded-lg transition-colors"
                                    title={`Move to ${STATUSES[idx + 1].label}`}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                              <button
                                onClick={() => deleteApplication(app.id)}
                                disabled={deletingId === app.id}
                                className="text-xs font-bold text-rose-400 hover:bg-rose-950/50 px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                {deletingId === app.id ? "..." : "✕"}
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Channel Outreach Modal */}
      {activeOutreachApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#14161D] border border-[#242834] rounded-3xl p-6 max-w-xl w-full text-white shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#242834] pb-4">
              <div>
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                  Outreach Assistant
                </span>
                <h3 className="text-base font-black text-white">
                  {activeOutreachApp.jobDescription.title}
                </h3>
                <p className="text-xs text-zinc-400">
                  {activeOutreachApp.jobDescription.company || "Target Company"}
                </p>
              </div>
              <button
                onClick={() => setActiveOutreachApp(null)}
                className="text-xs font-bold text-zinc-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            {generatingOutreach ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <span className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Drafting LinkedIn, WhatsApp & Email messages...
                </span>
              </div>
            ) : outreachPack ? (
              <div className="space-y-4">
                {/* Channel Selector */}
                <div className="flex gap-2 bg-[#090A0C] border border-[#242834] rounded-2xl p-1.5">
                  <button
                    onClick={() => setActiveChannelTab("linkedin")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeChannelTab === "linkedin"
                        ? "bg-amber-500 text-slate-950 font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    💼 LinkedIn InMail
                  </button>
                  <button
                    onClick={() => setActiveChannelTab("whatsapp")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeChannelTab === "whatsapp"
                        ? "bg-emerald-500 text-slate-950 font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    📱 WhatsApp DM
                  </button>
                  <button
                    onClick={() => setActiveChannelTab("email")}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeChannelTab === "email"
                        ? "bg-purple-500 text-slate-950 font-black"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    ✉️ Follow-Up Email
                  </button>
                </div>

                {/* Tab Content */}
                {activeChannelTab === "linkedin" && (
                  <div className="p-4 bg-[#090A0C] border border-[#242834] rounded-2xl space-y-3">
                    <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                      LinkedIn Connection / InMail Note (Max 250 chars):
                    </p>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {outreachPack.linkedinMessage}
                    </p>
                    <button
                      onClick={() => copyToClipboard(outreachPack.linkedinMessage || "", "li")}
                      className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition-colors"
                    >
                      {copiedKey === "li" ? "✓ Copied!" : "📋 Copy LinkedIn Message"}
                    </button>
                  </div>
                )}

                {activeChannelTab === "whatsapp" && (
                  <div className="p-4 bg-[#090A0C] border border-[#242834] rounded-2xl space-y-3">
                    <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                      WhatsApp Direct Message (Short & Professional):
                    </p>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {outreachPack.whatsappMessage}
                    </p>
                    <button
                      onClick={() => copyToClipboard(outreachPack.whatsappMessage || "", "wa")}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-xl transition-colors"
                    >
                      {copiedKey === "wa" ? "✓ Copied!" : "📋 Copy WhatsApp Message"}
                    </button>
                  </div>
                )}

                {activeChannelTab === "email" && (
                  <div className="p-4 bg-[#090A0C] border border-[#242834] rounded-2xl space-y-3">
                    <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                      Follow-up Email (Day 3-7 After Applying):
                    </p>
                    <div className="space-y-1 border-b border-[#242834] pb-2">
                      <span className="text-[10px] text-zinc-400 font-mono block">Subject:</span>
                      <p className="text-xs font-bold text-white">{outreachPack.coldEmailSubject}</p>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {outreachPack.followupEmailBody}
                    </p>
                    <button
                      onClick={() => copyToClipboard(`${outreachPack.coldEmailSubject}\n\n${outreachPack.followupEmailBody}`, "em")}
                      className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold rounded-xl transition-colors"
                    >
                      {copiedKey === "em" ? "✓ Copied!" : "📋 Copy Email Template"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-rose-400 py-4 text-center">
                Failed to generate outreach messages. Please try again.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
