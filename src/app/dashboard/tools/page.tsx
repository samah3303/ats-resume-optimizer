"use client";

import Link from "next/link";

interface ToolTile {
  title: string;
  category: string;
  description: string;
  emoji: string;
  href: string;
  badge?: string;
}

const TOOLS: ToolTile[] = [
  {
    title: "Application Kanban Tracker",
    category: "Job Pipeline",
    description: "Drag-and-drop Kanban tracker (Wishlist, Applied, Interviewing, Offer) to organize your active job search.",
    emoji: "📊",
    href: "/dashboard/tracker",
    badge: "Tracker",
  },
  {
    title: "System Guide & Walkthrough",
    category: "Onboarding",
    description: "Step-by-step playbook explaining how ResuMatch Multi-Agent AI turns automated rejections into interview calls.",
    emoji: "📖",
    href: "/dashboard/how-to-use",
    badge: "Guide",
  },
  {
    title: "Resume Vault",
    category: "Asset Management",
    description: "Upload and parse PDF/DOCX resumes to extract skills, experience, and formatting risk.",
    emoji: "📄",
    href: "/dashboard/resumes",
    badge: "Essential",
  },
  {
    title: "Target Job Descriptions",
    category: "Targeting",
    description: "Store target job postings, paste requirements, or extract job details directly from links.",
    emoji: "🎯",
    href: "/dashboard/jds",
    badge: "Targeting",
  },
  {
    title: "Outreach & Cover Studio",
    category: "Applications",
    description: "Generate tailored cover letters, LinkedIn cold notes (<300 chars), and cold emails.",
    emoji: "✉️",
    href: "/dashboard/outreach",
    badge: "AI Powered",
  },
  {
    title: "AI Interview Prep",
    category: "Interviews",
    description: "Predict top behavioral, technical, and gap questions tailored to your target job posting.",
    emoji: "🎙️",
    href: "/dashboard/interview",
    badge: "Mock Prep",
  },
  {
    title: "ATS Resume Builder",
    category: "Export & Editing",
    description: "Download clean, scannable single-column PDF resumes engineered for ATS algorithms.",
    emoji: "📥",
    href: "/dashboard/builder",
    badge: "PDF Export",
  },
  {
    title: "Batch Job Comparison",
    category: "Analytics",
    description: "Compare your primary resume against multiple job descriptions to find best match fits.",
    emoji: "📊",
    href: "/dashboard/compare",
    badge: "Multi-Scan",
  },
];

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 sm:p-8 text-white shadow-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <span>🧩 Features Directory</span>
            <span>•</span>
            <span>All ResuMatch Tools</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            All Tools & Features Hub
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
            Access your Application Kanban Tracker, System Guide, Outreach Generators, Stage-Wise Interview Coach, and Batch Job Comparison tools.
          </p>
        </div>

        {/* Primary Hero Feature Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Link
            href="/dashboard/studio"
            className="p-6 rounded-3xl bg-gradient-to-br from-[#14161D] via-[#1C1F2B] to-[#090A0C] border border-amber-500/30 text-white shadow-xl hover:border-amber-500 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
                Primary Core Feature 1
              </span>
              <span className="text-2xl">⚡</span>
            </div>
            <h2 className="text-xl font-black mt-3 text-white group-hover:text-amber-400 transition-colors">
              1-Click Application Studio
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Run ATS scans, paste job URLs, apply inline STAR bullet fixes, and sync applications.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>Launch Studio</span>
              <span>→</span>
            </div>
          </Link>

          <Link
            href="/dashboard/roadmap"
            className="p-6 rounded-3xl bg-gradient-to-br from-[#14161D] via-[#1C1F2B] to-[#090A0C] border border-amber-500/30 text-white shadow-xl hover:border-amber-500 transition-all group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
                Primary Core Feature 2
              </span>
              <span className="text-2xl">🗺️</span>
            </div>
            <h2 className="text-xl font-black mt-3 text-white group-hover:text-amber-400 transition-colors">
              2-Month Career Roadmap
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Your step-by-step 8-week execution plan to fix ATS gaps and land your target job.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-black text-amber-400 group-hover:translate-x-1 transition-transform">
              <span>View 8-Week Roadmap</span>
              <span>→</span>
            </div>
          </Link>
        </div>

        {/* Secondary Tool Tile Grid */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">
            Secondary Utilities & Tools
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="bg-[#14161D]/80 backdrop-blur-xl border border-[#242834] hover:border-amber-500/40 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="w-10 h-10 rounded-2xl bg-[#090A0C] text-xl flex items-center justify-center shrink-0 border border-[#242834]">
                      {tool.emoji}
                    </span>
                    {tool.badge && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    {tool.category}
                  </span>
                  <h3 className="text-sm font-black text-white mt-1 group-hover:text-amber-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed font-medium">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#242834] flex items-center justify-between text-xs font-black text-amber-400">
                  <span>Open Tool</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
