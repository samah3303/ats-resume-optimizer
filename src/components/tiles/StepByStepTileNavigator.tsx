"use client";

import { useState } from "react";
import Link from "next/link";

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

export interface PipelineStage {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
  isLocked?: boolean;
  unlockCondition?: string;
  features: SubFeatureItem[];
}

const campaignStages: PipelineStage[] = [
  {
    id: "stage-1-foundation",
    title: "Stage 1: Foundation",
    description: "Build a pixel-perfect ATS resume and a high-ranking LinkedIn profile.",
    icon: "🏗️",
    badge: "Unlocked",
    isLocked: false,
    features: [
      {
        id: "builder",
        title: "ATS Resume Studio",
        tagline: "6 Pro Templates & Drag-Drop Editor",
        description: "Pixel-perfect A4 canvas with live print styles and high-res PDF downloads.",
        href: "/dashboard/builder",
        icon: "📄",
        badge: "Core Studio",
      },
      {
        id: "linkedin-optimizer",
        title: "LinkedIn Profile Optimizer",
        tagline: "4 Headlines, Narrative About & SEO Skills",
        description: "Generate 4 high-ranking headlines and compelling narrative About sections.",
        href: "/dashboard/linkedin",
        icon: "⚡",
        badge: "SEO Suite",
      }
    ],
  },
  {
    id: "stage-2-hunt",
    title: "Stage 2: The Hunt",
    description: "Deploy background AI agents and semantic job discovery.",
    icon: "🤖",
    badge: "In Progress",
    isLocked: false,
    features: [
      {
        id: "job-discovery",
        title: "Semantic Job Discovery Hub",
        tagline: "140k+ Multi-Board Live Job Stream",
        description: "Discover live job postings ranked by semantic compatibility with your resume.",
        href: "/dashboard/jobs",
        icon: "🔍",
        badge: "Live Feed",
      },
      {
        id: "hunter-swarm",
        title: "Autonomous Hunter Agent Swarm",
        tagline: "24/7 Background Application Packets",
        description: "Autonomous background agents generate tailored STAR bullets and cover letters.",
        href: "/dashboard/agents",
        icon: "🤖",
        badge: "Autonomous",
      },
      {
        id: "pipeline-tracker",
        title: "Application Pipeline Kanban",
        tagline: "Visual Drag-and-Drop Application Board",
        description: "Track applications across Applied, Screening, Technical, Onsite, and Offer stages.",
        href: "/dashboard/tracker",
        icon: "📋",
        badge: "Kanban",
      }
    ],
  },
  {
    id: "stage-3-loop",
    title: "Stage 3: Active Loop",
    description: "Practice out loud with AI interviewer personas and video composure tracking.",
    icon: "🎙️",
    badge: "Locked",
    isLocked: true,
    unlockCondition: "Unlocks when an interview is scheduled in Tracker",
    features: [
      {
        id: "voice-mock",
        title: "Spoken Voice Mock Interviewer",
        tagline: "8 Personas & 48-Bar Audio Waveforms",
        description: "Practice spoken interviews out loud with Web Speech recognition.",
        href: "/dashboard/mock-interview",
        icon: "🎙️",
        badge: "Voice AI",
      },
      {
        id: "company-radar",
        title: "Company Interview Question Radar",
        tagline: "Predict Loop Questions for Google, Stripe & Meta",
        description: "Uncover top predicted interview loop questions and Bar Raiser expectations.",
        href: "/dashboard/interview",
        icon: "🏢",
        badge: "Radar",
      },
      {
        id: "coding-sandbox",
        title: "Technical Coding Sandbox",
        tagline: "In-Browser Algorithms IDE",
        description: "Solve algorithmic problems with real-time test assertions.",
        href: "/dashboard/challenges",
        icon: "💻",
        badge: "IDE",
      },
      {
        id: "video-analytics",
        title: "Video Composure & Gaze HUD",
        tagline: "Webcam Computer Vision Overlay",
        description: "Track real-time direct eye contact % and posture stability.",
        href: "/dashboard/video-analytics",
        icon: "👁️",
        badge: "Vision HUD",
      }
    ],
  },
  {
    id: "stage-4-close",
    title: "Stage 4: The Close",
    description: "Model 4-year total comp and roleplay negotiation tactics.",
    icon: "💰",
    badge: "Locked",
    isLocked: true,
    unlockCondition: "Unlocks when an offer is added to Tracker",
    features: [
      {
        id: "salary-war-room",
        title: "Salary Negotiation War Room",
        tagline: "4-Year Equity Vesting & Counter-Offer Bot",
        description: "Model 4-year total comp and simulate HR counter-offers.",
        href: "/dashboard/offers",
        icon: "💰",
        badge: "Negotiation",
      },
    ],
  },
];

export function StepByStepTileNavigator() {
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  if (selectedStage) {
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-150 text-[#FAFAFA]">
        {/* Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
          <div>
            <button
              type="button"
              onClick={() => setSelectedStage(null)}
              className="text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] flex items-center gap-1.5 cursor-pointer mb-1.5 transition-colors"
            >
              <span>&larr;</span>
              <span>Back to Campaign Pipeline</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedStage.icon}</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
                {selectedStage.title}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{selectedStage.description}</p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-mono text-zinc-300 self-start sm:self-auto">
            {selectedStage.features.length} Specialized Tools
          </div>
        </div>

        {/* Feature Sub-Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {selectedStage.features.map((feature) => (
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 text-[#FAFAFA]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#18181B] border border-[#27272A] text-zinc-300 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Campaign Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            Career OS Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Follow the 4-stage pipeline to land your next high-tier offer.
          </p>
        </div>
      </div>

      {/* Campaign Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {campaignStages.map((stage) => (
          <div
            key={stage.id}
            onClick={() => {
              // Even if locked, we allow exploring the tools in UI for demo purposes
              setSelectedStage(stage);
            }}
            className={`p-6 sm:p-7 bg-[#18181B] border ${stage.isLocked ? 'border-[#27272A] opacity-75 grayscale' : 'border-[#27272A] hover:border-[#FAFAFA]'} rounded-3xl cursor-pointer transition-all flex flex-col justify-between space-y-5 group hover:-translate-y-1 relative active:scale-[0.98] shadow-lg`}
          >
            {stage.isLocked && (
              <div className="absolute top-4 right-4 z-10 text-zinc-500">
                🔒
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                {stage.icon}
              </div>
              <span className={`px-2.5 py-1 rounded-md bg-[#27272A] text-[10px] font-bold uppercase ${stage.isLocked ? 'text-zinc-500' : 'text-[#FAFAFA]'} font-mono`}>
                {stage.badge}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-bold text-[#FAFAFA] group-hover:text-white transition-colors flex items-center gap-2">
                {stage.title}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {stage.description}
              </p>
              {stage.isLocked && stage.unlockCondition && (
                <p className="text-[10px] text-amber-500 font-mono mt-2 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
                  {stage.unlockCondition}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-bold text-[#FAFAFA] group-hover:underline">
              <span>View {stage.features.length} Tools</span>
              <span className="group-hover:translate-x-1.5 transition-transform">&rarr;</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
