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
    title: "Upload & Parse Resume",
    subtitle: "Extract structured data & check formatting",
    description:
      "Upload your resume in PDF or DOCX format. ResuMatch automatically extracts your work history, education, skills, and contact details while detecting ATS formatting hazards like complex tables or text boxes.",
    actionText: "Upload Resume",
    actionHref: "/dashboard/resumes",
    icon: "📄",
    badge: "Step 1",
    tips: [
      "Use clear, single-column layouts for maximum ATS readability.",
      "Avoid tables, text boxes, and background images in your uploaded file.",
      "Ensure text is select-able (not scanned image PDFs).",
    ],
  },
  {
    number: "02",
    title: "Target Job Description",
    subtitle: "Define your target position & keywords",
    description:
      "Paste the target job posting text including title, company name, and core requirements. ResuMatch extracts hard skills, domain keywords, and expected experience levels.",
    actionText: "Add Job Posting",
    actionHref: "/dashboard/jds",
    icon: "🎯",
    badge: "Step 2",
    tips: [
      "Include both primary qualifications and nice-to-have technical skills.",
      "Keep original formatting and line breaks intact when pasting.",
      "Save multiple job postings to run batch ATS comparisons.",
    ],
  },
  {
    number: "03",
    title: "Run AI ATS Audit & Skill Bridge",
    subtitle: "Calculate score & close keyword gaps",
    description:
      "Run a comprehensive ATS scan comparing your resume to the job description. Get an overall match score (0-100%), keyword gap analysis, section completeness scores, and curated free course links for missing skills.",
    actionText: "Run ATS Scan",
    actionHref: "/dashboard/analyze",
    icon: "🔍",
    badge: "Step 3",
    tips: [
      "Aim for an overall ATS Match Score of 75%+ before submitting.",
      "Review the missing skills section for free YouTube course links.",
      "Check the Keyword Density Heatmap to fix missing term frequencies.",
    ],
  },
  {
    number: "04",
    title: "Outreach & STAR Rewriter",
    subtitle: "Generate cover letters, cold emails & STAR bullets",
    description:
      "Generate 1-click tailored cover letters, 250-character LinkedIn connection notes, recruiter cold emails, and transform weak resume lines into high-impact STAR achievement metrics.",
    actionText: "Open Outreach Studio",
    actionHref: "/dashboard/outreach",
    icon: "✉️",
    badge: "Step 4",
    tips: [
      "Send a 2-sentence LinkedIn note to a recruiter within 24 hours of applying.",
      "Use quantified STAR metrics (%, $, time saved) in every resume bullet.",
      "Use follow-up scripts 5 days post-application to stay top of mind.",
    ],
  },
  {
    number: "05",
    title: "AI Interview Question Predictor",
    subtitle: "Practice top predicted questions & STAR feedback",
    description:
      "Predict high-probability technical, behavioral, and skills gap interview questions generated specifically from the job description and your resume gaps. Practice your answers with real-time AI feedback.",
    actionText: "Start Interview Prep",
    actionHref: "/dashboard/interview",
    icon: "🎙️",
    badge: "Step 5",
    tips: [
      "Review the recruiter rationale behind every question to understand what they test.",
      "Structure all behavioral answers using Situation, Task, Action, Result.",
      "Practice your 60-second elevator pitch for 'Tell me about yourself'.",
    ],
  },
  {
    number: "06",
    title: "ATS PDF Export & Daily Search Sprint",
    subtitle: "Download 100% ATS PDF & track daily routine",
    description:
      "Export your optimized resume text into a clean single-column PDF engineered for 100% ATS readability. Track your daily search goals (applications, outreaches, prep) and active applications on your kanban board.",
    actionText: "Open ATS Builder",
    actionHref: "/dashboard/builder",
    icon: "📥",
    badge: "Step 6",
    tips: [
      "Hit your daily targets: 3 applications, 2 cold outreaches, 1 prep session.",
      "Maintain your daily streak to stay consistent and avoid job search burnout.",
      "Export clean PDFs directly without re-typing into Word or Canva.",
    ],
  },
];

