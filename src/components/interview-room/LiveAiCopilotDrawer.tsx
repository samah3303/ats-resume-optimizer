"use client";

import { useState } from "react";
import { CopilotLiveInsight } from "@/lib/ai/interview-copilot";

interface LiveAiCopilotDrawerProps {
  targetRole: string;
}

export function LiveAiCopilotDrawer({ targetRole }: LiveAiCopilotDrawerProps) {
  const [transcriptSnippet, setTranscriptSnippet] = useState(
    "In our last microservices migration, we handled 15,000 requests per second across 8 Kubernetes pods by implementing Redis caching and asynchronous Kafka event streaming."
  );
  const [loading, setLoading] = useState(false);
  const [copilotInsight, setCopilotInsight] = useState<CopilotLiveInsight | null>({
    suggestedProbes: [
      "How did you handle cache invalidation and race conditions in Redis during high-traffic writes?",
      "What was your dead-letter queue (DLQ) strategy for failed Kafka consumer events?",
    ],
    factChecks: [
      {
        statement: "15,000 RPS across 8 Kubernetes pods with Redis + Kafka",
        verdict: "accurate",
        note: "Realistic throughput (~1,875 RPS/pod) for event-driven asynchronous microservices.",
      },
    ],
    demonstratedCompetencies: ["Distributed Systems", "Kafka Event-Driven Architecture", "Redis Caching"],
    candidateScorecardDraft: {
      technicalDepth: 5,
      communication: 4,
      problemSolving: 4,
      summaryNote: "Strong command of distributed caching and message queue scalability.",
    },
  });

  const handleGenerateProbes = async () => {
    if (!transcriptSnippet.trim() || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/interview-room/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recentTranscript: transcriptSnippet,
          targetRole,
        }),
      });

      if (!res.ok) throw new Error("Copilot failed");
      const json = await res.json();
      if (json.data) {
        setCopilotInsight(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm h-full flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase text-black">
              INTERVIEWER ONLY
            </span>
            <h3 className="text-sm font-black text-black flex items-center gap-1.5">
              <span>🤖</span> AI Live Copilot
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Listening
          </span>
        </div>

        {/* Real-Time Transcript Input / Stream */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
            Candidate Spoken Audio Stream (Last Turn)
          </label>
          <textarea
            value={transcriptSnippet}
            onChange={(e) => setTranscriptSnippet(e.target.value)}
            rows={2}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-900 outline-none leading-relaxed resize-none"
          />
          <div className="flex justify-end">
            <button
              onClick={handleGenerateProbes}
              disabled={loading}
              className="px-3 py-1 bg-black hover:bg-zinc-800 text-white font-black text-[11px] rounded-lg border border-black transition-all disabled:opacity-50"
            >
              {loading ? "Analyzing..." : "Generate Deep Probes"}
            </button>
          </div>
        </div>

        {/* Fact-Check Banner */}
        {copilotInsight?.factChecks && copilotInsight.factChecks.length > 0 && (
          <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-1 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
              <span>✓</span> AI Fact-Check Verification
            </span>
            <p className="text-zinc-800 leading-snug font-medium">
              {copilotInsight.factChecks[0].note}
            </p>
          </div>
        )}

        {/* Suggested Live Probes */}
        {copilotInsight?.suggestedProbes && (
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block">
              Suggested Next Follow-Up Probes:
            </span>
            <div className="space-y-2">
              {copilotInsight.suggestedProbes.map((probe, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-black leading-relaxed font-medium transition-all select-all shadow-xs"
                >
                  <span className="text-[10px] font-bold text-zinc-400 block mb-0.5">
                    Probe {idx + 1}:
                  </span>
                  "{probe}"
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demonstrated Competencies */}
        {copilotInsight?.demonstratedCompetencies && (
          <div className="space-y-1.5 pt-2 border-t border-zinc-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
              Demonstrated Skills:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {copilotInsight.demonstratedCompetencies.map((comp, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-lg bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-zinc-800"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-zinc-100 border border-zinc-200 rounded-2xl text-[11px] text-zinc-600 text-center">
        🔒 Candidate cannot see this panel. Powered by private real-time Copilot LLM.
      </div>
    </div>
  );
}
