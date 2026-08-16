"use client";

import { useState } from "react";
import { AutonomousAgentStatus } from "@/lib/ai/autonomous-agents";

interface AgentSwarmControlCenterProps {
  onDispatchSwarm: () => void;
  isDispatching?: boolean;
}

export function AgentSwarmControlCenter({
  onDispatchSwarm,
  isDispatching = false,
}: AgentSwarmControlCenterProps) {
  const [agents, setAgents] = useState<AutonomousAgentStatus[]>([
    {
      type: "hunter",
      name: "Hunter Agent",
      codename: "HUNTER-V4",
      roleDescription: "Scans aggregated job streams, evaluates semantic match %, and auto-drafts tailored resume packets & cover letters.",
      avatarIcon: "🎯",
      status: "active",
      lastScanTimestamp: "4 mins ago",
      totalActionsPerformed: 248,
      currentObjective: "Scanning 140k+ live job postings matching Staff Full-Stack profile.",
    },
    {
      type: "radar",
      name: "Market Radar Agent",
      codename: "RADAR-AI",
      roleDescription: "Monitors compensation surge anomalies, high-growth engineering skills, and venture funding hiring sprees.",
      avatarIcon: "📡",
      status: "active",
      lastScanTimestamp: "12 mins ago",
      totalActionsPerformed: 182,
      currentObjective: "Tracking +84% salary surge in AI Agent Orchestration and Rust systems.",
    },
    {
      type: "scout",
      name: "Layoff & Re-hire Scout",
      codename: "SCOUT-SENTINEL",
      roleDescription: "Tracks tech workforce re-structuring and maps which companies are aggressively absorbing impacted engineering talent.",
      avatarIcon: "🛰️",
      status: "active",
      lastScanTimestamp: "28 mins ago",
      totalActionsPerformed: 94,
      currentObjective: "Mapping 12 high-velocity tech companies actively hiring senior developers.",
    },
    {
      type: "guardian",
      name: "ATS Drift Guardian",
      codename: "GUARDIAN-SHIELD",
      roleDescription: "Audits primary resume ATS health against evolving parser algorithms (Workday, Greenhouse, Lever).",
      avatarIcon: "🛡️",
      status: "active",
      lastScanTimestamp: "1 hour ago",
      totalActionsPerformed: 65,
      currentObjective: "Verifying keyword density and single-column formatting compliance.",
    },
  ]);

  const toggleAgent = (type: string) => {
    setAgents(
      agents.map((a) =>
        a.type === type ? { ...a, status: a.status === "active" ? "idle" : "active" } : a
      )
    );
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
              SWARM INTELLIGENCE ACTIVE
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
            Autonomous Background Agent Swarm
          </h2>
          <p className="text-xs text-zinc-600">
            Dedicated AI agents working asynchronously in the background to scan job boards, tailor applications, and monitor market salary shifts.
          </p>
        </div>

        <button
          onClick={onDispatchSwarm}
          disabled={isDispatching}
          className="touch-target px-6 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-2xl border border-black shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95 disabled:opacity-50"
        >
          {isDispatching ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Dispatching Swarm Cycle...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Trigger Immediate Swarm Scan</span>
            </>
          )}
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const isActive = agent.status === "active" || agent.status === "scanning";
          return (
            <div
              key={agent.type}
              className={`p-5 rounded-3xl border transition-all space-y-4 flex flex-col justify-between shadow-sm ${
                isActive ? "bg-zinc-50 border-zinc-300" : "bg-white border-zinc-200 opacity-60"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-xl shadow-xs">
                    {agent.avatarIcon}
                  </div>
                  <button
                    onClick={() => toggleAgent(agent.type)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border transition-all ${
                      isActive
                        ? "bg-black text-white border-black"
                        : "bg-zinc-100 text-zinc-600 border-zinc-300"
                    }`}
                  >
                    {isActive ? "ACTIVE" : "PAUSED"}
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-black text-black">{agent.name}</h3>
                  <span className="text-[10px] font-mono font-bold text-zinc-500">
                    {agent.codename}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-sans">
                  {agent.roleDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-zinc-500">
                  <span>Last Cycle:</span>
                  <span className="font-mono font-bold text-black">{agent.lastScanTimestamp}</span>
                </div>
                <div className="p-2 bg-white border border-zinc-200 rounded-xl text-[10px] text-zinc-700 font-medium">
                  {agent.currentObjective}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
