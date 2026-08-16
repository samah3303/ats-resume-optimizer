import Link from "next/link";
import StatsAndReviewsSection from "@/components/StatsAndReviewsSection";

export default function UnauthenticatedHero() {
  return (
    <div className="flex flex-col bg-white text-zinc-950">
      {/* Main Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-28 bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-900 rounded-full text-xs font-bold uppercase tracking-wider">
            ⚡ 100% Free Multi-Agent AI + RAG + ML Engine
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-black leading-tight">
            Make Your Resume{" "}
            <span className="text-zinc-900 underline decoration-black decoration-2 underline-offset-8">
              Unstoppable
            </span>
          </h1>

          <p className="text-sm md:text-base text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            75% of resumes are rejected by ATS bots before a human sees them. KYRO uses{" "}
            <strong className="text-black">6 AI agents</strong>, RAG semantic search, and ML score prediction to analyze,
            rewrite, and optimize every line — so you reach <strong className="text-black">75-80%+ ATS match score</strong> on every application and land more interviews.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-zinc-700">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full font-semibold text-black">
              🧠 6 Multi-Agent AI
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full font-semibold text-black">
              🔍 384-Dim RAG Search
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full font-semibold text-black">
              📊 ML Score Predictor
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full font-semibold text-black">
              🎯 Stage-Wise Interview Coach
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm border border-black"
            >
              Get Started Free →
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 border border-zinc-300 bg-white text-black hover:bg-zinc-100 font-bold text-xs rounded-xl transition-all"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* Founder's Story, Mission & Vision Section */}
      <section className="py-20 px-4 bg-zinc-50/60 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-200 text-xs font-bold uppercase rounded-full tracking-wider">
              ❤️ Our Founder&apos;s Story & Mission
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-black leading-tight">
              Built From <span className="text-zinc-900 underline decoration-zinc-400 underline-offset-4">8 Months</span> of Job Hunt Struggle
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
              KYRO was not born in a corporate boardroom. It was created out of deep frustration with a broken hiring system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* The Founder's Journey */}
            <div className="p-8 bg-white rounded-3xl border border-zinc-200 space-y-4 flex flex-col justify-between shadow-sm hover:border-black transition-all">
              <div className="space-y-3">
                <div className="text-3xl">💔</div>
                <h3 className="text-lg font-black text-black">The 8-Month Search & LinkedIn Outcry</h3>
                <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
                  &quot;I personally spent <strong className="text-black">8 agonizing months searching for a job</strong>. Despite having solid technical skills, 90% of my applications vanished into black-box ATS algorithms, resulting in automated rejection emails or total silence.
                </p>
                <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
                  Every week, dozens of skilled developers reached out on LinkedIn asking: <em>&apos;Why no interview calls? Why instant rejection emails?&apos;</em> Seeing thousands of talented people suffer convinced me to build a real solution.&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-zinc-100 text-xs font-bold text-zinc-900">
                — KYRO Founder & Engineer
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="p-8 bg-white rounded-3xl border border-zinc-200 space-y-6 flex flex-col justify-between shadow-sm hover:border-black transition-all">
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎯</span> Our Mission
                  </span>
                  <h4 className="text-base font-black text-black">Ensure Every Qualified Job Seeker Lands Interview Calls</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    To eliminate unfair automated rejection algorithms by giving candidates enterprise-grade AI tools to optimize their resumes for every application.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌟</span> Our Commitment
                  </span>
                  <h4 className="text-base font-black text-black">100% Free Access for Job Seekers</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Even though multi-agent AI and RAG vector searches cost real server resources, KYRO is kept <strong className="text-black">100% FREE for job seekers</strong> right now so no candidate suffers in silence.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-black font-semibold">
                🚀 Over 10,000+ job applications optimized across the UAE, India, US, and EU.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How To Section: 4-Step Job Landing Workflow */}
      <section className="py-20 px-4 bg-white border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-200 text-xs font-bold uppercase rounded-full tracking-wider">
              📖 How KYRO Works
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-black">
              The 4-Step System to Beat ATS & Land Interviews
            </h2>
            <p className="text-xs text-zinc-600">
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
              <div key={s.step} className="p-6 rounded-2xl border border-zinc-200 bg-white space-y-3 hover:border-black transition-all shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-black bg-zinc-100 px-2.5 py-0.5 rounded-full border border-zinc-200">
                    Step {s.step}
                  </span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="text-sm font-black text-black">{s.title}</h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why We Differ From Competitors */}
      <section className="py-20 px-4 bg-zinc-50/60 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-200 text-xs font-bold uppercase rounded-full tracking-wider">
              ⚔️ Why KYRO Differs
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-black">
              Generic Resume Scanners vs. <span className="underline decoration-zinc-400">KYRO</span>
            </h2>
            <p className="text-xs text-zinc-600">
              Why candidates using single-prompt AI get rejected while KYRO users land 4x more interviews.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm text-xs">
              <thead>
                <tr className="bg-zinc-100 text-black text-left border-b border-zinc-200">
                  <th className="p-4 font-extrabold uppercase tracking-wider">Feature & Capability</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-zinc-500">Generic Resume Wrappers</th>
                  <th className="p-4 font-extrabold uppercase tracking-wider text-black bg-zinc-50">KYRO Multi-Agent Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
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
                  <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                    <td className="p-4 font-bold text-black">{row.feature}</td>
                    <td className="p-4 text-zinc-500">{row.generic}</td>
                    <td className="p-4 font-bold text-black bg-zinc-50/50">
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
      <section className="py-16 px-4 bg-white text-zinc-950 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-zinc-100 text-zinc-900 border border-zinc-200 text-xs font-bold uppercase rounded-full">
              ⚠️ The Job Search Reality Check
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-black">
              Why 75% of Resumes Are Scrapped by Bots Before a Recruiter Sees Them
            </h2>
            <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
              Applying to 100s of jobs without tailoring your resume is like playing the lottery. Here is how modern Applicant Tracking Systems work and how to beat them every single time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-white rounded-2xl border border-zinc-200 space-y-3 shadow-sm hover:border-black transition-all">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-base">
                1
              </div>
              <h3 className="text-base font-black text-black">The Auto-Rejection Cutoff</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Most enterprise ATS platforms (Workday, Taleo, Greenhouse) use automated score filters. Resumes matching under 65% trigger automated rejection emails within 2 to 24 hours — zero human eyes involved.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-zinc-200 space-y-3 shadow-sm hover:border-black transition-all">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-base">
                2
              </div>
              <h3 className="text-base font-black text-black">The Black Hole Effect</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                A single posting gets 300+ applications. Recruiters rank candidates by ATS match score and only open the top 10–15 candidates (top 5%). The remaining 90% sit in the database unread forever.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-zinc-200 space-y-3 shadow-sm hover:border-black transition-all">
              <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-black text-base">
                3
              </div>
              <h3 className="text-base font-black text-black">The 75%–80%+ Golden Rule</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Never send a generic resume. Run our 1-Click Studio on every job posting and tweak keywords until your score reaches <strong className="text-black">75%–80%+</strong>. Candidates hitting 75%+ land 4x more interview invites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 bg-zinc-50/60 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black text-center text-black mb-3">
            Everything You Need to Land the Job
          </h2>
          <p className="text-center text-xs text-zinc-600 mb-12 max-w-xl mx-auto">
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
                className="relative p-6 rounded-2xl border border-zinc-200 bg-white hover:border-black transition-all shadow-sm group"
              >
                {feature.tag && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-100 text-black border border-zinc-200">
                    {feature.tag}
                  </span>
                )}
                <div className="text-3xl mb-3 group-hover:scale-105 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-black text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers & User Reviews Section */}
      <section className="bg-white border-b border-zinc-200">
        <StatsAndReviewsSection />
      </section>

      <footer className="py-8 px-4 text-center text-xs text-zinc-500 bg-white border-t border-zinc-200">
        &copy; {new Date().getFullYear()} KYRO.ai. All rights reserved. Built with ❤️ for job seekers worldwide — 100% Free Multi-Agent AI & RAG Engine.
      </footer>
    </div>
  );
}
