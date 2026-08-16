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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn text-zinc-900">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto space-y-6 text-zinc-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Wizard Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
          <div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-white">
              ⚡ 1-Click Resume Fixer Wizard
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-black mt-1">
              Guided ATS Score Booster
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Review and apply high-impact STAR improvements designed for your target position.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-black text-xl font-bold p-1 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="flex items-center justify-between gap-2 p-1.5 bg-zinc-100 rounded-2xl border border-zinc-200">
          <button
            onClick={() => setCurrentStep(1)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              currentStep === 1
                ? "bg-black text-white font-black shadow-sm"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            1. Current Status
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              currentStep === 2
                ? "bg-black text-white font-black shadow-sm"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            2. Review STAR Fixes ({acceptedCount}/{displaySuggestions.length})
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              currentStep === 3
                ? "bg-black text-white font-black shadow-sm"
                : "text-zinc-600 hover:text-black"
            }`}
          >
            3. Optimized Output
          </button>
        </div>

        {/* STEP 1: Current Status Overview */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <TrafficLightStatus score={overallScore} size="lg" />

            <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
              <h3 className="text-xs font-black text-black uppercase tracking-wider">
                Why 1-Click Fix Works:
              </h3>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Recruiters filter candidates using automated ATS algorithms. By converting passive task descriptions (e.g. <em>&quot;Responsible for tasks&quot;</em>) into <strong>STAR Action Bullet Points with quantified metric outcomes</strong>, your resume ranks in the top 5% of candidate searches.
              </p>
            </div>

            <button
              onClick={() => setCurrentStep(2)}
              className="w-full py-3.5 px-6 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Proceed to Review 3 STAR Fixes</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* STEP 2: Review & Accept Fixes */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-800 font-bold">
              <span>Estimated Boosted Score:</span>
              <span className="text-base font-black text-black">{estimatedNewScore}% Match 📈</span>
            </div>

            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {displaySuggestions.map((item, idx) => {
                const isAccepted = !!acceptedFixes[idx];
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all space-y-3 ${
                      isAccepted
                        ? "bg-zinc-50 border-black shadow-sm"
                        : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {item.section}
                      </span>
                      <button
                        onClick={() => handleToggleAccept(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                          isAccepted
                            ? "bg-black text-white shadow-sm"
                            : "bg-white text-zinc-900 border border-zinc-300 hover:border-black"
                        }`}
                      >
                        {isAccepted ? "✓ Fix Accepted" : "+ Accept Fix"}
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 bg-zinc-100 rounded-xl border border-zinc-200">
                        <span className="text-[10px] font-bold text-zinc-500 block mb-0.5">Original:</span>
                        <p className="text-zinc-500 line-through">{item.originalText}</p>
                      </div>

                      <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200">
                        <span className="text-[10px] font-bold text-black block mb-0.5">Suggested STAR Bullet:</span>
                        <p className="text-zinc-900 font-semibold">{item.suggestedText}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-black transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="py-3 px-6 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center gap-2"
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
            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-3xl text-center space-y-2">
              <div className="text-3xl">🎉</div>
              <h3 className="text-lg font-black text-black">Your Optimized Resume STAR Bullets Ready!</h3>
              <p className="text-xs text-zinc-600">
                You accepted {acceptedCount} fixes. Estimated new ATS compatibility: <strong>{estimatedNewScore}% Match</strong>.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-3">
              <h4 className="text-xs font-black text-black uppercase tracking-wider">
                Copied STAR Bullets Summary:
              </h4>
              <div className="space-y-2">
                {displaySuggestions.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-zinc-200 flex items-center justify-between gap-3 text-xs">
                    <p className="font-mono text-zinc-800 truncate flex-1">&bull; {item.suggestedText}</p>
                    <button
                      onClick={() => handleCopy(item.suggestedText, idx)}
                      className={`px-3 py-1 font-bold rounded-lg text-xs transition-all shrink-0 ${copiedIndex === idx ? "bg-black text-white" : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200"}`}
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
                className="w-full sm:flex-1 py-3.5 px-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-2xl text-center shadow-sm transition-all"
              >
                📥 Export ATS PDF in Builder
              </a>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-800 font-bold text-xs rounded-2xl transition-all"
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
