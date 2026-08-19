"use client";

import { useState } from "react";
import Link from "next/link";
import { useWorkspaceMode } from "@/components/WorkspaceModeContext";

export interface SubFeatureItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
  highlightMetric?: string;
}

export interface CategoryGroup {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  features: SubFeatureItem[];
}

const candidateCategories: CategoryGroup[] = [
  {
    id: "resume-ats",
    title: "Resume & ATS Studio",
    description: "Build ATS-compliant resumes, preview 6 pro templates, and optimize STAR bullets with metric diffs.",
    icon: "📄",
    badge: "3 Tools",
    features: [
      {
        id: "builder",
        title: "ATS Resume Studio",
        tagline: "6 Pro Templates & Drag-Drop Editor",
        description: "Pixel-perfect A4 canvas with live print styles, drag-and-drop section ordering, and high-res PDF/DOCX downloads.",
        href: "/dashboard/builder",
        icon: "📄",
        badge: "Core Studio",
        highlightMetric: "6 Templates",
      },
      {
        id: "star-enhancer",
        title: "STAR Bullet Enhancer",
        tagline: "Inline Character Diff Viewer",
        description: "Transform weak passive verbs into high-impact metric-driven bullet points with visual red/green character diffs.",
        href: "/dashboard/builder",
        icon: "✨",
        badge: "AI Rewriter",
        highlightMetric: "Diff Engine",
      },
      {
        id: "keyword-heatmap",
        title: "Target JD Keyword Coverage",
        tagline: "Skill Heatmap & Gap Checker",
        description: "Calculate real-time keyword coverage against pasted job descriptions to eliminate missing competencies.",
        href: "/dashboard/builder",
        icon: "🎯",
        badge: "ATS Scanner",
        highlightMetric: "98% Pass Rate",
      },
    ],
  },
  {
    id: "technical-coding",
    title: "Coding Sandbox & Systems",
    description: "In-browser algorithmic challenge IDE, pointer visualizers, and distributed system design whiteboards.",
    icon: "💻",
    badge: "2 Tools",
    features: [
      {
        id: "coding-sandbox",
        title: "Monaco Coding Challenge IDE",
        tagline: "JS / TS / Python 3.11 with Pointer Visualizer",
        description: "Solve algorithmic problems with real-time test assertions, Two-Pointer visual step debuggers, and AI Big-O complexity reviews.",
        href: "/dashboard/challenges",
        icon: "💻",
        badge: "IDE",
        highlightMetric: "Automated Tests",
      },
      {
        id: "system-design",
        title: "System Design Whiteboard Arena",
        tagline: "SVG Vector Canvas & SPOF Capacity Grader",
        description: "Drag-and-drop distributed systems diagrams, calculate QPS/Bandwidth capacity math, and export clean Mermaid.js flowchart code.",
        href: "/dashboard/whiteboard",
        icon: "📐",
        badge: "Arena",
        highlightMetric: "Mermaid Export",
      },
    ],
  },
  {
    id: "interview-prep",
    title: "Interview & Presentation Mastery",
    description: "Conversational spoken voice mocks, company loop question predictors, video composure HUD, and follow-ups.",
    icon: "🎙️",
    badge: "4 Tools",
    features: [
      {
        id: "voice-mock",
        title: "Spoken Voice Mock Interviewer",
        tagline: "8 Personas & 48-Bar Audio Waveforms",
        description: "Practice spoken interviews out loud with Web Speech recognition, live filler-word counters, and post-round scorecards.",
        href: "/dashboard/mock-interview",
        icon: "🎙️",
        badge: "Voice AI",
        highlightMetric: "8 Personas",
      },
      {
        id: "company-radar",
        title: "Company Interview Question Radar",
        tagline: "Predict Loop Questions for Google, Stripe & Meta",
        description: "Uncover top 5 predicted interview loop questions, Bar Raiser expectations, and insider prep protocols.",
        href: "/dashboard/interview",
        icon: "🏢",
        badge: "Radar",
        highlightMetric: "Top 5 Predictions",
      },
      {
        id: "video-analytics",
        title: "Video Composure & Gaze HUD",
        tagline: "Webcam Computer Vision Overlay",
        description: "Track real-time direct eye contact %, posture stability index, and lighting contrast histograms before live video rounds.",
        href: "/dashboard/video-analytics",
        icon: "👁️",
        badge: "Vision HUD",
        highlightMetric: "Gaze Tracker",
      },
      {
        id: "post-interview",
        title: "Post-Interview Thank You Synthesizer",
        tagline: "1-Click Executive Follow-Up Emails",
        description: "Generate high-converting follow-up emails anchoring specific technical topics discussed, with strategic timing recommendations.",
        href: "/dashboard/interview",
        icon: "✉️",
        badge: "Follow-Up",
        highlightMetric: "30s Generator",
      },
    ],
  },
  {
    id: "compensation-strategy",
    title: "Salary & Career Strategy",
    description: "4-year equity vesting calculators, AI recruiter negotiation roleplay bots, and LinkedIn SEO optimizers.",
    icon: "💰",
    badge: "2 Tools",
    features: [
      {
        id: "salary-war-room",
        title: "Salary Negotiation War Room",
        tagline: "4-Year Equity Vesting & Counter-Offer Bot",
        description: "Model 4-year total comp (Base, Bonus, Equity), simulate HR counter-offers with an AI bot, and generate formal written counter-letters.",
        href: "/dashboard/offers",
        icon: "💰",
        badge: "Negotiation",
        highlightMetric: "+$18.4k Avg Gain",
      },
      {
        id: "linkedin-optimizer",
        title: "LinkedIn Brand Optimizer",
        tagline: "4 Headlines, About Stories & Cold Drip",
        description: "Generate 4 high-ranking headlines, narrative about sections, top 50 search keywords, and 3-step cold outreach drip sequences.",
        href: "/dashboard/linkedin",
        icon: "⚡",
        badge: "SEO Suite",
        highlightMetric: "Top 50 Skills",
      },
    ],
  },
  {
    id: "discovery-automation",
    title: "Discovery & Background Swarm",
    description: "140k+ semantic job aggregator stream, 24/7 background Hunter Agent, and visual Kanban application tracker.",
    icon: "🤖",
    badge: "3 Tools",
    features: [
      {
        id: "job-discovery",
        title: "Semantic Job Discovery Hub",
        tagline: "140k+ Multi-Board Live Job Stream",
        description: "Discover live job postings ranked by 384-dimensional pgvector semantic compatibility with your saved resume.",
        href: "/dashboard/jobs",
        icon: "🔍",
        badge: "Live Feed",
        highlightMetric: "140k+ Postings",
      },
      {
        id: "hunter-swarm",
        title: "Autonomous Hunter Agent Swarm",
        tagline: "24/7 Background Application Packets",
        description: "Let autonomous background agents generate tailored STAR bullets, cover letters, and outreach pitches while you sleep.",
        href: "/dashboard/agents",
        icon: "🤖",
        badge: "Autonomous",
        highlightMetric: "4 Agents",
      },
      {
        id: "app-tracker",
        title: "Kanban Application Tracker",
        tagline: "Visual Pipeline & 1-Click Swarm Sync",
        description: "Drag-and-drop applications across Wishlist, Applied, Interviewing, and Offer stages with 1-click Swarm imports.",
        href: "/dashboard/tracker",
        icon: "📊",
        badge: "Kanban",
        highlightMetric: "1-Click Sync",
      },
    ],
  },
  {
    id: "account-settings",
    title: "Account, Portfolios & Settings",
    description: "Manage onboarding career targets, verified portfolio links, and administrative governance.",
    icon: "⚙️",
    badge: "3 Tools",
    features: [
      {
        id: "portfolio",
        title: "Public Verified Portfolio",
        tagline: "Certified Badges & Skills Link",
        description: "Share a luxury monochrome profile showcasing your verified ATS scores, coding challenge badges, and system design grades.",
        href: "/portfolio/alex-rivers",
        icon: "🏆",
        badge: "Shareable",
        highlightMetric: "Certified Badges",
      },
      {
        id: "edit-onboarding",
        title: "Career Target & Onboarding Editor",
        tagline: "Update Target Titles, Skills & Experience",
        description: "Update your target job requisites and industry focus to refresh your tailored career roadmap.",
        href: "/",
        icon: "✏️",
        badge: "Profile",
        highlightMetric: "Onboarding State",
      },
      {
        id: "admin-os",
        title: "Master Admin & Governance OS",
        tagline: "Telemetry, Token Ledgers & Moderation",
        description: "Access executive multi-tenant telemetry, AI financial spend ledgers, and candidate management tools.",
        href: "/admin",
        icon: "🛡️",
        badge: "Admin",
        highlightMetric: "Telemetry OS",
      },
    ],
  },
];

