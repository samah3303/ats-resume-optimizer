"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkspaceMode, WorkspaceMode } from "@/components/WorkspaceModeContext";

interface FeatureTile {
  id: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  icon: string;
  category: string;
  badge?: string;
  highlightMetric?: string;
}

const candidateTiles: FeatureTile[] = [
  {
    id: "builder",
    title: "ATS Resume Studio",
    tagline: "6 Pro Templates & Inline STAR Diff",
    description: "Build ATS-compliant resumes with real-time keyword match % and metric-driven STAR bullet enhancements.",
    href: "/dashboard/builder",
    icon: "📄",
    category: "Core Studio",
    badge: "Most Popular",
    highlightMetric: "98% ATS Pass Rate",
  },
  {
    id: "challenges",
    title: "Coding Sandbox IDE",
    tagline: "Monaco IDE & Pointer Visualizer",
    description: "Solve algorithmic challenges in JS, TS, or Python 3.11 with step-by-step pointer debuggers and AI Big-O reviews.",
    href: "/dashboard/challenges",
    icon: "💻",
    category: "Technical Prep",
    badge: "Interactive",
    highlightMetric: "JS / TS / Python",
  },
  {
    id: "mock-interview",
    title: "Conversational Voice Mock",
    tagline: "8 Personas & Dynamic Waveforms",
    description: "Practice spoken interviews out loud with AI voice synthesis, 48-bar audio waveforms, and live filler-word counters.",
    href: "/dashboard/mock-interview",
    icon: "🎙️",
    category: "Interview Prep",
    badge: "Voice AI",
    highlightMetric: "8 Personas",
  },
  {
    id: "company-radar",
    title: "Company Interview Radar",
    tagline: "Predict Loop Rubrics & Questions",
    description: "Uncover exact predicted questions and Bar Raiser expectations for Google, Stripe, Amazon, Meta, and OpenAI.",
    href: "/dashboard/interview",
    icon: "🏢",
    category: "Interview Prep",
    badge: "Radar",
    highlightMetric: "Top 5 Predictions",
  },
  {
    id: "video-analytics",
    title: "Video Presence & Gaze HUD",
    tagline: "Webcam Computer Vision Overlay",
    description: "Analyze eye contact directness %, posture stability index, and room lighting histograms before live video calls.",
    href: "/dashboard/video-analytics",
    icon: "👁️",
    category: "Interview Prep",
    badge: "Computer Vision",
    highlightMetric: "Gaze Tracker",
  },
  {
    id: "whiteboard",
    title: "System Design Arena",
    tagline: "SVG Architecture & SPOF Grader",
    description: "Drag-and-drop distributed systems diagrams, calculate QPS math, and export clean Mermaid.js flowchart code.",
    href: "/dashboard/whiteboard",
    icon: "📐",
    category: "Engineering",
    badge: "Mermaid Export",
    highlightMetric: "SPOF Scanner",
  },
  {
    id: "jobs",
    title: "Semantic Job Discovery",
    tagline: "140k+ Multi-Board Live Stream",
    description: "Discover live job openings ranked by 384-dimensional pgvector semantic compatibility with your saved resume.",
    href: "/dashboard/jobs",
    icon: "🔍",
    category: "Discovery",
    badge: "Live Stream",
    highlightMetric: "140k+ Postings",
  },
  {
    id: "offers",
    title: "Salary War Room",
    tagline: "4-Year Equity & Recruiter Bot",
    description: "Calculate 4-year total compensation vesting schedules and simulate counter-offer negotiations with an AI recruiter bot.",
    href: "/dashboard/offers",
    icon: "💰",
    category: "Negotiation",
    badge: "High ROI",
    highlightMetric: "+$18.4k Avg Gain",
  },
  {
    id: "agents",
    title: "Autonomous Hunter Swarm",
    tagline: "24/7 Background Application Agent",
    description: "Let autonomous agents scan job boards and draft complete tailored application packets while you sleep.",
    href: "/dashboard/agents",
    icon: "🤖",
    category: "Automation",
    badge: "Autonomous",
    highlightMetric: "4 Active Agents",
  },
  {
    id: "tracker",
    title: "Kanban Application Tracker",
    tagline: "Visual Pipeline & Swarm Sync",
    description: "Track your applications across Wishlist, Applied, Interviewing, and Offer stages with 1-click Swarm imports.",
    href: "/dashboard/tracker",
    icon: "📊",
    category: "Organization",
    badge: "Kanban",
    highlightMetric: "1-Click Sync",
  },
  {
    id: "linkedin",
    title: "LinkedIn Brand Optimizer",
    tagline: "SEO Headlines & Cold Drip",
    description: "Generate 4 high-ranking headlines, narrative about stories, top 50 recruiter search skills, and cold outreach drips.",
    href: "/dashboard/linkedin",
    icon: "⚡",
    category: "Personal Brand",
    badge: "SEO",
    highlightMetric: "Top 50 Keywords",
  },
  {
    id: "portfolio",
    title: "Verified Candidate Portfolio",
    tagline: "Public Certified Skills Link",
    description: "Share a luxury monochrome profile showcasing your verified ATS scores, coding challenge badges, and system design grades.",
    href: "/portfolio/alex-rivers",
    icon: "🏆",
    category: "Credentials",
    badge: "Shareable",
    highlightMetric: "KYRO-Certified",
  },
];

