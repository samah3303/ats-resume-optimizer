"use client";

import { useState } from "react";
import Link from "next/link";
import { WebRTCVideoStage } from "./WebRTCVideoStage";
import { SynchronizedCodePad } from "./SynchronizedCodePad";
import { LiveAiCopilotDrawer } from "./LiveAiCopilotDrawer";
import { SharedScorecardDrawer } from "./SharedScorecardDrawer";
import { InterviewRoomData } from "@/lib/webrtc/rooms";

interface InterviewRoomWorkspaceProps {
  room: InterviewRoomData;
  isHost?: boolean;
}

export function InterviewRoomWorkspace({
  room,
  isHost = true,
}: InterviewRoomWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<"video_code" | "copilot" | "scorecard">("video_code");
  const [copiedLink, setCopiedLink] = useState(false);

  const copyRoomInvite = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 p-3 sm:p-6 max-w-[1600px] mx-auto space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/recruiter"
            className="touch-target px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-xs font-bold text-black rounded-xl transition-all shadow-sm flex items-center gap-1"
          >
            <span>&larr;</span> Recruiter OS
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-black text-black">{room.title}</h2>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-zinc-100 rounded text-zinc-700 border border-zinc-200">
                Room #{room.id}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Role: <strong className="text-black">{room.targetRole}</strong> • Interviewer: {room.interviewerName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher on Tablet/Mobile */}
          <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-300 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("video_code")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === "video_code" ? "bg-black text-white" : "text-zinc-600"
              }`}
            >
              Video & Code
            </button>
            <button
              onClick={() => setActiveTab("copilot")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === "copilot" ? "bg-black text-white" : "text-zinc-600"
              }`}
            >
              AI Copilot
            </button>
            <button
              onClick={() => setActiveTab("scorecard")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                activeTab === "scorecard" ? "bg-black text-white" : "text-zinc-600"
              }`}
            >
              Scorecard
            </button>
          </div>

          <button
            onClick={copyRoomInvite}
            className="touch-target px-4 py-2 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <span>{copiedLink ? "✓ Invite Copied" : "🔗 Copy Invite Link"}</span>
          </button>
        </div>
      </div>

      {/* Main Multi-Pane Room Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Video Stage + Synchronized Code Pad (8 cols) */}
        <div
          className={`lg:col-span-8 space-y-6 ${
            activeTab === "video_code" ? "block" : "hidden lg:block"
          }`}
        >
          {/* WebRTC Video Grid */}
          <WebRTCVideoStage
            localName={isHost ? room.interviewerName : room.candidateName || "Candidate"}
            remoteName={isHost ? room.candidateName || "Candidate" : room.interviewerName}
            isHost={isHost}
          />

          {/* Synchronized Collaborative Code Pad */}
          <SynchronizedCodePad initialCode={room.sharedCode} />
        </div>

        {/* Right Side: AI Live Copilot & Scorecard Drawers (4 cols) */}
        <div
          className={`lg:col-span-4 space-y-6 ${
            activeTab !== "video_code" ? "block" : "hidden lg:block"
          }`}
        >
          {/* AI Live Copilot */}
          {(activeTab === "copilot" || activeTab === "video_code") && (
            <LiveAiCopilotDrawer targetRole={room.targetRole} />
          )}

          {/* Shared Recruiter Scorecard */}
          {(activeTab === "scorecard" || activeTab === "video_code") && (
            <SharedScorecardDrawer
              candidateName={room.candidateName || "Candidate"}
              targetRole={room.targetRole}
            />
          )}
        </div>
      </div>
    </div>
  );
}
