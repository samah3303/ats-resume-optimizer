"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
  }>;
}

function AdminContent() {
  const params = useSearchParams();
  const key = params.get("key") || "";
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 text-center">
          <span className="text-3xl mb-3 block">🔒</span>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { stats } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">📊 ResuMatch Admin</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", value: stats.users, sub: `${stats.newUsers} new this week` },
          { label: "Resumes", value: stats.resumes },
          { label: "Jobs", value: stats.jobs },
          { label: "Analyses", value: stats.analyses },
          { label: "Onboardings", value: stats.onboardingProfiles },
          { label: "Roadmaps", value: stats.roadmaps },
          { label: "Shared Links", value: stats.sharedLinks },
          { label: "Avg Score", value: `${stats.averageScore}%` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            {s.sub && <p className="text-xs text-green-600 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Score Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
        <h2 className="text-lg font-semibold mb-3">Score Distribution</h2>
        <div className="flex gap-2 h-8 rounded-lg overflow-hidden">
          {stats.scoreDistribution.high > 0 && (
            <div
              className="bg-green-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(stats.scoreDistribution.high / stats.analyses) * 100}%` }}
            >
              {stats.scoreDistribution.high} ≥70%
            </div>
          )}
          {stats.scoreDistribution.medium > 0 && (
            <div
              className="bg-amber-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(stats.scoreDistribution.medium / stats.analyses) * 100}%` }}
            >
              {stats.scoreDistribution.medium} 40-69%
            </div>
          )}
          {stats.scoreDistribution.low > 0 && (
            <div
              className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
              style={{ width: `${(stats.scoreDistribution.low / stats.analyses) * 100}%` }}
            >
              {stats.scoreDistribution.low} &lt;40%
            </div>
          )}
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
        <h2 className="text-lg font-semibold mb-3">📈 Daily Analyses (30 days)</h2>
        <div className="flex items-end gap-0.5 h-32">
          {Object.entries(stats.dailyTrend).reverse().map(([day, count]) => {
            const maxVal = Math.max(...Object.values(stats.dailyTrend), 1);
            const pct = (count / maxVal) * 100;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${count} analyses`}>
                <span className="text-[10px] text-gray-400">{count || ""}</span>
                <div
                  className="w-full rounded-t bg-indigo-500 hover:bg-indigo-600 transition-colors min-h-[2px]"
                  style={{ height: `${Math.max(pct, 2)}%` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-0.5 mt-1">
          {Object.entries(stats.dailyTrend).reverse().slice(0, 30).map(([day]) => (
            <span key={day} className="flex-1 text-[8px] text-gray-300 text-center">
              {day.slice(5)}
            </span>
          ))}
        </div>
      </div>

      {/* Top Users + Recent Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-3">🏆 Top Users</h2>
          {data.topUsers.map((u) => (
            <div key={u.email} className="flex items-center justify-between py-2 border-b border-gray-50">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <span className="font-bold text-indigo-600">{u.analysisCount}</span>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">👥 Recent Users</h2>
            <button
              onClick={() => {
                const csv = ["Email,Name,Joined,Analyses", ...data.recentUsers.map(u => `${u.email},"${u.name}",${new Date(u.joined).toLocaleDateString()},${u.analysisCount}`)].join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = "resumatch-users.csv"; a.click(); URL.revokeObjectURL(url);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              📥 Export CSV
            </button>
          </div>
          {data.recentUsers.slice(0, 10).map((u) => (
            <div key={u.email} className="flex items-center justify-between py-2 border-b border-gray-50 text-sm">
              <span className="truncate max-w-[180px] text-gray-600">{u.email}</span>
              <span className="text-gray-400 text-xs">{new Date(u.joined).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold mb-3">Recent Analyses</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase border-b">
                <th className="pb-2">Score</th>
                <th className="pb-2">Resume</th>
                <th className="pb-2">JD</th>
                <th className="pb-2">User</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentAnalyses.map((a) => (
                <tr key={a.id} className="border-b border-gray-50">
                  <td className="py-2">
                    {a.score !== null ? (
                      <span
                        className={`font-bold ${a.score >= 70 ? "text-green-600" : a.score >= 40 ? "text-amber-600" : "text-red-600"}`}
                      >
                        {a.score}%
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2">{a.resume}</td>
                  <td className="py-2">{a.jd}</td>
                  <td className="py-2 text-gray-500">{a.user}</td>
                  <td className="py-2 text-gray-400">{new Date(a.date).toLocaleDateString()}</td>
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
