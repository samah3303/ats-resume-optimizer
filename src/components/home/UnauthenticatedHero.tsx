import Link from "next/link";
import StatsAndReviewsSection from "@/components/StatsAndReviewsSection";
import Logo from "@/components/Logo";

export default function UnauthenticatedHero() {
  const PLATFORM_MODULES = [
    {
      id: "resume-studio",
      tag: "CANDIDATE SUITE",
      title: "ATS Resume Studio & 6+ Template Gallery",
      description:
        "Build pixel-perfect, ATS-verified resumes with 6 curated design templates, STAR bullet rewriters, and 1-click vector optimization.",
      icon: "📄",
      href: "/dashboard/builder",
      highlights: ["6 Curated ATS Templates", "STAR Method Enhancer", "Vector ATS Pre-Flight Scan", "PDF & DOCX Exports"],
    },
    {
      id: "coding-sandbox",
      tag: "ENGINEERING SUITE",
      title: "In-Browser Coding Challenge Sandbox",
      description:
        "Multi-language coding playground in JavaScript, TypeScript, and Python with live unit test assertions and automated Big-O complexity analysis.",
      icon: "💻",
      href: "/dashboard/challenges",
      highlights: ["Multi-Language Monaco Editor", "Automated Assertion Runner", "Big-O Time/Space Analyzer", "Runtime & Memory Benchmarks"],
    },
    {
      id: "voice-interviewer",
      tag: "AI ROLEPLAY",
      title: "Conversational Spoken Mock Interviewer",
      description:
        "Practice real-time spoken interviews across 8 personas with live audio waveforms, speech cadence tracking, and post-session diagnostic scorecards.",
      icon: "🎙️",
      href: "/dashboard/mock-interview",
      highlights: ["8 Stage Persona Modes", "Real-Time Web Speech Audio", "Live Audio Waveform Canvas", "Turn-by-Turn STAR Coaching"],
    },
    {
      id: "recruiter-os",
      tag: "HR & RECRUITING",
      title: "Recruiter Talent Operating System",
      description:
        "All-in-one recruiting pipeline with AI job description generation, 8-stage candidate Kanban boards, and bulk AI ATS candidate screening.",
      icon: "👔",
      href: "/dashboard/recruiter",
      highlights: ["AI Job Description Architect", "8-Stage Pipeline Kanban", "Bulk Candidate ATS Screener", "Multi-Criteria Scorecards"],
    },
    {
      id: "job-hub",
      tag: "JOB DISCOVERY",
      title: "Multi-Platform Semantic Job Aggregator",
      description:
        "Unified job stream aggregating listings across major platforms with 384-dimensional pgvector resume semantic matching.",
      icon: "🔍",
      href: "/dashboard/jobs",
      highlights: ["Unified Multi-Board Aggregator", "pgvector Semantic Match %", "Salary Transparency Radar", "1-Click Bookmark & Track"],
    },
    {
      id: "negotiation-war-room",
      tag: "COMPENSATION",
      title: "Salary Negotiation War Room & Offer Comparator",
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
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-32 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-100 border border-zinc-300 text-zinc-900 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
            <span>⚡</span> THE UNIVERSAL AI CAREER & TALENT OPERATING SYSTEM
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-black leading-[1.08]">
            One Unified Platform for Your{" "}
            <span className="underline decoration-black decoration-3 underline-offset-8">
              Entire Career Lifecycle.
            </span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-zinc-600 max-w-3xl mx-auto leading-relaxed font-medium">
            From <strong className="text-black">ATS Resume Engineering</strong> & <strong className="text-black">In-Browser Coding Sandboxes</strong> to <strong className="text-black">Conversational Spoken Mock Interviews</strong>, <strong className="text-black">Recruiter Talent Pipelines</strong>, and <strong className="text-black">Salary Negotiation War Rooms</strong>.
          </p>

          {/* Dual Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
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
              <span>Launch Recruiter Talent OS</span>
            </Link>
          </div>

          {/* Pillar Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6 text-xs text-zinc-700">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full font-bold text-black shadow-xs">
              📄 ATS Resume Studio
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full font-bold text-black shadow-xs">
              💻 Coding Sandbox & Big-O
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full font-bold text-black shadow-xs">
              🎙️ Spoken Voice Mock Interviews
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full font-bold text-black shadow-xs">
              👔 Recruiter Pipeline Kanban
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full font-bold text-black shadow-xs">
              💰 Salary War Room
            </span>
          </div>
        </div>
      </section>

      {/* Platform Ecosystem Architecture Grid */}
      <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 border-b border-zinc-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-black uppercase rounded-full tracking-wider shadow-sm">
              🛠️ FULL-SPECTRUM CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black tracking-tight">
              The Complete 1-Stop AI Command Center
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600">
              Explore the interconnected tools powering candidates and recruiters through every phase of the hiring process.
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
                      Core Modules:
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

                <Link
                  href={mod.href}
                  className="touch-target w-full py-2.5 bg-zinc-50 hover:bg-black hover:text-white border border-zinc-200 hover:border-black rounded-xl text-xs font-black text-black transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>Launch Tool</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why KYRO Differs From Competitors */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-300 text-xs font-black uppercase rounded-full tracking-wider shadow-sm">
              ⚔️ ARCHITECTURAL SUPERIORITY
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-black">
              Generic Point Solutions vs. <span className="underline decoration-zinc-400">KYRO Ecosystem</span>
            </h2>
            <p className="text-xs text-zinc-600">
              Why stitching together 5 fragmented tools fails while KYRO delivers a seamless, end-to-end talent workflow.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm text-xs">
              <thead>
                <tr className="bg-zinc-100 text-black text-left border-b border-zinc-200">
                  <th className="p-4 font-extrabold uppercase tracking-wider">Capability</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-zinc-500">Fragmented Point Apps</th>
                  <th className="p-4 font-extrabold uppercase tracking-wider text-black bg-zinc-50">KYRO Unified Ecosystem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {[
                  {
                    feature: "Unified Talent Ecosystem",
                    generic: "Separate paywalled apps for resume, jobs, coding, and mock interviews",
                    kyro: "All 1-stop: Resume Studio, Coding Sandbox, Spoken Voice Mocks, Recruiter OS",
                  },
                  {
                    feature: "Spoken Voice Mock Interviews",
                    generic: "Static text lists of 5 generic behavioral questions",
                    kyro: "8 Spoken Persona Modes with live audio waveforms & STAR coaching",
                  },
                  {
                    feature: "In-Browser Technical Sandbox",
                    generic: "External link to LeetCode / HackerRank with no resume sync",
                    kyro: "Multi-language editor with unit assertions & automated Big-O analyzer",
                  },
                  {
                    feature: "Recruiter & Candidate Symmetry",
                    generic: "Candidate-only tools that ignore how recruiters screen",
                    kyro: "Full Recruiter OS with AI Job Architect, 8-stage Kanban & ATS scorecards",
                  },
                  {
                    feature: "Salary Negotiation War Room",
                    generic: "Vague crowdsourced salary averages with no roleplay",
                    kyro: "4-Year Equity Vesting schedules & live AI Recruiter negotiation bot",
                  },
                  {
                    feature: "Pricing Transparency",
                    generic: "High recurring paywalls ($29–$59/month)",
                    kyro: "100% Free full access for job seekers and candidates",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4 font-bold text-black">{row.feature}</td>
                    <td className="p-4 text-zinc-500">{row.generic}</td>
                    <td className="p-4 font-bold text-black bg-zinc-50/50">
                      ✓ {row.kyro}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Social Proof & Numbers */}
      <StatsAndReviewsSection />

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="md" />

          <p className="text-xs text-zinc-500 text-center sm:text-right">
            &copy; {new Date().getFullYear()} <strong>KYRO AI</strong>. The Universal Career & Talent Operating System.
            <br />
            Built with ❤️ for job seekers and hiring teams worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}
