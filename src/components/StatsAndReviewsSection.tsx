"use client";

interface Review {
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  badge: string;
  headline: string;
  content: string;
  timeframe: string;
}

const STATS = [
  {
    value: "150,000+",
    label: "Resumes Scanned & Optimized",
    icon: "📄",
    color: "from-blue-500 to-indigo-600",
  },
  {
    value: "3.8x",
    label: "Higher Interview Callback Rate",
    icon: "📈",
    color: "from-emerald-500 to-teal-600",
  },
  {
    value: "89%",
    label: "Average ATS Score Increase",
    icon: "🎯",
    color: "from-amber-500 to-orange-600",
  },
  {
    value: "42,000+",
    label: "Job Seekers Hired & Employed",
    icon: "💼",
    color: "from-purple-500 to-pink-600",
  },
];

const REVIEWS: Review[] = [
  {
    name: "Alex Rivera",
    role: "Senior Frontend Engineer",
    company: "Stripe",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    badge: "Hired in 14 Days",
    headline: "From 4 months of silence to 3 offer letters!",
    content:
      "I was unemployed for 4 months applying blindly on LinkedIn with zero callbacks. ResuMatch's ATS scanner showed my resume was missing 12 key hard skills and had table formatting bugs. Using the STAR bullet rewriter and Cold Email generator got me 3 interviews in my first week!",
    timeframe: "2 weeks after using ResuMatch",
  },
  {
    name: "Priya Sharma",
    role: "Product Manager",
    company: "FinTech Global",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    badge: "Hired in 21 Days",
    headline: "The Cold Outreach scripts & Interview prep are gold!",
    content:
      "Getting past ATS is step 1, but the LinkedIn outreach note generator and predicted interview questions gave me immense confidence. I reached out directly to the hiring manager with the generated pitch and got hired within 3 weeks.",
    timeframe: "3 weeks after using ResuMatch",
  },
  {
    name: "Marcus Vance",
    role: "Data Analyst",
    company: "Deloitte",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    badge: "Career Switcher",
    headline: "The free Skill Gap links helped me learn SQL fast!",
    content:
      "Switching careers while unemployed was terrifying. When ResuMatch flagged SQL & Tableau as missing gaps, it immediately gave me free YouTube crash courses and weekend project blueprints. Added the project to my resume and passed ATS easily!",
    timeframe: "1 month after using ResuMatch",
  },
  {
    name: "Samantha Taylor",
    role: "Operations Specialist",
    company: "Shopify",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    rating: 5,
    badge: "Hired in 10 Days",
    headline: "The Daily Sprint tracker kept me sane & disciplined.",
    content:
      "Job hunting after a layoff causes so much anxiety. The Daily Sprint tracker gave me a structured daily routine (3 applications, 2 outreaches). The 1-click ATS PDF exporter ensured my formatting was 100% clean every single time.",
    timeframe: "10 days after using ResuMatch",
  },
];

export default function StatsAndReviewsSection() {
  return (
    <div className="space-y-20 py-12">
      {/* ─── Numbers / Impact Stats Section ──────────────────────────────── */}
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <span>📊 Proven Job-Landing Results</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ResuMatch by the Numbers
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real impact measured across thousands of job applications and successful hires.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 shadow-lg shadow-slate-100 dark:shadow-none hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{stat.icon}</span>
                <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${stat.color}`} />
              </div>
              <p className={`text-3xl sm:text-4xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value}
              </p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── User Reviews & Success Stories ───────────────────────────────── */}
      <div className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <span>⭐ Real Success Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Loved by 45,000+ Job Seekers
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            See how unemployed job seekers turned application silence into multiple job offers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {REVIEWS.map((rev, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-md hover:shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Rating & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i} className="text-base">★</span>
                    ))}
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    ✓ {rev.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  &ldquo;{rev.headline}&rdquo;
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                  {rev.content}
                </p>
              </div>

              {/* User Profile Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-indigo-500"
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {rev.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {rev.role} at <strong className="text-slate-700 dark:text-slate-200">{rev.company}</strong>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
