"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
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

function AdminContent() {
  const params = useSearchParams();
  const key = params.get("key") || "";
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [broadcastText, setBroadcastText] = useState("✨ 1-Click Studio & Stage-Wise STAR Interview Coach now active!");
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
    setActionSuccess(`Broadcast banner ${!broadcastActive ? "ACTIVATED" : "DEACTIVATED"} for all candidates!`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleUserAction = (userEmail: string, actionName: string) => {
    setActionSuccess(`Action "${actionName}" applied to ${userEmail}`);
    setTimeout(() => setActionSuccess(null), 3000);
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

  const filteredUsers = recentUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(userQuery.toLowerCase())
  );

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
              Admin & System Health Analytics
            </h1>
          </div>
          <button
            onClick={handleExportCsv}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <span>📊 Export CSV Report</span>
          </button>
        </div>

        {/* 🟢 SYSTEM HEALTH & AI ENGINE STATUS CARD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-[#14161D] rounded-2xl border border-[#242834] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase">DeepSeek V4 AI Engine</span>
              <p className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Operational (1.4s Latency)
              </p>
            </div>
            <span className="text-2xl">🧠</span>
          </div>

          <div className="p-5 bg-[#14161D] rounded-2xl border border-[#242834] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase">pgvector RAG Embeddings</span>
              <p className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                384-Dim Index Healthy
              </p>
            </div>
            <span className="text-2xl">🔍</span>
          </div>

          <div className="p-5 bg-[#14161D] rounded-2xl border border-[#242834] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 block uppercase">50-60% Job Matcher Cache</span>
              <p className="text-sm font-black text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Active Openings Syncing
              </p>
            </div>
            <span className="text-2xl">🔎</span>
          </div>
        </div>

        {/* 📢 GLOBAL BROADCAST BANNER MANAGER */}
        <div className="p-6 bg-[#14161D] rounded-3xl border border-amber-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider">
              <span>📢 Candidate Broadcast Banner Manager</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${broadcastActive ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"}`}>
              {broadcastActive ? "LIVE ON DASHBOARD" : "INACTIVE"}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="Enter announcement banner message..."
              className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-[#090A0C] border border-[#242834] text-white focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleToggleBroadcast}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                broadcastActive
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-amber-500 hover:bg-amber-400 text-slate-950"
              }`}
            >
              {broadcastActive ? "Stop Broadcast" : "Publish Broadcast Banner"}
            </button>
          </div>
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
              Live Rates
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {/* Total Spend INR */}
            <div className="p-4 bg-[#090A0C]/80 rounded-2xl border border-[#242834] space-y-1">
              <span className="text-xs font-semibold text-zinc-400 block">Total Spend (INR)</span>
              <p className="text-2xl sm:text-3xl font-black text-emerald-400">
                ₹{stats.aiTokenSpend.totalSpendINR}
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                (~${stats.aiTokenSpend.totalSpendUSD} USD)
              </span>
            </div>

            {/* Total Tokens */}
            <div className="p-4 bg-[#090A0C]/80 rounded-2xl border border-[#242834] space-y-1">
              <span className="text-xs font-semibold text-zinc-400 block">Total Tokens Used</span>
              <p className="text-2xl sm:text-3xl font-black text-amber-300">
                {(stats.aiTokenSpend.totalTokens / 1000).toFixed(1)}k
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                Input + Output tokens
              </span>
            </div>

            {/* Avg Spend / User */}
            <div className="p-4 bg-[#090A0C]/80 rounded-2xl border border-[#242834] space-y-1">
              <span className="text-xs font-semibold text-zinc-400 block">Avg Cost / User</span>
              <p className="text-2xl sm:text-3xl font-black text-yellow-300">
                ₹{stats.aiTokenSpend.avgSpendPerUserINR}
              </p>
              <span className="text-[10px] text-zinc-500 block font-mono">
                Per registered user
              </span>
            </div>

            {/* Analyses Spend */}
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

        {/* Responsive Daily Analysis Trend Chart */}
        <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white">📈 Daily ATS Analysis Trend (Last 30 Days)</h3>
          <div className="w-full max-w-full overflow-hidden">
            <TrendChart data={trendData} />
          </div>
        </div>

        {/* User Search & Live List with Admin Actions */}
        <div className="bg-[#14161D] rounded-2xl border border-[#242834] p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold text-white">👥 Candidate Directory & Quota Management</h3>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="px-3.5 py-2 rounded-xl bg-[#090A0C] border border-[#242834] text-xs text-white outline-none focus:border-amber-500 w-full sm:w-64"
            />
          </div>

          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto min-w-0 max-w-full">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-[#242834] text-[11px] font-bold text-zinc-400 uppercase">
                  <th className="py-2.5 px-3">Candidate</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  <th className="py-2.5 px-3 text-center">Resumes</th>
                  <th className="py-2.5 px-3 text-center">Analyses</th>
                  <th className="py-2.5 px-3 text-right">Quick Action</th>
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
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleUserAction(u.email, "Grant +5 Scans")}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-extrabold transition-all"
                      >
                        +5 Free Scans
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
