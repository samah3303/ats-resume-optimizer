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
    <div className="space-y-16 py-4">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 border border-indigo-500/20 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-indigo-300">
            <span>🚀 Complete Job Search Acceleration Playbook</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            How to Master <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">ResuMatch</span> to Land Your Dream Job
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Follow our 6-step system engineered to optimize your resume for ATS bots, boost recruiter outreach response rates, master interview prep, and maintain daily search discipline.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/dashboard/studio"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-bold text-sm text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              Open 1-Click Studio →
            </Link>
            <Link
              href="/dashboard/compare"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md font-bold text-sm text-white transition-all"
            >
              Batch Compare Resumes ⚖️
            </Link>
          </div>
        </div>
      </div>

      {/* Founder's Story Banner */}
      <div className="p-6 bg-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-lg space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
          <span>❤️ Why ResuMatch Was Built</span>
        </div>
        <h3 className="text-lg font-extrabold text-white">
          Built From 8 Months of Job Hunt Struggle to Make Sure Everyone Lands Interviews
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          &quot;After suffering through 8 months of ghosting and automated ATS rejection emails, I created ResuMatch to break open the black box of corporate hiring algorithms. We keep this platform 100% free for job seekers right now so no candidate suffers alone.&quot;
        </p>
      </div>

      {/* Interactive 6-Step Guide */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            The 6-Step Job Landing Workflow
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
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
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 scale-[1.02]"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-lg font-bold ${isActive ? "text-white" : "text-slate-400"}`}>
                    {step.number}
                  </span>
                  <span className="text-lg">{step.icon}</span>
                </div>
                <p className={`text-xs font-bold line-clamp-1 ${isActive ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>
                  {step.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Step Detail Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/80 dark:border-slate-700 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-extrabold rounded-full">
                {currentStep.badge}
              </span>
              <span className="text-xs font-semibold text-slate-400">Step {activeStep + 1} of 6</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{currentStep.icon}</span>
                <span>{currentStep.title}</span>
              </h3>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {currentStep.subtitle}
              </p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {currentStep.description}
            </p>

            <div className="pt-2">
              <Link
                href={currentStep.actionHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <span>{currentStep.actionText}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Pro Tips Box */}
          <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200/70 dark:border-slate-600 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              <span>💡 Pro Tips for {currentStep.badge}</span>
            </div>

            <ul className="space-y-3">
              {currentStep.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            Platform Feature Deep Dive
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
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
                    ? "bg-slate-900 dark:bg-indigo-600 text-white shadow-md"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Display Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-indigo-500/20">
          <div className="lg:col-span-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center font-bold text-2xl border border-white/15">
              {currentFeature.icon}
            </div>

            <h3 className="text-2xl font-extrabold text-white">
              {currentFeature.title}
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              {currentFeature.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentFeature.highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-indigo-200 bg-white/5 p-2.5 rounded-xl border border-white/10">
                  <span className="text-indigo-400 font-bold">✦</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 space-y-4 text-center">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ready to Accelerate Your Job Search?</h4>
            <p className="text-xs text-slate-300">
              Start optimizing your applications with AI precision today.
            </p>
            <Link
              href="/dashboard/studio"
              className="block w-full py-3 bg-white text-indigo-950 font-bold text-xs rounded-xl hover:bg-indigo-50 transition-colors shadow-md"
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
