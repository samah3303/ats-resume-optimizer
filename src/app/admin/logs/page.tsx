"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface ActivityLogItem {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        filterAction === "all"
          ? "/api/admin/logs"
          : `/api/admin/logs?action=${encodeURIComponent(filterAction)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load telemetry logs");
      const json = await res.json();
      setLogs(json.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterAction]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header Banner */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-nordic-secondary text-nordic-text text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-nordic-primary" />
            Live Telemetry
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-nordic-text tracking-tight">
            AI Scraper Telemetry & Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-nordic-text-secondary mt-0.5 sm:mt-1">
            Real-time tracking of AI Job Finder queries across Naukri Gulf, Indeed, and LinkedIn.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={loadLogs}
            className="nordic-btn-secondary text-xs h-10 sm:h-11 px-4 cursor-pointer font-bold tap-active"
          >
            ↻ Refresh Logs
          </button>
          <Link
            href="/admin"
            className="nordic-btn-outline text-xs h-10 sm:h-11 px-4 flex items-center font-bold"
          >
            ← Overview
          </Link>
        </div>
      </div>

      {/* Action Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "all", label: `All Activity (${logs.length})` },
          { id: "ai_job_search", label: "✨ AI Job Searches" },
          { id: "resume_scan", label: "📄 Resume Scans" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterAction(tab.id)}
            className={`h-10 px-4 rounded-xl sm:rounded-[4px] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer tap-active whitespace-nowrap ${
              filterAction === tab.id
                ? "bg-nordic-primary text-white"
                : "bg-white text-nordic-text-secondary border border-nordic-border hover:bg-nordic-bg"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Logs Stream */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 border border-nordic-border bg-white rounded-2xl sm:rounded-[4px] animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-10 text-center space-y-2">
          <h3 className="font-bold text-base text-nordic-text">No activity logs found</h3>
          <p className="text-xs text-nordic-neutral">Telemetry events will appear as candidates search for jobs.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const isAi = log.action === "ai_job_search";

            return (
              <div
                key={log.id}
                className="nordic-card rounded-xl sm:rounded-[4px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-nordic-primary transition-all"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${
                      isAi
                        ? "bg-nordic-secondary text-nordic-primary"
                        : "bg-nordic-primary/10 text-nordic-primary"
                    }`}
                  >
                    {isAi ? "✨" : "⚡"}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-xs uppercase tracking-wide text-nordic-text">
                        {log.action.replace(/_/g, " ")}
                      </span>
                      <span className="text-[11px] text-nordic-neutral">by</span>
                      <span className="font-bold text-xs text-nordic-primary">
                        {log.user.name} ({log.user.email})
                      </span>
                    </div>
                    <p className="text-xs text-nordic-text-secondary font-mono leading-relaxed">
                      {log.details || "No details provided"}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 text-[11px] font-mono text-nordic-neutral border-t sm:border-t-0 pt-2 sm:pt-0">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
