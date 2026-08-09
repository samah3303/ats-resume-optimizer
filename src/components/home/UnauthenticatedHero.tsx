import Link from "next/link";
import StatsAndReviewsSection from "@/components/StatsAndReviewsSection";

export default function UnauthenticatedHero() {
  return (
    <div className="flex flex-col">
      {/* Main Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 bg-gradient-to-b from-white via-indigo-50/50 to-white">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            🚀 100% Free Multi-Agent AI + RAG + ML Engine
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
            Make Your Resume{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
              Unstoppable
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            75% of resumes are rejected by ATS bots before a human sees them. ResuMatch uses{" "}
            <strong>6 AI agents</strong>, RAG semantic search, and ML score prediction to analyze,
            rewrite, and optimize every line — so you reach <strong>75-80%+ ATS match score</strong> on every application and land more interviews.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm font-medium">
              🧠 6 Multi-Agent AI
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm font-medium">
              🔍 384-Dim RAG Search
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm font-medium">
              📊 ML Score Predictor
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 rounded-full shadow-sm font-medium">
              🎯 Stage-Wise Interview Coach
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Get Started Free
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Founder's Story, Mission & Vision Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-y border-indigo-500/20">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase rounded-full tracking-wider">
              ❤️ Our Founder&apos;s Story & Mission
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
              Built From 8 Months of Job Hunt Struggle
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              ResuMatch was not born in a corporate boardroom. It was created out of deep frustration with a broken hiring system.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* The Founder's Journey */}
            <div className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-3xl">💔</div>
                <h3 className="text-xl font-bold text-white">The 8-Month Search & LinkedIn Outcry</h3>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  &quot;I personally spent <strong>8 agonizing months searching for a job</strong>. Despite having solid technical skills, 90% of my applications vanished into black-box ATS algorithms, resulting in automated rejection emails or total silence.
                </p>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                  Every week, dozens of skilled developers reached out on LinkedIn asking: <em>&apos;Why no interview calls? Why instant rejection emails?&apos;</em> Seeing thousands of talented people suffer convinced me to build a real solution.&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs font-semibold text-indigo-300">
                — ResuMatch Founder & Engineer
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🎯</span> Our Mission
                  </span>
                  <h4 className="text-lg font-bold text-white">Ensure Every Qualified Job Seeker Lands Interview Calls</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    To eliminate unfair automated rejection algorithms by giving candidates enterprise-grade AI tools to optimize their resumes for every application.
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span>🌟</span> Our Commitment
                  </span>
                  <h4 className="text-lg font-bold text-white">100% Free Access for Job Seekers</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Even though multi-agent AI and RAG vector searches cost real server resources, ResuMatch is kept <strong>100% FREE for job seekers</strong> right now so no candidate suffers in silence.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-500/20 border border-indigo-400/30 rounded-2xl text-xs text-indigo-200">
                🚀 Over 10,000+ job applications optimized across the UAE, India, US, and EU.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How To Section: 4-Step Job Landing Workflow */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-full tracking-wider">
              📖 How ResuMatch Works
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              The 4-Step System to Beat ATS & Land Interviews
            </h2>
            <p className="text-sm text-gray-600">
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
              <div key={s.step} className="p-6 rounded-2xl border border-gray-200 bg-slate-50/50 space-y-3 hover:border-indigo-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                    Step {s.step}
                  </span>
                  <span className="text-2xl">{s.icon}</span>
                </div>
                <h3 className="text-base font-bold text-gray-900">{s.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why We Differ From Competitors */}
      <section className="py-20 px-4 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-bold uppercase rounded-full tracking-wider">
              ⚔️ Why ResuMatch Differs
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Generic Resume Scanners vs. ResuMatch
            </h2>
            <p className="text-sm text-gray-600">
              Why candidates using single-prompt AI get rejected while ResuMatch users land 4x more interviews.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm text-xs">
              <thead>
                <tr className="bg-slate-900 text-white text-left">
                  <th className="p-4 font-bold uppercase tracking-wider">Feature & Capability</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-slate-400">Generic Resume Wrappers</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-emerald-400 bg-slate-800">ResuMatch Multi-Agent Engine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
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
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-gray-900">{row.feature}</td>
                    <td className="p-4 text-gray-500">{row.generic}</td>
                    <td className="p-4 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/40">
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
      <section className="py-16 px-4 bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase rounded-full">
              ⚠️ The Job Search Reality Check
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-3 mb-4 text-white">
              Why 75% of Resumes Are Scrapped by Bots Before a Recruiter Sees Them
            </h2>
            <p className="text-sm md:text-base text-slate-300 leading-relaxed">
              Applying to 100s of jobs without tailoring your resume is like playing the lottery. Here is how modern Applicant Tracking Systems work and how to beat them every single time.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">The Auto-Rejection Cutoff</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Most enterprise ATS platforms (Workday, Taleo, Greenhouse) use automated score filters. Resumes matching under 65% trigger automated rejection emails within 2 to 24 hours — zero human eyes involved.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">The Black Hole Effect</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A single posting gets 300+ applications. Recruiters rank candidates by ATS match score and only open the top 10–15 candidates (top 5%). The remaining 90% sit in the database unread forever.
              </p>
            </div>

            <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">The 75%–80%+ Golden Rule</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Never send a generic resume. Run our 1-Click Studio on every job posting and tweak keywords until your score reaches <strong>75%–80%+</strong>. Candidates hitting 75%+ land 4x more interview invites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
            Everything You Need to Land the Job
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
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
                className="relative p-6 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 hover:shadow-lg transition-all group"
              >
                {feature.tag && (
                  <span
                    className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      feature.tag === "New"
                        ? "bg-green-100 text-green-700"
                        : feature.tag === "Dev"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}
                  >
                    {feature.tag}
                  </span>
                )}
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Powered by Cutting-Edge AI
          </h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            We combine multiple AI techniques to give you results that single-prompt tools can&apos;t match.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              {
                title: "6 AI Agents",
                desc: "Multi-step reasoning with self-verification for accurate, actionable suggestions",
              },
              {
                title: "RAG + pgvector",
                desc: "384-dim semantic embeddings for deep resume-JD matching, not just keyword counts",
              },
              {
                title: "ML Models",
                desc: "Trained on real analysis data. Instant scores with explainable feature importance",
              },
              {
                title: "DeepSeek V4",
                desc: "State-of-the-art LLM at 18x lower cost than GPT-4o. Fast, affordable, reliable",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 backdrop-blur rounded-lg p-4">
                <div className="font-bold text-sm mb-1">{item.title}</div>
                <div className="text-xs text-indigo-200 leading-relaxed">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers & User Reviews Section */}
      <section className="bg-slate-50 border-t border-slate-200/80 px-4">
        <div className="max-w-7xl mx-auto">
          <StatsAndReviewsSection />
        </div>
      </section>

      <footer className="py-8 px-4 text-center text-sm text-gray-500 border-t border-gray-200">
        &copy; {new Date().getFullYear()} ResuMatch. All rights reserved. Built with ❤️ for job seekers everywhere.
      </footer>
    </div>
  );
}
