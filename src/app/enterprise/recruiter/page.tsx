"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import Logo from "@/components/Logo";
import RecruiterOnboardingWizard from "@/components/recruiter/RecruiterOnboardingWizard";

interface RecruiterFeatureShowcase {
  id: string;
  badge: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  capabilities: string[];
}

const RECRUITER_FEATURE_TILES: RecruiterFeatureShowcase[] = [
  {
    id: "ai-requisition",
    badge: "Coming Soon • Early Beta",
    title: "15-Second AI Requisition & JD Generator",
    tagline: "Instant Job Specification Synthesis with Market Salary Benchmarks",
    description: "Generate compliant, high-converting job descriptions calibrated by seniority, domain requirements, required core competencies, and automated Boolean recruiter search strings.",
    icon: "⚡",
    capabilities: [
      "Auto-calibrated compensation bands across UAE, US, UK, and APAC",
      "Must-have vs nice-to-have skill taxonomy extractor",
      "LinkedIn & job board optimized SEO posting formats",
      "1-click Boolean string generation for candidate sourcing",
    ],
  },
  {
    id: "batch-screener",
    badge: "Coming Soon • Early Beta",
    title: "Batch AI Resume Screener & Scorecard Engine",
    tagline: "Bulk Screen 50+ Resumes with 0-100 Fit Scoring & Red-Flag Detection",
    description: "Upload applicant resumes in bulk against any active job requisition. The engine parses layout structure, verifies quantified STAR accomplishments, identifies missing domain skills, and generates instant recruiter cheat-sheets.",
    icon: "🤖",
    capabilities: [
      "0–100% Weighted Requisition Match Index",
      "Automated career gap & inconsistency red-flag radar",
      "Structured candidate comparison matrices for hiring managers",
      "Instant 1st-round interview question suggestions per candidate",
    ],
  },
  {
    id: "pipeline-kanban",
    badge: "Coming Soon • Early Beta",
    title: "Visual Talent Pipeline & Stage Kanban",
    tagline: "Drag-and-Drop Candidate Progression from Applied to Hired",
    description: "Full-cycle visual applicant tracking. Move candidates effortlessly across Applied, AI Screen, Technical Review, Executive Loop, and Offer stages with automated team notifications.",
    icon: "📊",
    capabilities: [
      "Customizable hiring workflow stages per requisition",
      "1-click stage advancement with candidate acknowledgment triggers",
      "Multi-reviewer scorecard aggregation and consensus ratings",
      "Centralized candidate communication timeline",
    ],
  },
  {
    id: "semantic-search",
    badge: "Coming Soon • Early Beta",
    title: "384-D Semantic Talent Search & Inbound Matching",
    tagline: "Natural Language Queries across Verified Candidate Talent Pools",
    description: "Find matching talent without writing complex Boolean strings. Search candidate pools using plain English prompts like 'Senior Next.js & Python engineer in Dubai with 5+ years experience and high ATS score'.",
    icon: "🔍",
    capabilities: [
      "384-dimensional vector semantic matching (pgvector powered)",
      "Verified candidate ATS scores and skill badges",
      "Direct inbound outreach sequences tailored to opening",
      "Privacy-first candidate profile view with obfuscated contact data",
    ],
  },
  {
    id: "ai-video-screener",
    badge: "Coming Soon • Early Beta",
    title: "Asynchronous AI 1st-Round Video Screener",
    tagline: "Automated Candidate Technical & Behavioral Screening Rooms",
    description: "Candidates participate in an AI-moderated 5-question technical and behavioral room. Recruiters receive full audio transcripts, filler-word analysis, and answer summaries before scheduling live loops.",
    icon: "🎙️",
    capabilities: [
      "Automated follow-up probing questions generated in real time",
      "Speech cadence, filler-word frequency & clarity analytics",
      "Anti-cheating behavioral telemetry and browser tab logs",
      "Executive summary card for 60-second hiring manager review",
    ],
  },
];

