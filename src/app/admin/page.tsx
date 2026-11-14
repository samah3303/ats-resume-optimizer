"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdminStats {
  metrics: {
    totalUsers: number;
    totalResumes: number;
    averageAtsScore: number;
    totalJobs: number;
    totalApplications: number;
    aiSearchesCount: number;
  };
  platformBreakdown: Record<string, number>;
  statusDistribution: Record<string, number>;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
    atsScore: number | null;
    location: string | null;
    targetRole: string | null;
    resumeFileName: string | null;
    jobsCount: number;
    applicationsCount: number;
  }>;
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) {
        throw new Error("Failed to load admin stats");
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-28 border border-[#DFDFDF] bg-white rounded-2xl sm:rounded-[4px] animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 border border-[#DFDFDF] bg-white rounded-2xl sm:rounded-[4px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="nordic-card p-8 rounded-2xl sm:rounded-[4px] text-center space-y-3">
        <div className="text-xl font-bold text-[#CC0008]">Failed to load admin stats</div>
        <p className="text-sm text-[#767676]">{error}</p>
        <button onClick={loadStats} className="nordic-btn-primary text-xs h-10 px-5">
          Retry
        </button>
      </div>
    );
  }

  const { metrics, platformBreakdown, statusDistribution, recentUsers } = data;

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header Banner */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFDA1A] text-[#111111] text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-[#003399]" />
            Control Center
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            Platform Analytics & Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#484848] mt-0.5 sm:mt-1">
            Real-time telemetry for candidate resumes, ATS match scores, and live job scrapers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadStats}
            className="nordic-btn-secondary text-xs h-10 sm:h-11 px-4 cursor-pointer font-bold tap-active"
          >
            ↻ Refresh
          </button>
          <Link
            href="/admin/users"
            className="nordic-btn-primary text-xs sm:text-sm h-10 sm:h-11 px-4 sm:px-5 flex items-center justify-center gap-1.5 font-bold tap-active"
          >
            Manage Candidates ➔
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4 sm:p-6 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#767676]">
            Total Candidates
          </span>
          <div className="text-2xl sm:text-4xl font-mono font-bold text-[#111111] my-2">
            {metrics.totalUsers}
          </div>
          <span className="text-xs text-[#0A8A00] font-semibold">
            {metrics.totalResumes} resumes scanned
          </span>
        </div>

        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4 sm:p-6 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#767676]">
            Average ATS Score
          </span>
          <div className="text-2xl sm:text-4xl font-mono font-bold text-[#003399] my-2">
            {metrics.averageAtsScore}%
          </div>
          <span className="text-xs text-[#767676]">
            Target benchmark: 75%+
          </span>
        </div>

        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4 sm:p-6 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#767676]">
            Jobs Tracked
          </span>
          <div className="text-2xl sm:text-4xl font-mono font-bold text-[#111111] my-2">
            {metrics.totalJobs}
          </div>
          <span className="text-xs text-[#003399] font-semibold">
            {metrics.totalApplications} in applications pipeline
          </span>
        </div>

        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4 sm:p-6 flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#767676]">
            AI Searches
          </span>
          <div className="text-2xl sm:text-4xl font-mono font-bold text-[#E87400] my-2">
            {metrics.aiSearchesCount}
          </div>
          <span className="text-xs text-[#767676]">
            DeepSeek web tools active
          </span>
        </div>
      </div>

      {/* Platform & Pipeline Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Scraped Job Source Platforms */}
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-3">
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#003399]" />
              Live Platform Source Breakdown
            </h2>
            <span className="text-[11px] text-[#767676]">Across saved jobs</span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "naukrigulf",
                name: "Naukri Gulf",
                count: platformBreakdown.naukrigulf || 0,
                color: "bg-[#0A8A00]",
              },
              {
                id: "indeed",
                name: "Indeed",
                count: platformBreakdown.indeed || 0,
                color: "bg-[#003399]",
              },
              {
                id: "linkedin",
                name: "LinkedIn",
                count: platformBreakdown.linkedin || 0,
                color: "bg-[#0077B5]",
              },
              {
                id: "greenhouse_lever",
                name: "Greenhouse / Lever",
                count: platformBreakdown.greenhouse_lever || 0,
                color: "bg-[#FF9900]",
              },
              {
                id: "manual",
                name: "Manual / Direct Link",
                count: (platformBreakdown.manual || 0) + (platformBreakdown.other || 0),
                color: "bg-[#111111]",
              },
            ].map((p) => {
              const total = metrics.totalJobs || 1;
              const pct = Math.round((p.count / total) * 100);

              return (
                <div key={p.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#111111]">{p.name}</span>
                    <span className="font-mono text-[#767676]">
                      {p.count} jobs ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-[#F5F5F5] border border-[#DFDFDF] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${p.color} transition-all duration-300`}
                      style={{ width: `${Math.max(pct, p.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Stages Distribution */}
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-3">
            <h2 className="text-base font-bold text-[#111111] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFDA1A]" />
              Application Pipeline Stages
            </h2>
            <span className="text-[11px] text-[#767676]">{metrics.totalApplications} Total</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {[
              { label: "Wishlist", count: statusDistribution.wishlist || 0, border: "border-[#767676]" },
              { label: "Applied", count: statusDistribution.applied || 0, border: "border-[#003399]" },
              { label: "Screening", count: statusDistribution.screening || 0, border: "border-[#0077B5]" },
              { label: "Interviewing", count: statusDistribution.interviewing || 0, border: "border-[#FFDA1A]" },
              { label: "Offers", count: statusDistribution.offer || 0, border: "border-[#0A8A00]" },
              { label: "Archived", count: (statusDistribution.rejected || 0) + (statusDistribution.archived || 0), border: "border-[#CC0008]" },
            ].map((st) => (
              <div
                key={st.label}
                className={`p-3 bg-[#F9FAFB] border-l-4 ${st.border} border border-[#DFDFDF] rounded-[4px] flex flex-col justify-between`}
              >
                <span className="text-[11px] font-bold text-[#767676] uppercase tracking-wide">
                  {st.label}
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-[#111111] mt-1">
                  {st.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Candidates Activity Table */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#DFDFDF] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#111111]">
              Recent Candidate Signups & Profiles
            </h2>
            <p className="text-xs text-[#767676] mt-0.5">
              Latest users registered on the platform with resume and ATS diagnostics.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs font-bold text-[#003399] hover:underline"
          >
            View All ({metrics.totalUsers}) ➔
          </Link>
        </div>

        {/* Mobile Candidate Card View */}
        <div className="md:hidden space-y-3">
          {recentUsers.map((u) => (
            <div
              key={u.id}
              className="p-4 border border-[#DFDFDF] rounded-xl bg-white space-y-2 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-sm text-[#111111]">{u.name}</div>
                  <div className="text-xs font-mono text-[#767676]">{u.email}</div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] ${
                    u.role === "admin"
                      ? "bg-[#FFDA1A] text-[#111111]"
                      : "bg-[#003399]/10 text-[#003399]"
                  }`}
                >
                  {u.role.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#484848] pt-1">
                <span>📍 {u.location || "Location not set"}</span>
                {u.atsScore !== null && (
                  <span className="font-mono font-bold text-[#0A8A00]">
                    ATS: {u.atsScore}%
                  </span>
                )}
              </div>

              <div className="text-xs text-[#767676] flex items-center justify-between pt-2 border-t border-[#DFDFDF]">
                <span>{u.jobsCount} jobs • {u.applicationsCount} apps</span>
                <span className="font-mono text-[10px]">
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DFDFDF] text-[#767676] uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Candidate</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Target Title</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">ATS Score</th>
                <th className="py-2.5 px-3">Jobs / Apps</th>
                <th className="py-2.5 px-3 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFDFDF]">
              {recentUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-[#111111]">{u.name}</div>
                    <div className="text-[#767676] font-mono text-[11px]">{u.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] ${
                        u.role === "admin"
                          ? "bg-[#FFDA1A] text-[#111111]"
                          : "bg-[#003399]/10 text-[#003399]"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-[#111111]">
                    {u.targetRole || "—"}
                  </td>
                  <td className="py-3 px-3 text-[#484848]">
                    {u.location || "—"}
                  </td>
                  <td className="py-3 px-3">
                    {u.atsScore !== null ? (
                      <span className="font-mono font-bold text-[#0A8A00] bg-[#0A8A00]/10 px-2 py-0.5 rounded-[2px]">
                        {u.atsScore}%
                      </span>
                    ) : (
                      <span className="text-[#999]">No scan</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono text-[#767676]">
                    {u.jobsCount}j / {u.applicationsCount}a
                  </td>
                  <td className="py-3 px-3 font-mono text-[#767676] text-right">
                    {new Date(u.createdAt).toLocaleDateString()}
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
