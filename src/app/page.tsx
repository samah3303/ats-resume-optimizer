"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ResumeUploader from "@/components/ResumeUploader";
import StatsAndReviewsSection from "@/components/StatsAndReviewsSection";

// ─── Country list ────────────────────────────────────────────────────────────

const COUNTRIES = [
  "United States", "United Kingdom", "United Arab Emirates", "Canada",
  "Germany", "Australia", "India", "Singapore", "Netherlands",
  "Ireland", "Switzerland", "Sweden", "New Zealand", "Japan",
  "South Korea", "France", "Brazil", "Mexico", "South Africa",
  "Saudi Arabia", "Qatar", "Malaysia", "Other",
];

const INDUSTRIES = [
  "Technology / SaaS", "Finance / FinTech", "Healthcare / HealthTech",
  "E-Commerce / Retail", "Education / EdTech", "Media / Entertainment",
  "Manufacturing", "Energy / Utilities", "Consulting",
  "Government / Public Sector", "Real Estate / PropTech",
  "Telecommunications", "Transportation / Logistics", "Gaming",
  "Cybersecurity", "AI / Machine Learning", "Other",
];

const JOB_TYPES = [
  "Full-time", "Part-time", "Contract",
  "Freelance", "Remote", "Hybrid", "On-site",
];

// ─── Step definitions ────────────────────────────────────────────────────────

