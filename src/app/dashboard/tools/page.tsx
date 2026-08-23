"use client";

import Link from "next/link";

interface ToolExplanation {
  title: string;
  category: string;
  emoji: string;
  href: string;
  badge?: string;
  why: string;
  what: string;
  how: string;
}

const TOOLS: ToolExplanation[] = [
  {
    title: "2-Month Career Roadmap",
    category: "Career Execution",
    emoji: "🗺️",
    href: "/dashboard/roadmap",
    badge: "Core Plan",
    why: "Job seekers often fail because they lack a structured weekly plan to fix skill gaps and target high-match roles.",
    what: "A personalized 8-week step-by-step action plan generated specifically for your target role and industry.",
    how: "Open the roadmap, follow the weekly tasks (Week 1-8), and mark items complete as you build your career portfolio.",
  },
  {
    title: "Resume Vault",
    category: "Asset Management",
    emoji: "📄",
    href: "/dashboard/resumes",
    badge: "Essential",
    why: "ATS parsers reject resumes with bad columns, headers, tables, or unreadable fonts.",
    what: "A secure storage hub for your resume versions with automatic text & layout parsing.",
    how: "Upload your PDF or DOCX file, set one as your Primary Baseline resume, and view parsed plain text.",
  },
  {
    title: "Target Job Descriptions",
    category: "Job Search",
    emoji: "💼",
    href: "/dashboard/jds",
    badge: "Targeting",
    why: "Tailoring your resume requires knowing the exact keywords recruiters and ATS scanners look for.",
    what: "A library where you can save job postings, paste requirement text, or extract job details from URLs.",
    how: "Paste a job link or text to save it, then run an instant ATS match scan against any saved resume.",
  },
  {
    title: "Outreach & Cover Letter Studio",
    category: "Application Boost",
    emoji: "✉️",
    href: "/dashboard/outreach",
    badge: "AI Generator",
    why: "Generic cover letters get ignored. Personal cold messages get 3x higher response rates from hiring managers.",
    what: "Tailored Cover Letters, LinkedIn Connection Notes (<300 chars), and Cold Email Templates.",
    how: "Select a job description, choose Outreach or Cover Letter mode, click Generate, and copy the text.",
  },
  {
    title: "AI Interview Coach",
    category: "Interview Prep",
    emoji: "🎙️",
    href: "/dashboard/interview",
    badge: "Mock Prep",
    why: "Getting an interview is only half the battle. You need clear STAR-format answers to pass hiring rounds.",
    what: "Predicted behavioral, technical, and resume-gap interview questions customized for your target job.",
    how: "Select your target job, generate interview questions, and practice your STAR answers using AI feedback.",
  },
  {
    title: "Application Kanban Tracker",
    category: "Pipeline Management",
    emoji: "📊",
    href: "/dashboard/tracker",
    badge: "Tracker",
    why: "Applying to dozens of jobs without tracking leads to missed follow-ups and chaotic job searches.",
    what: "A visual Kanban board divided into Wishlist, Applied, Interviewing, and Offer columns.",
    how: "Add job applications to your board and drag cards across columns as you move through interview stages.",
  },
  {
    title: "ATS Resume Builder",
    category: "Export & Editing",
    emoji: "📥",
    href: "/dashboard/builder",
    badge: "PDF Export",
    why: "Complex graphic design templates fail ATS scans. Clean, single-column formatting guarantees 100% readability.",
    what: "A clean, scannable single-column PDF resume generated directly from your optimized text.",
    how: "Edit your bullet points in the builder preview, select your layout settings, and download your ATS PDF.",
  },
  {
    title: "Batch Job Comparison",
    category: "Multi-Scan Analytics",
    emoji: "⚡",
    href: "/dashboard/compare",
    badge: "Multi-Scan",
    why: "You need to know which job postings match your skills best before spending time applying.",
    what: "A side-by-side comparison score grid ranking your primary resume against multiple job descriptions.",
    how: "Select 2-5 saved job descriptions, run batch comparison, and prioritize applying to roles with 75%+ scores.",
  },
  {
    title: "Recruiter Command Center",
    category: "Talent & Hiring",
    emoji: "👔",
    href: "/dashboard/recruiter",
    badge: "Recruiter AI",
    why: "Recruiters and hiring managers need autonomous ATS resume screening, 8-stage Kanban pipelines, and structured interview scorecards.",
    what: "An end-to-end recruitment studio featuring AI batch screening, stage distributions, and 1-click candidate advancement.",
    how: "Post job openings, view incoming applicants, execute AI ATS screenings, and move candidates through interview stages.",
  },
];

export default function ToolsHubPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-[#18181B] rounded-3xl border border-[#27272A] p-6 sm:p-8 text-[#FAFAFA] shadow-sm space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#27272A] text-[#FAFAFA] border border-[#27272A]">
            <span>🧩 Features Directory</span>
            <span>•</span>
            <span>Simple Guides &amp; Tools</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#FAFAFA]">
            All KYRO Tools &amp; Features
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed font-medium">
            Every tool is designed to solve a specific barrier in your job search. Below is what each tool does, why you need it, and how to use it in simple terms.
          </p>
        </div>

        {/* Tools Tile Grid with Why? What? How? */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TOOLS.map((tool) => (
            <div
              key={tool.title}
              className="bg-[#18181B] border border-[#27272A] hover:border-zinc-400 rounded-3xl p-6 text-[#FAFAFA] shadow-sm transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 rounded-2xl bg-[#27272A] text-2xl flex items-center justify-center shrink-0 border border-[#27272A]">
                      {tool.emoji}
                    </span>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        {tool.category}
                      </span>
                      <h2 className="text-lg font-black text-[#FAFAFA]">{tool.title}</h2>
                    </div>
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#27272A] text-[#FAFAFA] border border-[#27272A] shrink-0">
                      {tool.badge}
                    </span>
                  )}
                </div>

                {/* Why? What? How? Section */}
                <div className="space-y-3 text-xs">
                  {/* Why */}
                  <div className="p-3 bg-[#09090B] rounded-2xl border border-[#27272A] space-y-1">
                    <span className="font-bold text-rose-800 uppercase tracking-wider text-[10px] block">
                      ❓ Why Use This?
                    </span>
                    <p className="text-zinc-300 font-medium leading-relaxed">{tool.why}</p>
                  </div>

                  {/* What */}
                  <div className="p-3 bg-[#09090B] rounded-2xl border border-[#27272A] space-y-1">
                    <span className="font-bold text-[#FAFAFA] uppercase tracking-wider text-[10px] block">
                      💡 What Is It?
                    </span>
                    <p className="text-zinc-300 font-medium leading-relaxed">{tool.what}</p>
                  </div>

                  {/* How */}
                  <div className="p-3 bg-[#09090B] rounded-2xl border border-[#27272A] space-y-1">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider text-[10px] block">
                      🚀 How To Use It?
                    </span>
                    <p className="text-zinc-300 font-medium leading-relaxed">{tool.how}</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={tool.href}
                  className="w-full py-3 px-4 bg-black hover:bg-zinc-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 group shadow-sm border border-black"
                >
                  <span>Open {tool.title}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
