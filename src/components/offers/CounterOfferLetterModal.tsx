"use client";

import { useState } from "react";
import { CounterOfferLetterResult } from "@/lib/ai/negotiation";

export function CounterOfferLetterModal() {
  const [companyName, setCompanyName] = useState("ScaleUp Tech");
  const [roleTitle, setRoleTitle] = useState("Staff Software Engineer");
  const [recruiterName, setRecruiterName] = useState("Sarah Jenkins");
  const [candidateName, setCandidateName] = useState("Alex Rivers");
  const [currentBase, setCurrentBase] = useState(165000);
  const [requestedBase, setRequestedBase] = useState(185000);
  const [currentEquity, setCurrentEquity] = useState(120000);
  const [requestedEquity, setRequestedEquity] = useState(150000);
  const [currentSignOn, setCurrentSignOn] = useState(10000);
  const [requestedSignOn, setRequestedSignOn] = useState(25000);
  const [keyLeveragePoints, setKeyLeveragePoints] = useState("10+ years scaling distributed microservices and a competing offer at $190k base");

  const [loading, setLoading] = useState(false);
  const [letterData, setLetterData] = useState<CounterOfferLetterResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/negotiate/counter-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          companyName,
          roleTitle,
          recruiterName,
          currentBase,
          requestedBase,
          currentEquity,
          requestedEquity,
          currentSignOn,
          requestedSignOn,
          keyLeveragePoints,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate letter");
      const json = await res.json();
      if (json.data) {
        setLetterData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm mb-2">
            <span>📝</span> Written Counter-Offer Synthesizer
          </span>
          <h3 className="text-xl font-black text-black">Formal Counter-Offer Letter Generator</h3>
          <p className="text-xs text-zinc-600">
            Generate an executive-level, non-confrontational counter-proposal email ready to send to HR.
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
              <span>Drafting Letter...</span>
            </>
          ) : (
            <>
              <span>✨</span>
              <span>Generate Counter Letter</span>
            </>
          )}
        </button>
      </div>

      {/* Input Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-white border border-zinc-300 text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
            Recruiter Name
          </label>
          <input
            type="text"
            value={recruiterName}
            onChange={(e) => setRecruiterName(e.target.value)}
            className="w-full bg-white border border-zinc-300 text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
            Current Base vs Requested
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentBase}
              onChange={(e) => setCurrentBase(Number(e.target.value))}
              className="w-1/2 bg-white border border-zinc-300 text-xs text-black rounded-xl px-3 py-2 outline-none shadow-sm"
            />
            <span className="text-xs font-bold text-zinc-400">&rarr;</span>
            <input
              type="number"
              value={requestedBase}
              onChange={(e) => setRequestedBase(Number(e.target.value))}
              className="w-1/2 bg-white border border-zinc-300 text-xs text-black rounded-xl px-3 py-2 outline-none shadow-sm"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
            Current Sign-on vs Requested
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentSignOn}
              onChange={(e) => setCurrentSignOn(Number(e.target.value))}
              className="w-1/2 bg-white border border-zinc-300 text-xs text-black rounded-xl px-3 py-2 outline-none shadow-sm"
            />
            <span className="text-xs font-bold text-zinc-400">&rarr;</span>
            <input
              type="number"
              value={requestedSignOn}
              onChange={(e) => setRequestedSignOn(Number(e.target.value))}
              className="w-1/2 bg-white border border-zinc-300 text-xs text-black rounded-xl px-3 py-2 outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
          Key Leverage Points / Market Justifications
        </label>
        <input
          type="text"
          value={keyLeveragePoints}
          onChange={(e) => setKeyLeveragePoints(e.target.value)}
          placeholder="e.g. Competing offer from BigTech at $195k, specialized Rust & Kubernetes domain expertise..."
          className="w-full bg-white border border-zinc-300 text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm"
        />
      </div>

      {/* Generated Letter Viewer */}
      {letterData && (
        <div className="space-y-4 pt-4 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-700">
              Subject: <strong className="text-black">{letterData.subjectLine}</strong>
            </span>
            <button
              onClick={() => copyToClipboard(letterData.fullLetterMarkdown)}
              className="touch-target px-5 py-2 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border border-black transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>{copied ? "✓ Copied to Clipboard" : "📋 Copy Email Text"}</span>
            </button>
          </div>

          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs text-zinc-900 leading-relaxed font-mono whitespace-pre-line select-all">
            {letterData.fullLetterMarkdown}
          </div>
        </div>
      )}
    </div>
  );
}
