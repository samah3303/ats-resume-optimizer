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
    icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â ",
    badge: "Unlocked",
    isLocked: false,
    features: [
      {
        id: "builder",
        title: "ATS Resume Studio",
        tagline: "6 Pro Templates & Drag-Drop Editor",
        description: "Pixel-perfect A4 canvas with live print styles and high-res PDF downloads.",
        href: "/dashboard/builder",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾",
        badge: "Core Studio",
      },
      {
        id: "public-share",
        title: "Public Verified Portfolio & Share Link",
        tagline: "1-Click Sharable Candidate Profile",
        description: "Generate a clean, verified candidate portfolio link to send directly to recruiters.",
        href: "/portfolio",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â°ÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â",
        badge: "Live Link",
      }
    ],
  },
  {
    id: "stage-2-hunt",
    title: "Stage 2: The Hunt",
    description: "Deploy background AI agents and semantic job discovery.",
    icon: "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¤ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã¢â‚¬Å“",
    badge: "In Progress",
    isLocked: false,
    features: [
      {
        id: "job-discovery",
        title: "Semantic Job Discovery Hub",
        tagline: "140k+ Multi-Board Live Job Stream",
        description: "Discover live job postings ranked by semantic compatibility with your resume.",
        href: "/dashboard/jobs",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚ÂÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â",
        badge: "Live Feed",
      },
      {
        id: "outreach-engine",
        title: "Recruiter Outreach & Cold Drips",
        tagline: "3-Step Follow-Up Sequence Synthesizer",
        description: "Generate high-converting recruiter connection notes and hiring manager cold pitches.",
        href: "/dashboard/outreach",
        icon: "ÃƒÆ’Ã‚Â¢Ãƒâ€¦Ã¢â‚¬Å“Ãƒâ€šÃ‚ÂÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â",
        badge: "Outreach",
      },
      {
        id: "hunter-swarm",
        title: "Autonomous Hunter Agent Swarm",
        tagline: "24/7 Background Application Packets",
        description: "Autonomous background agents generate tailored STAR bullets and cover letters.",
        href: "/dashboard/agents",
        icon: "ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€šÃ‚Â¤ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“",
        badge: "Autonomous",
      }
    ],
  },
  {
    id: "stage-3-loop",
    title: "Stage 3: Active Loop",
    description: "Practice out loud with AI interviewer personas and video composure tracking.",
    icon: "ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â½ÃƒÂ¢Ã¢â‚¬Å¾Ã‚Â¢ÃƒÆ’Ã‚Â¯Ãƒâ€šÃ‚Â¸Ãƒâ€šÃ‚Â",
    badge: "Locked",
    isLocked: true,
    unlockCondition: "Unlocks when an interview is scheduled in Tracker",
    features: [
      {
        id: "company-radar",
        title: "Company Interview Question Radar",
        tagline: "Predict Loop Questions for Google, Stripe & Meta",
        description: "Uncover top predicted interview loop questions and Bar Raiser expectations.",
        href: "/dashboard/interview",
        icon: "ÃƒÆ’Ã‚Â°Ãƒâ€¦Ã‚Â¸Ãƒâ€¦Ã‚Â½Ãƒâ€šÃ‚Â¯",
        badge: "Radar",
      },
      {
        id: "coding-sandbox",
        title: "Technical Coding Sandbox",
        tagline: "In-Browser Algorithms IDE",
        description: "Solve algorithmic problems with real-time test assertions.",
        href: "/dashboard/challenges",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¾Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â»",
        badge: "IDE",
      },
      {
        id: "system-design",
        title: "System Design Whiteboard Arena",
        tagline: "SVG Vector Canvas & SPOF Capacity Grader",
        description: "Drag-and-drop distributed systems diagrams and export clean Mermaid.js code.",
        href: "/dashboard/whiteboard",
        icon: "ðŸ“‹",
        badge: "Arena",
      },
      {
        id: "video-analytics",
        title: "Video Composure & Gaze HUD",
        tagline: "Webcam Computer Vision Overlay",
        description: "Track real-time direct eye contact % and posture stability.",
        href: "/dashboard/video-analytics",
        icon: "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â°ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Â¹Ãƒâ€¦Ã¢â‚¬Å“ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡ ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¯ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¸ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡ ",
        badge: "Vision HUD",
      }
      ],
    },
  ];

