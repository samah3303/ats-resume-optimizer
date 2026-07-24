"use client";

import { useState } from "react";
import Link from "next/link";

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
    subtitle: "Extract structured data instantly",
    description:
      "Upload your existing resume in PDF or DOCX format. Our parser extracts work history, education, hard skills, soft skills, and contact info while highlighting formatting compatibility.",
    actionText: "Upload Resume",
    actionHref: "/dashboard/resumes",
    icon: "📄",
    badge: "Step 1",
    tips: [
      "Use clear, single-column layouts for maximum ATS readability.",
      "Avoid tables, text boxes, and complex graphics in your uploaded file.",
      "Ensure text is select-able (not scanned image PDFs).",
    ],
  },
  {
    number: "02",
    title: "Target Job Description",
    subtitle: "Define your dream role",
    description:
      "Paste the full job posting text including title, company name, and requirements. ResuMatch breaks down the target keywords, required technical skills, and experience level expected.",
    actionText: "Add Job Posting",
    actionHref: "/dashboard/jds",
    icon: "🎯",
    badge: "Step 2",
    tips: [
      "Include both core job requirements and preferred qualifications.",
      "Keep original formatting or line breaks intact when pasting.",
      "Add company culture and industry keywords if specified.",
    ],
  },
  {
    number: "03",
    title: "Run AI ATS Analysis",
    subtitle: "Calculate score & identify gaps",
    description:
      "Select your parsed resume and a saved job description to run a comprehensive ATS audit. Get an instant match score (0-100%) along with keyword gap analysis and impact ratings.",
    actionText: "Run ATS Scan",
    actionHref: "/dashboard/analyze",
    icon: "🔍",
    badge: "Step 3",
    tips: [
      "Aim for an overall ATS Match Score of 75% or higher before applying.",
      "Pay special attention to missing hard skills & domain keywords.",
      "Review the section-by-section breakdown for formatting flags.",
    ],
  },
  {
    number: "04",
    title: "Optimize & Track Applications",
    subtitle: "Apply recommendations & land interviews",
    description:
      "Incorporate suggested rewrites and missing keywords into your bullet points. Save customized resume versions, export analysis reports, and track application stages in your kanban board.",
    actionText: "Open Tracker",
    actionHref: "/dashboard/tracker",
    icon: "📈",
    badge: "Step 4",
    tips: [
      "Quantify achievements using metrics and metrics-driven action verbs.",
      "Tailor your resume for each unique job application.",
      "Keep track of application deadlines, interview dates, and contacts.",
    ],
  },
];

const FEATURE_TABS = [
  {
    id: "resume",
    name: "Resume Scanner",
    icon: "📄",
    title: "Intelligent Resume Parsing & Formatting Check",
    description:
      "Upload resumes in PDF/DOCX. Our AI engine parses structured sections, detects table or text-box hazards, flags missing contact info, and organizes skills into categorized taxonomies.",
    highlights: [
      "Multi-format support (PDF, DOCX)",
      "Section detection (Experience, Education, Skills)",
      "ATS formatting hazard warnings",
      "Parsed skill taxonomy extraction",
    ],
  },
  {
    id: "matcher",
    name: "ATS JD Matcher",
    icon: "🎯",
    title: "Deep Keyword & Experience Gap Analysis",
    description:
      "Compare your resume directly against real job postings. Uncover missing technical terms, soft skills, required certifications, and experience level mismatches.",
    highlights: [
      "Overall ATS Score (0-100%)",
      "Missing vs Matching hard & soft skills",
      "Action verb frequency audit",
      "Contextual bullet point rewrite recommendations",
    ],
  },
  {
    id: "roadmap",
    name: "AI Career Roadmap",
    icon: "🛣️",
    title: "Personalized Weekly Action Strategy",
    description:
      "Get a customized weekly game plan aligned with your target country, industry, and role. Learn what skills to sharpen and how to structure your LinkedIn profile.",
    highlights: [
      "Weekly milestone action checklists",
      "LinkedIn summary & headline suggestions",
      "Regional market skill priorities",
      "Core competencies gap closure",
    ],
  },
  {
    id: "tracker",
    name: "Application Tracker",
    icon: "💼",
    title: "Kanban Job Application Pipeline",
    description:
      "Organize all your job applications in one central dashboard. Track stages from Applied to Interviewing, Offer, and Rejected while keeping detailed notes.",
    highlights: [
      "Drag-and-drop status stages",
      "Linked resume versions per application",
      "Interview dates & follow-up notes",
      "Success rate analytics",
    ],
  },
];

