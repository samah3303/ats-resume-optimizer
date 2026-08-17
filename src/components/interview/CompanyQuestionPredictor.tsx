"use client";

import { useState } from "react";
import { CompanyPredictionResult } from "@/app/api/interview/predict/route";

export function CompanyQuestionPredictor() {
  const [company, setCompany] = useState("Stripe");
  const [role, setRole] = useState("Staff Infrastructure Engineer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompanyPredictionResult | null>({
    company: "Stripe",
    role: "Staff Infrastructure Engineer",
    difficultyRating: "Very Hard",
    cultureFocus: "Evaluates production craftsmanship, meticulous API design, distributed idempotency, and rigorous systems debugging.",
    predictedQuestions: [
      {
        question: "Design an idempotent distributed payment processing engine that guarantees exactly-once billing across multi-region network failures.",
        category: "System Design",
        interviewerExpectation: "Expects unique transaction idempotency keys, two-phase commits vs. saga orchestrators, and strict database isolation levels.",
        suggestedTalkingPoints: ["Idempotency-Key header caching in Redis", "Distributed locking with lease renewals", "Dead-letter queues for unrecoverable errors"],
      },
      {
        question: "Tell me about a time you led a major infrastructure migration with zero customer-facing downtime.",
        category: "Leadership / Bar Raiser",
        interviewerExpectation: "Looks for meticulous risk mitigation, shadow traffic dual-writes, and dark launching protocols.",
        suggestedTalkingPoints: ["Dual-write validation phase", "Automated rollback canary alarms", "Comprehensive runbooks for on-call engineers"],
      },
      {
        question: "Implement a sliding-window rate limiter in TypeScript or Go supporting 100k requests/sec per API key.",
        category: "Coding & Algo",
        interviewerExpectation: "Clean thread-safe concurrency, Redis memory footprint efficiency, and sliding log vs. token bucket trade-offs.",
        suggestedTalkingPoints: ["Token Bucket algorithm", "Redis sorted sets", "Graceful 429 Retry-After response headers"],
      },
    ],
    insiderTips: [
      "Stripe heavily values code readability and clean error handling over obscure algorithmic one-liners.",
      "In System Design, explicitly discuss telemetry, metrics cardinality, and failure domain boundaries.",
      "Bring up real-world trade-offs between consistency and availability in financial systems.",
    ],
  });

  const POPULAR_COMPANIES = ["Google", "Stripe", "Amazon", "Meta", "Netflix", "Uber", "Datadog", "OpenAI"];

  const handlePredict = async () => {
    if (!company.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/interview/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role }),
      });

      if (!res.ok) throw new Error("Failed to predict questions");
      const json = await res.json();
      if (json.data) {
        setResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
            🏢 AI COMPANY INTERVIEW RADAR
          </span>
          <h3 className="text-base sm:text-lg font-black text-black mt-1">
            Company-Specific Question Predictor & Bar Raiser Rubric
          </h3>
          <p className="text-xs text-zinc-600">
            Uncover exact predicted questions and hiring loop expectations tailored to top tech companies.
          </p>
        </div>

        {result && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1 bg-black text-white text-xs font-black rounded-xl border border-black shadow-xs">
              Difficulty: {result.difficultyRating}
            </span>
          </div>
        )}
      </div>

      {/* Input Controls & Popular Company Quick Pills */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-zinc-500 mr-1">Quick Select:</span>
          {POPULAR_COMPANIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCompany(c);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                company === c
                  ? "bg-black text-white border border-black shadow-xs"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
              Target Company Name
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Stripe, Amazon, Google..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-black font-medium outline-none focus:border-black focus:bg-white transition-colors"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
              Target Position / Level
            </label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Staff Software Engineer, E5..."
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-black font-medium outline-none focus:border-black focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handlePredict}
            disabled={loading}
            className="touch-target px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Analyzing Company Rubric..." : "⚡ Predict Interview Loop & Questions"}
          </button>
        </div>
      </div>

      {/* Prediction Output */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-zinc-200">
          {/* Culture / Bar Raiser Focus */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block">
              {result.company} Hiring Philosophy & Bar Raiser Focus:
            </span>
            <p className="text-xs text-black font-medium leading-relaxed">
              {result.cultureFocus}
            </p>
          </div>

          {/* Predicted Questions Cards */}
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block">
              Top Predicted Loop Questions ({result.predictedQuestions.length}):
            </span>

            {result.predictedQuestions.map((q, idx) => (
              <div
                key={idx}
                className="p-5 bg-white border border-zinc-200 hover:border-black rounded-2xl space-y-3 transition-all shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black text-black uppercase">
                    Q{idx + 1} • {q.category}
                  </span>
                </div>

                <h4 className="text-sm font-black text-black font-sans leading-snug">
                  &ldquo;{q.question}&rdquo;
                </h4>

                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                    What the Interviewer Expects:
                  </span>
                  <p className="text-zinc-800 leading-relaxed font-medium">
                    {q.interviewerExpectation}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-zinc-400 mr-1">Recommended Anchors:</span>
                  {q.suggestedTalkingPoints.map((pt, pIdx) => (
                    <span
                      key={pIdx}
                      className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-black"
                    >
                      ✓ {pt}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Insider Tips */}
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-black block">
              💡 {result.company} Interview Insider Protocol:
            </span>
            <ul className="space-y-1.5 text-xs text-zinc-800 font-medium">
              {result.insiderTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-black font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
