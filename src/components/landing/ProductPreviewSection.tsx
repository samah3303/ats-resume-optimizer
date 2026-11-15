"use client";

import React, { useState } from "react";
import Link from "next/link";

interface SlideData {
  id: string;
  tabLabel: string;
  badge: string;
  title: string;
  description: string;
  url: string;
}

const SLIDES: SlideData[] = [
  {
    id: "dashboard",
    tabLabel: "Dashboard & ATS Funnel",
    badge: "AI Resume & Analytics",
    title: "ATS Optimization & Application Funnel",
    description: "Get real-time feedback on keyword density, ATS compliance, and monitor your interview conversion funnel.",
    url: "https://paniund.com/dashboard",
  },
  {
    id: "job-detail",
    tabLabel: "Job Detail & AI Cover Letter",
    badge: "1-Click Generation",
    title: "Tailored Job Matching & Cover Letters",
    description: "Compare your resume against any job requirement, inspect matched keywords, and generate bespoke cover letters in seconds.",
    url: "https://paniund.com/dashboard/jobs/senior-fullstack-dev",
  },
  {
    id: "tracker",
    tabLabel: "Kanban Pipeline Tracker",
    badge: "Visual Search Management",
    title: "Interactive Application Board",
    description: "Drag and drop applications across Wishlist, Applied, Interviewing, and Offer stages with interview dates and notes.",
    url: "https://paniund.com/dashboard/tracker",
  },
];