const recruiterCategories: CategoryGroup[] = [
  {
    id: "requisitions",
    title: "Job Requisitions & Architect",
    description: "Create and manage structured job requisitions with AI-generated screening rubrics.",
    icon: "📝",
    badge: "1 Tool",
    features: [
      {
        id: "job-architect",
        title: "AI Job Description Architect",
        tagline: "Generate Bias-Free JDs in 15s",
        description: "Draft comprehensive, structured job postings with role requirements, screening criteria, and interview rubrics.",
        href: "/dashboard/recruiter",
        icon: "📝",
        badge: "Requisition Engine",
        highlightMetric: "15s Generation",
      },
    ],
  },
  {
    id: "pipelines",
    title: "Applicant Pipelines & Kanban",
    description: "Visual 8-stage applicant tracking from Applied to Hired.",
    icon: "📋",
    badge: "1 Tool",
    features: [
      {
        id: "pipeline-kanban",
        title: "8-Stage Pipeline Kanban",
        tagline: "Visual Drag-and-Drop Applicant Funnel",
        description: "Track candidate applications across Screening, Technical, System Design, Bar Raiser, Offer, and Hired.",
        href: "/dashboard/recruiter/pipeline/engineering-lead-01",
        icon: "📋",
        badge: "8 Stages",
        highlightMetric: "Drag & Drop",
      },
    ],
  },
  {
    id: "screening-evaluation",
    title: "Screening & Scorecards",
    description: "Bulk automated resume evaluation and structured hiring committee scorecards.",
    icon: "⚡",
    badge: "2 Tools",
    features: [
      {
        id: "bulk-screener",
        title: "Bulk ATS Resume Screener",
        tagline: "Automated Batch Fit Scoring",
        description: "Upload and evaluate dozens of candidate resumes simultaneously with instant compatibility scores and red-flag audits.",
        href: "/dashboard/recruiter",
        icon: "⚡",
        badge: "Batch AI",
        highlightMetric: "0-100% Fit",
      },
      {
        id: "scorecard-builder",
        title: "Standardized Scorecards",
        tagline: "Objective Hiring Committee Rubrics",
        description: "Grade candidates across technical depth, system architecture, and culture add with 1-click debrief generation.",
        href: "/dashboard/recruiter",
        icon: "🎯",
        badge: "Objective",
        highlightMetric: "1-Click Debrief",
      },
    ],
  },
  {
    id: "live-assessments",
    title: "Live Video Assessments",
    description: "WebRTC interview rooms with synchronized code editor and secret AI copilot.",
    icon: "📹",
    badge: "1 Tool",
    features: [
      {
        id: "interview-rooms",
        title: "WebRTC Video Interview Rooms",
        tagline: "Live P2P Calling + AI Fact Copilot",
        description: "Host technical video rounds with synchronized live coding, shared scorecards, and real-time AI probing assistance.",
        href: "/dashboard/interview-rooms",
        icon: "📹",
        badge: "P2P WebRTC",
        highlightMetric: "AI Copilot",
      },
    ],
  },
  {
    id: "recruiter-governance",
    title: "Governance & Master Admin",
    description: "Platform telemetry, team seats, and server moderation.",
    icon: "🛡️",
    badge: "1 Tool",
    features: [
      {
        id: "admin-os-recruiter",
        title: "Master Admin & Governance OS",
        tagline: "Telemetry, Token Ledgers & Moderation",
        description: "Access executive multi-tenant telemetry, AI financial spend ledgers, and candidate management tools.",
        href: "/admin",
        icon: "🛡️",
        badge: "Admin",
        highlightMetric: "Telemetry OS",
      },
    ],
  },
];

