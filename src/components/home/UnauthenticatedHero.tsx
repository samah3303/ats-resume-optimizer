import Link from "next/link";
import StatsAndReviewsSection from "@/components/StatsAndReviewsSection";
import Logo from "@/components/Logo";
import { LiveHeroDemoWidget } from "./LiveHeroDemoWidget";

export default function UnauthenticatedHero() {
  const PLATFORM_MODULES = [
    {
      id: "resume-studio",
      tag: "RESUME STUDIO",
      title: "ATS Resume Builder & 6 Pro Templates",
      description:
        "Build pixel-perfect, ATS-verified resumes with 6 design templates, inline STAR metric rewriters, and instant PDF/DOCX downloads.",
      icon: "📄",
      href: "/dashboard/builder",
      highlights: ["6 Tested ATS Templates", "STAR Metric Diff Enhancer", "Target Keyword Checklist", "Instant PDF & DOCX Export"],
    },
    {
      id: "coding-sandbox",
      tag: "CODING IDE",
      title: "In-Browser Coding Practice & Big-O Analyzer",
      description:
        "Full Monaco IDE in JS, TS, and Python with live unit test assertions, pointer visualizers, and instant Big-O complexity feedback.",
      icon: "💻",
      href: "/dashboard/challenges",
      highlights: ["Multi-Language Monaco IDE", "Step Pointer Visualizer", "Big-O Time/Space Reviewer", "Runtime & Memory Profiling"],
    },
    {
      id: "voice-interviewer",
      tag: "VOICE COACH",
      title: "Live Spoken Mock Interviews & Audio Waveforms",
      description:
        "Practice realistic spoken interviews across 8 personas with live audio waveforms, filler-word tracking, and instant STAR scorecards.",
      icon: "🎙️",
      href: "/dashboard/mock-interview",
      highlights: ["8 Interviewer Personas", "Real-Time Audio Waveforms", "Filler-Word Counter HUD", "Turn-by-Turn STAR Coaching"],
    },
    {
      id: "video-analytics",
      tag: "VIDEO PRESENCE",
      title: "Webcam Gaze & Executive Composure Coach",
      description:
        "Camera HUD tracking real-time eye contact directness, posture stability, and executive presence to ensure you look confident.",
      icon: "👁️",
      href: "/dashboard/video-analytics",
      highlights: ["Direct Eye Contact %", "Posture Stability Meter", "Lighting Pre-Flight Check", "Executive Presence Report"],
    },
    {
      id: "job-hub",
      tag: "JOB RADAR",
      title: "Smart Job Discovery & Autonomous Hunter Swarm",
      description:
        "Automatically scan 140k+ live job openings, match your exact skills, and generate tailored application packets 24/7.",
      icon: "🤖",
      href: "/dashboard/agents",
      highlights: ["Autonomous Hunter Agent", "Skill Match Accuracy", "Salary Surge Insights", "1-Click Tracker Sync"],
    },
    {
      id: "negotiation-war-room",
      tag: "SALARY WAR ROOM",
      title: "Salary Negotiation Simulator & 4-Year Equity",
      description:
        "Calculate 4-year total compensation with equity vesting curves, simulate live negotiations against an AI recruiter bot, and compare competing offers.",
      icon: "💰",
      href: "/dashboard/offers",
      highlights: ["4-Year Equity Vesting Schedules", "Live AI Recruiter Roleplay", "Secret Coach Win-Rate Predictor", "Multi-Offer Decision Matrix"],
    },
  ];

  return (
    <div className="flex flex-col bg-white text-zinc-950 font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-16 md:py-24 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-100 border border-zinc-300 text-zinc-900 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <span>⚡</span> THE 1-STOP AI CAREER & TALENT OPERATING SYSTEM
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black leading-[1.08]">
            Land Your Dream Job Faster — Powered by{" "}
            <span className="underline decoration-black decoration-3 underline-offset-8">
              Your All-in-One AI Suite.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Beat ATS screening bots with 6 tailored resume templates, practice live spoken mock interviews with dynamic coaching, and auto-discover high-paying roles 24/7.
          </p>

          {/* Primary Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="touch-target w-full sm:w-auto px-8 py-4 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-2xl transition-all shadow-md border border-black flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Explore Candidate Suite Free</span>
              <span>&rarr;</span>
            </Link>
            <Link
              href="/dashboard/recruiter"
              className="touch-target w-full sm:w-auto px-8 py-4 border border-zinc-300 bg-white text-black hover:bg-zinc-100 font-bold text-xs rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
            >
              <span>👔</span>
              <span>For Hiring & Recruiter Teams</span>
            </Link>
          </div>

          {/* Interactive Live Hero Demo */}
          <div className="pt-6">
            <LiveHeroDemoWidget />
          </div>
        </div>
      </section>

      {/* Platform Ecosystem Architecture Grid */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-black uppercase rounded-full tracking-wider shadow-sm">
              🛠️ EVERYTHING YOU NEED TO GET HIRED
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight">
              Six Specialized AI Engines in One Clean Command Center
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              No more juggling 6 different subscriptions for resumes, LeetCode, mock interviews, and job trackers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_MODULES.map((mod) => (
              <div
                key={mod.id}
                className="p-6 sm:p-8 bg-white border border-zinc-200 hover:border-black rounded-3xl space-y-5 transition-all shadow-sm flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-2xl shadow-sm group-hover:scale-105 transition-transform">
                      {mod.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {mod.tag}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-black text-black group-hover:text-black">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                      Key Highlights:
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-800 font-medium">
                      {mod.highlights.map((h, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="text-black font-black text-[10px]">✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-100">
                  <Link
                    href={mod.href}
                    className="touch-target w-full py-2.5 bg-zinc-50 hover:bg-black hover:text-white border border-zinc-300 rounded-xl text-xs font-black text-black transition-all flex items-center justify-center gap-1.5 shadow-2xs group-hover:border-black"
                  >
                    <span>Launch Module</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural Superiority Matrix */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-black uppercase rounded-full tracking-wider shadow-sm">
              ⚡ ARCHITECTURAL SUPERIORITY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              Why KYRO Outperforms Fragmented Single-Purpose Tools
            </h2>
          </div>

          <div className="border border-zinc-300 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-300 text-black">
                  <th className="p-4 sm:p-5 font-black uppercase tracking-wider">Capability</th>
                  <th className="p-4 sm:p-5 font-black uppercase tracking-wider text-black bg-zinc-200/60">
                    KYRO AI System
                  </th>
                  <th className="p-4 sm:p-5 font-bold uppercase tracking-wider text-zinc-500">
                    Legacy Job Sites / Tools
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-medium">
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-black">ATS Resume Studio</td>
                  <td className="p-4 sm:p-5 text-black font-bold bg-zinc-50/50">
                    ✓ 6 Templates + Inline STAR Diff Rewriter + Vector Scan
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Basic static PDF builder without AI metric diffs</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-black">Coding & System Design</td>
                  <td className="p-4 sm:p-5 text-black font-bold bg-zinc-50/50">
                    ✓ In-Browser Monaco IDE + Big-O Analyzer + SVG Whiteboard
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Separate subscription required (LeetCode / Excalidraw)</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-black">Interview Preparation</td>
                  <td className="p-4 sm:p-5 text-black font-bold bg-zinc-50/50">
                    ✓ Spoken Voice Mocks (8 Personas) + Video Composure HUD
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Text-only static question lists</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-black">Salary Negotiation</td>
                  <td className="p-4 sm:p-5 text-black font-bold bg-zinc-50/50">
                    ✓ 4-Year Equity Curves + AI Recruiter Roleplay Simulator
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Static self-reported averages without simulation</td>
                </tr>
                <tr>
                  <td className="p-4 sm:p-5 font-bold text-black">Autonomous Search</td>
                  <td className="p-4 sm:p-5 text-black font-bold bg-zinc-50/50">
                    ✓ Hunter Agent Swarm + 1-Click Application Tracker Sync
                  </td>
                  <td className="p-4 sm:p-5 text-zinc-500">Manual copy-pasting into spreadsheets</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Social Proof & Testimonials */}
      <StatsAndReviewsSection />

      {/* Bottom Final CTA */}
      <section className="py-20 md:py-28 px-4 text-center bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-3xl mx-auto space-y-6">
          <Logo size="lg" />
          <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tight">
            Ready to Take Control of Your Career?
          </h2>
          <p className="text-sm text-zinc-600 max-w-xl mx-auto leading-relaxed">
            Join thousands of ambitious engineers and professionals using KYRO to master interviews and secure top-tier compensation.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="touch-target inline-flex items-center gap-2 px-10 py-4 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-2xl transition-all shadow-lg border border-black active:scale-95"
            >
              <span>Get Started Free — No Credit Card Needed</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
