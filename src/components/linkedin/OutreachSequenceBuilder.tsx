"use client";

import { useState } from "react";
import { ColdOutreachSequenceResult, ColdOutreachStep } from "@/lib/ai/linkedin";

interface OutreachSequenceBuilderProps {
  initialSequence?: ColdOutreachSequenceResult | null;
  defaultCandidateName?: string;
}

export function OutreachSequenceBuilder({
  initialSequence = null,
  defaultCandidateName = "",
}: OutreachSequenceBuilderProps) {
  const [targetCompany, setTargetCompany] = useState("Stripe");
  const [roleTitle, setRoleTitle] = useState("Staff Frontend Engineer");
  const [recruiterName, setRecruiterName] = useState("Sarah Jenkins");
  const [valueProp, setValueProp] = useState("scaling React micro-frontends and optimizing Web Vitals");
  const [candidateName, setCandidateName] = useState(defaultCandidateName || "Alex");
  const [loading, setLoading] = useState(false);
  const [sequence, setSequence] = useState<ColdOutreachSequenceResult | null>(initialSequence);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/linkedin/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          targetCompany,
          roleTitle,
          recruiterName,
          valueProp,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate outreach sequence");
      const json = await res.json();
      if (json.data) {
        setSequence(json.data);
        setActiveStepIndex(0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentStep: ColdOutreachStep | undefined = sequence?.steps[activeStepIndex];

  return (
    <div className="space-y-6">
      {/* Configuration Box */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm mb-2">
              <span>✉️</span> Recruiter InMail & Cold Email Studio
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              3-Step High-Conversion Outreach Sequence
            </h2>
            <p className="text-xs text-zinc-600 mt-1">
              Generate timed, hyper-personalized outreach sequences that convert cold recruiters into interview invitations.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="touch-target min-h-[44px] px-6 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-2xl border border-black shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Drafting Sequence...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>{sequence ? "Regenerate Sequence" : "Generate 3-Step Sequence"}</span>
              </>
            )}
          </button>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-zinc-200">
          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Target Company
            </label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. OpenAI / Stripe / Airbnb"
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Target Role
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Staff Software Engineer"
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Recruiter / Manager Name
            </label>
            <input
              type="text"
              value={recruiterName}
              onChange={(e) => setRecruiterName(e.target.value)}
              placeholder="e.g. Sarah Jenkins (or Hiring Team)"
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Core Technical Value Proposition
            </label>
            <input
              type="text"
              value={valueProp}
              onChange={(e) => setValueProp(e.target.value)}
              placeholder="e.g. scaling distributed Go services"
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Sequence Timeline & Email Viewer */}
      {sequence && (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Step Timeline Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sequence.steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all shadow-sm ${
                  activeStepIndex === idx
                    ? "bg-black text-white border-black"
                    : "bg-zinc-50 text-zinc-900 border-zinc-200 hover:border-black"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                  <span className={activeStepIndex === idx ? "text-zinc-300" : "text-zinc-500"}>
                    {step.dayDelay === 0 ? "DAY 1 (IMMEDIATE)" : `DAY ${step.dayDelay + 1}`}
                  </span>
                  <span className="font-mono">{step.characterCount} chars</span>
                </div>
                <div className="font-black text-xs sm:text-sm">
                  Step {step.stepNumber}: {step.name}
                </div>
              </button>
            ))}
          </div>

          {/* Current Step Editor / Preview */}
          {currentStep && (
            <div className="space-y-5 pt-2">
              {/* Subject Lines Options */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
                  Recommended Subject Line(s):
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentStep.subjectLines.map((subj, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3 text-xs flex-1 min-w-[280px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-mono">
                          {subj.openRateScore}% Open Rate
                        </span>
                        <span className="font-bold text-black">{subj.subject}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(subj.subject, `subj-${sIdx}`)}
                        className="text-[11px] font-bold text-zinc-600 hover:text-black shrink-0 px-2 py-1 bg-white border border-zinc-300 rounded-lg shadow-sm"
                      >
                        {copiedKey === `subj-${sIdx}` ? "✓" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Body Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                    Message Body ({currentStep.characterCount} chars — Mobile friendly):
                  </span>
                  <span className="text-[11px] text-zinc-500 italic">
                    💡 {currentStep.purpose}
                  </span>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 text-xs text-zinc-900 leading-relaxed whitespace-pre-line font-sans select-all">
                  {currentStep.body}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => {
                    const subj = currentStep.subjectLines[0]?.subject || "";
                    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(currentStep.body)}`;
                    window.open(mailtoUrl, "_blank");
                  }}
                  className="touch-target px-5 py-2.5 bg-white hover:bg-zinc-100 border border-zinc-300 hover:border-black text-xs font-bold text-black rounded-xl transition-all shadow-sm flex items-center gap-2"
                >
                  <span>📫</span>
                  <span>Open in Default Mail App</span>
                </button>

                <button
                  onClick={() => copyToClipboard(currentStep.body, "current-body")}
                  className="touch-target px-6 py-2.5 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border border-black transition-all shadow-sm flex items-center gap-2"
                >
                  <span>{copiedKey === "current-body" ? "✓ Copied to Clipboard" : "📋 Copy Message Body"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Outreach Strategy Tips */}
          {sequence.outreachTips && sequence.outreachTips.length > 0 && (
            <div className="pt-4 border-t border-zinc-200 space-y-2">
              <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
                Executive Cold Outreach Protocol:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {sequence.outreachTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-700 leading-relaxed"
                  >
                    ✓ {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
