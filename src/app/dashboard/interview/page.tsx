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
      // Call optimize/negotiate endpoint or inline mock evaluation
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
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
          <span>Interview Readiness Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          AI Interview Question Predictor & Roleplay
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-3xl">
          Predict high-probability technical, behavioral, and gap questions tailored specifically to your resume and target job posting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
          <h2 className="text-base font-bold text-slate-900">1. Setup Practice Session</h2>

          <form onSubmit={handleGenerate} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Your Resume
              </label>
              <select
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="">-- Choose Resume --</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Job Posting
              </label>
              <select
                value={jdId}
                onChange={(e) => setJdId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      activeCategory === cat
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
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
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                        {q.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">Question {idx + 1}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        &ldquo;{q.question}&rdquo;
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 italic">
                        Why recruiter asks this: {q.rationale}
                      </p>
                    </div>

                    {/* Interactive Practice Box */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Practice Your Answer (STAR Method):
                      </label>
                      <textarea
                        value={practiceAnswer[idx] || ""}
                        onChange={(e) =>
                          setPracticeAnswer((prev) => ({ ...prev, [idx]: e.target.value }))
                        }
                        placeholder="Type your response here..."
                        rows={3}
                        className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      />
                      <button
                        onClick={() => handleEvaluateAnswer(idx, q.question)}
                        disabled={evaluatingIndex === idx || !practiceAnswer[idx]?.trim()}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg disabled:opacity-40 transition-all flex items-center gap-1.5"
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
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 whitespace-pre-wrap font-sans mt-2">
                          {feedback[idx]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xl mx-auto">
                🎙️
              </div>
              <h3 className="text-base font-bold text-slate-800">Your Predicted Interview Questions</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Select a resume and job description to get tailored questions and practice your STAR answers with AI feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
