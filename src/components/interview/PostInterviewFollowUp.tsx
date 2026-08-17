"use client";

import { useState } from "react";
import { FollowUpEmailResult } from "@/app/api/interview/follow-up/route";

export function PostInterviewFollowUp() {
  const [interviewerName, setInterviewerName] = useState("Sarah Jenkins");
  const [companyName, setCompanyName] = useState("Stripe");
  const [roleTitle, setRoleTitle] = useState("Staff Infrastructure Engineer");
  const [topicsDiscussed, setTopicsDiscussed] = useState(
    "Idempotency keys in distributed payments and high-throughput rate-limiting trade-offs"
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [emailResult, setEmailResult] = useState<FollowUpEmailResult | null>({
    subjectLine: "Thank you — Staff Infrastructure Engineer discussion | Alex Rivers",
    salutation: "Hi Sarah,",
    plainText: `Hi Sarah,

Thank you for taking the time to speak with me today regarding the Staff Infrastructure Engineer role at Stripe.

I really enjoyed our deep dive into idempotency keys in distributed payments and high-throughput rate-limiting trade-offs. Our conversation reinforced my excitement about the team's engineering velocity and technical roadmap.

Please let me know if you need any additional code samples, architectural references, or documentation from my end.

Best regards,
Alex Rivers`,
    bodyHtml: `<p>Hi Sarah,</p><p>Thank you for taking the time to speak with me today regarding the <strong>Staff Infrastructure Engineer</strong> role at <strong>Stripe</strong>.</p><p>I really enjoyed our deep dive into <em>idempotency keys in distributed payments and high-throughput rate-limiting trade-offs</em>. Our conversation reinforced my excitement about the team's engineering velocity and technical roadmap.</p><p>Please let me know if you need any additional code samples, architectural references, or documentation from my end.</p><p>Best regards,<br/>Alex Rivers</p>`,
    recommendedSendWindow: "Within 4 to 8 hours post-interview",
    keyTacticsUsed: ["Specific Technical Anchor", "Forward Value Projection", "Concise Executive Tone"],
  });

  const handleGenerate = async () => {
    if (!companyName.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/interview/follow-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewerName,
          companyName,
          roleTitle,
          topicsDiscussed,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate follow up");
      const json = await res.json();
      if (json.data) {
        setEmailResult(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!emailResult) return;
    navigator.clipboard.writeText(
      `Subject: ${emailResult.subjectLine}\n\n${emailResult.plainText}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
            ✉️ POST-INTERVIEW STRATEGY
          </span>
          <h3 className="text-base sm:text-lg font-black text-black mt-1">
            Executive Post-Interview &quot;Thank You&quot; Synthesizer
          </h3>
          <p className="text-xs text-zinc-600">
            Generate high-converting follow-up emails anchoring specific technical talking points discussed.
          </p>
        </div>

        {emailResult && (
          <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-xs font-bold text-black rounded-xl">
            ⏰ {emailResult.recommendedSendWindow}
          </span>
        )}
      </div>

      {/* Input Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
              Interviewer Name
            </label>
            <input
              type="text"
              value={interviewerName}
              onChange={(e) => setInterviewerName(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-black font-medium outline-none focus:border-black focus:bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-black font-medium outline-none focus:border-black focus:bg-white"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
              Role Title
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 text-xs text-black font-medium outline-none focus:border-black focus:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
            Specific Technical Topics Discussed in Round
          </label>
          <textarea
            value={topicsDiscussed}
            onChange={(e) => setTopicsDiscussed(e.target.value)}
            rows={2}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-black font-medium outline-none focus:border-black focus:bg-white"
            placeholder="e.g. Discussed distributed cache replication and p99 query latency tuning..."
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="touch-target px-6 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Synthesizing Follow-Up..." : "✨ Generate Strategic Follow-Up"}
          </button>
        </div>
      </div>

      {/* Generated Email Preview */}
      {emailResult && (
        <div className="space-y-4 pt-4 border-t border-zinc-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
              Ready-to-Send Executive Email:
            </span>
            <button
              onClick={copyToClipboard}
              className="px-4 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border border-black transition-all shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <span>{copied ? "✓ Copied to Clipboard!" : "📋 Copy Full Email"}</span>
            </button>
          </div>

          <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3 text-xs">
            <div className="pb-2 border-b border-zinc-200">
              <span className="font-mono text-zinc-500 font-bold">Subject: </span>
              <strong className="text-black font-sans">{emailResult.subjectLine}</strong>
            </div>
            <div className="whitespace-pre-line text-zinc-800 leading-relaxed font-sans font-medium">
              {emailResult.plainText}
            </div>
          </div>

          {/* Key Tactics Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] font-bold text-zinc-400 mr-1">Tactics Applied:</span>
            {emailResult.keyTacticsUsed.map((t, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-black"
              >
                ✓ {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
