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
    id: "ats-analysis",
    title: "ATS Analysis & Resume Studio",
    description: "Scan your resume against target roles, uncover keyword gaps, and build pixel-perfect ATS templates with STAR diffs.",
    icon: "📊",
    badge: "Core Priority",
    features: [
      {
        id: "ats-analysis-engine",
        title: "ATS Match & Gap Analysis Hub",
        tagline: "Multi-JD Compatibility & 80+ Fit Scoring",
        description: "Scan your resume against any target job posting to uncover missing technical skills, format compliance, and instant AI rewrite diffs.",
        href: "/dashboard/analyze",
        icon: "📊",
        badge: "Top Priority",
        highlightMetric: "80+ Benchmark",
      },
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
    id: "linkedin-brand",
    title: "LinkedIn Brand & Recruiter Visibility",
    description: "Generate 4 viral headlines, narrative About stories, top 50 search keywords, and 1-click recruiter cold outreach templates.",
    icon: "⚡",
    badge: "Visibility",
    features: [
      {
        id: "linkedin-optimizer",
        title: "LinkedIn Profile Optimizer",
        tagline: "4 Headlines, Narrative About & SEO Skills",
        description: "Generate 4 high-ranking headlines, compelling narrative About sections, top 50 recruiter search keywords, and algorithm tuning.",
        href: "/dashboard/linkedin",
        icon: "⚡",
        badge: "SEO Suite",
        highlightMetric: "Top 50 Skills",
      },
      {
        id: "outreach-engine",
        title: "Recruiter Outreach & Cold Drips",
        tagline: "3-Step Follow-Up Sequence Synthesizer",
        description: "Generate high-converting recruiter connection notes and hiring manager cold pitches tailored to specific openings.",
        href: "/dashboard/outreach",
        icon: "✉️",
        badge: "Outreach",
        highlightMetric: "3-Step Drip",
      },
      {
        id: "public-share",
        title: "Public Verified Portfolio & Share Link",
        tagline: "1-Click Sharable Candidate Profile",
        description: "Generate a clean, verified candidate portfolio link with obfuscated credentials to send directly to recruiters.",
        href: "/portfolio",
        icon: "🌐",
        badge: "Live Link",
        highlightMetric: "Verified Profile",
      },
    ],
  },
  {
    id: "career-roadmap",
    title: "2-Month Strategic Job Hunt Plan",
    description: "8-week tactical career roadmap across 3 execution phases: Foundation, High Velocity Applications, and Offer Conversion.",
    icon: "🗺️",
    badge: "8-Week Plan",
    features: [
      {
        id: "tactical-roadmap",
        title: "8-Week Career Execution Roadmap",
        tagline: "Phase 1: Foundation → Phase 2: Velocity → Phase 3: Offers",
        description: "Follow customized weekly milestones and actionable checklists to methodically land high-tier offers in 60 days.",
        href: "/dashboard/roadmap",
        icon: "🗺️",
        badge: "8-Week Plan",
        highlightMetric: "3-Phase Strategy",
      },
      {
        id: "pipeline-tracker",
        title: "Application Pipeline Kanban",
        tagline: "Visual Drag-and-Drop Application Board",
        description: "Track applications across Applied, Screening, Technical, Onsite, and Offer stages with automated follow-up alerts.",
        href: "/dashboard/tracker",
        icon: "📋",
        badge: "Kanban",
        highlightMetric: "Live Pipeline",
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
    id: "compensation-strategy",
    title: "Salary Negotiation War Room",
    description: "4-year equity vesting calculators, AI recruiter negotiation roleplay bots, and formal counter-offer letters.",
    icon: "💰",
    badge: "1 Tool",
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
    ],
  },
  {
    id: "discovery-automation",
    title: "Discovery & Background Swarm",
    description: "140k+ semantic job aggregator stream and 24/7 background Hunter Agent packets.",
    icon: "🤖",
    badge: "2 Tools",
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
    ],
  },
];

export function StepByStepTileNavigator() {
  const { mode, toggleMode } = useWorkspaceMode();
  const [selectedCategory, setSelectedCategory] = useState<CategoryGroup | null>(null);

  // If a Category is opened, drill down into its tools
  if (selectedCategory) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150 text-[#FAFAFA]">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
          <div>
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] flex items-center gap-1.5 cursor-pointer mb-1.5 transition-colors"
            >
              <span>&larr;</span>
              <span>Back to Candidate Tools Hub</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedCategory.icon}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
                {selectedCategory.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{selectedCategory.description}</p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-mono text-zinc-300 self-start sm:self-auto">
            {selectedCategory.features.length} Specialized Tools
          </div>
        </div>

        {/* Feature Sub-Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {selectedCategory.features.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className="p-6 bg-[#18181B] border border-[#27272A] hover:border-[#FAFAFA] rounded-3xl transition-all flex flex-col justify-between space-y-4 group hover:-translate-y-1 active:scale-[0.99] shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <div className="flex items-center gap-2">
                  {feature.badge && (
                    <span className="px-2.5 py-0.5 rounded-md bg-[#27272A] text-[#FAFAFA] text-[9px] font-bold uppercase font-mono">
                      {feature.badge}
                    </span>
                  )}
                  {feature.highlightMetric && (
                    <span className="text-[10px] font-mono font-bold text-zinc-400">
                      {feature.highlightMetric}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-bold text-[#FAFAFA] group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs font-bold text-zinc-300">{feature.tagline}</p>
                <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                  {feature.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-bold text-[#FAFAFA] group-hover:underline">
                <span>Launch Tool</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // DEFAULT CANDIDATE HOME: Direct Category Grid (No intermediate 2-card picker!)
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 text-[#FAFAFA]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#18181B] border border-[#27272A] text-zinc-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Candidate &amp; Engineering Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            Career OS Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Access your ATS resume optimizer, LinkedIn branding suite, and 2-month career roadmap.
          </p>
        </div>

        <button
          type="button"
          onClick={toggleMode}
          className="touch-target px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-zinc-300 hover:text-[#FAFAFA] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>⇄ Switch to Recruiter OS</span>
        </button>
      </div>

      {/* Primary Category Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {candidateCategories.map((category) => (
          <div
            key={category.id}
            onClick={() => setSelectedCategory(category)}
            className="p-6 sm:p-7 bg-[#18181B] border border-[#27272A] hover:border-[#FAFAFA] rounded-3xl cursor-pointer transition-all flex flex-col justify-between space-y-5 group hover:-translate-y-1 relative active:scale-[0.98] shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {category.icon}
              </div>
              <span className="px-2.5 py-1 rounded-md bg-[#27272A] text-[10px] font-bold uppercase text-[#FAFAFA] font-mono">
                {category.badge}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-bold text-[#FAFAFA] group-hover:text-white transition-colors">
                {category.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-bold text-[#FAFAFA] group-hover:underline">
              <span>View {category.features.length} Focused Tools</span>
              <span className="group-hover:translate-x-1.5 transition-transform">&rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