export default function ProductPreviewSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
  };

  const current = SLIDES[activeSlide];

  return (
    <section id="preview" className="py-12 sm:py-16 lg:py-20 bg-nordic-bg border-t border-nordic-border overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-nordic-border rounded-full text-[11px] font-semibold text-nordic-primary mb-3 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-nordic-primary" />
            Product Preview
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-nordic-text">
            See what&apos;s inside
          </h2>
          <p className="text-sm sm:text-base text-nordic-text-secondary mt-2">
            Your entire job search, organized in one workspace.
          </p>
        </div>

        {/* Carousel Tabs Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6 sm:mb-8">
          {SLIDES.map((slide, index) => {
            const isActive = activeSlide === index;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveSlide(index)}
                className={`px-3.5 py-2 rounded-[4px] text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? "bg-nordic-primary text-white shadow-xs"
                    : "bg-white text-nordic-text-secondary border border-nordic-border hover:border-nordic-primary hover:text-nordic-primary"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-nordic-secondary" : "bg-nordic-border"
                  }`}
                />
                {slide.tabLabel}
              </button>
            );
          })}
        </div>

        {/* Browser Mockup Window Carousel Track */}
        <div className="relative max-w-5xl mx-auto">
          {/* Controls: Left & Right Floaters */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous preview"
            className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-nordic-border text-nordic-text hover:bg-nordic-bg hover:border-nordic-primary hover:text-nordic-primary shadow-md items-center justify-center cursor-pointer transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next preview"
            className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border border-nordic-border text-nordic-text hover:bg-nordic-bg hover:border-nordic-primary hover:text-nordic-primary shadow-md items-center justify-center cursor-pointer transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Viewport Container */}
          <div className="rounded-[8px] border border-nordic-border bg-white shadow-lg overflow-hidden">
            {/* Window Chrome / Title Bar */}
            <div className="bg-[#EBEBEB] border-b border-nordic-border px-4 py-2.5 flex items-center justify-between gap-3">
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] inline-block" />
              </div>

              {/* Fake Address Bar */}
              <div className="flex-1 max-w-md mx-auto">
                <div className="bg-white border border-nordic-border rounded-[4px] px-3 py-1 flex items-center gap-2 text-[11px] font-mono text-nordic-text-secondary shadow-2xs">
                  <span className="text-nordic-success text-[10px]">🔒</span>
                  <span className="truncate">{current.url}</span>
                </div>
              </div>

              {/* Right Window Controls Hint */}
              <div className="text-[11px] font-mono font-bold text-nordic-neutral shrink-0 hidden sm:block">
                paniund UI
              </div>
            </div>

            {/* Carousel Horizontal Sliding Track */}
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {/* SLIDE 1: Dashboard Mockup */}
              <div className="w-full shrink-0 bg-nordic-bg p-3 sm:p-5 lg:p-6 min-h-[460px] sm:min-h-[500px]">
                <div className="space-y-4 text-left">
                  {/* Dashboard Inner App Bar */}
                  <div className="bg-white border border-nordic-border rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-nordic-secondary text-nordic-primary font-black text-xs rounded-[3px] flex items-center justify-center">
                        P.
                      </div>
                      <div>
                        <div className="text-xs font-bold text-nordic-text">Alex Johnson</div>
                        <div className="text-[10px] text-nordic-neutral">Senior Full Stack Developer • Dubai / Remote</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-nordic-success/10 border border-nordic-success/20 text-nordic-success rounded-[3px] text-[10px] font-bold">
                        ● 4 Active Applications
                      </span>
                      <span className="nordic-btn-yellow text-[10px] py-1 px-2.5 font-bold rounded-[3px]">
                        + Add Job
                      </span>
                    </div>
                  </div>

                  {/* Main Grid: ATS Score Tile + Funnel Analytics Tile */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* ATS Score Tile (5 cols) */}
                    <div className="md:col-span-5 bg-white border border-nordic-border rounded-[4px] p-4 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-nordic-primary">
                            ATS Resume Score
                          </span>
                          <span className="px-2 py-0.5 rounded-[2px] bg-nordic-success/10 text-nordic-success text-[10px] font-bold">
                            Strong Fit
                          </span>
                        </div>

                        <div className="flex items-center gap-4 my-2">
                          <div className="w-18 h-18 rounded-full bg-nordic-primary text-white flex flex-col items-center justify-center border-4 border-nordic-secondary shadow-xs shrink-0">
                            <span className="text-2xl font-black font-mono leading-none">88</span>
                            <span className="text-[9px] uppercase tracking-wider text-white/80 font-bold">/ 100</span>
                          </div>
                          <div>
                            <div className="text-xs font-bold text-nordic-text">Passes 94% of Top ATS Filters</div>
                            <div className="text-[11px] text-nordic-text-secondary mt-0.5 leading-snug">
                              Optimized for Taleo, Workday & Greenhouse parsers.
                            </div>
                          </div>
                        </div>

                        {/* Breakdown Bars */}
                        <div className="space-y-1.5 mt-3 pt-3 border-t border-nordic-border text-[11px]">
                          <div className="flex justify-between font-medium">
                            <span className="text-nordic-text-secondary">Keyword Match</span>
                            <span className="font-mono font-bold text-nordic-success">92%</span>
                          </div>
                          <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-nordic-success h-full rounded-full" style={{ width: "92%" }} />
                          </div>

                          <div className="flex justify-between font-medium pt-1">
                            <span className="text-nordic-text-secondary">ATS Formatting</span>
                            <span className="font-mono font-bold text-nordic-primary">96%</span>
                          </div>
                          <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-nordic-primary h-full rounded-full" style={{ width: "96%" }} />
                          </div>

                          <div className="flex justify-between font-medium pt-1">
                            <span className="text-nordic-text-secondary">Impact Metrics</span>
                            <span className="font-mono font-bold text-nordic-primary">84%</span>
                          </div>
                          <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                            <div className="bg-nordic-primary h-full rounded-full" style={{ width: "84%" }} />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-nordic-border flex items-center justify-between text-[11px]">
                        <span className="text-nordic-neutral">Resume: Alex_Johnson_FullStack.pdf</span>
                        <span className="text-nordic-primary font-bold hover:underline cursor-pointer">
                          Optimize +8% &rarr;
                        </span>
                      </div>
                    </div>

                    {/* Application Funnel Tile (7 cols) */}
                    <div className="md:col-span-7 bg-white border border-nordic-border rounded-[4px] p-4 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-nordic-primary block">
                              Application Funnel
                            </span>
                            <span className="text-[11px] text-nordic-neutral">
                              Interview conversion & velocity metrics
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-[2px] bg-nordic-success/10 text-nordic-success text-[10px] font-bold">
                            Top 10% Benchmark 🌟
                          </span>
                        </div>

                        {/* Funnel Flow Visual */}
                        <div className="grid grid-cols-3 gap-2 py-2">
                          <div className="bg-nordic-bg border border-nordic-border rounded-[4px] p-2.5 text-center">
                            <span className="text-[10px] uppercase font-bold text-nordic-neutral block">Applied</span>
                            <span className="text-xl font-bold font-mono text-nordic-primary">24</span>
                            <span className="text-[10px] text-nordic-success font-semibold block mt-0.5">+5 this week</span>
                          </div>

                          <div className="bg-nordic-primary/5 border border-nordic-primary/20 rounded-[4px] p-2.5 text-center">
                            <span className="text-[10px] uppercase font-bold text-nordic-primary block">Interviews</span>
                            <span className="text-xl font-bold font-mono text-nordic-primary">6</span>
                            <span className="text-[10px] text-nordic-primary font-bold block mt-0.5">25.0% Rate</span>
                          </div>

                          <div className="bg-nordic-success/10 border border-nordic-success/20 rounded-[4px] p-2.5 text-center">
                            <span className="text-[10px] uppercase font-bold text-nordic-success block">Offers</span>
                            <span className="text-xl font-bold font-mono text-nordic-success">2</span>
                            <span className="text-[10px] text-nordic-success font-bold block mt-0.5">33.3% Win</span>
                          </div>
                        </div>

                        {/* Recent Matched Openings preview */}
                        <div className="mt-3 pt-3 border-t border-nordic-border space-y-2">
                          <div className="text-[11px] font-bold text-nordic-text uppercase tracking-wider">
                            Latest Matched Vacancies
                          </div>
                          <div className="flex items-center justify-between p-2 bg-[#F9FAFB] border border-nordic-border rounded-[3px] text-xs">
                            <div>
                              <span className="font-bold text-nordic-text">Senior Full Stack Developer</span>
                              <span className="text-nordic-neutral text-[11px] block">Confidential • Ras al-Khaimah (AED 15,000/mo)</span>
                            </div>
                            <span className="font-mono font-bold text-nordic-primary bg-white border border-nordic-border px-2 py-0.5 rounded-[2px] text-[11px]">
                              92% Match
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-[#F9FAFB] border border-nordic-border rounded-[3px] text-xs">
                            <div>
                              <span className="font-bold text-nordic-text">Staff Backend Engineer</span>
                              <span className="text-nordic-neutral text-[11px] block">Careem • Dubai, UAE (AED 32,000/mo)</span>
                            </div>
                            <span className="font-mono font-bold text-nordic-primary bg-white border border-nordic-border px-2 py-0.5 rounded-[2px] text-[11px]">
                              89% Match
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 2: Job Detail & AI Cover Letter Mockup */}
              <div className="w-full shrink-0 bg-nordic-bg p-3 sm:p-5 lg:p-6 min-h-[460px] sm:min-h-[500px]">
                <div className="space-y-4 text-left">
                  {/* Job Detail Header Card */}
                  <div className="bg-white border border-nordic-border rounded-[4px] p-4 shadow-2xs">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded-[2px] bg-nordic-primary text-white font-mono text-[10px] font-bold">
                            INDEED
                          </span>
                          <span className="text-xs font-bold text-nordic-neutral">Careem Technologies</span>
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-nordic-text">
                          Senior Full Stack Developer (PHP/Laravel & React)
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-nordic-text-secondary mt-1.5">
                          <span>📍 Dubai, UAE</span>
                          <span>💰 AED 22,000 - 28,000 / month</span>
                          <span>💼 Full-time</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-[10px] uppercase font-bold text-nordic-neutral">ATS Match</div>
                          <div className="font-mono text-lg font-black text-nordic-success">92%</div>
                        </div>
                        <span className="h-8 px-3 rounded-[3px] bg-nordic-success text-white text-xs font-bold flex items-center justify-center">
                          ✓ Applied
                        </span>
                      </div>
                    </div>

                    {/* Sub Navigation Tabs */}
                    <div className="flex items-center gap-1 mt-4 pt-3 border-t border-nordic-border overflow-x-auto text-xs font-bold">
                      <span className="px-3 py-1.5 text-nordic-neutral">
                        Job Overview
                      </span>
                      <span className="px-3 py-1.5 bg-nordic-primary text-white rounded-[3px]">
                        ✨ AI Cover Letter
                      </span>
                      <span className="px-3 py-1.5 text-nordic-neutral">
                        Resume Bullet Rewrites (+4)
                      </span>
                      <span className="px-3 py-1.5 text-nordic-neutral">
                        Follow-up Email
                      </span>
                    </div>
                  </div>

                  {/* AI Generated Cover Letter Document & Analysis Pane */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* The Generated Letter Paper (8 cols) */}
                    <div className="md:col-span-8 bg-white border border-nordic-border rounded-[4px] p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-nordic-border">
                        <div className="flex items-center gap-1.5 text-[11px] text-nordic-success font-bold">
                          <span>✓ Tailored to Careem JD</span>
                          <span className="text-nordic-neutral">• 342 words</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-[11px] font-bold border border-nordic-border rounded-[3px] bg-white">
                            Copy Text
                          </span>
                          <span className="px-2.5 py-1 text-[11px] font-bold bg-nordic-secondary text-nordic-primary rounded-[3px]">
                            Export PDF
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2.5 text-xs text-[#222222] font-serif leading-relaxed bg-[#FAFAFA] p-4 rounded-[4px] border border-[#EEEEEE]">
                        <p className="font-sans text-[11px] text-nordic-neutral">
                          Dear Hiring Team at Careem,
                        </p>
                        <p>
                          I am writing to express my strong enthusiasm for the Senior Full Stack Developer position. With over six years architecting high-throughput Laravel microservices and modern React user interfaces, my experience directly maps to your requirements for scaling distributed mobility and fintech platforms across the MENA region.
                        </p>
                        <p>
                          In my recent role, I led the complete overhaul of our backend API infrastructure, improving query latency by 35% across 2M daily requests and building real-time event streaming pipelines. I thrive at the intersection of robust backend performance and seamless user experiences.
                        </p>
                        <p>
                          I welcome the opportunity to discuss how my technical expertise can support Careem&apos;s upcoming platform initiatives.
                        </p>
                        <p className="font-sans text-[11px] font-bold text-nordic-text pt-1">
                          Sincerely,<br />Alex Johnson
                        </p>
                      </div>
                    </div>

                    {/* Right Keywords & Skills Match (4 cols) */}
                    <div className="md:col-span-4 bg-white border border-nordic-border rounded-[4px] p-4 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-nordic-primary mb-2">
                          Matched Keywords (6/6)
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {["PHP", "Laravel", "React", "REST APIs", "MySQL", "Docker"].map((sk) => (
                            <span key={sk} className="px-2 py-0.5 rounded-[3px] bg-nordic-success/10 text-nordic-success font-bold text-[10px]">
                              ✓ {sk}
                            </span>
                          ))}
                        </div>

                        <div className="text-[11px] font-bold uppercase tracking-wider text-nordic-neutral mb-1.5 pt-2 border-t border-nordic-border">
                          Optimization Suggestion
                        </div>
                        <p className="text-[11px] text-nordic-text-secondary leading-snug">
                          Your resume includes all core tech competencies. Add 1 bullet highlighting team mentorship to hit 95% match.
                        </p>
                      </div>

                      <div className="pt-3 border-t border-nordic-border">
                        <span className="w-full h-8 bg-nordic-primary text-white rounded-[3px] text-xs font-bold flex items-center justify-center">
                          Regenerate with New Tone &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SLIDE 3: Application Tracker Board Mockup */}
              <div className="w-full shrink-0 bg-nordic-bg p-3 sm:p-5 lg:p-6 min-h-[460px] sm:min-h-[500px]">
                <div className="space-y-4 text-left">
                  {/* Tracker Board Header */}
                  <div className="bg-white border border-nordic-border rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                    <div>
                      <div className="text-xs font-bold text-nordic-text">Job Application Pipeline</div>
                      <div className="text-[10px] text-nordic-neutral">Drag-and-drop workflow across your active recruitment cycles</div>
                    </div>

                    {/* Funnel Ribbon */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                      <span className="px-2 py-0.5 bg-nordic-bg border border-nordic-border rounded-[3px] text-nordic-text-secondary">
                        Wishlist: 6
                      </span>
                      <span className="px-2 py-0.5 bg-nordic-primary/10 border border-nordic-primary/20 rounded-[3px] text-nordic-primary">
                        Applied: 12
                      </span>
                      <span className="px-2 py-0.5 bg-nordic-secondary text-nordic-text rounded-[3px]">
                        Interviewing: 4
                      </span>
                      <span className="px-2 py-0.5 bg-nordic-success text-white rounded-[3px]">
                        Offer: 2
                      </span>
                    </div>
                  </div>

                  {/* Kanban Columns Grid (4 columns) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Column 1: Wishlist */}
                    <div className="bg-[#EBEBEB]/60 border border-nordic-border rounded-[4px] p-2.5 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-nordic-border">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-nordic-text-secondary">
                          Wishlist (6)
                        </span>
                        <span className="text-[10px] text-nordic-neutral">★</span>
                      </div>

                      <div className="bg-white border border-nordic-border rounded-[4px] p-2.5 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-[#0077D6]">BAYT</span>
                          <span className="text-[10px] font-bold text-nordic-primary font-mono">88%</span>
                        </div>
                        <div className="text-xs font-bold text-nordic-text">AI Engineer</div>
                        <div className="text-[10px] text-nordic-neutral">Durlston Partners • Abu Dhabi</div>
                        <div className="text-[10px] font-bold text-nordic-success pt-1">AED 25,000 / mo</div>
                      </div>

                      <div className="bg-white border border-nordic-border rounded-[4px] p-2.5 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-[#0077B5]">LINKEDIN</span>
                          <span className="text-[10px] font-bold text-nordic-primary font-mono">85%</span>
                        </div>
                        <div className="text-xs font-bold text-nordic-text">Lead Frontend Dev</div>
                        <div className="text-[10px] text-nordic-neutral">Noon • Dubai, UAE</div>
                        <div className="text-[10px] font-bold text-nordic-success pt-1">AED 28,000 / mo</div>
                      </div>
                    </div>

                    {/* Column 2: Applied */}
                    <div className="bg-[#EBEBEB]/60 border border-nordic-border rounded-[4px] p-2.5 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-nordic-border">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-nordic-primary">
                          Applied (12)
                        </span>
                        <span className="text-[10px] text-nordic-primary">✓</span>
                      </div>

                      <div className="bg-white border-l-3 border-l-nordic-primary border-t border-r border-b border-nordic-border rounded-[4px] p-2.5 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-nordic-primary">INDEED</span>
                          <span className="text-[10px] font-bold text-nordic-success font-mono">92%</span>
                        </div>
                        <div className="text-xs font-bold text-nordic-text">Senior Full Stack Dev</div>
                        <div className="text-[10px] text-nordic-neutral">Confidential • Ras al-Khaimah</div>
                        <div className="text-[10px] text-nordic-primary pt-1 font-semibold">Applied 2d ago</div>
                      </div>

                      <div className="bg-white border border-nordic-border rounded-[4px] p-2.5 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-nordic-success">NAUKRI</span>
                          <span className="text-[10px] font-bold text-nordic-primary font-mono">89%</span>
                        </div>
                        <div className="text-xs font-bold text-nordic-text">Full Stack Web Specialist</div>
                        <div className="text-[10px] text-nordic-neutral">Bayt Tech • Dubai</div>
                        <div className="text-[10px] text-nordic-primary pt-1 font-semibold">Applied 4d ago</div>
                      </div>
                    </div>

                    {/* Column 3: Interviewing */}
                    <div className="bg-nordic-secondary/10 border border-nordic-secondary/30 rounded-[4px] p-2.5 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-nordic-secondary/40">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#B45309]">
                          Interviewing (4)
                        </span>
                        <span className="text-[10px] text-[#B45309]">⚡</span>
                      </div>

                      <div className="bg-white border-2 border-nordic-primary rounded-[4px] p-2.5 shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-nordic-primary">CAREEM</span>
                          <span className="text-[10px] font-bold text-nordic-success font-mono">94%</span>
                        </div>
                        <div className="text-xs font-bold text-nordic-text">Senior Backend Engineer</div>
                        <div className="text-[10px] text-nordic-neutral">Dubai, UAE • AED 30k/mo</div>
                        <div className="px-1.5 py-0.5 rounded-[2px] bg-nordic-primary/10 text-nordic-primary text-[10px] font-bold mt-1 inline-block">
                          🗓️ Tech Round: Tomorrow 2 PM
                        </div>
                      </div>

                      <div className="bg-white border border-nordic-border rounded-[4px] p-2.5 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-nordic-neutral">TALABAT</span>
                          <span className="text-[10px] font-bold text-nordic-primary font-mono">91%</span>
                        </div>
                        <div className="text-xs font-bold text-nordic-text">Principal Platform Lead</div>
                        <div className="text-[10px] text-nordic-neutral">Dubai, UAE</div>
                        <div className="text-[10px] text-[#B45309] font-bold pt-1">🗓️ Final Round: Friday</div>
                      </div>
                    </div>

                    {/* Column 4: Offer */}
                    <div className="bg-nordic-success/10 border border-nordic-success/30 rounded-[4px] p-2.5 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-nordic-success/40">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-nordic-success">
                          Offer (2)
                        </span>
                        <span className="text-[10px] text-nordic-success">🎉</span>
                      </div>

                      <div className="bg-white border-2 border-nordic-success rounded-[4px] p-2.5 shadow-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-nordic-success">STRIPE MENA</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] bg-nordic-secondary text-nordic-text">
                            OFFER RECEIVED
                          </span>
                        </div>
                        <div className="text-xs font-bold text-nordic-text">Staff Platform Architect</div>
                        <div className="text-[10px] text-nordic-neutral">Dubai, UAE</div>
                        <div className="text-xs font-black text-nordic-success pt-1">
                          AED 38,000 / month
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card Summary & Quick Direct Action */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-nordic-text-secondary px-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-nordic-text">{current.title}</span>
              <span className="hidden sm:inline text-nordic-neutral">—</span>
              <span className="hidden sm:inline text-nordic-neutral">{current.description}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Slide pagination dots */}
              <div className="flex items-center gap-1.5">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      activeSlide === i ? "w-6 bg-nordic-primary" : "w-2.5 bg-nordic-border hover:bg-[#999999]"
                    }`}
                  />
                ))}
              </div>

              <Link
                href="/login"
                className="text-nordic-primary font-bold hover:underline flex items-center gap-1"
              >
                Experience Live Demo &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
