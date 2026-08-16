"use client";

import { useState } from "react";
import { RecruiterSimulationMessage, RecruiterSimulationTurnResponse } from "@/lib/ai/negotiation";

export function NegotiationWarRoomChat() {
  const [companyName, setCompanyName] = useState("ScaleUp Tech");
  const [roleTitle, setRoleTitle] = useState("Staff Software Engineer");
  const [currentOffer, setCurrentOffer] = useState("$165k Base, 10% Bonus, $120k Equity, $10k Sign-on");
  const [candidateGoal, setCandidateGoal] = useState("$185k Base or $30k Sign-on + $150k Equity");
  const [recruiterPersona, setRecruiterPersona] = useState<"collaborative_recruiter" | "firm_enterprise" | "startup_founder">("collaborative_recruiter");

  const [messages, setMessages] = useState<RecruiterSimulationMessage[]>([
    {
      role: "recruiter",
      content:
        "Hi Alex, we are thrilled to extend an offer for the Staff Software Engineer role at ScaleUp Tech! Our initial offer is $165,000 base salary, 10% annual bonus, $120,000 equity grant over 4 years, and a $10,000 signing bonus. We believe this is a very competitive package and would love to welcome you to the team.",
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [latestCoachInsight, setLatestCoachInsight] = useState<RecruiterSimulationTurnResponse["coachInsight"] | null>({
    tacticDetected: "Initial Anchor Offer",
    leverageAnalysis: "They want you and anchored first. You have strong room to negotiate sign-on and equity without risking the offer.",
    suggestedResponses: [
      "Thank you so much! I'm genuinely excited about the role. Based on my technical leadership and market data, I'm aiming for a base salary closer to $185,000.",
      "I appreciate the offer! If base salary bands are firm, could we bridge the gap through an increased sign-on bonus of $30,000?",
    ],
    riskLevel: "low",
    successProbability: 85,
  });

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const newHistory: RecruiterSimulationMessage[] = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/negotiate/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          roleTitle,
          currentOffer,
          candidateGoal,
          recruiterPersona,
          conversationHistory: messages,
          latestCandidateMessage: text,
        }),
      });

      if (!res.ok) throw new Error("Simulation request failed");
      const json = await res.json();
      if (json.data) {
        setMessages((prev) => [
          ...prev,
          { role: "recruiter", content: json.data.recruiterMessage },
        ]);
        setLatestCoachInsight(json.data.coachInsight);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Chat Screen (7 cols) */}
      <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between min-h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-black text-black">
                Live Recruiter Negotiation Bot
              </h3>
            </div>
            <p className="text-xs text-zinc-600">
              Roleplay with an AI Recruiter in real-time to master your counter-offer strategy.
            </p>
          </div>

          <select
            value={recruiterPersona}
            onChange={(e) => setRecruiterPersona(e.target.value as any)}
            className="bg-zinc-50 border border-zinc-300 text-xs font-bold text-zinc-900 rounded-xl px-3 py-1.5 outline-none shadow-sm"
          >
            <option value="collaborative_recruiter">Collaborative Recruiter</option>
            <option value="firm_enterprise">Strict Enterprise HR</option>
            <option value="startup_founder">Seed Startup Founder</option>
          </select>
        </div>

        {/* Message Stream */}
        <div className="space-y-4 overflow-y-auto max-h-[420px] p-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1 px-1">
                {m.role === "user" ? "You (Candidate)" : `${companyName} Recruiter`}
              </span>
              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-sm ${
                  m.role === "user"
                    ? "bg-black text-white rounded-br-none"
                    : "bg-zinc-50 border border-zinc-200 text-zinc-900 rounded-bl-none"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-zinc-500 italic p-2">
              <span className="w-3 h-3 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin" />
              <span>Recruiter is typing...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-zinc-200 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your negotiation reply..."
              className="flex-1 bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-4 py-3 outline-none shadow-sm transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-5 py-3 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black shadow-sm transition-all disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Right Intelligence / Coach Insight Panel (5 cols) */}
      <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
        <div className="space-y-5">
          <div className="pb-4 border-b border-zinc-200 flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-[10px] font-black uppercase tracking-wider text-black inline-block mb-1">
                SECRET COACH INTEL
              </span>
              <h3 className="text-base font-black text-black">Tactical Negotiation Advice</h3>
            </div>
            {latestCoachInsight && (
              <div className="text-right">
                <span className="text-lg font-black text-black font-mono">
                  {latestCoachInsight.successProbability}%
                </span>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Win Rate</span>
              </div>
            )}
          </div>

          {latestCoachInsight ? (
            <div className="space-y-4">
              {/* Tactic Detected */}
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  Recruiter Tactic Detected:
                </span>
                <p className="text-xs font-black text-black">
                  {latestCoachInsight.tacticDetected}
                </p>
              </div>

              {/* Leverage Analysis */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                  Your Leverage Point:
                </span>
                <p className="text-xs text-zinc-800 leading-relaxed bg-zinc-50 border border-zinc-200 p-3.5 rounded-2xl">
                  {latestCoachInsight.leverageAnalysis}
                </p>
              </div>

              {/* Suggested Reply Scripts */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
                  Recommended One-Click Responses:
                </span>
                {latestCoachInsight.suggestedResponses.map((resp, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSendMessage(resp)}
                    className="p-3 bg-white hover:bg-black hover:text-white border border-zinc-300 hover:border-black rounded-xl text-xs text-zinc-900 transition-all cursor-pointer shadow-sm group"
                  >
                    <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 block mb-1">
                      Option {idx + 1} (Click to Send):
                    </span>
                    <p className="font-medium">{resp}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-500 text-xs">
              Start chatting to reveal real-time coach intelligence.
            </div>
          )}
        </div>

        <div className="p-3.5 bg-zinc-100 border border-zinc-300 rounded-2xl text-center">
          <p className="text-[11px] text-zinc-700 font-medium">
            💡 <strong>Pro Tip:</strong> Never accept the first counter on the phone. Always say: <em>"Thank you, let me discuss this with my family and get back to you by tomorrow morning."</em>
          </p>
        </div>
      </div>
    </div>
  );
}