const FEATURE_TABS = [
  {
    id: "outreach",
    name: "Outreach Studio",
    icon: "✉️",
    title: "Application Booster & Cold Outreach Studio",
    description:
      "Generate job-tailored cover letters, 250-character LinkedIn connection notes, recruiter cold emails, 5-day follow-up scripts, and 60-second elevator pitches in seconds.",
    highlights: [
      "1-Click Cover Letter tailored to JD & Resume",
      "LinkedIn Connection Request Note (<300 chars)",
      "Recruiter Cold Email & Subject Line Pitch",
      "STAR Method Bullet Point Rewriter",
    ],
  },
  {
    id: "interview",
    name: "Interview Studio",
    icon: "🎙️",
    title: "AI Interview Question Predictor & STAR Practice",
    description:
      "Predict high-probability interview questions customized to the target JD and candidate background with real-time STAR framework evaluation.",
    highlights: [
      "Technical, Behavioral & Gap Questions",
      "Recruiter Intent & Rationale Explanations",
      "Interactive STAR Answer Practice Box",
      "Real-time AI Feedback & Score Improvement",
    ],
  },
  {
    id: "builder",
    name: "ATS PDF Builder",
    icon: "📥",
    title: "One-Click ATS-Friendly PDF Resume Generator",
    description:
      "Edit and export single-column ATS-friendly PDF resumes directly without complex formatting tools breaking ATS scannability.",
    highlights: [
      "100% ATS-readable single-column layout",
      "Plain text / Markdown inline editor",
      "Instant PDF download via PDFKit engine",
      "Pre-loaded from parsed resume data",
    ],
  },
  {
    id: "skillbridge",
    name: "Skill-Bridging",
    icon: "🎓",
    title: "Free Course Links & Micro-Project Blueprints",
    description:
      "Automatically maps missing hard skills from ATS audits to free learning resources and 48-hour weekend portfolio project ideas.",
    highlights: [
      "Free YouTube & FreeCodeCamp crash course links",
      "Weekend portfolio project blueprints",
      "GitHub starter repo search shortcuts",
      "Remediates missing keyword gaps fast",
    ],
  },
  {
    id: "sprint",
    name: "Daily Sprint",
    icon: "🔥",
    title: "Daily Job Search Discipline & Accountability",
    description:
      "Gamify your daily job search routine with structured target counters, streak milestones, and follow-up reminders.",
    highlights: [
      "Daily targets: 3 Apps, 2 Outreaches, 1 Prep",
      "Streak counter & streak protection",
      "Integrated into the main dashboard",
      "Prevents job hunter fatigue & burnout",
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
              href="/dashboard/analyze"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 font-bold text-sm text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
            >
              Start Free ATS Scan →
            </Link>
            <Link
              href="/dashboard/outreach"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-md font-bold text-sm text-white transition-all"
            >
              Open Outreach Studio ✉️
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive 6-Step Guide */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            The 6-Step Job Landing Workflow
          </h2>
          <p className="text-sm text-slate-500">
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
                    : "bg-white text-slate-700 border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-lg font-bold ${isActive ? "text-white" : "text-slate-400"}`}>
                    {step.number}
                  </span>
                  <span className="text-lg">{step.icon}</span>
                </div>
                <p className={`text-xs font-bold line-clamp-1 ${isActive ? "text-white" : "text-slate-900"}`}>
                  {step.title}
                </p>
              </button>
            );
          })}
        </div>

        {/* Step Detail Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-extrabold rounded-full">
                {currentStep.badge}
              </span>
              <span className="text-xs font-semibold text-slate-400">Step {activeStep + 1} of 6</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>{currentStep.icon}</span>
                <span>{currentStep.title}</span>
              </h3>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                {currentStep.subtitle}
              </p>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
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
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200/70 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
              <span>💡 Pro Tips for {currentStep.badge}</span>
            </div>

            <ul className="space-y-3">
              {currentStep.tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Platform Feature Deep Dive
          </h2>
          <p className="text-sm text-slate-500">
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
                    ? "bg-slate-900 text-white shadow-md"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
              href="/dashboard/analyze"
              className="block w-full py-3 bg-white text-indigo-950 font-bold text-xs rounded-xl hover:bg-indigo-50 transition-colors shadow-md"
            >
              Get Started Now →
            </Link>
          </div>
        </div>
      </div>

      {/* Numbers & User Reviews */}
      <StatsAndReviewsSection />
    </div>
  );
}