const recruiterTiles: FeatureTile[] = [
  {
    id: "recruiter-hq",
    title: "Recruiter Talent HQ",
    tagline: "Active Requisitions & Funnel Metrics",
    description: "Central command center for monitoring candidate application throughput, screening volume, and open team seats.",
    href: "/dashboard/recruiter",
    icon: "👔",
    category: "Recruiting Command",
    badge: "HQ",
    highlightMetric: "Live Funnel",
  },
  {
    id: "job-architect",
    title: "AI Job Description Architect",
    tagline: "Generate Bias-Free JDs in 15s",
    description: "Draft comprehensive, structured job postings with role requirements, screening criteria, and interview rubrics.",
    href: "/dashboard/recruiter",
    icon: "📝",
    category: "Requisition Engine",
    badge: "15s Generation",
    highlightMetric: "Structured Rubric",
  },
  {
    id: "pipeline-kanban",
    title: "8-Stage Pipeline Kanban",
    tagline: "Applied to Offer Candidate Tracker",
    description: "Visual drag-and-drop pipeline from Applied to Screening, Technical, System Design, Bar Raiser, and Hired.",
    href: "/dashboard/recruiter/pipeline/engineering-lead-01",
    icon: "📋",
    category: "Pipeline Management",
    badge: "8 Stages",
    highlightMetric: "Drag & Drop",
  },
  {
    id: "bulk-screener",
    title: "Bulk ATS Resume Screener",
    tagline: "Automated Batch Fit Scoring",
    description: "Upload and evaluate dozens of candidate resumes simultaneously with instant compatibility scores and red-flag audits.",
    href: "/dashboard/recruiter",
    icon: "⚡",
    category: "Candidate Screening",
    badge: "AI Evaluator",
    highlightMetric: "0-100% Fit Score",
  },
  {
    id: "interview-rooms",
    title: "WebRTC Video Interview Rooms",
    tagline: "Live P2P Calling + AI Fact Copilot",
    description: "Host technical video rounds with synchronized live coding, shared scorecards, and real-time AI probing assistance.",
    href: "/dashboard/interview-rooms",
    icon: "📹",
    category: "Live Assessment",
    badge: "P2P WebRTC",
    highlightMetric: "AI Copilot",
  },
  {
    id: "scorecard-builder",
    title: "Standardized Scorecards",
    tagline: "Objective Hiring Committee Rubrics",
    description: "Grade candidates across technical depth, system architecture, and culture add with 1-click debrief generation.",
    href: "/dashboard/recruiter",
    icon: "🎯",
    category: "Evaluation",
    badge: "Objective",
    highlightMetric: "1-Click Debrief",
  },
];