const STEPS = [
  { num: 1, label: "Resume" },
  { num: 2, label: "Target" },
  { num: 3, label: "Analyze" },
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumeFormat, setResumeFormat] = useState<"pdf" | "doc" | "docx" | null>(null);
  const [positions, setPositions] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [jobType, setJobType] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [suggestedPositions, setSuggestedPositions] = useState<string[]>([]);

  // ─── Check onboarding status when authenticated ──────────────────────────
  const checkOnboarding = useCallback(async () => {
    setCheckingOnboarding(true);
    try {
      const res = await fetch("/api/onboarding");
      if (res.ok) {
        const data = await res.json();
        setOnboardingDone(data.completed);
        if (data.completed) {
          router.replace("/dashboard");
        }
      }
    } catch {
      setOnboardingDone(false);
    } finally {
      setCheckingOnboarding(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "authenticated") {
      checkOnboarding();
    }
  }, [status, checkOnboarding]);

  // ─── Toggle a suggested position in/out of the positions field ──────
  const togglePosition = (pos: string) => {
    const current = positions
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (current.includes(pos)) {
      setPositions(current.filter((p) => p !== pos).join(", "));
    } else {
      setPositions([...current, pos].join(", "));
    }
  };

  // ─── Handle resume uploaded ─────────────────────────────────────────────
  const handleResumeUploaded = useCallback(
    (resume: { id: string; name: string }) => {
      setResumeId(resume.id);
      setResumeName(resume.name);
      setError(null);
      // Save progress to localStorage
      localStorage.setItem("onboarding_resumeId", resume.id);
      localStorage.setItem("onboarding_resumeName", resume.name);
      // Auto-fill from resume
      setAutoFilling(true);
      fetch("/api/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.suggestedPositions?.length > 0) {
            setSuggestedPositions(data.suggestedPositions);
            setPositions(data.suggestedPositions.join(", "));
          }
          if (data.suggestedIndustry) {
            // If industry matches one of our options, set it
            const match = INDUSTRIES.find(
              (i) => i.toLowerCase() === data.suggestedIndustry.toLowerCase()
            ) || data.suggestedIndustry;
            setIndustry(match);
          }
          localStorage.setItem("onboarding_step", "2");
        })
        .catch(() => {})
        .finally(() => setAutoFilling(false));
      // Advance after auto-fill starts
      setTimeout(() => setStep(2), 600);
    },
    []
  );

  // ─── Handle format detected ─────────────────────────────────────────────
  const handleFormatDetected = useCallback((format: "pdf" | "doc" | "docx") => {
    setResumeFormat(format);
  }, []);

  // ─── Submit onboarding ──────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!resumeId || !positions.trim() || !country) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          targetPositions: positions
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          targetCountry: country,
          linkedinUrl: linkedin.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          industry: industry || undefined,
          jobType: jobType || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      // Clear onboarding localStorage on complete
      localStorage.removeItem("onboarding_resumeId");
      localStorage.removeItem("onboarding_resumeName");
      localStorage.removeItem("onboarding_step");
      router.push("/dashboard#roadmap");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAnalyzing(false);
    }
  };

  // ─── Auth loading state ─────────────────────────────────────────────────
  if (status === "loading" || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ─── Unauthenticated — show hero/CTA ────────────────────────────────────
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col">
        <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 bg-gradient-to-b from-white to-indigo-50">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              🚀 Multi-Agent AI + RAG + ML
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
              Make Your Resume{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Unstoppable
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              75% of resumes are rejected by ATS before a human sees them. ResuMatch uses{" "}
              <strong>6 AI agents</strong>, semantic search, and machine learning to analyze,
              rewrite, and optimize every line — so you beat the bots and land more interviews.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-sm text-gray-500">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full">
                🧠 Multi-Agent AI
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full">
                🔍 RAG Semantic Search
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full">
                📊 ML Score Predictor
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full">
                🎯 Interview Coach
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

        {/* Feature Grid */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-4">
              Everything You Need to Land the Job
            </h2>
            <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
              From resume analysis to salary negotiation — one platform, zero effort.
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
                  title: "Interactive Interview Coach",
                  desc: "Mock interviews tailored to your target job. Answer questions, get scored on each response with model answers, and receive a final performance report.",
                  tag: "New",
                },
                {
                  icon: "🗺️",
                  title: "8-Week Career Roadmap",
                  desc: "Personalized week-by-week plan to close skill gaps. Includes course recommendations, salary projections, and timeline milestones.",
                },
                {
                  icon: "🔎",
                  title: "Real Job Search Agent",
                  desc: "Searches live job boards with semantic ranking. Auto-saves matched jobs to your dashboard with match percentages.",
                  tag: "New",
                },
                {
                  icon: "✍️",
                  title: "Iterative Resume Writer",
                  desc: "Draft → self-critique → revise → polish. Three refinement passes produce a professional, ATS-optimized resume that preserves your original formatting.",
                },
                {
                  icon: "📋",
                  title: "Kanban Job Tracker",
                  desc: "Track every application from Wishlist → Applied → Interview → Offer. Drag-and-drop columns with status automation.",
                },
                {
                  icon: "📝",
                  title: "Cover Letter Generator",
                  desc: "Tailored cover letters for each job — pulls your relevant experience and addresses the specific requirements from the JD.",
                },
                {
                  icon: "💰",
                  title: "Salary Negotiation Kit",
                  desc: "Market range estimates, counter-offer scripts, acceptance emails, and negotiation talking points — all personalized to your experience.",
                },
                {
                  icon: "📤",
                  title: "Outreach Message Pack",
                  desc: "Cold emails, LinkedIn messages, and recruiter outreach templates customized for each job you're targeting.",
                },
                {
                  icon: "🔌",
                  title: "MCP + n8n Automation",
                  desc: "Connect to Claude Desktop via MCP. Automate weekly job hunts and application pipelines with n8n workflows.",
                  tag: "Dev",
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="relative p-6 rounded-xl border border-gray-200 bg-white hover:border-indigo-200 hover:shadow-lg transition-all group"
                >
                  {feature.tag && (
                    <span className={`absolute top-3 right-3 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      feature.tag === "New"
                        ? "bg-green-100 text-green-700"
                        : feature.tag === "Dev"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-indigo-100 text-indigo-700"
                    }`}>
                      {feature.tag}
                    </span>
                  )}
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{feature.desc}</p>
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
                { title: "6 AI Agents", desc: "Multi-step reasoning with self-verification for accurate, actionable suggestions" },
                { title: "RAG + pgvector", desc: "384-dim semantic embeddings for deep resume-JD matching, not just keyword counts" },
                { title: "ML Models", desc: "Trained on real analysis data. Instant scores with explainable feature importance" },
                { title: "DeepSeek V4", desc: "State-of-the-art LLM at 18x lower cost than GPT-4o. Fast, affordable, reliable" },
              ].map((item) => (
                <div key={item.title} className="bg-white/10 backdrop-blur rounded-lg p-4">
                  <div className="font-bold text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-indigo-200 leading-relaxed">{item.desc}</div>
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
          &copy; {new Date().getFullYear()} ResuMatch. All rights
          reserved.
        </footer>
      </div>
    );
  }

  // ─── Already completed onboarding — redirect (handled in effect) ────────
  if (onboardingDone) return null;

  // ─── Onboarding wizard ──────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s.num
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.num ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.num
                )}
              </div>
              <span
                className={`text-xs mt-1.5 font-medium ${
                  step >= s.num ? "text-indigo-700" : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-1 mt-[-14px] transition-colors ${
                  step > s.num ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 shadow-sm">
        {/* ── Step 1: Resume Upload ─────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Upload Your Resume
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              We&apos;ll analyze your resume to identify strengths, gaps, and
              opportunities for your target roles.
            </p>

            <ResumeUploader
              onUploaded={handleResumeUploaded}
              onFormatDetected={handleFormatDetected}
            />

            {/* PDF Disclaimer */}
            {resumeFormat === "pdf" && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <span className="text-yellow-600 text-lg shrink-0">⚠️</span>
                <p className="text-sm text-yellow-800">
                  <strong>PDF uploaded:</strong> Generated optimizations will
                  use a standard structural layout. For custom designer-layout
                  generation, please upload a{" "}
                  <code className="bg-yellow-100 px-1 rounded">.doc</code> or{" "}
                  <code className="bg-yellow-100 px-1 rounded">.docx</code>{" "}
                  file.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 2: Target Collection ─────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Tell Us About Your Goals
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              This helps us tailor the analysis and roadmap to your specific
              career ambitions.
            </p>

            {/* Auto-fill indicator */}
            {autoFilling && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4 text-sm text-blue-700">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                AI is extracting details from your resume...
              </div>
            )}

            {/* Uploaded resume info */}
            {resumeName && (
              <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-lg mb-4">
                <span className="text-indigo-600">📄</span>
                <span className="text-sm font-medium text-indigo-700">
                  {resumeName}
                </span>
                <button
                  onClick={() => {
                    setResumeId(null);
                    setResumeName(null);
                    setResumeFormat(null);
                    setStep(1);
                  }}
                  className="ml-auto text-xs text-indigo-500 hover:text-indigo-700 underline"
                >
                  Change
                </button>
              </div>
            )}

            <div className="space-y-4">
              {/* Target Positions */}
              <div>
                <label
                  htmlFor="positions"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Target Job Positions{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="positions"
                  type="text"
                  value={positions}
                  onChange={(e) => setPositions(e.target.value)}
                  placeholder="e.g. Senior Software Engineer, Engineering Manager"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">
                  💡 We already extracted what you&apos;ve done. Tell us where you want to go — this helps find gaps between your current profile and your dream roles.
                </p>
                {/* Suggested position chips */}
                {suggestedPositions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1.5">
                      🤖 AI-suggested from your resume — click to add/remove:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedPositions.map((pos) => {
                        const isSelected = positions
                          .split(",")
                          .map((p) => p.trim())
                          .includes(pos);
                        return (
                          <button
                            key={pos}
                            type="button"
                            onClick={() => togglePosition(pos)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                              isSelected
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {pos}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Industry + Country row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="industry"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Target Industry{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white transition-colors"
                  >
                    <option value="">Select industry...</option>
                    {INDUSTRIES.map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Target Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none bg-white transition-colors"
                  >
                    <option value="">Select a country...</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Job Type (multi-select checkboxes) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Job Type Preferences{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {JOB_TYPES.map((jt) => {
                    const selected = jobType.split(",").map((j) => j.trim()).includes(jt);
                    return (
                      <button
                        key={jt}
                        type="button"
                        onClick={() => {
                          const current = jobType
                            .split(",")
                            .map((j) => j.trim())
                            .filter(Boolean);
                          if (current.includes(jt)) {
                            setJobType(current.filter((j) => j !== jt).join(", "));
                          } else {
                            setJobType([...current, jt].join(", "));
                          }
                        }}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          selected
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {jt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LinkedIn, Portfolio, GitHub */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    LinkedIn URL{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="linkedin"
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="portfolio"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    Portfolio URL{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="portfolio"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="yourportfolio.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="github"
                    className="block text-sm font-medium text-gray-700 mb-1.5"
                  >
                    GitHub URL{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="github"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="github.com/username"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-8">
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Skip for now
                </button>
              </div>
              <button
                onClick={() => setStep(3)}
                disabled={!positions.trim() || !country}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Start Analysis
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: AI Analysis ────────────────────────────────────────── */}
        {step === 3 && (
          <div className="text-center">
            {analyzing ? (
              <div className="py-8">
                <div className="flex items-center justify-center gap-1.5 mb-4">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  Analyzing Your Resume
                </h2>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Our AI is reviewing your experience against your target
                  positions in {country}. This takes about 15–30 seconds.
                </p>
              </div>
            ) : (
              <div className="py-8">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Ready to Analyze
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  We&apos;ll analyze your resume and generate a personalized
                  8-week career roadmap.
                </p>

                {/* Summary */}
                <div className="bg-gray-50 rounded-lg p-4 text-left mb-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Resume</span>
                    <span className="font-medium text-gray-900">
                      {resumeName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Positions</span>
                    <span className="font-medium text-gray-900 truncate max-w-[200px]">
                      {positions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Target Country</span>
                    <span className="font-medium text-gray-900">
                      {country}
                    </span>
                  </div>
                  {linkedin && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">LinkedIn</span>
                      <span className="font-medium text-gray-900 truncate max-w-[200px]">
                        {linkedin}
                      </span>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ← Edit
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Generate Roadmap
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
