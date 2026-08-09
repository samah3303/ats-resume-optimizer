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
      ? questions
      : questions.filter((q) => q.category === activeCategory)
    : [];

  if (status === "loading" || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090A0C]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0C] text-white py-8 px-4 sm:px-6 lg:px-8 space-y-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-400 mb-1">
            <span>Interview Readiness Studio</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            AI Interview Question Predictor & Roleplay
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
            Predict high-probability technical, behavioral, and gap questions tailored specifically to your resume and target job posting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-4 bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 shadow-2xl space-y-5">
            <h2 className="text-base font-black text-white">1. Setup Practice Session</h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 font-bold">
                  ⚠️ {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">
                  Select Your Resume
                </label>
                <select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">-- Choose Resume --</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1.5">
                  Select Job Posting
                </label>
                <select
                  value={jdId}
                  onChange={(e) => setJdId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
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
                className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
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
                          ? "bg-amber-500 text-slate-950 shadow-md"
                          : "bg-[#14161D] border border-[#242834] text-zinc-300 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Question Cards */}
                <div className="space-y-4">
                  {filteredQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-[#14161D]/80 backdrop-blur-xl rounded-3xl border border-[#242834] p-6 shadow-xl space-y-4 hover:border-amber-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {q.category}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">Question {idx + 1}</span>
                      </div>

                      <div>
                        <h3 className="text-sm font-black text-white leading-snug">
                          &ldquo;{q.question}&rdquo;
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1 italic">
                          Why recruiter asks this: {q.rationale}
                        </p>
                      </div>

                      {/* Interactive Practice Box */}
                      <div className="space-y-2 pt-3 border-t border-[#242834]">
                        <label className="block text-[10px] font-black text-amber-300 uppercase tracking-wider">
                          Practice Your Answer (STAR Method):
                        </label>
                        <textarea
                          value={practiceAnswer[idx] || ""}
                          onChange={(e) =>
                            setPracticeAnswer((prev) => ({ ...prev, [idx]: e.target.value }))
                          }
                          placeholder="Type your response here..."
                          rows={3}
                          className="w-full p-4 rounded-xl bg-[#090A0C] border border-[#242834] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={() => handleEvaluateAnswer(idx, q.question)}
                          disabled={evaluatingIndex === idx || !practiceAnswer[idx]?.trim()}
                          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl disabled:opacity-40 transition-all flex items-center gap-1.5"
                        >
                          {evaluatingIndex === idx ? (
                            <>
                              <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                              Evaluating Answer...
                            </>
                          ) : (
                            "🤖 Get AI STAR Feedback"
                          )}
                        </button>

                        {feedback[idx] && (
                          <div className="p-4 bg-emerald-950/80 border border-emerald-800 rounded-2xl text-xs text-emerald-300 whitespace-pre-wrap font-sans mt-2">
                            {feedback[idx]}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-dashed border-[#242834] p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-xl mx-auto">
                  🎙️
                </div>
                <h3 className="text-base font-black text-white">Your Predicted Interview Questions</h3>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
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
