"use client";

import { useState } from "react";
import Link from "next/link";
import StatsAndReviewsSection from "@/components/StatsAndReviewsSection";

interface Step {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  actionText: string;
  actionHref: string;
  icon: string;
  badge: string;
  tips: string[];
}

const STEPS: Step[] = [
  {
    number: "01",
    title: "Upload Primary Resume & Target Goals",
    subtitle: "Establish baseline ATS score & target country",
    description:
      "Upload your primary resume in PDF or DOCX format. ResuMatch automatically extracts your core skills, work history, target roles, and country preferences, establishing your General ATS baseline score.",
    actionText: "Upload Primary Resume",
    actionHref: "/dashboard/resumes",
    icon: "📄",
    badge: "Step 1",
    tips: [
      "Set your primary resume to drive your onboarding analysis baseline.",
      "Specify your target country (UAE, India, US, etc.) for region-specific ATS algorithms.",
      "ResuMatch auto-populates target positions and skills directly from your uploaded document.",
    ],
  },
  {
    number: "02",
    title: "Generate Interactive 8-Week Roadmap",
    subtitle: "Execute week-by-week tasks with saved checkbox progress",
    description:
      "Receive a personalized 8-week career roadmap split into Foundation, High Velocity, and Conversion phases. Click task checkboxes to track and persist your overall progress across devices.",
    actionText: "View Your Roadmap",
    actionHref: "/dashboard#roadmap",
    icon: "🗺️",
    badge: "Step 2",
    tips: [
      "Check off weekly tasks as you complete them — progress is automatically saved to the database.",
      "Iteration 1 includes tasks to fix initial resume and LinkedIn recommendations.",
      "Click 'Regenerate Roadmap' once baseline fixes are done to unlock post-fix advanced career steps.",
    ],
  },
  {
    number: "03",
    title: "1-Click Studio per Application (Target 75-80%+)",
    subtitle: "Tailor bullet points specifically to each Job Description",
    description:
      "Never send a generic resume. Paste JD text or import job URLs directly into 1-Click Studio. Review 7 to 10 section-by-section STAR bullet rewrites until your ATS score reaches 75%–80%+.",
    actionText: "Open 1-Click Studio",
    actionHref: "/dashboard/studio",
    icon: "⚡",
    badge: "Step 3",
    tips: [
      "Aim for an overall ATS Match Score of 75%–80%+ before submitting your application.",
      "Accept AI suggestions to automatically incorporate missing hard skills with ROI metrics.",
      "Export clean single-column ATS PDFs directly from the studio workspace.",
    ],
  },
  {
    number: "04",
    title: "Stage-Wise Interview Coach & Model Answers",
    subtitle: "Practice HR, Technical, Coding, and CEO round questions",
    description:
      "Filter practice questions by interview stage (HR Screening, Technical Deep-Dive, Live Coding / System Design, CEO Round). Toggle expanders to view high-scoring STAR-method model responses.",
    actionText: "Practice Interview Q&As",
    actionHref: "/dashboard/interview",
    icon: "🎯",
    badge: "Step 4",
    tips: [
      "Filter by stage to prepare for your exact upcoming interview round.",
      "Review the 'Why Asked' recruiter intent for every question.",
      "Study the sample STAR response to structure your own resume accomplishments.",
    ],
  },
  {
    number: "05",
    title: "LinkedIn Optimization & Recruiter Hack Pack",
    subtitle: "Set up 24h job alerts, free premium trial & Open to Work",
    description:
      "Optimize your LinkedIn headline and summary for recruiter searches. Utilize recruiter job hunting hacks including past 24-hour job alert filters and free Premium InMail outreach.",
    actionText: "View LinkedIn Hacks",
    actionHref: "/dashboard#linkedin",
    icon: "💼",
    badge: "Step 5",
    tips: [
      "Filter job alerts strictly by 'Posted in last 24 hours' to be in the first 25 applicants.",
      "Activate LinkedIn Premium 30-day trial for 5 free monthly recruiter InMails.",
      "Enable 'Open to Work' (Recruiters Only mode) to increase recruiter outreach by 40%.",
    ],
  },
  {
    number: "06",
    title: "Batch Resume Comparison & Application Tracking",
    subtitle: "Compare version quality side-by-side & manage pipeline",
    description:
      "Compare up to 4 resume versions side-by-side to evaluate quality scores and strengths. Track active applications from Wishlist → Applied → Interview → Offer on your Kanban board.",
    actionText: "Batch Compare Resumes",
    actionHref: "/dashboard/compare",
    icon: "⚖️",
    badge: "Step 6",
    tips: [
      "Compare old resume versions against optimized versions to verify quality score gains.",
      "Log applied dates on your Kanban board to trigger automated 5-day follow-up reminders.",
      "Use Outreach Studio for personalized recruiter cold emails and InMails.",
    ],
  },
];

