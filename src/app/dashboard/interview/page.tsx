"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CompanyQuestionPredictor } from "@/components/interview/CompanyQuestionPredictor";
import { PostInterviewFollowUp } from "@/components/interview/PostInterviewFollowUp";

interface Resume {
  id: string;
  name: string;
}

interface JD {
  id: string;
  title: string;
  company: string | null;
}

interface InterviewQuestion {
  category: string;
  question: string;
  rationale: string;
}

type InterviewTab = "company_radar" | "resume_gaps" | "follow_up";

export default function InterviewPage() {
  const { status } = useSession();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<InterviewTab>("company_radar");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [jds, setJds] = useState<JD[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form State
  const [resumeId, setResumeId] = useState("");
  const [jdId, setJdId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Questions output state
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [practiceAnswer, setPracticeAnswer] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [evaluatingIndex, setEvaluatingIndex] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [rRes, jRes] = await Promise.all([
        fetch("/api/resumes"),
        fetch("/api/jds"),
      ]);
      if (rRes.ok) setResumes((await rRes.json()).resumes || []);
      if (jRes.ok) setJds((await jRes.json()).jds || []);
    } catch {
      // silently handle
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router, fetchData]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId || !jdId) {
      setError("Please select both a resume and a job description.");
      return;
    }

    setGenerating(true);
    setError("");
    setQuestions(null);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jdId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate interview questions.");
      }

      const data = await res.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate interview questions.");
    } finally {
      setGenerating(false);
    }
  };

  const handleEvaluateAnswer = async (index: number, questionText: string) => {
    const userAnswer = practiceAnswer[index];
    if (!userAnswer || !userAnswer.trim()) return;

    setEvaluatingIndex(index);
    try {
      const res = await fetch("/api/star-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bullet: userAnswer }),
      });

      if (res.ok) {
        const data = await res.json();
        const top = data.data;
        setFeedback((prev) => ({
          ...prev,
          [index]: `💡 Improved STAR Response:\n\n"${top?.enhanced || userAnswer}"\n\nKey Metrics Injected: ${top?.metricsAdded?.join(", ") || "Good structure!"}`,
        }));
      }
    } catch {
      setFeedback((prev) => ({
        ...prev,
        [index]: "Your answer has good structure! Try quantifying your impact with numbers (e.g. %, $, hours saved).",
      }));
    } finally {
      setEvaluatingIndex(null);
    }
  };

  const categories = questions
    ? ["All", ...Array.from(new Set(questions.map((q) => q.category)))]
    : [];

  if (status === "loading" || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderedQuestions = questions
    ? activeCategory === "All"
      ? questions
      : questions.filter((q) => q.category === activeCategory)
    : [];

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-8 px-4 sm:px-6 lg:px-8 space-y-6 pb-24">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div>
            <Link
              href="/dashboard"
              className="text-xs font-bold text-zinc-500 hover:text-black flex items-center gap-1.5 cursor-pointer mb-1 transition-colors"
            >
              <span>←</span>
              <span>Back to Tile Hub</span>
            </Link>
            <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight">
              Interview Strategy &amp; Readiness Studio
            </h1>
            <p className="text-xs text-zinc-600 mt-0.5">
              Select an isolated tool below to prepare for company-specific loops, analyze resume gaps, or draft follow-up emails.
            </p>
          </div>

          <Link
            href="/dashboard/mock-interview"
            className="touch-target px-5 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <span className="text-base">🎙️</span>
            <span>Spoken Voice Mock &rarr;</span>
          </Link>
        </div>

        {/* 3 Single-Purpose Screen Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto">
          {[
            { id: "company_radar", label: "🏢 Company Interview Radar", icon: "🏢" },
            { id: "resume_gaps", label: "🎯 Resume-to-Job Question Predictor", icon: "🎯" },
            { id: "follow_up", label: "✉️ Post-Interview Follow-Up", icon: "✉️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InterviewTab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-black text-white font-black shadow-xs"
                  : "bg-zinc-100 text-zinc-700 hover:text-black hover:bg-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ISOLATED SCREEN 1: Company Question Predictor */}
        {activeTab === "company_radar" && (
          <div className="animate-in fade-in duration-150">
            <CompanyQuestionPredictor />
          </div>
        )}

        {/* ISOLATED SCREEN 2: Resume-to-Job Tailored Question Generator */}
        {activeTab === "resume_gaps" && (
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm animate-in fade-in duration-150">
            <div className="pb-4 border-b border-zinc-200">
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
                📄 RESUME-SPECIFIC GAP ANALYSIS
              </span>
              <h2 className="text-base sm:text-lg font-black text-black mt-1">
                Predict Questions Tailored to Your Specific Resume &amp; Target JD
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form */}
              <div className="lg:col-span-4 bg-zinc-50 rounded-2xl border border-zinc-200 p-5 space-y-4">
                <form onSubmit={handleGenerate} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                      ⚠️ {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Select Your Resume
                    </label>
                    <select
                      value={resumeId}
                      onChange={(e) => setResumeId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-black focus:outline-none focus:border-black shadow-sm cursor-pointer"
                    >
                      <option value="">-- Choose Resume --</option>
                      {resumes.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                      Select Job Posting
                    </label>
                    <select
                      value={jdId}
                      onChange={(e) => setJdId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-black focus:outline-none focus:border-black shadow-sm cursor-pointer"
                    >
                      <option value="">-- Choose Job Description --</option>
                      {jds.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.title} {j.company ? `at ${j.company}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={generating || !resumeId || !jdId}
                    className="w-full py-3 px-4 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl shadow-sm border border-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {generating ? "Predicting Questions..." : "🎯 Predict Resume Loop Questions"}
                  </button>
                </form>
              </div>

              {/* Output */}
              <div className="lg:col-span-8 space-y-4">
                {questions && questions.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                            activeCategory === cat
                              ? "bg-black text-white border border-black shadow-xs"
                              : "bg-zinc-100 border border-zinc-200 text-zinc-800 hover:border-black"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {renderedQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-3 hover:border-black transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-zinc-100 text-zinc-900 border border-zinc-300">
                              {q.category}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">Q{idx + 1}</span>
                          </div>

                          <h4 className="text-sm font-black text-black leading-snug">
                            &ldquo;{q.question}&rdquo;
                          </h4>
                          <p className="text-xs text-zinc-600 italic">
                            Why recruiter asks this: {q.rationale}
                          </p>

                          <div className="space-y-2 pt-2 border-t border-zinc-100">
                            <textarea
                              value={practiceAnswer[idx] || ""}
                              onChange={(e) =>
                                setPracticeAnswer((prev) => ({ ...prev, [idx]: e.target.value }))
                              }
                              placeholder="Draft your STAR response..."
                              rows={2}
                              className="w-full p-3 rounded-xl bg-zinc-50 border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black"
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleEvaluateAnswer(idx, q.question)}
                                disabled={evaluatingIndex === idx || !practiceAnswer[idx]?.trim()}
                                className="px-3.5 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border border-black disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                              >
                                {evaluatingIndex === idx ? "Evaluating..." : "🤖 Get STAR Feedback"}
                              </button>
                            </div>

                            {feedback[idx] && (
                              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 whitespace-pre-wrap font-sans mt-2">
                                {feedback[idx]}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-50 rounded-2xl border border-dashed border-zinc-300 p-8 text-center space-y-2">
                    <span className="text-2xl">🎯</span>
                    <h4 className="text-xs font-black text-black">Select Resume &amp; Job Description</h4>
                    <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                      Choose a saved resume and job posting to analyze skill gaps and generate personalized interview questions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ISOLATED SCREEN 3: Post-Interview Follow-Up & Thank You Synthesizer */}
        {activeTab === "follow_up" && (
          <div className="animate-in fade-in duration-150">
            <PostInterviewFollowUp />
          </div>
        )}
      </div>
    </div>
  );
}
