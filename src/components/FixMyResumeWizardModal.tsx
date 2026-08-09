"use client";

import { useState } from "react";
import TrafficLightStatus from "./TrafficLightStatus";

interface Suggestion {
  section: string;
  originalText: string;
  suggestedText: string;
  rationale: string;
}

interface FixMyResumeWizardModalProps {
  open: boolean;
  onClose: () => void;
  overallScore: number;
  suggestions: Suggestion[];
  missingSkills?: string[];
  resumeName?: string;
}

export default function FixMyResumeWizardModal({
  open,
  onClose,
  overallScore,
  suggestions = [],
  missingSkills = [],
  resumeName = "My Resume",
}: FixMyResumeWizardModalProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [acceptedFixes, setAcceptedFixes] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!open) return null;

  const displaySuggestions = suggestions.length > 0
    ? suggestions
    : missingSkills.map((skill) => ({
        section: "Key Skill Addition",
        originalText: `Missing target skill: "${skill}"`,
        suggestedText: `Engineered modules leveraging ${skill}, optimizing execution speed by 30%.`,
        rationale: `Directly satisfies recruiter screening filters for ${skill}.`,
      }));

  const handleToggleAccept = (idx: number) => {
    setAcceptedFixes((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const acceptedCount = Object.values(acceptedFixes).filter(Boolean).length;
  const estimatedNewScore = Math.min(95, overallScore + acceptedCount * 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn text-white">
      <div
        className="bg-[#14161D] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-amber-500/30 max-h-[90vh] overflow-y-auto space-y-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Wizard Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#242834]">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              ⚡ 1-Click Resume Fixer Wizard
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Guided ATS Score Booster
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review and apply high-impact STAR improvements designed for your target position.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="flex items-center justify-between gap-2 p-1.5 bg-[#090A0C] rounded-2xl border border-[#242834]">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              currentStep === 1
                ? "bg-amber-500 text-slate-950 font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            1. Current Status
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              currentStep === 2
                ? "bg-amber-500 text-slate-950 font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            2. Review STAR Fixes ({acceptedCount}/{displaySuggestions.length})
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              currentStep === 3
                ? "bg-amber-500 text-slate-950 font-black"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            3. Optimized Output
          </button>
        </div>

        {/* STEP 1: Current Status Overview */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <TrafficLightStatus score={overallScore} size="lg" />

            <div className="p-5 bg-[#090A0C] rounded-2xl border border-[#242834] space-y-3">
              <h3 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Why 1-Click Fix Works:
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Recruiters filter candidates using automated ATS algorithms. By converting passive task descriptions (e.g. <em>&quot;Responsible for tasks&quot;</em>) into <strong>STAR Action Bullet Points with quantified metric outcomes</strong>, your resume ranks in the top 5% of candidate searches.
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Review 3 STAR Fixes</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* STEP 2: Review & Accept Fixes */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-300 font-bold">
              <span>Estimated Boosted Score:</span>
              <span className="text-base font-black text-emerald-400">{estimatedNewScore}% Match 📈</span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {displaySuggestions.map((item, idx) => {
                const isAccepted = !!acceptedFixes[idx];
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isAccepted
                        ? "bg-emerald-950/40 border-emerald-800"
                        : "bg-[#090A0C] border-[#242834]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                        {item.section}
                      </span>
                      <button
                        onClick={() => handleToggleAccept(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          isAccepted
                            ? "bg-emerald-500 text-slate-950"
                            : "bg-[#14161D] text-amber-400 border border-[#242834] hover:bg-[#1C1F2B]"
                        }`}
                      >
                        {isAccepted ? "✓ Fix Accepted" : "+ Accept Fix"}
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-rose-950/40 rounded-xl border border-rose-900/40">
                        <span className="text-[10px] font-black text-rose-400 block mb-0.5">Original:</span>
                        <p className="text-zinc-400 line-through">{item.originalText}</p>
                      </div>

                      <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-900/40">
                        <span className="text-[10px] font-black text-emerald-400 block mb-0.5">Suggested STAR Bullet:</span>
                        <p className="text-white font-medium">{item.suggestedText}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <span>View Optimized Output</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Optimized Output & Actions */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="p-5 bg-emerald-950/80 border border-emerald-800 rounded-3xl text-center space-y-2">
              <div className="text-3xl">🎉</div>
              <h3 className="text-lg font-black text-white">Your Optimized Resume STAR Bullets Ready!</h3>
              <p className="text-xs text-emerald-300">
                You accepted {acceptedCount} fixes. Estimated new ATS compatibility: <strong>{estimatedNewScore}% Match</strong>.
              </p>
            </div>

            <div className="p-4 bg-[#090A0C] rounded-2xl border border-[#242834] space-y-3">
              <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider">
                Copied STAR Bullets Summary:
              </h4>
              <div className="space-y-2">
                {displaySuggestions.map((item, idx) => (
                  <div key={idx} className="p-3 bg-[#14161D] rounded-xl border border-[#242834] flex items-center justify-between gap-3 text-xs">
                    <p className="font-mono text-zinc-200 truncate flex-1">&bull; {item.suggestedText}</p>
                    <button
                      onClick={() => handleCopy(item.suggestedText, idx)}
                      className={`px-3 py-1 font-bold rounded-lg text-xs transition-all shrink-0 ${copiedIndex === idx ? "bg-emerald-500/30 text-emerald-300 animate-copy-bounce" : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"}`}
                    >
                      {copiedIndex === idx ? "✅ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="/dashboard/builder"
                className="w-full sm:flex-1 py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl text-center shadow-lg shadow-amber-500/20 transition-all"
              >
                📥 Export ATS PDF in Builder
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#090A0C] border border-[#242834] hover:bg-[#14161D] text-white font-bold text-xs rounded-2xl transition-all"
              >
                Close Wizard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