const FEATURE_TABS = [
  {
    id: "studio",
    name: "1-Click Studio",
    icon: "⚡",
    title: "1-Click Application Optimization Studio",
    description:
      "Import job postings directly from URL or text, audit ATS scannability with live 5-step progress, apply instant STAR bullet fixes, and export ATS-compliant PDFs.",
    highlights: [
      "7 to 10 Tailored Suggestions per Scan",
      "Target Goal Banner (75-80%+ ATS Match)",
      "Live Step-by-Step AI Pipeline Visualizer",
      "1-Click PDF Export & Sync to Kanban",
    ],
  },
  {
    id: "roadmap",
    name: "8-Week Roadmap",
    icon: "🗺️",
    title: "Interactive 8-Week Phased Career Roadmap",
    description:
      "Personalized week-by-week plan to close skill gaps and build career momentum with interactive database-persisted task checkboxes and completion progress tracking.",
    highlights: [
      "Phased Timeline (Foundation, High Velocity, Conversion)",
      "Interactive Saved Task Checkboxes",
      "Overall Completion Progress Bar",
      "Iteration 1 Setup vs Post-Fix Regenerated Roadmap",
    ],
  },
  {
    id: "interview",
    name: "Interview Coach",
    icon: "🎯",
    title: "Stage-Wise Interview Coach & Model Answers",
    description:
      "Tailor interview preparation by round (HR, Technical Deep-Dive, Live Coding / System Design, CEO Round) with comprehensive STAR model answers and key talking points.",
    highlights: [
      "Stage Filters (HR, Tech, Coding, CEO)",
      "STAR-Method Sample Responses",
      "3 Key Talking Points per Question",
      "Recruiter Intent & Rationale Explanations",
    ],
  },
  {
    id: "compare",
    name: "Batch Comparison",
    icon: "⚖️",
    title: "Side-by-Side Batch Resume Comparison Tool",
    description:
      "Compare up to 4 resume versions side-by-side to evaluate overall quality ratings (0-100), key strengths, and area-by-area improvement opportunities.",
    highlights: [
      "Compare up to 4 Resumes Simultaneously",
      "Side-by-Side Overall Quality Scores",
      "Detailed Strengths & Improvement Lists",
      "Determines Best Baseline Resume for Target Roles",
    ],
  },
  {
    id: "jds",
    name: "50-60% Job Matcher",
    icon: "🔎",
    title: "Real Active Job Opening Recommendation Engine",
    description:
      "Searches live job boards in your target country for real job roles matching 50% to 60% of your primary resume (ideal sweet spot for growth).",
    highlights: [
      "Enforces 50%–60% Primary Resume Match",
      "Real Active Hiring Companies in Target Region",
      "Direct Search Links to LinkedIn, Indeed & Naukrigulf",
      "Auto-Saves Matched Openings to Dashboard",
    ],
  },
];

