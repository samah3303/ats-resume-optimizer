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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center max-w-sm w-full space-y-3">
          <span className="text-4xl block">🔒</span>
          <h2 className="text-base font-bold text-slate-900">Admin Access Required</h2>
          <p className="text-xs text-slate-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { stats, recentAnalyses, topUsers, recentUsers } = data;

  const trendData = Object.entries(stats.dailyTrend)
    .reverse()
    .map(([date, score]) => ({ date, score }));

  const filteredUsers = recentUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(userQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0 max-w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
            <span>🛡️ ResuMatch Executive Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin & Cost Analytics</h1>
        </div>
        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>📊 Export CSV Report</span>
        </button>
      </div>

      {/* 💳 AI TOKEN & INR SPEND WIDGET */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-500/20 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-xl font-bold text-indigo-300">
              💳
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">AI Token & Cost Expenditure (INR ₹)</h2>
              <p className="text-xs text-slate-400">Real-time DeepSeek API token consumption & cost tracking</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold">
            Live Pricing Rates
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {/* Total Spend INR */}
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-slate-300 block">Total Spend (INR)</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
              ₹{stats.aiTokenSpend.totalSpendINR}
            </p>
            <span className="text-[10px] text-slate-400 block font-mono">
              (~${stats.aiTokenSpend.totalSpendUSD} USD)
            </span>
          </div>

          {/* Total Tokens */}
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-slate-300 block">Total Tokens Used</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-300">
              {(stats.aiTokenSpend.totalTokens / 1000).toFixed(1)}k
            </p>
            <span className="text-[10px] text-slate-400 block font-mono">
              Input + Output tokens
            </span>
          </div>

          {/* Avg Spend / User */}
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-slate-300 block">Avg Cost / User</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">
              ₹{stats.aiTokenSpend.avgSpendPerUserINR}
            </p>
            <span className="text-[10px] text-slate-400 block font-mono">
              Per registered user
            </span>
          </div>

          {/* Analyses Spend */}
          <div className="p-4 bg-white/10 rounded-2xl border border-white/10 space-y-1">
            <span className="text-xs font-semibold text-slate-300 block">ATS Scans Spend</span>
            <p className="text-2xl sm:text-3xl font-extrabold text-purple-300">
              ₹{stats.aiTokenSpend.spendByFeatureINR.analyses}
            </p>
            <span className="text-[10px] text-slate-400 block font-mono">
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
          { label: "Roadmaps Generated", value: stats.roadmaps, sub: "4-week plans" },
          { label: "Onboarding Profiles", value: stats.onboardingProfiles, sub: "Target preferences" },
          { label: "Shared Reports", value: stats.sharedLinks, sub: "Public links" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-1">
            <p className="text-xs font-semibold text-slate-500">{item.label}</p>
            <p className="text-2xl font-extrabold text-slate-900">{item.value}</p>
            <p className="text-[11px] text-slate-400 font-medium">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Market Demand Insights */}
      {stats.marketInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>🎯 Top Target Job Positions</span>
            </h3>
            {stats.marketInsights.topPositions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No position data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.marketInsights.topPositions.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">{item.position}</span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-800">
                      {item.count} users
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>🌍 Target Country Distribution</span>
            </h3>
            {stats.marketInsights.topCountries.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No country data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.marketInsights.topCountries.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-semibold text-slate-800">{item.country}</span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                      {item.count} candidates
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Responsive Daily Analysis Trend Chart (Mobile Wrapped) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">📈 Daily ATS Analysis Trend (Last 30 Days)</h3>
        <div className="w-full max-w-full overflow-hidden">
          <TrendChart data={trendData} />
        </div>
      </div>

      {/* User Search & Live List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-sm font-bold text-slate-900">👥 User Directory & Activity</h3>
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-full sm:w-64"
          />
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Joined Date</th>
                <th className="py-2.5 px-3 text-center">Resumes</th>
                <th className="py-2.5 px-3 text-center">Analyses Run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.map((u, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">{u.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                  </td>
                  <td className="py-3 px-3 text-slate-500">
                    {new Date(u.joined).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-700">
                    {u.resumeCount}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-indigo-600">
                    {u.analysisCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Analyses Log */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">🔍 Recent ATS Analysis Log</h3>
        
        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto min-w-0 max-w-full">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase">
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Target Job</th>
                <th className="py-2.5 px-3">Resume</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentAnalyses.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                        (a.score ?? 0) >= 70
                          ? "bg-emerald-100 text-emerald-800"
                          : (a.score ?? 0) >= 40
                          ? "bg-amber-100 text-amber-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {a.score !== null ? `${a.score}%` : "Pending"}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{a.jd}</td>
                  <td className="py-3 px-3 text-slate-600">{a.resume}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{a.user}</td>
                  <td className="py-3 px-3 text-slate-400">
                    {new Date(a.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
