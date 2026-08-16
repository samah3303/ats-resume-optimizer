"use client";

import { useState, useEffect, useRef } from "react";
import {
  PersonaMetadata,
  VoiceChatMessage,
  VoiceTurnResponse,
  FinalInterviewDiagnostic,
} from "@/lib/ai/voice-interview";
import { AudioWaveformVisualizer } from "./AudioWaveformVisualizer";
import { InterviewScorecardReport } from "./InterviewScorecardReport";

interface VoiceInterviewRoomProps {
  initialGreeting: string;
  interviewer: PersonaMetadata;
  targetRole: string;
  onExit: () => void;
}

export function VoiceInterviewRoom({
  initialGreeting,
  interviewer,
  targetRole,
  onExit,
}: VoiceInterviewRoomProps) {
  const [messages, setMessages] = useState<VoiceChatMessage[]>([
    {
      role: "assistant",
      content: initialGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [spokenTranscript, setSpokenTranscript] = useState("");
  const [latestFeedback, setLatestFeedback] = useState<VoiceTurnResponse["realtimeFeedback"] | null>(null);
  const [finalReport, setFinalReport] = useState<FinalInterviewDiagnostic | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const recognitionRef = useRef<any>(null);
  const speechStartTimeRef = useRef<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        speechStartTimeRef.current = Date.now();
      };

      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setSpokenTranscript(final || interim);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    // Auto-speak initial greeting
    speakText(initialGreeting);

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, spokenTranscript]);

  const speakText = (text: string) => {
    if (isMuted || typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      if (spokenTranscript.trim()) {
        handleSendAnswer(spokenTranscript);
      }
    } else {
      setSpokenTranscript("");
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {}
      }
    }
  };

  const handleSendAnswer = async (answerText: string) => {
    if (!answerText.trim() || isThinking) return;

    // Calculate WPM and filler words
    const durationMin = Math.max(0.1, (Date.now() - speechStartTimeRef.current) / 60000);
    const words = answerText.trim().split(/\s+/).length;
    const wpm = Math.round(words / durationMin);

    const fillerWordsMatches = answerText.match(/\b(um|uh|like|you know|basically|actually)\b/gi) || [];

    const userMsg: VoiceChatMessage = {
      role: "user",
      content: answerText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      metrics: {
        wpm: Math.min(260, Math.max(80, wpm)),
        fillerWordsCount: fillerWordsMatches.length,
      },
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setSpokenTranscript("");
    setIsThinking(true);

    try {
      const res = await fetch("/api/voice-interview/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: interviewer.type,
          targetRole,
          conversationHistory: newHistory.map((m) => ({ role: m.role, content: m.content })),
          latestSpokenAnswer: answerText,
          wpm: userMsg.metrics?.wpm,
          fillerWords: fillerWordsMatches,
        }),
      });

      if (!res.ok) throw new Error("Turn failed");
      const json = await res.json();
      if (json.data) {
        const reply: VoiceTurnResponse = json.data;
        const aiMsg: VoiceChatMessage = {
          role: "assistant",
          content: reply.spokenReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setLatestFeedback(reply.realtimeFeedback);
        speakText(reply.spokenReply);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleFinishInterview = async () => {
    setIsFinishing(true);
    window.speechSynthesis?.cancel();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    try {
      const res = await fetch("/api/voice-interview/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          persona: interviewer.type,
          targetRole,
          fullConversation: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Finish evaluation failed");
      const json = await res.json();
      if (json.data) {
        setFinalReport(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFinishing(false);
    }
  };

  if (finalReport) {
    return (
      <InterviewScorecardReport
        report={finalReport}
        interviewer={interviewer}
        targetRole={targetRole}
        onRestart={onExit}
      />
    );
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6 shadow-sm max-w-6xl mx-auto min-h-[720px] flex flex-col justify-between">
      {/* Top Header & Interviewer Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-2xl shadow-sm">
            {interviewer.avatarEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-black">
                {interviewer.interviewerName}
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                {interviewer.role}
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              {interviewer.title} • Target: <strong className="text-black">{targetRole}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              if (!isMuted) window.speechSynthesis?.cancel();
            }}
            className={`touch-target px-3 py-1.5 text-xs font-bold rounded-xl border transition-all shadow-sm ${
              isMuted
                ? "bg-zinc-200 text-zinc-700 border-zinc-300"
                : "bg-white text-black border-zinc-300 hover:border-black"
            }`}
            title="Toggle Text-to-Speech audio"
          >
            {isMuted ? "🔇 Audio Muted" : "🔊 Audio On"}
          </button>

          <button
            onClick={handleFinishInterview}
            disabled={isFinishing || messages.length < 2}
            className="touch-target px-4 py-1.5 bg-black hover:bg-zinc-800 text-white text-xs font-black rounded-xl border border-black shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isFinishing ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <span>🏁</span>
                <span>Finish & Review Scorecard</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Center Stage: Audio Waveform & Speech Visualizer */}
      <div className="py-6 px-4 bg-zinc-50 border border-zinc-200 rounded-3xl text-center space-y-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? "bg-emerald-500 animate-pulse"
                : isListening
                ? "bg-black animate-ping"
                : isThinking
                ? "bg-amber-500 animate-spin"
                : "bg-zinc-400"
            }`}
          />
          <span className="text-xs font-black uppercase tracking-wider text-black">
            {isSpeaking
              ? `${interviewer.interviewerName} is Speaking...`
              : isListening
              ? "Listening to Your Voice..."
              : isThinking
              ? `${interviewer.interviewerName} is Evaluating Answer...`
              : "Ready for Your Answer"}
          </span>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <AudioWaveformVisualizer
          isListening={isListening}
          isSpeaking={isSpeaking}
          isThinking={isThinking}
        />

        {/* Live Interim Transcript Banner */}
        {spokenTranscript && (
          <div className="p-3 bg-white border border-zinc-300 rounded-2xl max-w-xl mx-auto text-xs text-black font-medium animate-fadeIn shadow-sm">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-0.5">
              Live Speech Input:
            </span>
            "{spokenTranscript}"
          </div>
        )}
      </div>

      {/* Transcript Stream & Coach Feedback Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[300px]">
        {/* Left: Chat Stream (8 cols) */}
        <div className="lg:col-span-8 bg-zinc-50 border border-zinc-200 rounded-3xl p-5 space-y-4 overflow-y-auto max-h-[360px] shadow-sm">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1 px-1">
                <span>{msg.role === "user" ? "You" : interviewer.interviewerName}</span>
                <span>• {msg.timestamp}</span>
                {msg.metrics?.wpm && (
                  <span className="text-black font-mono">
                    ({msg.metrics.wpm} WPM)
                  </span>
                )}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[88%] shadow-sm ${
                  msg.role === "user"
                    ? "bg-black text-white rounded-br-none"
                    : "bg-white border border-zinc-200 text-zinc-900 rounded-bl-none font-sans"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Right: Live Coach Insights Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-zinc-200 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                LIVE COACH FEEDBACK
              </span>
              {latestFeedback && (
                <span className="text-xs font-mono font-black text-black">
                  {latestFeedback.contentScore}/100
                </span>
              )}
            </div>

            {latestFeedback ? (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase block">
                    STAR Structure Score
                  </span>
                  <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full rounded-full"
                      style={{ width: `${latestFeedback.starStructureScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase block">
                    Strength:
                  </span>
                  <p className="text-xs text-zinc-800 leading-snug">
                    ✓ {latestFeedback.strengths[0]}
                  </p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-900 block">
                    ⚡ Instant Tip for Next Answer:
                  </span>
                  <p className="text-xs text-amber-900 leading-snug">
                    {latestFeedback.improvementTip}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-400 text-xs">
                Speak your answer to receive turn-by-turn STAR scoring and speech cadence feedback.
              </div>
            )}
          </div>

          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[11px] text-zinc-600 text-center">
            💡 Keep answers concise between <strong>45–90 seconds</strong>.
          </div>
        </div>
      </div>

      {/* Bottom Microphone Control Toolbar */}
      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-xs text-zinc-600 text-center sm:text-left">
          {speechSupported ? (
            <span>Click <strong>{isListening ? "Stop & Submit" : "Speak Answer"}</strong> to record with microphone</span>
          ) : (
            <span className="text-rose-600">Microphone not supported in this browser. You can type answers below.</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Main Push-to-Talk / Continuous Mic Button */}
          <button
            onClick={toggleListening}
            disabled={isThinking}
            className={`touch-target min-h-[48px] px-8 py-3 rounded-2xl text-xs font-black transition-all flex items-center gap-2 active:scale-95 shadow-md ${
              isListening
                ? "bg-rose-600 hover:bg-rose-700 text-white border border-rose-600 animate-pulse"
                : "bg-black hover:bg-zinc-800 text-white border border-black"
            }`}
          >
            <span className="text-base">{isListening ? "⏹" : "🎙️"}</span>
            <span>{isListening ? "Stop & Submit Answer" : "Start Speaking Answer"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
