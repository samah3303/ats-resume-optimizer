"use client";

import { FinalInterviewDiagnostic, PersonaMetadata } from "@/lib/ai/voice-interview";

interface InterviewScorecardReportProps {
  report: FinalInterviewDiagnostic;
  interviewer: PersonaMetadata;
  targetRole: string;
  onRestart: () => void;
}

export function InterviewScorecardReport({
  report,
  interviewer,
  targetRole,
  onRestart,
}: InterviewScorecardReportProps) {
  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case "strong_hire":
        return { label: "STRONG HIRE", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      case "hire":
        return { label: "HIRE", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "lean_hire":
        return { label: "LEAN HIRE", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "lean_no_hire":
        return { label: "LEAN NO HIRE", color: "bg-rose-50 text-rose-700 border-rose-200" };
      case "no_hire":
        return { label: "NO HIRE", color: "bg-rose-100 text-rose-800 border-rose-300" };
      default:
        return { label: "HIRE", color: "bg-zinc-100 text-zinc-800 border-zinc-300" };
    }
  };

  const recBadge = getRecommendationBadge(report.recommendation);

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{interviewer.avatarEmoji}</span>
            <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
              {interviewer.title} Evaluation
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
            Interview Performance Diagnostic
          </h2>
          <p className="text-xs text-zinc-600">
            Target Role: <strong className="text-black">{targetRole}</strong> • Evaluated by {interviewer.interviewerName}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-3xl font-black text-black font-mono">{report.overallScore}/100</span>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Overall Score</span>
          </div>
          <span className={`px-4 py-2 rounded-2xl text-xs font-black border uppercase tracking-wider ${recBadge.color}`}>
            {recBadge.label}
          </span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-black block">
          Executive Debrief Summary
        </span>
        <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-sans">
          {report.summary}
        </p>
      </div>

      {/* Category Performance Breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-black">
          Competency Radar Breakdown
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Technical Acumen", score: report.categoryScores.technicalAcumen },
            { label: "STAR Structure", score: report.categoryScores.starStructure },
            { label: "Speech Cadence", score: report.categoryScores.communicationPace },
            { label: "Executive Presence", score: report.categoryScores.executivePresence },
            { label: "Culture & Values", score: report.categoryScores.cultureAndValues },
          ].map((cat, idx) => (
            <div
              key={idx}
              className="p-4 bg-white border border-zinc-200 rounded-2xl text-center space-y-1 shadow-sm"
            >
              <span className="text-xl font-black text-black font-mono block">
                {cat.score}%
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                {cat.label}
              </span>
              <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-black h-full rounded-full"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-emerald-50/40 border border-emerald-200 rounded-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
            <span>✓</span> Top Interview Strengths
          </span>
          <ul className="space-y-2 text-xs text-emerald-950 font-medium list-disc list-inside">
            {report.topStrengths.map((str, idx) => (
              <li key={idx} className="leading-relaxed">
                {str}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-amber-50/40 border border-amber-200 rounded-2xl space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <span>⚡</span> Priority Areas for Next Mock
          </span>
          <ul className="space-y-2 text-xs text-amber-950 font-medium list-disc list-inside">
            {report.keyAreasToImprove.map((area, idx) => (
              <li key={idx} className="leading-relaxed">
                {area}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Question-by-Question Review */}
      {report.questionByQuestionReview && report.questionByQuestionReview.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-zinc-200">
          <h3 className="text-xs font-black uppercase tracking-wider text-black">
            Turn-by-Turn Question Critique
          </h3>

          <div className="space-y-4">
            {report.questionByQuestionReview.map((q, idx) => (
              <div
                key={idx}
                className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-zinc-500">
                      Question {idx + 1}
                    </span>
                    <h4 className="text-xs sm:text-sm font-black text-black">
                      {q.question}
                    </h4>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-white border border-zinc-300 font-mono text-xs font-black text-black shadow-sm shrink-0">
                    {q.score}/100
                  </span>
                </div>

                <div className="p-3.5 bg-white border border-zinc-200 rounded-xl space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                    Your Spoken Answer:
                  </span>
                  <p className="text-zinc-800 italic">"{q.candidateAnswerSummary}"</p>
                </div>

                <div className="text-xs text-zinc-700 leading-relaxed">
                  <strong className="text-black">Interviewer Feedback:</strong> {q.critique}
                </div>

                {q.modelAnswerSnippet && (
                  <div className="p-3.5 bg-zinc-100 border border-zinc-300 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] uppercase font-bold text-black block">
                      💡 Top 1% Model Answer Structure:
                    </span>
                    <p className="text-zinc-800 font-sans">{q.modelAnswerSnippet}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
        <button
          onClick={onRestart}
          className="touch-target px-6 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-2"
        >
          <span>🔄</span>
          <span>Start New Mock Interview Round</span>
        </button>
      </div>
    </div>
  );
}
