"use client";

import { useState } from "react";
import Link from "next/link";
import { Challenge } from "@/lib/challenges/data";
import { CodeEditorPanel } from "./CodeEditorPanel";
import { ProblemView } from "./ProblemView";
import { ConsoleTestRunner } from "./ConsoleTestRunner";
import { AiReviewModal } from "./AiReviewModal";
import { CodeExecutionResult, CodeReviewResult } from "@/lib/ai/code-reviewer";

interface CodingWorkspaceProps {
  challenge: Challenge;
}

export function CodingWorkspace({ challenge }: CodingWorkspaceProps) {
  const [language, setLanguage] = useState<"javascript" | "typescript" | "python">("javascript");
  const [code, setCode] = useState(challenge.templates.javascript);
  const [isRunning, setIsRunning] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [testResult, setTestResult] = useState<CodeExecutionResult | null>(null);
  const [aiReview, setAiReview] = useState<CodeReviewResult | null>(null);
  const [activePane, setActivePane] = useState<"code" | "problem">("code");

  const handleLanguageChange = (newLang: "javascript" | "typescript" | "python") => {
    setLanguage(newLang);
    setCode(challenge.templates[newLang] || challenge.templates.javascript);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/challenges/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: challenge.slug,
          code,
          language,
        }),
      });

      if (!res.ok) throw new Error("Execution failed");
      const json = await res.json();
      if (json.result) {
        setTestResult(json.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiReview = async () => {
    setIsReviewing(true);
    try {
      const res = await fetch("/api/challenges/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: challenge.slug,
          code,
          language,
        }),
      });

      if (!res.ok) throw new Error("Review request failed");
      const json = await res.json();
      if (json.review) {
        setAiReview(json.review);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 p-3 sm:p-6 flex flex-col gap-4 max-w-[1600px] mx-auto pb-24">
      {/* Top IDE Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-2">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/challenges"
            className="touch-target px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-xs font-bold text-black rounded-xl transition-all shadow-sm flex items-center gap-1"
          >
            <span>&larr;</span> All Challenges
          </Link>
          <span className="text-sm font-black text-black">{challenge.title}</span>
        </div>

        {/* Mobile toggle button between Problem & Code */}
        <div className="flex sm:hidden items-center gap-1 bg-zinc-100 border border-zinc-300 p-1 rounded-xl">
          <button
            onClick={() => setActivePane("problem")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activePane === "problem" ? "bg-black text-white" : "text-zinc-600"
            }`}
          >
            Problem
          </button>
          <button
            onClick={() => setActivePane("code")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              activePane === "code" ? "bg-black text-white" : "text-zinc-600"
            }`}
          >
            Code IDE
          </button>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[750px]">
        {/* Left: Problem Description Panel (5 cols) */}
        <div
          className={`lg:col-span-5 h-full ${
            activePane === "problem" ? "block" : "hidden sm:block"
          }`}
        >
          <ProblemView challenge={challenge} />
        </div>

        {/* Right: Code Editor & Console Runner (7 cols) */}
        <div
          className={`lg:col-span-7 flex flex-col gap-4 h-full ${
            activePane === "code" ? "block" : "hidden sm:flex"
          }`}
        >
          {/* Editor Panel (Top) */}
          <div className="flex-1 min-h-[440px]">
            <CodeEditorPanel
              code={code}
              onChange={setCode}
              language={language}
              onLanguageChange={handleLanguageChange}
              onRun={handleRunCode}
              onAiReview={handleAiReview}
              isRunning={isRunning}
              isReviewing={isReviewing}
            />
          </div>

          {/* Console / Test Runner Panel (Bottom) */}
          <div className="shrink-0">
            <ConsoleTestRunner result={testResult} isRunning={isRunning} />
          </div>
        </div>
      </div>

      {/* AI Review Modal */}
      {aiReview && (
        <AiReviewModal review={aiReview} onClose={() => setAiReview(null)} />
      )}
    </div>
  );
}
