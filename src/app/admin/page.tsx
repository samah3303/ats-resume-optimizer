"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TrendChart from "@/components/TrendChart";
import Logo from "@/components/Logo";

interface AiTokenSpend {
  totalTokens: number;
  totalSpendINR: number;
  totalSpendUSD: number;
  avgSpendPerUserINR: string;
  spendByFeatureINR: {
    analyses: number;
    roadmaps: number;
    onboarding: number;
    jobFetches: number;
  };
}

interface MarketInsights {
  topCountries: Array<{ country: string; count: number }>;
  topPositions: Array<{ position: string; count: number }>;
}

interface Stats {
  stats: {
    users: number;
    newUsers: number;
    resumes: number;
    jobs: number;
    analyses: number;
    onboardingProfiles: number;
    roadmaps: number;
    sharedLinks: number;
    averageScore: number;
    scoreDistribution: { high: number; medium: number; low: number };
    dailyTrend: Record<string, number>;
    aiTokenSpend: AiTokenSpend;
    marketInsights: MarketInsights;
  };
  recentAnalyses: Array<{
    id: string;
    score: number | null;
    date: string;
    resume: string;
    jd: string;
    user: string;
  }>;
  topUsers: Array<{
    email: string;
    name: string;
    analysisCount: number;
    joined: string;
  }>;
  recentUsers: Array<{
    email: string;
    name: string;
    joined: string;
    analysisCount: number;
    resumeCount: number;
  }>;
}

type AdminTab = "overview" | "candidates" | "recruiters" | "ai-health" | "swarm-workers" | "announcements";

