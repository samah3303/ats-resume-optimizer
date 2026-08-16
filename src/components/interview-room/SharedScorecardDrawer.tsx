"use client";

import { useState } from "react";

interface SharedScorecardDrawerProps {
  candidateName: string;
  targetRole: string;
}

export function SharedScorecardDrawer({
  candidateName,
  targetRole,
}: SharedScorecardDrawerProps) {
  const [technicalRating, setTechnicalRating] = useState(4);
  const [communicationRating, setCommunicationRating] = useState(4);
  const [problemSolvingRating, setProblemSolvingRating] = useState(5);
  const [notes, setNotes] = useState(
    "Candidate articulated strong architectural reasoning for distributed Kafka event streaming and Redis caching."
  );
  const [recommendation, setRecommendation] = useState<"strong_hire" | "hire" | "lean_hire" | "no_hire">("strong_hire");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div>
            <h3 className="text-sm font-black text-black flex items-center gap-1.5">
              <span>📋</span> Recruiter Scorecard
            </h3>
            <p className="text-[11px] text-zinc-500">
              Candidate: <strong className="text-black">{candidateName}</strong> • {targetRole}
            </p>
          </div>
          {saved && (
            <span className="text-[10px] font-bold text-emerald-600">✓ Saved to ATS</span>
          )}
        </div>

        {/* Rating Sliders */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-zinc-700">Technical Depth:</span>
              <span className="font-mono font-black text-black">{technicalRating}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={technicalRating}
              onChange={(e) => setTechnicalRating(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-zinc-700">Communication & Clarity:</span>
              <span className="font-mono font-black text-black">{communicationRating}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={communicationRating}
              onChange={(e) => setCommunicationRating(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-zinc-700">Problem Solving & Architecture:</span>
              <span className="font-mono font-black text-black">{problemSolvingRating}/5</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={problemSolvingRating}
              onChange={(e) => setProblemSolvingRating(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>
        </div>

        {/* Recommendation Dropdown */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-100">
          <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
            Overall Hiring Recommendation
          </label>
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value as any)}
            className="w-full bg-zinc-50 border border-zinc-300 text-xs font-bold text-black rounded-xl px-3 py-2 outline-none"
          >
            <option value="strong_hire">STRONG HIRE (Top 5%)</option>
            <option value="hire">HIRE (Meets All Bars)</option>
            <option value="lean_hire">LEAN HIRE (Minor Gaps)</option>
            <option value="no_hire">NO HIRE</option>
          </select>
        </div>

        {/* Private Interviewer Notes */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider block">
            Private Interviewer Evaluation Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-black outline-none resize-none leading-relaxed"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        className="touch-target w-full py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black transition-all shadow-sm flex items-center justify-center gap-1.5"
      >
        <span>💾</span>
        <span>Submit Scorecard to ATS</span>
      </button>
    </div>
  );
}
