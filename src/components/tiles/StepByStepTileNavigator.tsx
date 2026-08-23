"use client";

import { useState, useEffect } from "react";
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
  isLocked?: boolean;
  unlockCondition?: string;
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
        id: "ats-analysis-engine",
        title: "ATS Match & Gap Analysis Hub",
        tagline: "Multi-JD Compatibility & 80+ Fit Scoring",
        description: "Scan your resume against target job postings to uncover missing technical skills.",
        href: "/dashboard/analyze",
        icon: "📊",
        badge: "Top Priority",
      },
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
      },
      {
        id: "public-share",
        title: "Public Verified Portfolio & Share Link",
        tagline: "1-Click Sharable Candidate Profile",
        description: "Generate a clean, verified candidate portfolio link to send directly to recruiters.",
        href: "/portfolio",
        icon: "🌐",
        badge: "Live Link",
      },
      {
        id: "tactical-roadmap",
        title: "8-Week Career Execution Roadmap",
        tagline: "Customized Weekly Milestones",
        description: "Follow actionable checklists to methodically land high-tier offers in 60 days.",
        href: "/dashboard/roadmap",
        icon: "🗺️",
        badge: "8-Week Plan",
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
        id: "outreach-engine",
        title: "Recruiter Outreach & Cold Drips",
        tagline: "3-Step Follow-Up Sequence Synthesizer",
        description: "Generate high-converting recruiter connection notes and hiring manager cold pitches.",
        href: "/dashboard/outreach",
        icon: "✉️",
        badge: "Outreach",
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
        id: "system-design",
        title: "System Design Whiteboard Arena",
        tagline: "SVG Vector Canvas & SPOF Capacity Grader",
        description: "Drag-and-drop distributed systems diagrams and export clean Mermaid.js code.",
        href: "/dashboard/whiteboard",
        icon: "📐",
        badge: "Arena",
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
  const [stages, setStages] = useState<PipelineStage[]>(campaignStages);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;

        // Deep clone so we can modify nested features
        const updatedStages = JSON.parse(JSON.stringify(campaignStages)) as PipelineStage[];
        
        // --- STAGE 1: Foundation ---
        // ATS Engine & Builder are unlocked.
        // LinkedIn is locked until Primary Resume exists.
        const stage1 = updatedStages[0];
        const linkedInTool = stage1.features.find(f => f.id === "linkedin");
        if (linkedInTool) {
          if (data.hasPrimaryResume) {
            linkedInTool.isLocked = false;
            linkedInTool.badge = "Unlocked";
          } else {
            linkedInTool.isLocked = true;
            linkedInTool.badge = "Locked";
            linkedInTool.unlockCondition = "Hit 80+ and set Primary Baseline to unlock";
          }
        }
        
        // --- STAGE 2: The Hunt ---
        // Locked until LinkedIn is generated
        const stage2 = updatedStages[1];
        if (data.hasLinkedin) {
          stage2.isLocked = false;
          stage2.badge = "Unlocked";
          stage2.unlockCondition = undefined;
        } else {
          stage2.isLocked = true;
          stage2.badge = "Locked";
          stage2.unlockCondition = "Unlocks after finishing LinkedIn Delta Report";
        }

        // Inside Stage 2, Roadmap is unlocked.
        // Tracker, Tailor vs JD, Jobs, Resumes are locked until Roadmap exists.
        if (stage2.features) {
          stage2.features.forEach(f => {
            if (f.id !== "roadmap") {
              if (data.hasRoadmap) {
                f.isLocked = false;
              } else {
                f.isLocked = true;
                f.badge = "Locked";
                f.unlockCondition = "Generate 2-Month Roadmap to unlock";
              }
            }
          });
        }

        // --- STAGE 3: The Loop (Interviews) ---
        const stage3 = updatedStages[2];
        if (data.hasInterview) {
          stage3.isLocked = false;
          stage3.badge = "Unlocked";
          stage3.unlockCondition = undefined;
        } else {
          stage3.isLocked = true;
          stage3.badge = "Locked";
          stage3.unlockCondition = "Unlocks when an interview is added to Tracker";
        }

        // --- STAGE 4: The Close (Offers) ---
        const stage4 = updatedStages[3];
        if (data.hasOffer) {
          stage4.isLocked = false;
          stage4.badge = "Unlocked";
          stage4.unlockCondition = undefined;
        } else {
          stage4.isLocked = true;
          stage4.badge = "Locked";
          stage4.unlockCondition = "Unlocks when an offer is added to Tracker";
        }

        setStages(updatedStages);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          {selectedStage.features.map((feature) => {
            const isToolLocked = feature.isLocked;

            const content = (
              <>
                {isToolLocked && (
                  <div className="absolute top-4 right-4 z-10 text-zinc-500">
                    dY"'
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-2xl ${isToolLocked ? '' : 'group-hover:scale-110'} transition-transform`}>
                    {feature.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    {feature.badge && (
                      <span className={`px-2.5 py-0.5 rounded-md bg-[#27272A] ${isToolLocked ? 'text-zinc-500' : 'text-[#FAFAFA]'} text-[9px] font-bold uppercase font-mono`}>
                        {feature.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 mt-4">
                  <h3 className={`text-base font-bold ${isToolLocked ? 'text-zinc-500' : 'text-[#FAFAFA] group-hover:text-white'} transition-colors`}>
                    {feature.title}
                  </h3>
                  <p className="text-xs font-bold text-zinc-400">{feature.tagline}</p>
                  <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                    {feature.description}
                  </p>
                  {isToolLocked && feature.unlockCondition && (
                    <p className="text-[10px] text-amber-500 font-mono mt-2 bg-amber-500/10 p-2 rounded-md border border-amber-500/20">
                      {feature.unlockCondition}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#27272A] flex items-center justify-between text-xs font-bold text-[#FAFAFA] mt-4">
                  <span className={isToolLocked ? 'text-zinc-500' : 'group-hover:underline'}>
                    {isToolLocked ? 'Locked' : 'Launch Tool'}
                  </span>
                  {!isToolLocked && <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>}
                </div>
              </>
            );

            const className = `p-6 bg-[#18181B] border ${isToolLocked ? 'border-[#27272A] opacity-75 grayscale cursor-not-allowed' : 'border-[#27272A] hover:border-[#FAFAFA] cursor-pointer hover:-translate-y-1 active:scale-[0.99]'} rounded-3xl transition-all flex flex-col justify-between group shadow-lg relative h-full`;

            if (isToolLocked) {
              return (
                <div key={feature.id} className={className}>
                  {content}
                </div>
              );
            }

            return (
              <Link key={feature.id} href={feature.href} className={className}>
                {content}
              </Link>
            );
          })}
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
        {stages.map((stage) => (
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