export default function HowToUseSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  const currentStep = STEPS[activeStep];
  const currentFeature = FEATURE_TABS[activeFeatureTab];

  return (
    <div className="space-y-16 py-4 bg-[#090A0C] text-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0D0E11] via-[#14161D] to-[#090A0C] text-white p-8 sm:p-12 border border-[#242834] shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs font-black text-amber-300">
            <span>🚀 Complete Job Search Acceleration Playbook</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            How to Master <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">ResuMatch</span> to Land Your Dream Job
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Follow our 6-step system engineered to optimize your resume for ATS bots, boost recruiter outreach response rates, master interview prep, and maintain daily search discipline.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/dashboard/studio"
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 font-black text-xs text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
            >
              Open 1-Click Studio →
            </Link>
            <Link
              href="/dashboard/compare"
              className="px-6 py-3 rounded-xl bg-[#14161D] hover:bg-[#1C1F2B] border border-[#242834] font-bold text-xs text-amber-300 transition-all"
            >
              Batch Compare Resumes ⚖️
            </Link>
          </div>
        </div>
      </div>

      {/* Founder's Story Banner */}
      <div className="p-6 bg-[#14161D] text-white rounded-3xl border border-amber-500/30 shadow-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-300">
          <span>❤️ Why ResuMatch Was Built</span>
        </div>
        <h3 className="text-base sm:text-lg font-black text-white">
          Built From 8 Months of Job Hunt Struggle to Make Sure Everyone Lands Interviews
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed">
          &quot;After suffering through 8 months of ghosting and automated ATS rejection emails, I created ResuMatch to break open the black box of corporate hiring algorithms. We keep this platform 100% free for job seekers right now so no candidate suffers alone.&quot;
        </p>
      </div>

      {/* Interactive 6-Step Guide */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            The 6-Step Job Landing Workflow
          </h2>
          <p className="text-xs text-zinc-400">
            Click through each step to understand how to turn applications into interview calls.
          </p>
        </div>

        {/* Step Numbers Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STEPS.map((step, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStep(idx)}
                className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden ${
                  isActive
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02] font-extrabold"
                    : "bg-[#14161D] text-zinc-300 border-[#242834] hover:border-amber-500/50 hover:bg-[#1C1F2B]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-base font-black ${isActive ? "text-slate-950" : "text-amber-400"}`}>
                    {step.number}
                  </span>
                  <span className="text-lg">{step.icon}</span>
                </div>
                <p className={`text-xs font-bold line-clamp-1 ${isActive ? "text-slate-950" : "text-white"}`}>
                  {step.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Step Detail Card */}
        <div className="bg-[#14161D] rounded-3xl border border-[#242834] p-6 sm:p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black rounded-full">
                {currentStep.badge}
              </span>
              <span className="text-xs font-semibold text-zinc-400">Step {activeStep + 1} of 6</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <span>{currentStep.icon}</span>
                <span>{currentStep.title}</span>
              </h3>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {currentStep.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {currentStep.description}
            </p>

            <div className="pt-2">
              <Link
                href={currentStep.actionHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
              >
                <span>{currentStep.actionText}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Pro Tips Box */}
          <div className="lg:col-span-5 bg-[#0D0E11] border border-[#242834] rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase tracking-wider">
              <span>💡 Pro Tips for {currentStep.badge}</span>
            </div>

            <ul className="space-y-3">
              {currentStep.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300 leading-relaxed">
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Feature Deep Dive Tabs */}
      <div className="space-y-8 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Platform Feature Deep Dive
          </h2>
          <p className="text-xs text-zinc-400">
            Explore our specialized AI toolkits built for job seekers.
          </p>
        </div>

        {/* Feature Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2">
          {FEATURE_TABS.map((tab, idx) => {
            const isActive = activeFeatureTab === idx;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFeatureTab(idx)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md font-black"
                    : "bg-[#14161D] border border-[#242834] text-zinc-300 hover:bg-[#1C1F2B] hover:text-white"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Display Card */}
        <div className="bg-gradient-to-br from-[#14161D] via-[#1C1F2B] to-[#0D0E11] text-white rounded-3xl p-8 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-[#242834]">
          <div className="lg:col-span-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 backdrop-blur-md text-amber-300 flex items-center justify-center font-black text-2xl border border-amber-500/30">
              {currentFeature.icon}
            </div>

            <h3 className="text-2xl font-black text-white">
              {currentFeature.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {currentFeature.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentFeature.highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-amber-200 bg-[#090A0C]/80 p-2.5 rounded-xl border border-[#242834]">
                  <span className="text-amber-400 font-bold">✦</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#090A0C]/90 backdrop-blur-md rounded-2xl p-6 border border-[#242834] space-y-4 text-center">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">Ready to Accelerate Your Job Search?</h4>
            <p className="text-xs text-zinc-400">
              Start optimizing your applications with AI precision today.
            </p>
            <Link
              href="/dashboard/studio"
              className="block w-full py-3 bg-amber-500 text-slate-950 font-black text-xs rounded-xl hover:bg-amber-400 transition-colors shadow-md"
            >
              Open 1-Click Studio Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Numbers & User Reviews */}
      <StatsAndReviewsSection />
    </div>
  );
}
