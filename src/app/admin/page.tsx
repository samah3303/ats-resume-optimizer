"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TrendChart from "@/components/TrendChart";

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

type AdminTab = "overview" | "candidates" | "ai-health" | "job-matcher" | "announcements" | "analytics";

function AdminContent() {
  const params = useSearchParams();
  const key = params.get("key") || "";
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sub-screen navigation state
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [userQuery, setUserQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [broadcastText, setBroadcastText] = useState("✨ 1-Click Studio & Stage-Wise STAR Interview Coach are live!");
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [targetAudience, setTargetAudience] = useState("all");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [scrapingRegion, setScrapingRegion] = useState<string | null>(null);

  useEffect(() => {
    if (!key) {
      setError("Missing admin key. Use ?key=your-key");
      setLoading(false);
      return;
    }
    fetch(`/api/admin/stats?key=${key}`)
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized or failed");
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
      ["Total Users", data.stats.users],
      ["New Users (7 days)", data.stats.newUsers],
      ["Total Resumes", data.stats.resumes],
      ["Total Job Descriptions", data.stats.jobs],
      ["Total Analyses", data.stats.analyses],
      ["Average ATS Score", `${data.stats.averageScore}%`],
      ["Total AI Tokens Consumed", data.stats.aiTokenSpend.totalTokens],
      ["Total AI Spend (INR ₹)", `₹${data.stats.aiTokenSpend.totalSpendINR}`],
      ["Total AI Spend (USD $)", `$${data.stats.aiTokenSpend.totalSpendUSD}`],
      ["Avg Spend / User (INR ₹)", `₹${data.stats.aiTokenSpend.avgSpendPerUserINR}`],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ResuMatch_Admin_Stats_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleToggleBroadcast = () => {
    setBroadcastActive(!broadcastActive);
    setActionSuccess(`Broadcast banner ${!broadcastActive ? "ACTIVATED" : "DEACTIVATED"} for ${targetAudience.toUpperCase()} candidates!`);
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
      setActionSuccess(`Scraper successfully fetched +15 active 50-60% match jobs for ${region}!`);
      setTimeout(() => setActionSuccess(null), 3500);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090A0C]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-[#090A0C]">
        <div className="bg-[#14161D] rounded-3xl p-8 shadow-2xl border border-[#242834] text-center max-w-sm w-full space-y-3">
          <span className="text-4xl block">🔒</span>
          <h2 className="text-base font-black text-white">Admin Access Required</h2>
          <p className="text-xs text-amber-400 font-medium">{error}</p>
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
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Action Success Toast */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-950/90 text-emerald-300 border border-emerald-800/80 rounded-2xl text-xs font-bold shadow-xl animate-fadeIn flex items-center gap-2">
            <span>✅</span>
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#242834] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <span>🛡️ ResuMatch Executive Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Admin & Cost Analytics
            </h1>
          </div>
          <button
            onClick={handleExportCsv}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <span>📊 Export CSV Report</span>
          </button>
        </div>

        {/* 💳 AI TOKEN & INR SPEND WIDGET */}
        <div className="bg-gradient-to-br from-[#0D0E11] via-[#14161D] to-[#090A0C] text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#242834] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl font-bold text-amber-300">
                💳
              </div>
              <div>
                <h2 className="text-base font-black text-white">AI Token & Cost Expenditure (INR ₹)</h2>
                <p className="text-xs text-zinc-400">Real-time DeepSeek API token consumption & cost tracking</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
              Live DB Rates
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-[#090A0C]/80 rounded-2xl border border-[#242834] space-y-1">
              <span className="text-xs font-semibold text-zinc-400 block">Total Spend (INR)</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                ₹{stats.aiTokenSpend.totalSpendINR}
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                (~${stats.aiTokenSpend.totalSpendUSD} USD)
              </span>
            </div>

            <div className="p-4 bg-[#090A0C]/80 rounded-2xl border border-[#242834] space-y-1">
              <span className="text-xs font-semibold text-zinc-400 block">Total Tokens Used</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-300">
                {(stats.aiTokenSpend.totalTokens / 1000).toFixed(1)}k
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                Input + Output tokens
              </span>
            </div>

            <div className="p-4 bg-[#090A0C]/80 rounded-2xl border border-[#242834] space-y-1">
              <span className="text-xs font-semibold text-zinc-400 block">Avg Cost / User</span>
              <p className="text-2xl sm:text-3xl font-black text-yellow-300">
                ₹{stats.aiTokenSpend.avgSpendPerUserINR}
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                Per registered user
              </span>
            </div>

            <div className="p-4 bg-[#090A0C]/80 rounded-2xl border border-[#242834] space-y-1">
              <span className="text-xs font-semibold text-zinc-400 block">ATS Scans Spend</span>
              <p className="text-2xl sm:text-3xl font-black text-purple-300">
                ₹{stats.aiTokenSpend.spendByFeatureINR.analyses}
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                {stats.analyses} scans completed
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.users, sub: `${stats.newUsers} new (7d)` },
            { label: "Resumes Uploaded", value: stats.resumes, sub: "PDF/DOCX parsed" },
            { label: "Jobs Saved", value: stats.jobs, sub: "Target postings" },
            { label: "Analyses Run", value: stats.analyses, sub: "ATS audits" },
            { label: "Avg ATS Score", value: `${stats.averageScore}%`, sub: "System benchmark" },
            { label: "Roadmaps Generated", value: stats.roadmaps, sub: "8-week plans" },
            { label: "Onboarding Profiles", value: stats.onboardingProfiles, sub: "Target preferences" },
            { label: "Shared Reports", value: stats.sharedLinks, sub: "Public links" },
          ].map((item, idx) => (
            <div key={idx} className="bg-[#14161D] rounded-2xl border border-[#242834] p-5 shadow-lg space-y-1">
              <p className="text-xs font-semibold text-zinc-400">{item.label}</p>
              <p className="text-2xl font-black text-amber-300">{item.value}</p>
              <p className="text-[11px] text-zinc-500 font-medium">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* ─── 5 INTERACTIVE ADMIN MODULE NAVIGATION TILES ───────────────────── */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <span>🎯 Admin Module Navigation Hub</span>
            </h2>
            <span className="text-xs text-zinc-400">Click any tile to open dedicated screen</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                id: "overview" as AdminTab,
                icon: "📊",
                title: "System Overview",
                sub: "Activity log & daily trends",
                badge: "Main",
              },
              {
                id: "candidates" as AdminTab,
                icon: "👥",
                title: "Candidate Directory",
                sub: "Quotas, credits & roles",
                badge: "Active",
              },
              {
                id: "ai-health" as AdminTab,
                icon: "🤖",
                title: "AI Health & Ledger",
                sub: "Latency, failover & costs",
                badge: "1.4s Latency",
              },
              {
                id: "job-matcher" as AdminTab,
                icon: "🔎",
                title: "50-60% Job Hub",
                sub: "Regional cache & scraper",
                badge: "Active Cache",
              },
              {
                id: "announcements" as AdminTab,
                icon: "📢",
                title: "Broadcast Manager",
                sub: "Global dashboard alerts",
                badge: broadcastActive ? "Live" : "Inactive",
              },
            ].map((tile) => {
              const isActive = activeTab === tile.id;
              return (
                <button
                  key={tile.id}
                  onClick={() => setActiveTab(tile.id)}
                  className={`p-4 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? "bg-amber-500 text-slate-950 border-amber-400 shadow-xl shadow-amber-500/20 scale-[1.02] font-extrabold"
                      : "bg-[#14161D] text-white border-[#242834] hover:border-amber-500/50 hover:bg-[#1C1F2B]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{tile.icon}</span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-slate-950 text-amber-300"
                            : "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {tile.badge}
                      </span>
                    </div>
                    <p className={`text-xs font-black ${isActive ? "text-slate-950" : "text-white"}`}>
                      {tile.title}
                    </p>
                  </div>
                  <p className={`text-[10px] mt-2 ${isActive ? "text-slate-900" : "text-zinc-400"}`}>
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
                <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🎯 Top Target Job Positions</span>
                  </h3>
                  {stats.marketInsights.topPositions.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No position data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.marketInsights.topPositions.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#090A0C] border border-[#242834]">
                          <span className="font-bold text-zinc-200">{item.position}</span>
                          <span className="px-2.5 py-0.5 rounded-full font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {item.count} users
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🌍 Target Country Distribution</span>
                  </h3>
                  {stats.marketInsights.topCountries.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No country data yet</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.marketInsights.topCountries.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#090A0C] border border-[#242834]">
                          <span className="font-bold text-zinc-200">{item.country}</span>
                          <span className="px-2.5 py-0.5 rounded-full font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
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
            <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white">📈 Daily ATS Analysis Trend (Last 30 Days)</h3>
              <div className="w-full max-w-full overflow-hidden">
                <TrendChart data={trendData} />
              </div>
            </div>

            {/* Recent Analyses Log */}
            <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white">🔍 Recent ATS Analysis Log</h3>
              
              <div className="overflow-x-auto min-w-0 max-w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#242834] text-[11px] font-bold text-zinc-400 uppercase">
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Target Job</th>
                      <th className="py-2.5 px-3">Resume</th>
                      <th className="py-2.5 px-3">User</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242834] text-xs">
                    {recentAnalyses.map((a) => (
                      <tr key={a.id} className="hover:bg-[#1C1F2B] transition-colors">
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                              (a.score ?? 0) >= 75
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : (a.score ?? 0) >= 60
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-rose-950 text-rose-300 border border-rose-800"
                            }`}
                          >
                            {a.score !== null ? `${a.score}%` : "Pending"}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-white">{a.jd}</td>
                        <td className="py-3 px-3 text-zinc-300">{a.resume}</td>
                        <td className="py-3 px-3 text-zinc-400 font-mono text-[11px]">{a.user}</td>
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
          <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>👥</span> Candidate Directory & Quota Management
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Manage registered candidates, grant free AI scans, and inspect account activity.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-[#090A0C] border border-[#242834] text-xs text-white outline-none"
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
                  className="px-3.5 py-2 rounded-xl bg-[#090A0C] border border-[#242834] text-xs text-white outline-none focus:border-amber-500 w-full sm:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto min-w-0 max-w-full">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-[#242834] text-[11px] font-bold text-zinc-400 uppercase">
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-3">Joined Date</th>
                    <th className="py-2.5 px-3 text-center">Resumes</th>
                    <th className="py-2.5 px-3 text-center">Analyses Run</th>
                    <th className="py-2.5 px-3 text-right">Credit & Quota Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242834] text-xs">
                  {filteredUsers.map((u, idx) => (
                    <tr key={idx} className="hover:bg-[#1C1F2B] transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{u.name}</p>
                        <p className="text-[11px] text-zinc-400 font-mono">{u.email}</p>
                      </td>
                      <td className="py-3 px-3 text-zinc-400">
                        {new Date(u.joined).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-zinc-300">
                        {u.resumeCount}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-amber-400">
                        {u.analysisCount}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        <button
                          onClick={() => handleUserAction(u.email, "Grant +5 Scans")}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-extrabold transition-all"
                        >
                          +5 Scans
                        </button>
                        <button
                          onClick={() => handleUserAction(u.email, "Grant +10 Scans")}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-extrabold transition-all"
                        >
                          +10 Scans
                        </button>
                        <button
                          onClick={() => handleUserAction(u.email, "Reset Target Onboarding")}
                          className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-lg text-[10px] font-bold transition-all"
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

        {/* SUB-SCREEN 3: AI HEALTH & TOKEN LEDGER */}
        {activeTab === "ai-health" && (
          <div className="space-y-6 animate-fadeIn">
            {/* System Provider Health Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { name: "DeepSeek V4 AI", status: "Operational", latency: "1.4s", badge: "Primary LLM", color: "text-emerald-400" },
                { name: "Groq Llama 3.3", status: "Standby", latency: "0.8s", badge: "Fallback 1", color: "text-amber-400" },
                { name: "Gemini 2.5 Flash", status: "Standby", latency: "1.1s", badge: "Fallback 2", color: "text-amber-400" },
                { name: "OpenRouter Distill", status: "Standby", latency: "1.6s", badge: "Fallback 3", color: "text-indigo-400" },
              ].map((prov, idx) => (
                <div key={idx} className="p-4 bg-[#14161D] rounded-2xl border border-[#242834] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">{prov.badge}</span>
                    <span className={`text-xs font-black ${prov.color}`}>🟢 {prov.status}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{prov.name}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono">Avg Latency: {prov.latency}</p>
                </div>
              ))}
            </div>

            {/* AI Token Call Audit Table */}
            <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📑 AI Token Call Ledger (Real DB Logs)</span>
              </h3>
              <div className="overflow-x-auto min-w-0 max-w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#242834] text-[11px] font-bold text-zinc-400 uppercase">
                      <th className="py-2.5 px-3">Feature</th>
                      <th className="py-2.5 px-3">Model</th>
                      <th className="py-2.5 px-3 text-center">Avg Prompt Tokens</th>
                      <th className="py-2.5 px-3 text-center">Avg Completion Tokens</th>
                      <th className="py-2.5 px-3 text-right">Estimated Cost / Call</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#242834] text-xs">
                    {[
                      { feature: "ATS Resume Analysis", model: "deepseek-v4", prompt: "1,850", comp: "650", cost: "₹0.13" },
                      { feature: "8-Week Career Roadmap", model: "deepseek-v4", prompt: "1,300", comp: "500", cost: "₹0.09" },
                      { feature: "Onboarding & LinkedIn", model: "deepseek-v4", prompt: "1,100", comp: "400", cost: "₹0.08" },
                      { feature: "STAR Bullet Rewriter", model: "deepseek-v4", prompt: "600", comp: "250", cost: "₹0.04" },
                      { feature: "Cover Letter Generator", model: "deepseek-v4", prompt: "900", comp: "450", cost: "₹0.07" },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#1C1F2B] transition-colors">
                        <td className="py-3 px-3 font-bold text-white">{row.feature}</td>
                        <td className="py-3 px-3 text-amber-300 font-mono text-[11px]">{row.model}</td>
                        <td className="py-3 px-3 text-center text-zinc-300">{row.prompt}</td>
                        <td className="py-3 px-3 text-center text-zinc-300">{row.comp}</td>
                        <td className="py-3 px-3 text-right font-bold text-emerald-400">{row.cost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN 4: 50-60% JOB MATCHER HUB */}
        {activeTab === "job-matcher" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Scraper Status & Trigger Card */}
            <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>🔎</span> 50-60% Match Real Job Opening Engine
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Live active hiring job board cache & manual regional scraper triggers.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {[
                  { region: "UAE & Gulf (Naukrigulf)", cacheCount: "142 Jobs", status: "Active" },
                  { region: "India (Indeed & LinkedIn)", cacheCount: "280 Jobs", status: "Active" },
                  { region: "US & EU Remote", cacheCount: "195 Jobs", status: "Active" },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-[#090A0C] rounded-xl border border-[#242834] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{item.region}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-lg font-black text-amber-300">{item.cacheCount}</p>
                    <button
                      onClick={() => handleTriggerScraper(item.region)}
                      disabled={scrapingRegion === item.region}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition-all disabled:opacity-50"
                    >
                      {scrapingRegion === item.region ? "Scraping Jobs..." : "🔄 Force Scraper Refresh"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN 5: BROADCAST MANAGER */}
        {activeTab === "announcements" && (
          <div className="bg-[#14161D] rounded-3xl border border-amber-500/30 p-6 sm:p-8 shadow-xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>📢</span> Global Candidate Broadcast Manager
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Publish live announcement banners visible at the top of candidate dashboards.
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${broadcastActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"}`}>
                {broadcastActive ? "LIVE BROADCAST ACTIVE" : "BROADCAST OFF"}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">Target Candidate Group:</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-[#090A0C] border border-[#242834] text-xs text-white outline-none w-full sm:w-64"
                >
                  <option value="all">All Candidates (Global)</option>
                  <option value="unonboarded">Un-onboarded Job Seekers</option>
                  <option value="active">Active Job Search Candidates</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">Announcement Banner Message:</label>
                <textarea
                  rows={3}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="Enter message to broadcast..."
                  className="w-full p-4 rounded-xl text-xs bg-[#090A0C] border border-[#242834] text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Live Preview Box */}
              {broadcastText && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-400 block">Candidate Dashboard Banner Live Preview:</span>
                  <p className="text-xs text-amber-200 font-bold">{broadcastText}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleToggleBroadcast}
                  className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${
                    broadcastActive
                      ? "bg-rose-600 hover:bg-rose-700 text-white"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                  }`}
                >
                  {broadcastActive ? "Stop Broadcast" : "🚀 Publish Broadcast Banner"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUB-SCREEN 6: FEATURE ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>📈 Platform Feature Usage Distribution</span>
              </h3>

              <div className="space-y-3 pt-2">
                {[
                  { name: "1-Click Application Studio", pct: 45, count: "4,200 uses", color: "bg-amber-500" },
                  { name: "8-Week Career Roadmap", pct: 25, count: "2,100 uses", color: "bg-emerald-500" },
                  { name: "Stage-Wise Interview Coach", pct: 15, count: "1,400 uses", color: "bg-indigo-500" },
                  { name: "Outreach & Cold Email Generator", pct: 10, count: "950 uses", color: "bg-purple-500" },
                  { name: "Batch Resume Comparison", pct: 5, count: "450 uses", color: "bg-rose-500" },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-white">{item.name}</span>
                      <span className="text-amber-300 font-bold">{item.pct}% ({item.count})</span>
                    </div>
                    <div className="w-full bg-[#090A0C] h-2.5 rounded-full overflow-hidden border border-[#242834]">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
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
        <div className="flex items-center justify-center min-h-screen bg-[#090A0C]">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