export function StepByStepTileNavigator() {
  const { mode, setMode } = useWorkspaceMode();
  const [selectedCategory, setSelectedCategory] = useState<CategoryGroup | null>(null);

  const categories = mode === "recruiter" ? recruiterCategories : candidateCategories;

  // STAGE 3: Sub-Feature Tiles inside a specific Category
  if (selectedCategory) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-bold text-zinc-500 hover:text-black flex items-center gap-1.5 cursor-pointer mb-1.5 transition-colors"
            >
              <span>←</span>
              <span>Back to {mode === "candidate" ? "Candidate Hub" : "Recruiter Hub"}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xl">{selectedCategory.icon}</span>
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                {selectedCategory.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-600 mt-1">{selectedCategory.description}</p>
          </div>

          <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-xs font-black rounded-xl text-black self-start sm:self-auto">
            {selectedCategory.features.length} Focused Tools
          </span>
        </div>

        {/* Feature Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {selectedCategory.features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className="p-6 bg-white border border-zinc-200 hover:border-black rounded-3xl shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group hover:-translate-y-1 relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-xs">
                  {feature.icon}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {feature.badge && (
                    <span className="px-2.5 py-0.5 rounded-md bg-black text-white text-[9px] font-black uppercase">
                      {feature.badge}
                    </span>
                  )}
                  {feature.highlightMetric && (
                    <span className="text-[10px] font-mono font-bold text-zinc-500">
                      {feature.highlightMetric}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-black text-black group-hover:text-zinc-900 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs font-bold text-zinc-700">{feature.tagline}</p>
                <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                  {feature.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-black group-hover:underline">
                <span>Launch Single Screen</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // STAGE 2: Category Tile Hub
  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Active Persona Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-zinc-50 border border-zinc-200 rounded-3xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center text-lg shadow-sm">
            {mode === "candidate" ? "👤" : "👔"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                KYRO WORKSPACE TILE OS
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

        {/* 2-Option Persona Switcher Pill */}
        <div className="flex items-center p-1 bg-white border border-zinc-300 rounded-2xl text-[11px] font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setMode("candidate")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mode === "candidate" ? "bg-black text-white font-black shadow-xs" : "text-zinc-600 hover:text-black"
            }`}
          >
            👤 Candidate
          </button>
          <button
            type="button"
            onClick={() => setMode("recruiter")}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              mode === "recruiter" ? "bg-black text-white font-black shadow-xs" : "text-zinc-600 hover:text-black"
            }`}
          >
            👔 Recruiter
          </button>
        </div>
      </div>

      {/* Category Tiles Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-black">
            Select Feature Category ({categories.length} Categories)
          </h2>
          <span className="text-xs text-zinc-500 font-medium">Click tile to view dedicated tools</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="p-7 bg-white border border-zinc-200 hover:border-black rounded-3xl cursor-pointer shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group hover:-translate-y-1 relative"
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-xs">
                  {category.icon}
                </div>
                <span className="px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
                  {category.badge}
                </span>
              </div>

              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-black text-black group-hover:text-zinc-900 transition-colors">
                  {category.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {category.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-black text-black group-hover:underline">
                <span>View {category.features.length} Focused Tools</span>
                <span className="group-hover:translate-x-1.5 transition-transform">&rarr;</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
