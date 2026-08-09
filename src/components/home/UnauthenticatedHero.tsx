import Link from "next/link";
import StatsAndReviewsSection from "@/components/StatsAndReviewsSection";

export default function UnauthenticatedHero() {
  return (
    <div className="flex flex-col bg-[#090A0C] text-white">
      {/* Main Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-28 bg-gradient-to-b from-[#090A0C] via-[#12141C] to-[#090A0C] border-b border-[#242834]">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider">
            ⚡ 100% Free Multi-Agent AI + RAG + ML Engine
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Make Your Resume{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
              Unstoppable
            </span>
          </h1>

          <p className="text-sm md:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            75% of resumes are rejected by ATS bots before a human sees them. ResuMatch uses{" "}
            <strong className="text-amber-300">6 AI agents</strong>, RAG semantic search, and ML score prediction to analyze,
            rewrite, and optimize every line — so you reach <strong className="text-amber-400">75-80%+ ATS match score</strong> on every application and land more interviews.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-zinc-300">
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#14161D] border border-[#242834] rounded-full font-bold text-amber-300">
              🧠 6 Multi-Agent AI
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#14161D] border border-[#242834] rounded-full font-bold text-amber-300">
              🔍 384-Dim RAG Search
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#14161D] border border-[#242834] rounded-full font-bold text-amber-300">
              📊 ML Score Predictor
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#14161D] border border-[#242834] rounded-full font-bold text-amber-300">
              🎯 Stage-Wise Interview Coach
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg shadow-amber-500/20"
            >
              Get Started Free →
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 border border-[#242834] bg-[#14161D] text-amber-300 hover:text-white font-bold text-xs rounded-xl hover:bg-[#1C1F2B] transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Founder's Story, Mission & Vision Section */}
      <section className="py-20 px-4 bg-[#0D0E11] border-b border-[#242834]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black uppercase rounded-full tracking-wider">
              ❤️ Our Founder&apos;s Story & Mission
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Built From <span className="text-amber-400">8 Months</span> of Job Hunt Struggle
            </h2>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              ResuMatch was not born in a corporate boardroom. It was created out of deep frustration with a broken hiring system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* The Founder's Journey */}
            <div className="p-8 bg-[#14161D] rounded-3xl border border-[#242834] space-y-4 flex flex-col justify-between shadow-xl">
              <div className="space-y-3">
                <div className="text-3xl">💔</div>
                <h3 className="text-lg font-black text-amber-300">The 8-Month Search & LinkedIn Outcry</h3>
                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                  &quot;I personally spent <strong className="text-amber-300">8 agonizing months searching for a job</strong>. Despite having solid technical skills, 90% of my applications vanished into black-box ATS algorithms, resulting in automated rejection emails or total silence.
                </p>
                <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
                  Every week, dozens of skilled developers reached out on LinkedIn asking: <em>&apos;Why no interview calls? Why instant rejection emails?&apos;</em> Seeing thousands of talented people suffer convinced me to build a real solution.&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-[#242834] text-xs font-bold text-amber-400">
                — ResuMatch Founder & Engineer
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="p-8 bg-[#14161D] rounded-3xl border border-[#242834] space-y-6 flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎯</span> Our Mission
                  </span>
                  <h4 className="text-base font-black text-white">Ensure Every Qualified Job Seeker Lands Interview Calls</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    To eliminate unfair automated rejection algorithms by giving candidates enterprise-grade AI tools to optimize their resumes for every application.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌟</span> Our Commitment
                  </span>
                  <h4 className="text-base font-black text-white">100% Free Access for Job Seekers</h4>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Even though multi-agent AI and RAG vector searches cost real server resources, ResuMatch is kept <strong className="text-amber-300">100% FREE for job seekers</strong> right now so no candidate suffers in silence.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 font-bold">
                🚀 Over 10,000+ job applications optimized across the UAE, India, US, and EU.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How To Section: 4-Step Job Landing Workflow */}
      <section className="py-20 px-4 bg-[#090A0C] border-b border-[#242834]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black uppercase rounded-full tracking-wider">
              📖 How ResuMatch Works
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              The 4-Step System to Beat ATS & Land Interviews
            </h2>
            <p className="text-xs text-zinc-400">
              From onboarding to your final CEO interview round — step-by-step guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: "📄",
                title: "Upload & Baseline",
                desc: "Upload your primary resume. AI auto-extracts your skills, experience, country, and target roles, establishing your General ATS baseline score.",
              },
              {
                step: "02",
                icon: "🗺️",
                title: "8-Week Roadmap",
                desc: "Get an interactive 8-week execution plan with DB-persisted checkboxes, task progress tracking, and matched 50-60% real job openings.",
              },
              {
                step: "03",
                icon: "⚡",
                title: "1-Click Studio (75-80%+)",
                desc: "Paste JD URLs into 1-Click Application Studio for every job application. Tweak bullet points until your score reaches 75%–80%+.",
              },
              {
                step: "04",
                icon: "🎯",
                title: "Interview Q&A Models",
                desc: "Filter interview practice by round (HR, Technical, Coding, CEO). Get high-scoring STAR model answers and key talking points.",
              },
            ].map((s) => (
              <div key={s.step} className="p-6 rounded-2xl border border-[#242834] bg-[#14161D] space-y-3 hover:border-amber-500/50 transition-all shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    Step {s.step}
                  </span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="text-sm font-bold text-amber-300">{s.title}</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why We Differ From Competitors */}
      <section className="py-20 px-4 bg-[#0D0E11] border-b border-[#242834]">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black uppercase rounded-full tracking-wider">
              ⚔️ Why ResuMatch Differs
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Generic Resume Scanners vs. <span className="text-amber-400">ResuMatch</span>
            </h2>
            <p className="text-xs text-zinc-400">
              Why candidates using single-prompt AI get rejected while ResuMatch users land 4x more interviews.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-[#14161D] rounded-2xl border border-[#242834] overflow-hidden shadow-xl text-xs">
              <thead>
                <tr className="bg-[#090A0C] text-amber-300 text-left border-b border-[#242834]">
                  <th className="p-4 font-black uppercase tracking-wider">Feature & Capability</th>
                  <th className="p-4 font-black uppercase tracking-wider text-zinc-500">Generic Resume Wrappers</th>
                  <th className="p-4 font-black uppercase tracking-wider text-amber-400 bg-amber-500/10">ResuMatch Multi-Agent Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#242834]">
                {[
                  {
                    feature: "AI Processing Architecture",
                    generic: "Single-prompt ChatGPT API wrapper (hallucinates)",
                    resumatch: "6 Multi-Agent AI Pipeline with self-verification",
                  },
                  {
                    feature: "Semantic Search Depth",
                    generic: "Basic exact keyword text count matching",
                    resumatch: "384-Dimensional pgvector RAG Embedding Search",
                  },
                  {
                    feature: "Job Matching Engine",
                    generic: "Scrapes random internet job listings",
                    resumatch: "Recommends active jobs matching 50-60% of primary resume",
                  },
                  {
                    feature: "Career Growth Roadmap",
                    generic: "Static text dump with no progress tracking",
                    resumatch: "Interactive 8-Week Roadmap with DB-persisted checkboxes",
                  },
                  {
                    feature: "Interview Preparation",
                    generic: "Generic static list of 5 basic questions",
                    resumatch: "Stage-Wise Coach (HR, Tech, CEO) with STAR Model Answers",
                  },
                  {
                    feature: "Pricing & Access",
                    generic: "Paywalled ($19–$39/mo subscriptions)",
                    resumatch: "100% Free Access for candidates right now",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#1C1F2B] transition-colors">
                    <td className="p-4 font-bold text-white">{row.feature}</td>
                    <td className="p-4 text-zinc-400">{row.generic}</td>
                    <td className="p-4 font-bold text-amber-300 bg-amber-500/10">
                      ✓ {row.resumatch}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ATS Truths & 75-80%+ Rule Highlight Section */}
      <section className="py-16 px-4 bg-[#090A0C] text-white border-b border-[#242834]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-black uppercase rounded-full">
              ⚠️ The Job Search Reality Check
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Why 75% of Resumes Are Scrapped by Bots Before a Recruiter Sees Them
            </h2>
            <p className="text-xs md:text-sm text-zinc-300 leading-relaxed">
              Applying to 100s of jobs without tailoring your resume is like playing the lottery. Here is how modern Applicant Tracking Systems work and how to beat them every single time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-[#14161D] rounded-2xl border border-[#242834] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-base border border-amber-500/30">
                1
              </div>
              <h3 className="text-base font-black text-amber-300">The Auto-Rejection Cutoff</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Most enterprise ATS platforms (Workday, Taleo, Greenhouse) use automated score filters. Resumes matching under 65% trigger automated rejection emails within 2 to 24 hours — zero human eyes involved.
              </p>
            </div>

            <div className="p-6 bg-[#14161D] rounded-2xl border border-[#242834] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-base border border-amber-500/30">
                2
              </div>
              <h3 className="text-base font-black text-amber-300">The Black Hole Effect</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                A single posting gets 300+ applications. Recruiters rank candidates by ATS match score and only open the top 10–15 candidates (top 5%). The remaining 90% sit in the database unread forever.
              </p>
            </div>

            <div className="p-6 bg-[#14161D] rounded-2xl border border-[#242834] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-base border border-amber-500/30">
                3
              </div>
              <h3 className="text-base font-black text-amber-300">The 75%–80%+ Golden Rule</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Never send a generic resume. Run our 1-Click Studio on every job posting and tweak keywords until your score reaches <strong className="text-amber-300">75%–80%+</strong>. Candidates hitting 75%+ land 4x more interview invites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 bg-[#0D0E11] border-b border-[#242834]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center text-white mb-3">
            Everything You Need to Land the Job
          </h2>
          <p className="text-center text-xs text-zinc-400 mb-12 max-w-xl mx-auto">
            From baseline analysis to salary negotiation — one platform, zero effort.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "🧠",
                title: "Multi-Agent ATS Analysis",
                desc: "6 AI agents work together — extract requirements, map skills, find gaps, rewrite bullets, and self-verify. 5-step pipeline beats single-prompt AI.",
                tag: "Core",
              },
              {
                icon: "🔍",
                title: "RAG Semantic Matching",
                desc: "Vector embeddings compare your resume with job descriptions at a deep semantic level. Catches synonyms, context, and skill relationships that keyword matching misses.",
                tag: "New",
              },
              {
                icon: "📊",
                title: "ML Score Predictor",
                desc: "Instant ATS score from 12 resume features — no API call needed. Trained on real analysis data, improves with every scan. Get explainable, consistent scores.",
                tag: "New",
              },
              {
                icon: "🎯",
                title: "Stage-Wise Interview Coach",
                desc: "Tailored by interview round (HR, Technical, Coding, CEO). Get high-scoring STAR model answers and key talking points.",
                tag: "New",
              },
              {
                icon: "🗺️",
                title: "8-Week Career Roadmap",
                desc: "Personalized week-by-week plan with interactive DB-persisted checkboxes and task completion progress tracking.",
              },
              {
                icon: "⚖️",
                title: "Batch Resume Comparison",
                desc: "Compare up to 4 resume versions side-by-side to evaluate quality ratings, strengths, and ATS readiness.",
                tag: "New",
              },
              {
                icon: "🔎",
                title: "50-60% Real Job Matcher",
                desc: "Searches active job boards for real openings matching 50% to 60% of your primary resume in your target country.",
                tag: "New",
              },
              {
                icon: "📋",
                title: "Kanban Job Tracker",
                desc: "Track every application from Wishlist → Applied → Interview → Offer. Drag-and-drop columns with status automation.",
              },
              {
                icon: "✍️",
                title: "1-Click Application Studio",
                desc: "Import JDs directly from URL, audit ATS scannability with live progress, and apply instant STAR bullet fixes.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="relative p-6 rounded-2xl border border-[#242834] bg-[#14161D] hover:border-amber-500/50 transition-all shadow-lg group"
              >
                {feature.tag && (
                  <span className="absolute top-3 right-3 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {feature.tag}
                  </span>
                )}
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-bold text-amber-300 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers & User Reviews Section */}
      <section className="bg-[#090A0C] border-b border-[#242834]">
        <StatsAndReviewsSection />
      </section>

      <footer className="py-8 px-4 text-center text-xs text-zinc-400 bg-[#090A0C]">
        &copy; {new Date().getFullYear()} ResuMatch.ai. All rights reserved. Built with ❤️ in Carbon Black & Amber Yellow for job seekers everywhere.
      </footer>
    </div>
  );
}