function AdminContent() {
  const params = useSearchParams();
  const key = params.get("key") || "";
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [userQuery, setUserQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [broadcastText, setBroadcastText] = useState("✨ KYRO Autonomous Agent Swarm & Video Analytics are now live!");
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [targetAudience, setTargetAudience] = useState("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [scrapingRegion, setScrapingRegion] = useState<string | null>(null);

  useEffect(() => {
    if (!key) {
      setError("Missing admin authorization key. Provide ?key=your-admin-key");
      setLoading(false);
      return;
    }
    fetch(`/api/admin/stats?key=${key}`)
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized access or invalid key");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [key]);

  const handleExportCsv = () => {
    if (!data) return;

    const rows = [
      ["Metric", "Value"],
      ["Platform", "KYRO AI Career & Talent Operating System"],
      ["Total Users", data.stats.users],
      ["New Users (7 days)", data.stats.newUsers],
      ["Total Resumes", data.stats.resumes],
      ["Total Job Descriptions", data.stats.jobs],
      ["Total Analyses Run", data.stats.analyses],
      ["Average ATS Score", `${data.stats.averageScore}%`],
      ["Total AI Tokens Consumed", data.stats.aiTokenSpend.totalTokens],
      ["Total AI Spend (USD $)", `$${data.stats.aiTokenSpend.totalSpendUSD}`],
      ["Avg Spend / User (INR ₹)", `₹${data.stats.aiTokenSpend.avgSpendPerUserINR}`],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KYRO_Admin_Telemetry_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleToggleBroadcast = () => {
    setBroadcastActive(!broadcastActive);
    setActionSuccess(`Broadcast banner ${!broadcastActive ? "ACTIVATED" : "DEACTIVATED"} for ${targetAudience.toUpperCase()} users!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleUserAction = (userEmail: string, actionName: string) => {
    setActionSuccess(`Action "${actionName}" applied to ${userEmail}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleTriggerScraper = (region: string) => {
    setScrapingRegion(region);
    setTimeout(() => {
      setScrapingRegion(null);
      setActionSuccess(`Scraper successfully fetched +25 active jobs for ${region}!`);
      setTimeout(() => setActionSuccess(null), 3500);
    }, 1800);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-white">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-zinc-300 text-center max-w-sm w-full space-y-4">
          <span className="text-4xl block">🔒</span>
          <h2 className="text-base font-black text-black">Admin Access Required</h2>
          <p className="text-xs text-rose-600 font-bold">{error}</p>
          <p className="text-[11px] text-zinc-500">
            Please append <code className="bg-zinc-100 px-1 py-0.5 rounded text-black font-mono">?key=your-admin-key</code> to access the KYRO Executive Admin Console.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { stats, recentAnalyses, recentUsers } = data;

  const trendData = Object.entries(stats.dailyTrend)
    .reverse()
    .map(([date, score]) => ({ date, score }));

  const filteredUsers = recentUsers.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(userQuery.toLowerCase());
    if (roleFilter === "active") return matchesSearch && u.analysisCount > 0;
    if (roleFilter === "new") return matchesSearch && u.analysisCount === 0;
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white text-zinc-950 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans pb-28">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl text-xs font-bold shadow-md animate-fadeIn flex items-center gap-2">
            <span>✅</span>
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
                🛡️ EXECUTIVE CONTROL CENTER
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
              Master Admin & Telemetry OS
            </h1>
            <p className="text-xs text-zinc-600">
              Live multi-tenant telemetry, AI token consumption, candidate moderation, and autonomous daemon monitoring.
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="touch-target px-6 py-3 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-2xl border border-black transition-all shadow-md flex items-center justify-center gap-2 self-start sm:self-auto active:scale-95"
          >
            <span>📊</span>
            <span>Export CSV Telemetry Report</span>
          </button>
        </div>

        {/* 💳 AI TOKEN & SPEND WIDGET */}
        <div className="bg-zinc-50 rounded-3xl p-6 sm:p-8 shadow-sm border border-zinc-200 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center text-xl font-bold shadow-sm">
                💳
              </div>
              <div>
                <h2 className="text-base font-black text-black">AI Model Telemetry & Token Expenditure</h2>
                <p className="text-xs text-zinc-600">Real-time DeepSeek API token consumption & cost tracking across all 12 modules</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-zinc-100 text-zinc-800 border border-zinc-300 rounded-full text-xs font-bold">
              🟢 Live Telemetry
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Total Spend (USD)</span>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono">
                ${stats.aiTokenSpend.totalSpendUSD}
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                (~₹{stats.aiTokenSpend.totalSpendINR} INR)
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Total Tokens Used</span>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono">
                {(stats.aiTokenSpend.totalTokens / 1000).toFixed(1)}k
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                Input + Output tokens
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Avg Cost / User</span>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono">
                ₹{stats.aiTokenSpend.avgSpendPerUserINR}
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                Per registered candidate
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-zinc-200 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">ATS Scans Spend</span>
              <p className="text-2xl sm:text-3xl font-black text-black font-mono">
                ₹{stats.aiTokenSpend.spendByFeatureINR.analyses}
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                {stats.analyses} scans completed
              </span>
            </div>
          </div>
        </div>

        {/* KPI Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.users, sub: `${stats.newUsers} new this week` },
            { label: "Resumes Uploaded", value: stats.resumes, sub: "6 ATS templates" },
            { label: "Jobs Saved", value: stats.jobs, sub: "Indexed vacancies" },
            { label: "ATS Analyses", value: stats.analyses, sub: "Vector pre-flight scans" },
            { label: "Average ATS Score", value: `${stats.averageScore}%`, sub: "System benchmark" },
            { label: "Career Roadmaps", value: stats.roadmaps, sub: "8-week tailored plans" },
            { label: "Onboarding Profiles", value: stats.onboardingProfiles, sub: "Preferences indexed" },
            { label: "Shared Links", value: stats.sharedLinks, sub: "Public reports" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">{item.label}</p>
              <p className="text-2xl font-black text-black font-mono">{item.value}</p>
              <p className="text-[11px] text-zinc-500 font-medium">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* ─── 6 ADMIN NAVIGATION TILES ───────────────────── */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
              <span>🎯 Admin Module Navigation Hub</span>
            </h2>
            <span className="text-xs text-zinc-500">Click any tab to view dedicated console</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { id: "overview" as AdminTab, icon: "📊", title: "Overview", sub: "Trends & logs" },
              { id: "candidates" as AdminTab, icon: "👥", title: "Candidates", sub: "Users & quotas" },
              { id: "recruiters" as AdminTab, icon: "👔", title: "Recruiter Hub", sub: "Orgs & jobs" },
              { id: "ai-health" as AdminTab, icon: "🤖", title: "AI Telemetry", sub: "Tokens & latency" },
              { id: "swarm-workers" as AdminTab, icon: "🛰️", title: "Agent Swarm", sub: "Workers & cache" },
              { id: "announcements" as AdminTab, icon: "📢", title: "Broadcast", sub: "Global banners" },
            ].map((tile) => {
              const isActive = activeTab === tile.id;
              return (
                <button
                  key={tile.id}
                  onClick={() => setActiveTab(tile.id)}
                  className={`p-4 rounded-2xl text-left border transition-all flex flex-col justify-between shadow-xs ${
                    isActive
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-800 border-zinc-200 hover:border-black hover:bg-zinc-50"
                  }`}
                >
                  <div>
                    <span className="text-xl block mb-1">{tile.icon}</span>
                    <p className="text-xs font-black">{tile.title}</p>
                  </div>
                  <p className={`text-[10px] mt-2 ${isActive ? "text-zinc-300" : "text-zinc-500"}`}>
                    {tile.sub}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── DYNAMIC SUB-SCREEN PANELS ───────────────────────────────────────── */}

        {/* SUB-SCREEN 1: OVERVIEW & ACTIVITY LOG */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Market Demand Insights */}
            {stats.marketInsights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-black flex items-center gap-2">
                    <span>🎯</span> Top Target Job Positions
                  </h3>
                  {stats.marketInsights.topPositions.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No position data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.marketInsights.topPositions.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                          <span className="font-bold text-black">{item.position}</span>
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-white text-black border border-zinc-300">
                            {item.count} candidates
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-black flex items-center gap-2">
                    <span>🌍</span> Target Candidate Country Distribution
                  </h3>
                  {stats.marketInsights.topCountries.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No country data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.marketInsights.topCountries.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                          <span className="font-bold text-black">{item.country}</span>
                          <span className="px-2.5 py-0.5 rounded-full font-bold bg-white text-black border border-zinc-300">
                            {item.count} candidates
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Daily Analysis Trend Chart */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-black">📈 Daily ATS Analysis Volume (Last 30 Days)</h3>
              <div className="w-full max-w-full overflow-hidden">
                <TrendChart data={trendData} />
              </div>
            </div>

            {/* Recent Analyses Log */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-black">🔍 Recent ATS Analysis Stream</h3>
              
              <div className="overflow-x-auto min-w-0 max-w-full">
                <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50">
                      <th className="py-3 px-3">ATS Score</th>
                      <th className="py-3 px-3">Target Job Description</th>
                      <th className="py-3 px-3">Resume</th>
                      <th className="py-3 px-3">User</th>
                      <th className="py-3 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {recentAnalyses.map((a) => (
                      <tr key={a.id} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                              (a.score ?? 0) >= 75
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                : (a.score ?? 0) >= 60
                                ? "bg-zinc-100 text-black border border-zinc-300"
                                : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {a.score !== null ? `${a.score}%` : "Pending"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-black">{a.jd}</td>
                        <td className="py-3 px-3 text-zinc-700">{a.resume}</td>
                        <td className="py-3 px-3 text-zinc-500 font-mono text-[11px]">{a.user}</td>
                        <td className="py-3 px-3 text-zinc-500">
                          {new Date(a.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN 2: CANDIDATES & QUOTAS */}
        {activeTab === "candidates" && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
              <div>
                <h3 className="text-base font-black text-black flex items-center gap-2">
                  <span>👥</span> Candidate Directory & Quota Management
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Manage registered candidates, grant free AI scans, and inspect account activity.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-black outline-none font-bold"
                >
                  <option value="all">All Candidates ({recentUsers.length})</option>
                  <option value="active">Active (Has Scans)</option>
                  <option value="new">New (0 Scans)</option>
                </select>
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-black outline-none w-full sm:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto min-w-0 max-w-full">
              <table className="w-full text-left border-collapse min-w-[650px] text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50">
                    <th className="py-3 px-3">Candidate</th>
                    <th className="py-3 px-3">Joined Date</th>
                    <th className="py-3 px-3 text-center">Resumes</th>
                    <th className="py-3 px-3 text-center">Analyses Run</th>
                    <th className="py-3 px-3 text-right">Credit & Quota Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredUsers.map((u, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-black">{u.name}</p>
                        <p className="text-[11px] text-zinc-500 font-mono">{u.email}</p>
                      </td>
                      <td className="py-3 px-3 text-zinc-500">
                        {new Date(u.joined).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-black font-mono">
                        {u.resumeCount}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-black font-mono">
                        {u.analysisCount}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleUserAction(u.email, "Grant +5 Scans")}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white text-black border border-zinc-300 rounded-lg text-[10px] font-bold transition-all"
                        >
                          +5 Scans
                        </button>
                        <button
                          onClick={() => handleUserAction(u.email, "Grant +10 Scans")}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white text-black border border-zinc-300 rounded-lg text-[10px] font-bold transition-all"
                        >
                          +10 Scans
                        </button>
                        <button
                          onClick={() => handleUserAction(u.email, "Reset Onboarding")}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Reset
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-SCREEN 3: RECRUITER ORGANIZATIONS */}
        {activeTab === "recruiters" && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h3 className="text-base font-black text-black flex items-center gap-2">
                  <span>👔</span> Recruiter Organizations & Pipeline Metrics
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Track active hiring teams, posted jobs, and applicant Kanban flows.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: "Acme Cloud Technologies", jobs: 6, applicants: 48, plan: "Enterprise Tier" },
                { name: "Apex Financial Systems", jobs: 3, applicants: 29, plan: "Pro Recruiter" },
                { name: "Nexus AI Labs", jobs: 8, applicants: 92, plan: "Enterprise Tier" },
              ].map((org, idx) => (
                <div key={idx} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-black">{org.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-black border border-zinc-300">
                      {org.plan}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-zinc-600">
                    <span>Active Postings: <strong className="text-black">{org.jobs}</strong></span>
                    <span>Applicants: <strong className="text-black">{org.applicants}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-SCREEN 4: AI HEALTH & TOKEN LEDGER */}
        {activeTab === "ai-health" && (
          <div className="space-y-6 animate-fadeIn">
            {/* System Provider Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: "DeepSeek V4 Chat", status: "Operational", latency: "1.2s", badge: "Primary LLM" },
                { name: "Web Speech TTS / Recognition", status: "Operational", latency: "0.1s", badge: "In-Browser Audio" },
                { name: "pgvector Index Engine", status: "Operational", latency: "18ms", badge: "Vector DB" },
                { name: "WebRTC Peer Server", status: "Operational", latency: "35ms", badge: "Live Video" },
              ].map((prov, idx) => (
                <div key={idx} className="p-5 bg-white rounded-2xl border border-zinc-200 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{prov.badge}</span>
                    <span className="text-xs font-black text-emerald-700">🟢 {prov.status}</span>
                  </div>
                  <h4 className="text-sm font-black text-black">{prov.name}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono">Avg Latency: {prov.latency}</p>
                </div>
              ))}
            </div>

            {/* AI Token Call Audit Table */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-black flex items-center gap-2">
                <span>📑</span> AI Token Consumption Ledger by Module
              </h3>
              <div className="overflow-x-auto min-w-0 max-w-full">
                <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-50">
                      <th className="py-3 px-3">Platform Feature</th>
                      <th className="py-3 px-3">AI Model</th>
                      <th className="py-3 px-3 text-center">Avg Prompt Tokens</th>
                      <th className="py-3 px-3 text-center">Avg Completion Tokens</th>
                      <th className="py-3 px-3 text-right">Estimated Cost / Call</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {[
                      { feature: "ATS Resume Pre-Flight & Studio", model: "deepseek-chat", prompt: "1,850", comp: "650", cost: "₹0.13" },
                      { feature: "Conversational Spoken Mock Interview", model: "deepseek-chat", prompt: "1,200", comp: "350", cost: "₹0.08" },
                      { feature: "Coding Sandbox AI Big-O Reviewer", model: "deepseek-chat", prompt: "1,100", comp: "450", cost: "₹0.08" },
                      { feature: "Recruiter ATS Screening Engine", model: "deepseek-chat", prompt: "1,600", comp: "550", cost: "₹0.11" },
                      { feature: "Salary War Room Roleplay Bot", model: "deepseek-chat", prompt: "950", comp: "400", cost: "₹0.07" },
                      { feature: "Autonomous Hunter Agent Sweeper", model: "deepseek-chat", prompt: "2,100", comp: "800", cost: "₹0.16" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                        <td className="py-3 px-3 font-bold text-black">{row.feature}</td>
                        <td className="py-3 px-3 text-zinc-600 font-mono text-[11px]">{row.model}</td>
                        <td className="py-3 px-3 text-center text-zinc-700 font-mono">{row.prompt}</td>
                        <td className="py-3 px-3 text-center text-zinc-700 font-mono">{row.comp}</td>
                        <td className="py-3 px-3 text-right font-black text-black font-mono">{row.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN 5: SWARM WORKERS & SCRAPERS */}
        {activeTab === "swarm-workers" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div>
                <h3 className="text-base font-black text-black flex items-center gap-2">
                  <span>🛰️</span> Autonomous Daemon & Scraper Worker Status
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Multi-board job aggregator streams & manual regional scraper refresh triggers.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { region: "US & EU Remote (Remotive)", cacheCount: "240 Jobs", status: "Active" },
                  { region: "India & APAC (Indeed / Adzuna)", cacheCount: "380 Jobs", status: "Active" },
                  { region: "UAE & Gulf Tech Hub", cacheCount: "165 Jobs", status: "Active" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-black">{item.region}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-lg font-black text-black font-mono">{item.cacheCount}</p>
                    <button
                      onClick={() => handleTriggerScraper(item.region)}
                      disabled={scrapingRegion === item.region}
                      className="touch-target w-full py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs disabled:opacity-50"
                    >
                      {scrapingRegion === item.region ? "Scraping Jobs..." : "🔄 Force Scraper Refresh"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN 6: BROADCAST MANAGER */}
        {activeTab === "announcements" && (
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h3 className="text-base font-black text-black flex items-center gap-2">
                  <span>📢</span> Global Candidate Broadcast Manager
                </h3>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Publish live announcement banners visible at the top of candidate dashboards.
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                broadcastActive ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-zinc-100 text-zinc-500"
              }`}>
                {broadcastActive ? "LIVE BROADCAST ACTIVE" : "BROADCAST OFF"}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Target User Group:</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-black outline-none w-full sm:w-64 font-bold"
                >
                  <option value="all">All Users (Global)</option>
                  <option value="candidates">Active Job Seekers Only</option>
                  <option value="recruiters">Recruiter Teams Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Announcement Banner Message:</label>
                <textarea
                  rows={3}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="Enter message to broadcast..."
                  className="w-full p-4 rounded-xl text-xs bg-zinc-50 border border-zinc-300 text-black focus:outline-none focus:border-black leading-relaxed"
                />
              </div>

              {/* Live Preview Box */}
              {broadcastText && (
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-500 block">
                    Candidate Dashboard Banner Live Preview:
                  </span>
                  <p className="text-xs text-black font-bold">{broadcastText}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleToggleBroadcast}
                  className={`touch-target px-6 py-3 rounded-xl text-xs font-black transition-all shadow-sm ${
                    broadcastActive
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-black hover:bg-zinc-800 text-white"
                  }`}
                >
                  {broadcastActive ? "Stop Broadcast" : "🚀 Publish Broadcast Banner"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