export function WorkspaceTileLauncher() {
  const { mode, setMode } = useWorkspaceMode();
  const [showWorkspaceSelector, setShowWorkspaceSelector] = useState(false);

  const currentTiles = mode === "recruiter" ? recruiterTiles : candidateTiles;

  // SCREEN 1: Primary 2-Tile Workspace Selector
  if (showWorkspaceSelector) {
    return (
      <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="px-3 py-1 rounded-full bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase tracking-wider text-black">
            SELECT ACTIVE WORKSPACE
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Choose Your KYRO Workspace
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600">
            Tailor your dashboard to your exact role. You can switch personas at any time with 1 click.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Tile 1: Candidate Suite */}
          <div
            onClick={() => {
              setMode("candidate");
              setShowWorkspaceSelector(false);
            }}
            className={`p-8 bg-white border-2 rounded-3xl cursor-pointer transition-all space-y-6 shadow-sm hover:shadow-xl hover:-translate-y-1 relative group ${
              mode === "candidate" ? "border-black ring-2 ring-black" : "border-zinc-200 hover:border-black"
            }`}
          >
            {mode === "candidate" && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-black uppercase">
                Active
              </span>
            )}
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              👤
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-black">
                Candidate &amp; Engineering Suite
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Accelerate your job search with ATS Resume Studio, Monaco Coding Sandbox, Spoken Voice Mock Coach, and Salary War Room.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {["📄 6 ATS Templates", "💻 Monaco IDE", "🎙️ Spoken Mocks", "💰 Salary War Room", "🤖 Auto Swarm"].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-black"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="touch-target w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-black transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Launch Candidate Suite &rarr;</span>
            </button>
          </div>

          {/* Tile 2: Recruiter OS */}
          <div
            onClick={() => {
              setMode("recruiter");
              setShowWorkspaceSelector(false);
            }}
            className={`p-8 bg-white border-2 rounded-3xl cursor-pointer transition-all space-y-6 shadow-sm hover:shadow-xl hover:-translate-y-1 relative group ${
              mode === "recruiter" ? "border-black ring-2 ring-black" : "border-zinc-200 hover:border-black"
            }`}
          >
            {mode === "recruiter" && (
              <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-black text-white text-[10px] font-black uppercase">
                Active
              </span>
            )}
            <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
              👔
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-black">
                Recruiter Talent Operating System
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Architect job descriptions, track applicants across 8-stage Kanban pipelines, screen resumes in bulk, and host WebRTC video rooms.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {["📝 AI Job Architect", "📋 8-Stage Kanban", "⚡ Bulk ATS Screener", "📹 WebRTC Rooms", "🎯 Scorecards"].map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-black"
                >
                  {tag}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="touch-target w-full py-3.5 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-black transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Launch Recruiter OS &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: Persona-Specific Feature Tile Grid
  return (
    <div className="space-y-6">
      {/* Active Persona Banner & Switcher Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-50 border border-zinc-200 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center text-lg shadow-sm">
            {mode === "candidate" ? "👤" : "👔"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                ACTIVE WORKSPACE
              </span>
              <span className="px-2 py-0.2 rounded-md bg-black text-white text-[9px] font-black uppercase">
                {mode === "candidate" ? "Candidate Suite" : "Recruiter OS"}
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-black mt-0.5">
              {mode === "candidate"
                ? "Candidate Career & Engineering Command Center"
                : "Recruiter Talent & Pipeline Operating System"}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowWorkspaceSelector(true)}
          className="touch-target px-4 py-2 bg-white hover:bg-zinc-100 text-black border border-zinc-300 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>⇄</span>
          <span>Switch Workspace</span>
        </button>
      </div>

      {/* Feature Tiles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {currentTiles.map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className="p-6 bg-white border border-zinc-200 hover:border-black rounded-3xl shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-5 group hover:-translate-y-1 relative"
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-xs">
                {tile.icon}
              </div>
              <div className="flex flex-col items-end gap-1">
                {tile.badge && (
                  <span className="px-2 py-0.5 rounded-md bg-black text-white text-[9px] font-black uppercase">
                    {tile.badge}
                  </span>
                )}
                {tile.highlightMetric && (
                  <span className="text-[10px] font-mono font-bold text-zinc-500">
                    {tile.highlightMetric}
                  </span>
                )}
              </div>
            </div>

            {/* Title & Tagline & Description */}
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                {tile.category}
              </span>
              <h4 className="text-base font-black text-black group-hover:text-zinc-900 transition-colors">
                {tile.title}
              </h4>
              <p className="text-xs font-bold text-zinc-700">
                {tile.tagline}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 pt-1">
                {tile.description}
              </p>
            </div>

            {/* Bottom Action Hint */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-black group-hover:underline">
              <span>Open Tool</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