const FAQS = [
  {
    question: "What is an ATS (Applicant Tracking System)?",
    answer:
      "An Applicant Tracking System (ATS) is software used by employers to collect, scan, score, and rank job applications. Over 90% of Fortune 500 companies use ATS tools (like Greenhouse, Lever, Workday) to filter out resumes that lack required keywords or proper formatting before a human recruiter ever sees them.",
  },
  {
    question: "What is a good ATS Match Score?",
    answer:
      "We recommend aiming for a match score of 75% or higher. A score above 75% indicates strong keyword alignment, clear section organization, and high probability of passing automated screening filters.",
  },
  {
    question: "Can I upload multiple versions of my resume?",
    answer:
      "Yes! You can upload and store multiple resume variations (e.g. Frontend Developer, Full-Stack Engineer, Technical Lead) in your account and test each against different job descriptions.",
  },
  {
    question: "How does the AI generate resume rewrite suggestions?",
    answer:
      "Our AI analyzes the job description's key requirements and evaluates how your resume phrases accomplishments. It then suggests bullet point improvements incorporating missing keywords while retaining your original experience.",
  },
  {
    question: "Are my uploaded resumes and job descriptions kept secure?",
    answer:
      "Yes. Your data is stored securely and is only accessible through your authenticated account. We do not sell or publicly share your resume data.",
  },
];

export default function HowToUseSection() {
  const [activeTab, setActiveTab] = useState("resume");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-8 md:p-12 shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -top-12 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-indigo-200 text-xs font-semibold uppercase tracking-wider border border-white/15">
            ✨ Quick Start & User Guide
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            How to Use <span className="text-indigo-300">ResuMatch</span> ATS Optimizer
          </h1>
          <p className="text-indigo-100/90 text-base md:text-lg leading-relaxed max-w-2xl">
            Master the step-by-step process of parsing your resume, matching against job postings, fixing ATS keyword gaps, and tracking your job search success.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard/analyze"
              className="px-6 py-3 rounded-xl bg-white text-indigo-950 font-semibold hover:bg-indigo-50 transition-all shadow-md flex items-center gap-2 text-sm"
            >
              <span>⚡ Start ATS Analysis</span>
            </Link>
            <Link
              href="/dashboard/resumes"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 transition-all text-sm"
            >
              📄 Upload Resume
            </Link>
          </div>
        </div>
      </div>

      {/* 4-Step Workflow Section */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            4-Step Optimization Workflow
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            Follow these four simple steps to convert any resume into an ATS-proof application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 hover:shadow-lg transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-2xl">
                    {step.icon}
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {step.badge}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Tips */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1">
                    💡 Pro Tips:
                  </span>
                  <ul className="space-y-1.5">
                    {step.tips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2"
                      >
                        <span className="text-indigo-500 shrink-0">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4">
                <Link
                  href={step.actionHref}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  <span>{step.actionText}</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Deep Dive Tabs */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Feature Deep Dive
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base">
            Explore the core features designed to accelerate your job search.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {FEATURE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        {FEATURE_TABS.filter((t) => t.id === activeTab).map((tab) => (
          <div
            key={tab.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-2 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  <span>{tab.icon}</span>
                  <span>{tab.name} Overview</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {tab.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {tab.description}
                </p>

                <div className="pt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Key Highlights & Capabilities
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tab.highlights.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
                      >
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0 text-xs">
                          ✓
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-800/50 dark:to-slate-800/20 p-6 border border-slate-200/80 dark:border-slate-800 space-y-4">
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Ready to test {tab.name}?
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Jump right into the app and start optimizing your resume and applications today.
                </p>
                <Link
                  href={
                    tab.id === "resume"
                      ? "/dashboard/resumes"
                      : tab.id === "matcher"
                      ? "/dashboard/analyze"
                      : tab.id === "roadmap"
                      ? "/dashboard"
                      : "/dashboard/tracker"
                  }
                  className="block text-center w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm"
                >
                  Open {tab.name} →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Frequently Asked Questions */}
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Everything you need to know about ATS optimization and ResuMatch.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-sm md:text-base transition-colors"
                >
                  <span>{faq.question}</span>
                  <span
                    className={`ml-4 transform transition-transform duration-200 text-slate-400 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-0 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-4 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
