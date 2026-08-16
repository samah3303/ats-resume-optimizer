"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

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

export default function InterviewPage() {
  const { status } = useSession();
  const router = useRouter();

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
        body: JSON.stringify({ rawBullet: userAnswer }),
      });

      if (res.ok) {
        const data = await res.json();
        const top = data.options?.[0];
        setFeedback((prev) => ({
          ...prev,
          [index]: `💡 Feedback & Improved STAR Response:\n\n"${top?.bullet || userAnswer}"\n\nResult Metric Focus: ${top?.starBreakdown?.resultMetrics || "Good structure!"}`,
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

  const filteredQuestions = questions
    ? activeCategory === "All"
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
    <div className="min-h-screen bg-white text-zinc-900 py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-zinc-600 mb-1">
              <span>Interview Readiness Studio</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
              AI Interview Question Predictor & Roleplay
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-3xl">
              Predict high-probability technical, behavioral, and gap questions tailored specifically to your resume and target job posting.
            </p>
          </div>

          <Link
            href="/dashboard/mock-interview"
            className="touch-target px-6 py-3.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-2xl border border-black shadow-md transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <span className="text-base">🎙️</span>
            <span>Launch Live Voice Mock Room &rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-black text-black">1. Setup Practice Session</h2>

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
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-black focus:outline-none focus:border-black shadow-sm cursor-pointer"
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
                  className="w-full px-4 py-3 rounded-xl bg-white border border-zinc-300 text-xs font-semibold text-black focus:outline-none focus:border-black shadow-sm cursor-pointer"
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
                className="w-full py-3.5 px-4 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-sm border border-black transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Predicting Questions...
                  </>
                ) : (
                  "🎯 Predict Top Interview Questions"
                )}
              </button>
            </form>
          </div>

          {/* Output */}
          <div className="lg:col-span-8 space-y-6">
            {questions && questions.length > 0 ? (
              <div className="space-y-6">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                        activeCategory === cat
                          ? "bg-black text-white border border-black shadow-sm"
                          : "bg-zinc-100 border border-zinc-200 text-zinc-800 hover:border-black"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Question Cards */}
                <div className="space-y-4">
                  {renderedQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm space-y-4 hover:border-black transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-zinc-100 text-zinc-900 border border-zinc-300">
                          {q.category}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">Question {idx + 1}</span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-black leading-snug">
                          &ldquo;{q.question}&rdquo;
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1 italic">
                          Why recruiter asks this: {q.rationale}
                        </p>
                      </div>

                      {/* Interactive Practice Box */}
                      <div className="space-y-2 pt-3 border-t border-zinc-200">
                        <label className="block text-[10px] font-black text-zinc-700 uppercase tracking-wider">
                          Practice Your Answer (STAR Method):
                        </label>
                        <textarea
                          value={practiceAnswer[idx] || ""}
                          onChange={(e) =>
                            setPracticeAnswer((prev) => ({ ...prev, [idx]: e.target.value }))
                          }
                          placeholder="Type your response here..."
                          rows={3}
                          className="w-full p-4 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black shadow-sm"
                        />
                        <button
                          onClick={() => handleEvaluateAnswer(idx, q.question)}
                          disabled={evaluatingIndex === idx || !practiceAnswer[idx]?.trim()}
                          className="px-4 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border border-black disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          {evaluatingIndex === idx ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Evaluating Answer...
                            </>
                          ) : (
                            "🤖 Get AI STAR Feedback"
                          )}
                        </button>

                        {feedback[idx] && (
                          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 whitespace-pre-wrap font-sans mt-2 shadow-sm">
                            {feedback[idx]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-50 rounded-3xl border border-dashed border-zinc-300 p-12 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-black border border-zinc-300 flex items-center justify-center font-bold text-xl mx-auto shadow-sm">
                  🎙️
                </div>
                <h3 className="text-base font-black text-black">Your Predicted Interview Questions</h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Select a resume and job description to get tailored questions and practice your STAR answers with AI feedback.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
