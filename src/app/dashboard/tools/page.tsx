"use client";

import Link from "next/link";

interface ToolTile {
  title: string;
  category: string;
  description: string;
  emoji: string;
  href: string;
  badge?: string;
  gradient: string;
}

const TOOLS: ToolTile[] = [
  {
    title: "Resume Vault",
    category: "Asset Management",
    description: "Upload and parse PDF/DOCX resumes to extract skills, experience, and formatting risk.",
    emoji: "📄",
    href: "/dashboard/resumes",
    badge: "Essential",
    gradient: "from-blue-600 to-indigo-600",
  },
  {
    title: "Target Job Descriptions",
    category: "Targeting",
    description: "Store target job postings, paste requirements, or extract job details directly from links.",
    emoji: "🎯",
    href: "/dashboard/jds",
    badge: "Targeting",
    gradient: "from-emerald-600 to-teal-600",
  },
  {
    title: "Outreach & Cover Studio",
    category: "Applications",
    description: "Generate tailored cover letters, LinkedIn cold notes (<300 chars), and cold emails.",
    emoji: "✉️",
    href: "/dashboard/outreach",
    badge: "AI Powered",
    gradient: "from-purple-600 to-indigo-600",
  },
  {
    title: "AI Interview Prep",
    category: "Interviews",
    description: "Predict top behavioral, technical, and gap questions tailored to your target job posting.",
    emoji: "🎙️",
    href: "/dashboard/interview",
    badge: "Mock Prep",
    gradient: "from-amber-600 to-orange-600",
  },
  {
    title: "ATS Resume Builder",
    category: "Export & Editing",
    description: "Download clean, scannable single-column PDF resumes engineered for ATS algorithms.",
    emoji: "📥",
    href: "/dashboard/builder",
    badge: "PDF Export",
    gradient: "from-indigo-600 to-cyan-600",
  },
  {
    title: "Batch Job Comparison",
    category: "Analytics",
    description: "Compare your primary resume against multiple job descriptions to find best match fits.",
    emoji: "📊",
    href: "/dashboard/compare",
    badge: "Multi-Scan",
    gradient: "from-rose-600 to-pink-600",
  },
  {
    title: "System Guide & Walkthrough",
    category: "Onboarding",
    description: "Comprehensive 6-step system walkthrough to maximize interviews and job offers.",
    emoji: "📖",
    href: "/dashboard/how-to-use",
    badge: "Guide",
    gradient: "from-slate-700 to-slate-900",
  },
];

export default function ToolsHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
          <span>🧩 Features Directory</span>
          <span>•</span>
          <span>All ResuMatch Tools</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
          All Tools & Features
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl">
          Access all secondary optimization tools, resume vault management, outreach studios, interview prep predictors, and scannable PDF export builders.
        </p>
      </div>

      {/* Primary Hero Feature Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/studio"
          className="p-6 rounded-3xl bg-gradient-to-r from-indigo-700 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20">
              Primary Core Feature 1
            </span>
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="text-xl font-black mt-3">1-Click Application Studio</h2>
          <p className="text-xs text-indigo-100 mt-1">
            Run ATS scans, paste job URLs, apply inline STAR bullet fixes, and sync applications.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
            <span>Launch Studio</span>
            <span>→</span>
          </div>
        </Link>

        <Link
          href="/dashboard/roadmap"
          className="p-6 rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-600 text-white shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/20">
              Primary Core Feature 2
            </span>
            <span className="text-2xl">🗺️</span>
          </div>
          <h2 className="text-xl font-black mt-3">2-Month Career Roadmap</h2>
          <p className="text-xs text-emerald-100 mt-1">
            Your step-by-step 8-week execution plan to fix ATS gaps and land your target job.
          </p>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
            <span>View 8-Week Roadmap</span>
            <span>→</span>
          </div>
        </Link>
      </div>

      {/* Secondary Tool Tile Grid (2 columns on mobile, 3 on desktop) */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
          Secondary Utilities & Tools
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xl flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                    {tool.emoji}
                  </span>
                  {tool.badge && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {tool.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed font-medium">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Open Tool</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
