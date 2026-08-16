"use client";

import { useState } from "react";
import { INTERVIEW_PERSONAS, InterviewPersonaType } from "@/lib/ai/voice-interview";

interface InterviewSetupModalProps {
  resumes?: { id: string; name: string }[];
  onStartSession: (config: {
    persona: InterviewPersonaType;
    targetRole: string;
    companyTarget: string;
    resumeId?: string;
    difficulty: "junior" | "mid" | "senior" | "staff" | "executive";
  }) => void;
  isLoading?: boolean;
}

export function InterviewSetupModal({
  resumes = [],
  onStartSession,
  isLoading = false,
}: InterviewSetupModalProps) {
  const [selectedPersona, setSelectedPersona] = useState<InterviewPersonaType>("phone_screen");
  const [targetRole, setTargetRole] = useState("Staff Frontend Engineer");
  const [companyTarget, setCompanyTarget] = useState("Stripe / Tier 1 Tech");
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [difficulty, setDifficulty] = useState<"junior" | "mid" | "senior" | "staff" | "executive">("senior");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartSession({
      persona: selectedPersona,
      targetRole,
      companyTarget,
      resumeId: selectedResumeId || undefined,
      difficulty,
    });
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="pb-4 border-b border-zinc-200 space-y-1">
        <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm mb-2">
          <span>🎙️</span> AI Spoken Interview Engine
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
          Select Your Mock Interview Stage & Persona
        </h2>
        <p className="text-xs text-zinc-600">
          Simulate high-stakes spoken interviews with realistic AI interviewers, voice speech recognition, and instant turn-by-turn coaching.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Persona Selection Grid (8 options) */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
            1. Choose Interview Stage & Interviewer Persona
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.values(INTERVIEW_PERSONAS).map((p) => {
              const isSelected = selectedPersona === p.type;
              return (
                <div
                  key={p.type}
                  onClick={() => setSelectedPersona(p.type)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none shadow-sm ${
                    isSelected
                      ? "bg-black text-white border-black ring-2 ring-black"
                      : "bg-white text-zinc-900 border-zinc-200 hover:border-black hover:bg-zinc-50"
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{p.avatarEmoji}</span>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          isSelected ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        {p.role.split(" ")[0]}
                      </span>
                    </div>

                    <h4 className="text-xs font-black leading-tight">
                      {p.title}
                    </h4>

                    <p
                      className={`text-[10px] leading-relaxed line-clamp-2 ${
                        isSelected ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {p.focusArea}
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold block pt-1 border-t ${
                      isSelected ? "border-zinc-800 text-zinc-400" : "border-zinc-100 text-zinc-400"
                    }`}
                  >
                    with {p.interviewerName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuration Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-200">
          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Target Role Title
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Backend Architect"
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Target Company (Optional)
            </label>
            <input
              type="text"
              value={companyTarget}
              onChange={(e) => setCompanyTarget(e.target.value)}
              placeholder="e.g. Stripe / Google / Seed Startup"
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Seniority Level
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs font-bold text-zinc-900 rounded-xl px-3.5 py-2.5 outline-none shadow-sm cursor-pointer"
            >
              <option value="junior">Junior / Entry Level</option>
              <option value="mid">Mid-Level Engineer</option>
              <option value="senior">Senior Engineer</option>
              <option value="staff">Staff / Principal Architect</option>
              <option value="executive">Engineering Manager / Director</option>
            </select>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <span>🎙️</span>
            <span>Microphone & Text-to-Speech audio enabled in browser</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="touch-target min-h-[44px] px-8 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-2xl border border-black shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Connecting to Interviewer...</span>
              </>
            ) : (
              <>
                <span>▶</span>
                <span>Enter Voice Interview Room</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
