"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { useToast } from "@/components/Toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RecentAnalysesCard from "@/components/dashboard/RecentAnalysesCard";
import ResumeListCard from "@/components/dashboard/ResumeListCard";
import OnboardingInsights from "@/components/dashboard/OnboardingInsights";
import EditOnboardingModal from "@/components/dashboard/EditOnboardingModal";
import IndustrySelector, { IndustryDomain } from "@/components/IndustrySelector";
import NextBestActionBanner from "@/components/NextBestActionBanner";
import NewAnalysisModal from "@/components/dashboard/NewAnalysisModal";
import {
  Resume,
  Analysis,
  Roadmap,
  OnboardingProfileData,
  ResumeImprovement,
} from "@/types/dashboard";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [onboardingProfile, setOnboardingProfile] =
    useState<OnboardingProfileData | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false);

  // Accordion state for onboarding insights
  const [expandedInsight, setExpandedInsight] = useState<string | null>(
    searchParams.get("insight") || null
  );

  const setInsightWithUrl = (key: string | null) => {
    setExpandedInsight(key);
    const url = new URL(window.location.href);
    if (key) {
      url.searchParams.set("insight", key);
    } else {
      url.searchParams.delete("insight");
    }
    window.history.replaceState({}, "", url.toString());
  };

  const handleSelectDomain = useCallback(
    (domain: IndustryDomain) => {
      toast(`Industry set to: ${domain.name}. AI prompt terminology updated.`, "info");
    },
    [toast]
  );

  const fetchData = useCallback(async () => {
    setDataError(null);
    try {
      const [resRes, anaRes, roadmapRes, onboardRes] = await Promise.all([
        fetch("/api/resumes"),
        fetch("/api/analyze"),
        fetch("/api/roadmap"),
        fetch("/api/onboarding"),
      ]);

      if (resRes.ok) setResumes((await resRes.json()).resumes || []);
      if (anaRes.ok) setAnalyses((await anaRes.json()).analyses || []);
      if (roadmapRes.ok) setRoadmap((await roadmapRes.json()).roadmap || null);
      if (onboardRes.ok) {
        const onboardData = await onboardRes.json();
        if (onboardData.profile && onboardData.completed) {
          setOnboardingProfile(onboardData.profile);
        } else {
          router.replace("/");
          return;
        }
      }
    } catch {
      setDataError("Failed to load dashboard data. Please refresh the page.");
      toast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, [toast, router]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const handleRegenRoadmap = async () => {
    setRoadmapLoading(true);
    try {
      const res = await fetch("/api/roadmap", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setRoadmap(data.roadmap);
        toast("Roadmap regenerated", "success");
      } else {
        toast("Failed to regenerate roadmap", "error");
      }
    } catch {
      toast("Failed to regenerate roadmap", "error");
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleResetOnboarding = async () => {
    try {
      const res = await fetch("/api/onboarding", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      } else {
        toast("Failed to reset onboarding", "error");
      }
    } catch {
      toast("Failed to reset onboarding", "error");
    }
  };

  const handleChangePrimaryResume = async (resumeId: string) => {
    const targetResume = resumes.find((r) => r.id === resumeId);
    try {
      toast(`Setting "${targetResume?.name || "resume"}" as Primary... Re-analyzing baseline...`, "info");
      const res = await fetch("/api/resumes/primary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });

      if (res.ok) {
        await fetchData();
        toast(`Primary resume updated! Onboarding analysis & roadmap regenerated.`, "success");
      } else {
        const data = await res.json();
        toast(data.error || "Failed to update primary resume", "error");
      }
    } catch {
      toast("Failed to update primary resume", "error");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 bg-[#14161D] rounded w-48 animate-pulse mb-8" />
          <SkeletonGrid count={4} />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  const generalAtsScore = onboardingProfile?.generalAtsScore ?? null;
  const linkedinTips: string[] = (() => {
    try {
      return onboardingProfile?.linkedinOpts
        ? JSON.parse(onboardingProfile.linkedinOpts)
        : [];
    } catch {
      return [];
    }
  })();
  const resumeImprovements: ResumeImprovement[] = (() => {
    try {
      return onboardingProfile?.resumeImprovements
        ? JSON.parse(onboardingProfile.resumeImprovements)
        : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <DashboardHeader
          userName={session?.user?.name}
          resumeCount={resumes.length}
          analysisCount={analyses.length}
          generalAtsScore={generalAtsScore}
          onResetOnboarding={handleResetOnboarding}
          onNewAnalysis={() => setShowNewAnalysisModal(true)}
        />

        {/* Smart Next Best Action Banner */}
        <NextBestActionBanner
          resumeCount={resumes.length}
          analysisCount={analyses.length}
          generalAtsScore={generalAtsScore}
        />

        {/* Industry Selector bar */}
        <div className="p-5 bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-3xl text-white shadow-xl">
          <IndustrySelector onSelectDomain={handleSelectDomain} />
        </div>

        {/* Workflow Clarity Guidance Card */}
        <div className="p-6 sm:p-7 bg-[#14161D]/80 backdrop-blur-2xl border border-amber-500/20 rounded-3xl text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <span>💡 General Baseline vs. Targeted Job Scan</span>
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Ready to apply for a specific job?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Your baseline ATS score above and <strong>2-Month Plan</strong> show your overall resume quality. For each job posting you apply to, click <strong>+ New Analysis</strong> to compare requirements, find missing keywords, and get tailored fixes.
            </p>
          </div>

          <button
            onClick={() => setShowNewAnalysisModal(true)}
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 shrink-0 flex items-center gap-2"
          >
            <span>⚡ + New Job Analysis</span>
          </button>
        </div>

        {/* Error banner */}
        {dataError && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-2xl text-xs text-rose-300 font-bold flex items-center justify-between">
            <span>{dataError}</span>
            <button
              onClick={fetchData}
              className="px-3 py-1.5 text-xs font-bold bg-rose-900 text-rose-200 rounded-xl hover:bg-rose-800 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Recent Analyses & Score */}
        <RecentAnalysesCard
          analyses={analyses}
          generalAtsScore={generalAtsScore}
          onEditOnboarding={() => setShowEditModal(true)}
          onNewAnalysis={() => setShowNewAnalysisModal(true)}
        />

        {/* Resumes List with Primary toggle */}
        <ResumeListCard
          resumes={resumes}
          onChangePrimary={handleChangePrimaryResume}
        />

        {/* Onboarding Insights Accordion & Roadmap */}
        <OnboardingInsights
          roadmap={roadmap}
          roadmapLoading={roadmapLoading}
          onRegenRoadmap={handleRegenRoadmap}
          onResetOnboarding={handleResetOnboarding}
          linkedinTips={linkedinTips}
          resumeImprovements={resumeImprovements}
          expandedInsight={expandedInsight}
          setInsightWithUrl={setInsightWithUrl}
        />

        {/* Edit Onboarding & Primary Resume Modal */}
        <EditOnboardingModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            fetchData();
            toast("Onboarding target & primary resume updated! Analysis regenerated.", "success");
          }}
          resumes={resumes}
          profile={onboardingProfile}
        />

        {/* New Job Analysis Popup Modal */}
        <NewAnalysisModal
          open={showNewAnalysisModal}
          onClose={() => setShowNewAnalysisModal(false)}
          resumes={resumes}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#090A0C]">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