export function StepByStepTileNavigator() {
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>(campaignStages);
  const [loading, setLoading] = useState(true);
  const [latestAnalysis, setLatestAnalysis] = useState<{ id: string | null; score: number | null }>({
    id: null,
    score: null,
  });
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    fetch("/api/progress")
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;
        setProgress(data);

        // Deep clone so we can modify nested features
        const updatedStages = JSON.parse(JSON.stringify(campaignStages)) as PipelineStage[];
        
        // --- STAGE 1: Foundation ---
        // ATS Engine & Builder are unlocked.
        // LinkedIn is locked until Primary Resume exists.
        const stage1 = updatedStages[0];
          const linkedInTool = stage1.features.find(f => f.id === "linkedin");
          if (linkedInTool) {
            const has80Plus = (data.generalAtsScore && data.generalAtsScore >= 80) || (data.latestAnalysisScore && data.latestAnalysisScore >= 80);
            if (has80Plus) {
              linkedInTool.isLocked = false;
              linkedInTool.badge = "Unlocked";
            } else {
              linkedInTool.isLocked = true;
              linkedInTool.badge = "Locked";
              linkedInTool.unlockCondition = "Hit 80+ ATS Score to unlock";
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
        setLatestAnalysis({
          id: data.latestAnalysisId,
          score: data.latestAnalysisScore,
        });
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
                  <div className="absolute top-4 right-4 z-10 text-zinc-500"><svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
              Dashboard
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Follow these steps to land your next job.
            </p>
        </div>
      </div>

      {/* Core Workflow Hub */}
      {progress && (
        <div className="space-y-4 mb-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: General ATS Analysis */}
            <Link
              href="/dashboard/analyze/general"
              className={`p-5 rounded-2xl border transition-all flex flex-col group ${
                progress.generalAtsScore !== null 
                  ? progress.generalAtsScore >= 80 
                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/60' 
                    : progress.generalAtsScore >= 60 
                      ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60' 
                      : 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/60'
                  : 'bg-[#18181B] border-[#27272A] hover:border-[#FAFAFA]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-400">Step 1</span>
                {progress.generalAtsScore !== null && (
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    progress.generalAtsScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {progress.generalAtsScore >= 80 ? 'Ready' : 'Improve'}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-[#FAFAFA] text-sm group-hover:text-white transition-colors">
                General ATS Analysis
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 flex-1">
                {progress.generalAtsScore !== null 
                  ? 'Click to view line-by-line suggestions.'
                  : 'Scan your resume against target market.'}
              </p>
              <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#FAFAFA]">
                {progress.generalAtsScore !== null ? (
                  <span className={`text-lg font-black ${
                    progress.generalAtsScore >= 80 ? 'text-emerald-400' : progress.generalAtsScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>{progress.generalAtsScore}%</span>
                ) : (
                  <span>Launch Tool</span>
                )}
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* Card 2: LinkedIn Updates */}
            {(progress.generalAtsScore && progress.generalAtsScore >= 80) || (progress.latestAnalysisScore && progress.latestAnalysisScore >= 80) ? (
              <Link
                href="/dashboard/linkedin"
                className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#FAFAFA] transition-all flex flex-col group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-400">Step 2</span>
                  {progress.hasLinkedin && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400">Done</span>
                  )}
                </div>
                <h3 className="font-bold text-[#FAFAFA] text-sm group-hover:text-white transition-colors">
                  LinkedIn Optimization
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 flex-1">
                  Sync your baseline resume to generate localized LinkedIn updates.
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#FAFAFA]">
                  <span>Launch Tool</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] opacity-75 grayscale flex flex-col cursor-not-allowed">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-500">Step 2</span>
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="font-bold text-zinc-500 text-sm">LinkedIn Optimization</h3>
                <p className="text-[11px] text-zinc-600 mt-1 flex-1">
                  Hit 80+ General ATS Score to unlock.
                </p>
              </div>
            )}

            {/* Card 3: 2-Month Roadmap */}
            {progress.hasLinkedin ? (
              <Link
                href="/dashboard/roadmap"
                className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#FAFAFA] transition-all flex flex-col group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-400">Step 3</span>
                  {progress.hasRoadmap && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400">Active</span>
                  )}
                </div>
                <h3 className="font-bold text-[#FAFAFA] text-sm group-hover:text-white transition-colors">
                  2-Month Master Plan
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 flex-1">
                  Generate your 8-week structured roadmap for local markets.
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#FAFAFA]">
                  <span>Launch Tool</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] opacity-75 grayscale flex flex-col cursor-not-allowed">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-500">Step 3</span>
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="font-bold text-zinc-500 text-sm">2-Month Master Plan</h3>
                <p className="text-[11px] text-zinc-600 mt-1 flex-1">
                  Complete LinkedIn optimization to unlock.
                </p>
              </div>
            )}

            {/* Card 4: JD ATS Analysis */}
            {progress.hasRoadmap ? (
              <Link
                href="/dashboard/analyze"
                className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#FAFAFA] transition-all flex flex-col group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-400">Step 4</span>
                  {progress.latestAnalysisId && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400">Active</span>
                  )}
                </div>
                <h3 className="font-bold text-[#FAFAFA] text-sm group-hover:text-white transition-colors">
                  JD Match Analysis
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 flex-1">
                  Tailor your baseline resume specifically for target Job Descriptions.
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#FAFAFA]">
                  <span>Launch Tool</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] opacity-75 grayscale flex flex-col cursor-not-allowed">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-500">Step 4</span>
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="font-bold text-zinc-500 text-sm">JD Match Analysis</h3>
                <p className="text-[11px] text-zinc-600 mt-1 flex-1">
                  Generate your 8-Week roadmap to unlock.
                </p>
              </div>
            )}

          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {/* Card 5: Kanban Tracker */}
            {progress.latestAnalysisId ? (
              <Link
                href="/dashboard/tracker"
                className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#FAFAFA] transition-all flex flex-col group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-400">Step 5</span>
                </div>
                <h3 className="font-bold text-[#FAFAFA] text-sm group-hover:text-white transition-colors">
                  Kanban Job Tracker
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 flex-1">
                  Track applied, interview, and offer stages.
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#FAFAFA]">
                  <span>Launch Tool</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] opacity-75 grayscale flex flex-col cursor-not-allowed">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-500">Step 5</span>
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="font-bold text-zinc-500 text-sm">Kanban Job Tracker</h3>
                <p className="text-[11px] text-zinc-600 mt-1 flex-1">
                  Run 1 JD Analysis to unlock.
                </p>
              </div>
            )}

            {/* Card 6: Mock Interviews (Only shown/unlocked based on hasInterview) */}
            {progress.hasInterview ? (
              <Link
                href="/dashboard/mock-interview"
                className="p-5 rounded-2xl bg-[#18181B] border border-amber-500/30 hover:border-amber-500 transition-all flex flex-col group shadow-[0_0_15px_rgba(245,158,11,0.1)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-amber-500">Step 6</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-500 animate-pulse">Unlocked!</span>
                </div>
                <h3 className="font-bold text-[#FAFAFA] text-sm group-hover:text-white transition-colors">
                  AI Mock Interviews
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 flex-1">
                  Practice for your upcoming interview with an AI recruiter.
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#FAFAFA]">
                  <span>Launch Tool</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] opacity-50 grayscale flex flex-col cursor-not-allowed hidden md:flex">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-500">Step 6</span>
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="font-bold text-zinc-500 text-sm">AI Mock Interviews</h3>
                <p className="text-[11px] text-zinc-600 mt-1 flex-1">
                  Move a job to 'Interview' in Tracker to unlock.
                </p>
              </div>
            )}

            {/* Card 7: Salary War Room (Only shown/unlocked based on hasOffer) */}
            {progress.hasOffer ? (
              <Link
                href="/dashboard/offers"
                className="p-5 rounded-2xl bg-[#18181B] border border-emerald-500/30 hover:border-emerald-500 transition-all flex flex-col group shadow-[0_0_15px_rgba(16,185,129,0.1)]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-emerald-500">Step 7</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/20 text-emerald-400 animate-pulse">Unlocked!</span>
                </div>
                <h3 className="font-bold text-[#FAFAFA] text-sm group-hover:text-white transition-colors">
                  Salary War Room
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 flex-1">
                  Simulate HR counter-offers and maximize your compensation.
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#FAFAFA]">
                  <span>Launch Tool</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] opacity-50 grayscale flex flex-col cursor-not-allowed hidden md:flex">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-500">Step 7</span>
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="font-bold text-zinc-500 text-sm">Salary War Room</h3>
                <p className="text-[11px] text-zinc-600 mt-1 flex-1">
                  Move a job to 'Offer' in Tracker to unlock.
                </p>
              </div>
            )}

            {/* Card 8: Career Knowledge Graph */}
            {progress.latestAnalysisId ? (
              <Link
                href="/dashboard/graph"
                className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#FAFAFA] transition-all flex flex-col group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-400">Step 8</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-500/20 text-blue-400">New</span>
                </div>
                <h3 className="font-bold text-[#FAFAFA] text-sm group-hover:text-white transition-colors">
                  Career Knowledge Graph
                </h3>
                <p className="text-[11px] text-zinc-400 mt-1 flex-1">
                  Visualize connections between your skills, resumes, and target jobs.
                </p>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#FAFAFA]">
                  <span>Launch Tool</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </Link>
            ) : (
              <div className="p-5 rounded-2xl bg-[#18181B] border border-[#27272A] opacity-50 grayscale flex flex-col cursor-not-allowed hidden md:flex">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-zinc-500">Step 8</span>
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <h3 className="font-bold text-zinc-500 text-sm">Career Knowledge Graph</h3>
                <p className="text-[11px] text-zinc-600 mt-1 flex-1">
                  Run 1 JD Analysis to map your footprint.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

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
              <div className="absolute top-4 right-4 z-10 text-zinc-500"><svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></div>
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








