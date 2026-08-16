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
    <div className="space-y-16 py-4 bg-white text-black">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-zinc-50 text-black p-8 sm:p-12 border border-zinc-200 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-200 border border-zinc-300 text-xs font-bold text-black">
            <span>🚀 Complete Job Search Acceleration Playbook</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-black">
            How to Master ResuMatch to Land Your Dream Job
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-medium">
            Follow our 6-step system engineered to optimize your resume for ATS bots, boost recruiter outreach response rates, master interview prep, and maintain daily search discipline.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/dashboard/builder"
              className="px-6 py-3 rounded-xl bg-black hover:bg-zinc-800 font-bold text-xs text-white shadow-sm transition-all hover:scale-[1.02] border border-black"
            >
              Open Resume Studio →
            </Link>
            <Link
              href="/dashboard/compare"
              className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 font-bold text-xs text-black transition-all shadow-sm"
            >
              Batch Compare Resumes ⚖️
            </Link>
          </div>
        </div>
      </div>

      {/* Founder's Story Banner */}
      <div className="p-6 bg-zinc-50 text-black rounded-3xl border border-zinc-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black">
          <span>❤️ Why ResuMatch Was Built</span>
        </div>
        <h3 className="text-base sm:text-lg font-black text-black">
          Built From 8 Months of Job Hunt Struggle to Make Sure Everyone Lands Interviews
        </h3>
        <p className="text-xs text-zinc-600 leading-relaxed font-medium">
          &quot;After suffering through 8 months of ghosting and automated ATS rejection emails, I created ResuMatch to break open the black box of corporate hiring algorithms. We keep this platform 100% free for job seekers right now so no candidate suffers alone.&quot;
        </p>
      </div>

      {/* Interactive 6-Step Guide */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-black">
            The 6-Step Job Landing Workflow
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
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
                className={`p-3.5 rounded-2xl text-left border transition-all relative overflow-hidden shadow-sm ${
                  isActive
                    ? "bg-black text-white border-black shadow-sm scale-[1.02] font-bold"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-black hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-base font-black ${isActive ? "text-white" : "text-black"}`}>
                    {step.number}
                  </span>
                  <span className="text-lg">{step.icon}</span>
                </div>
                <p className={`text-xs font-bold line-clamp-1 ${isActive ? "text-white" : "text-black"}`}>
                  {step.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Step Detail Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-black">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-zinc-100 text-black border border-zinc-300 text-xs font-bold rounded-full">
                {currentStep.badge}
              </span>
              <span className="text-xs font-semibold text-zinc-500">Step {activeStep + 1} of 6</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-black flex items-center gap-2">
                <span>{currentStep.icon}</span>
                <span>{currentStep.title}</span>
              </h3>
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                {currentStep.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
              {currentStep.description}
            </p>

            <div className="pt-2">
              <Link
                href={currentStep.actionHref}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all border border-black"
              >
                <span>{currentStep.actionText}</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Pro Tips Box */}
          <div className="lg:col-span-5 bg-zinc-50 border border-zinc-200 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-black uppercase tracking-wider">
              <span>💡 Pro Tips for {currentStep.badge}</span>
            </div>

            <ul className="space-y-3">
              {currentStep.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 leading-relaxed">
                  <span className="text-black font-bold shrink-0 mt-0.5">✓</span>
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
          <h2 className="text-2xl sm:text-3xl font-black text-black">
            Platform Feature Deep Dive
          </h2>
          <p className="text-xs text-zinc-500 font-medium">
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
                    ? "bg-black text-white shadow-sm font-bold border border-black"
                    : "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100 hover:border-black"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Feature Display Card */}
        <div className="bg-zinc-50 text-black rounded-3xl p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border border-zinc-200">
          <div className="lg:col-span-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-200 text-black flex items-center justify-center font-black text-2xl border border-zinc-300 shadow-sm">
              {currentFeature.icon}
            </div>

            <h3 className="text-2xl font-black text-black">
              {currentFeature.title}
            </h3>

            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-medium">
              {currentFeature.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {currentFeature.highlights.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-black bg-white p-2.5 rounded-xl border border-zinc-200 shadow-sm font-medium">
                  <span className="text-black font-bold">✦</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-zinc-200 space-y-4 text-center shadow-sm">
            <h4 className="text-xs font-black text-black uppercase tracking-wider">Ready to Accelerate Your Job Search?</h4>
            <p className="text-xs text-zinc-500 font-medium">
              Start optimizing your applications with AI precision today.
            </p>
            <Link
              href="/dashboard/builder"
              className="block w-full py-3 bg-black text-white font-bold text-xs rounded-xl hover:bg-zinc-800 transition-colors shadow-sm border border-black"
            >
              Open Resume Studio Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Numbers & User Reviews */}
      <StatsAndReviewsSection />
    </div>
  );
}