export default function RecruiterCommandCenterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [requestedFeatures, setRequestedFeatures] = useState<Record<string, boolean>>({});
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [initialCompanyName, setInitialCompanyName] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      const localDone = typeof window !== "undefined" && localStorage.getItem("recruiter_onboarding_done") === "true";
      fetch("/api/recruiter/onboarding")
        .then((res) => res.json())
        .then((data) => {
          if (!data.completed && !localDone) {
            setNeedsOnboarding(true);
            if (data.profile?.companyName) {
              setInitialCompanyName(data.profile.companyName);
            }
          } else {
            setNeedsOnboarding(false);
          }
        })
        .catch(() => {
          setNeedsOnboarding(false);
        });
    }
  }, [status, router]);

  const handleRequestAccess = (featureId: string, featureTitle: string) => {
    setRequestedFeatures((prev) => ({ ...prev, [featureId]: true }));
    toast(`🎉 You're on the early beta list for "${featureTitle}"! We'll notify you as soon as it's enabled.`, "success");
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("recruiter_onboarding_done", "true");
    setNeedsOnboarding(false);
    toast("🎉 Talent workspace configured successfully!", "success");
    router.push("/account");
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("recruiter_onboarding_done", "true");
    setNeedsOnboarding(false);
  };

  if (status === "loading" || needsOnboarding === null) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#09090B]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-32">
      {/* Recruiter Onboarding Wizard Modal if not completed */}
      {needsOnboarding && (
        <RecruiterOnboardingWizard
          initialCompanyName={initialCompanyName}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}

      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Recruiter Hero Header */}
        <div className="relative overflow-hidden bg-[#18181B] rounded-3xl border border-[#27272A] p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#09090B] border border-[#27272A] text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Enterprise Recruiter OS</span>
                <span>•</span>
                <span>Early Access Suite</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA]">
                Recruiter Command Center
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                Autonomous candidate screening, 15-second requisition synthesis, and 384-dimensional semantic talent matching.
              </p>
            </div>

            {/* Account & Profile Quick Action */}
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                href="/account"
                className="px-4 py-2.5 bg-[#09090B] hover:bg-[#27272A] text-[#FAFAFA] font-bold text-xs rounded-xl transition-all border border-[#27272A] flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
              >
                <span>🏢 Organization Profile</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Showcase Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
              Recruiter Capability Suite
            </h2>
            <span className="px-3 py-1 bg-[#18181B] border border-[#27272A] text-[11px] font-mono font-bold text-zinc-300 rounded-full">
              5 Enterprise Engines
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Preview the upcoming suite of AI-driven talent acquisition tools currently rolling out to early beta partners.
          </p>
        </div>

        {/* 5 Feature Tiles Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {RECRUITER_FEATURE_TILES.map((tile) => {
            const hasRequested = requestedFeatures[tile.id];

            return (
              <div
                key={tile.id}
                className="bg-[#18181B] border border-[#27272A] hover:border-zinc-500 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 transition-all shadow-lg group"
              >
                <div className="space-y-4">
                  {/* Top Bar: Icon, Title & Coming Soon Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#09090B] border border-[#27272A] flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                        {tile.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                          RECRUITER OS ENGINE
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-[#FAFAFA] tracking-tight">
                          {tile.title}
                        </h3>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-800 text-[10px] font-bold text-amber-300 uppercase tracking-wider shrink-0 font-mono">
                      {tile.badge}
                    </span>
                  </div>

                  {/* Tagline */}
                  <p className="text-xs font-bold text-zinc-300">
                    {tile.tagline}
                  </p>

                  {/* Main Description */}
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {tile.description}
                  </p>

                  {/* Capability Bullets */}
                  <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                      CORE CAPABILITIES INCLUDED
                    </span>
                    <ul className="space-y-1.5 text-xs text-zinc-300">
                      {tile.capabilities.map((cap, cIdx) => (
                        <li key={cIdx} className="flex items-center gap-2">
                          <span className="text-emerald-400 text-xs font-bold">✓</span>
                          <span className="text-[11px] text-zinc-300">{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Interactive Action */}
                <div className="pt-4 border-t border-[#27272A] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                    <span>🔒</span>
                    <span>Rolling out to selected teams</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRequestAccess(tile.id, tile.title)}
                    disabled={hasRequested}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm ${
                      hasRequested
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-700/60"
                        : "bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] border border-[#FAFAFA]"
                    }`}
                  >
                    {hasRequested ? (
                      <>
                        <span>✓ Early Access Requested</span>
                      </>
                    ) : (
                      <>
                        <span>🔔 Request Early Beta Access</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
