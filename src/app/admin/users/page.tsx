"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface CandidateItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  phone: string | null;
  location: string | null;
  targetRoles: string[];
  skills: string[];
  atsScore: number | null;
  resumeFileName: string | null;
  jobsCount: number;
  applicationsCount: number;
  activityCount: number;
}

export default function AdminUsersPage() {
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (roleFilter !== "all") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load candidates");
      const json = await res.json();
      setCandidates(json.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCandidates();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadCandidates]);

  const handleToggleRole = async (user: CandidateItem) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    setUpdatingId(user.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        throw new Error("Failed to update role");
      }

      setCandidates((prev) =>
        prev.map((c) => (c.id === user.id ? { ...c, role: newRole } : c))
      );
      setMessage({
        text: `Updated ${user.name}'s role to ${newRole.toUpperCase()}.`,
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to update role",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header Banner */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-nordic-secondary text-nordic-text text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-nordic-primary" />
            Candidate Directory
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-nordic-text tracking-tight">
            Candidate & User Management
          </h1>
          <p className="text-xs sm:text-sm text-nordic-text-secondary mt-0.5 sm:mt-1">
            Search candidates, inspect ATS scores, and configure platform roles.
          </p>
        </div>

        <Link
          href="/admin"
          className="nordic-btn-secondary text-xs h-10 sm:h-11 px-4 cursor-pointer font-bold tap-active flex items-center gap-1.5 self-start md:self-auto"
        >
          ← Back to Overview
        </Link>
      </div>

      {message && (
        <div
          className={`border p-3.5 sm:p-4 rounded-xl sm:rounded-[4px] text-xs font-semibold flex items-center justify-between ${
            message.type === "success"
              ? "bg-nordic-success/10 border-nordic-success text-nordic-success"
              : "bg-nordic-error/10 border-nordic-error text-nordic-error"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="font-bold text-sm cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "all", label: `All (${candidates.length})` },
            { id: "user", label: "Candidates" },
            { id: "admin", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as typeof roleFilter)}
              className={`h-10 px-4 rounded-xl sm:rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer tap-active whitespace-nowrap ${
                roleFilter === tab.id
                  ? "bg-nordic-primary text-white"
                  : "bg-white text-nordic-text-secondary border border-nordic-border hover:bg-nordic-bg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, title, location..."
            className="w-full h-10 px-3.5 bg-white border border-nordic-border rounded-xl sm:rounded-[4px] text-sm text-nordic-text placeholder-nordic-neutral focus:outline-none focus:border-nordic-primary focus:ring-2 focus:ring-nordic-primary/15"
          />
        </div>
      </div>

      {/* Candidate List Container */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 border border-nordic-border bg-white rounded-2xl sm:rounded-[4px] animate-pulse" />
          ))}
        </div>
      ) : candidates.length === 0 ? (
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-10 text-center space-y-2">
          <h3 className="font-bold text-base text-nordic-text">No candidates found</h3>
          <p className="text-xs text-nordic-neutral">Try adjusting your search query or filter.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List View */}
          <div className="md:hidden space-y-3">
            {candidates.map((u) => (
              <div
                key={u.id}
                className="nordic-card rounded-2xl p-4.5 space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-nordic-text">{u.name}</h3>
                    <div className="text-xs font-mono text-nordic-neutral">{u.email}</div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-[2px] ${
                      u.role === "admin"
                        ? "bg-nordic-secondary text-nordic-text"
                        : "bg-nordic-primary/10 text-nordic-primary"
                    }`}
                  >
                    {u.role.toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-nordic-text-secondary space-y-1">
                  <div>🎯 {u.targetRoles.join(", ") || "No target roles set"}</div>
                  <div>📍 {u.location || "Location not set"}</div>
                  {u.atsScore !== null && (
                    <div className="font-mono font-bold text-nordic-success">
                      ATS Score: {u.atsScore}%
                    </div>
                  )}
                  {u.resumeFileName && (
                    <div className="text-[11px] text-nordic-neutral font-mono">
                      📄 {u.resumeFileName}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-nordic-border flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-nordic-neutral">
                    {u.jobsCount} jobs • {u.applicationsCount} apps
                  </span>

                  <button
                    onClick={() => handleToggleRole(u)}
                    disabled={updatingId === u.id}
                    className={`text-xs px-3 py-1.5 rounded-[4px] font-bold border transition-colors cursor-pointer tap-active disabled:opacity-50 ${
                      u.role === "admin"
                        ? "bg-white border-nordic-border text-nordic-neutral hover:text-nordic-error"
                        : "bg-nordic-primary border-nordic-primary text-white hover:bg-nordic-primary-hover"
                    }`}
                  >
                    {updatingId === u.id
                      ? "Updating..."
                      : u.role === "admin"
                      ? "Demote to Candidate"
                      : "Promote to Admin"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block nordic-card rounded-[4px] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-nordic-border text-nordic-neutral uppercase tracking-wider font-bold">
                    <th className="py-3 px-4">Candidate</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Target Title</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">ATS Match</th>
                    <th className="py-3 px-4">Activity</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nordic-border bg-white">
                  {candidates.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-nordic-text">{u.name}</div>
                        <div className="text-nordic-neutral font-mono text-[11px]">{u.email}</div>
                        {u.resumeFileName && (
                          <div className="text-[10px] text-nordic-neutral font-mono mt-0.5">
                            📄 {u.resumeFileName}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-[3px] ${
                            u.role === "admin"
                              ? "bg-nordic-secondary text-nordic-text"
                              : "bg-nordic-primary/10 text-nordic-primary"
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-nordic-text max-w-xs truncate">
                        {u.targetRoles.join(", ") || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-nordic-text-secondary">
                        {u.location || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        {u.atsScore !== null ? (
                          <span className="font-mono font-bold text-nordic-success bg-nordic-success/10 px-2 py-0.5 rounded-[2px]">
                            {u.atsScore}%
                          </span>
                        ) : (
                          <span className="text-[#999]">No scan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-nordic-neutral">
                        {u.jobsCount} jobs • {u.applicationsCount} apps
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={updatingId === u.id}
                          className={`text-[11px] px-3 py-1.5 rounded-[4px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                            u.role === "admin"
                              ? "bg-white border-nordic-border text-nordic-neutral hover:text-nordic-error hover:border-nordic-error"
                              : "bg-nordic-primary border-nordic-primary text-white hover:bg-nordic-primary-hover"
                          }`}
                        >
                          {updatingId === u.id
                            ? "Updating..."
                            : u.role === "admin"
                            ? "Demote to User"
                            : "Make Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
