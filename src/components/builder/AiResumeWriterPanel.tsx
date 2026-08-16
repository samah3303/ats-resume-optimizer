"use client";

import React, { useState, useEffect } from "react";
import { ResumeData } from "@/types/builder";

interface AiResumeWriterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialAction?: "generate_summary" | "star_rewrite" | "suggest_skills" | "preflight_check";
  initialContent?: string;
  initialContext?: any;
  currentResumeData: ResumeData;
  onApply: (type: string, data: any, context?: any) => void;
}

type TabType = "generate_summary" | "star_rewrite" | "suggest_skills" | "preflight_check";

export default function AiResumeWriterPanel({
  isOpen,
  onClose,
  initialAction = "generate_summary",
  initialContent = "",
  initialContext = {},
  currentResumeData,
  onApply,
}: AiResumeWriterPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialAction);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Mode 1: Summary Generator state
  const [summaryTargetRole, setSummaryTargetRole] = useState(
    currentResumeData.personalInfo.jobTitle || "Senior Full-Stack Engineer"
  );
  const [summaryTone, setSummaryTone] = useState<"tech" | "executive" | "impact" | "entry">("tech");
  const [summaryKeyHighlights, setSummaryKeyHighlights] = useState(
    initialContent || currentResumeData.personalInfo.summary || ""
  );
  const [summaryResults, setSummaryResults] = useState<string[]>([]);

  // Mode 2: STAR Bullet Rewriter state
  const [bulletInput, setBulletInput] = useState(initialContent || "");
  const [bulletTargetRole, setBulletTargetRole] = useState(
    initialContext?.jobTitle || currentResumeData.personalInfo.jobTitle || ""
  );
  const [bulletMetricHint, setBulletMetricHint] = useState("");
  const [starResults, setStarResults] = useState<
    Array<{
      title: string;
      bullet: string;
      starBreakdown?: { situationTask: string; action: string; resultMetrics: string };
    }>
  >([]);

  // Mode 3: Skill Suggestions state
  const [skillTargetRole, setSkillTargetRole] = useState(
    currentResumeData.personalInfo.jobTitle || "Senior Software Engineer"
  );
  const [suggestedSkills, setSuggestedSkills] = useState<
    Array<{ category: string; skills: string[] }>
  >([]);
  const [selectedSkillsToAdd, setSelectedSkillsToAdd] = useState<string[]>([]);

  // Mode 4: ATS Pre-Flight Check state
  const [preflightResult, setPreflightResult] = useState<{
    atsScore: number;
    grade: string;
    summary: string;
    metrics: {
      bulletQuantificationPct: number;
      actionVerbDiversity: number;
      contactCompleteness: number;
      skillsDensity: number;
    };
    checks: Array<{
      id: string;
      status: "pass" | "warn" | "fail";
      title: string;
      message: string;
      recommendation?: string;
    }>;
  } | null>(null);

  // Sync state when initial props change
  useEffect(() => {
    if (initialAction) setActiveTab(initialAction);
    if (initialAction === "star_rewrite" && initialContent) {
      setBulletInput(initialContent);
    }
    if (initialAction === "generate_summary" && initialContent) {
      setSummaryKeyHighlights(initialContent);
    }
  }, [initialAction, initialContent]);

  // Handle AI API calls
  const handleRunAi = async () => {
    setLoading(true);
    setError("");

    try {
      if (activeTab === "generate_summary") {
        const res = await fetch("/api/builder/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate_summary",
            targetRole: summaryTargetRole,
            tone: summaryTone,
            keyHighlights: summaryKeyHighlights,
            currentResumeData,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to generate summary");
        setSummaryResults(data.summaries || []);
      } else if (activeTab === "star_rewrite") {
        const res = await fetch("/api/builder/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "star_rewrite",
            rawBullet: bulletInput,
            targetRole: bulletTargetRole,
            metricHint: bulletMetricHint,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to rewrite bullet");
        setStarResults(data.options || []);
      } else if (activeTab === "suggest_skills") {
        const existing = currentResumeData.skills.flatMap((s) => s.skills);
        const res = await fetch("/api/builder/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "suggest_skills",
            targetRole: skillTargetRole,
            existingSkills: existing,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to suggest skills");
        setSuggestedSkills(data.suggestedCategories || []);
        // Pre-select all suggested skills
        const all = (data.suggestedCategories || []).flatMap(
          (c: { skills: string[] }) => c.skills
        );
        setSelectedSkillsToAdd(all);
      } else if (activeTab === "preflight_check") {
        const res = await fetch("/api/builder/ai-assist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "preflight_check",
            resumeData: currentResumeData,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to run ATS diagnostic");
        setPreflightResult(data.preflight);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleSkillSelect = (skill: string) => {
    setSelectedSkillsToAdd((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] lg:w-[540px] bg-white border-l border-zinc-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out text-black">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">
            ⚡
          </div>
          <div>
            <h2 className="text-sm font-black text-black uppercase tracking-wider flex items-center gap-2">
              AI Resume Copilot
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 text-black border border-zinc-200 font-mono font-bold">
                DeepSeek-V4
              </span>
            </h2>
            <p className="text-[11px] text-zinc-500">
              Transform weak bullets, tailor keywords, and beat ATS algorithms
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-black text-xs font-bold touch-target flex items-center justify-center"
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 bg-zinc-50 px-3 pt-2 overflow-x-auto scrollbar-none gap-1">
        <button
          onClick={() => {
            setActiveTab("generate_summary");
            setError("");
          }}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "generate_summary"
              ? "bg-white text-black border-t-2 border-black shadow-sm font-black"
              : "text-zinc-500 hover:text-black"
          }`}
        >
          <span>✨</span>
          <span>Summary</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("star_rewrite");
            setError("");
          }}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "star_rewrite"
              ? "bg-white text-black border-t-2 border-black shadow-sm font-black"
              : "text-zinc-500 hover:text-black"
          }`}
        >
          <span>⚡</span>
          <span>STAR Rewrite</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("suggest_skills");
            setError("");
          }}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "suggest_skills"
              ? "bg-white text-black border-t-2 border-black shadow-sm font-black"
              : "text-zinc-500 hover:text-black"
          }`}
        >
          <span>🎯</span>
          <span>Skill Match</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("preflight_check");
            setError("");
          }}
          className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "preflight_check"
              ? "bg-white text-black border-t-2 border-black shadow-sm font-black"
              : "text-zinc-500 hover:text-black"
          }`}
        >
          <span>🔍</span>
          <span>ATS Check</span>
        </button>
      </div>

      {/* Main Dock Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold">
            ⚠️ {error}
          </div>
        )}

        {/* TAB 1: EXECUTIVE SUMMARY */}
        {activeTab === "generate_summary" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                Target Role / Headline
              </label>
              <input
                type="text"
                value={summaryTargetRole}
                onChange={(e) => setSummaryTargetRole(e.target.value)}
                placeholder="e.g. Lead Staff Engineer, Product Director"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                Narrative Tone
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "tech", label: "Metrics-Driven Tech" },
                  { id: "executive", label: "Executive & Visionary" },
                  { id: "impact", label: "Direct & High-Impact" },
                  { id: "entry", label: "Growth & High-Potential" },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSummaryTone(t.id as any)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left ${
                      summaryTone === t.id
                        ? "bg-black text-white border-black"
                        : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-black"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                Key Background / Metrics / Superpowers (Optional)
              </label>
              <textarea
                rows={3}
                value={summaryKeyHighlights}
                onChange={(e) => setSummaryKeyHighlights(e.target.value)}
                placeholder="e.g. 7 years React/Node.js, scaled to 2M users, cut AWS cost 30%..."
                className="w-full p-3 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black leading-relaxed shadow-sm"
              />
            </div>

            <button
              onClick={handleRunAi}
              disabled={loading}
              className="w-full py-3 px-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-black"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Executive Summaries...</span>
                </>
              ) : (
                "✨ Generate 3 ATS Summaries"
              )}
            </button>

            {/* Generated Summary Variations */}
            {summaryResults.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-zinc-200">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Select High-Impact Summary:
                </h3>
                {summaryResults.map((summary, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5 hover:border-black transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                        Option #{idx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(summary, idx)}
                          className="text-[11px] font-bold text-zinc-600 hover:text-black"
                        >
                          {copiedIndex === idx ? "✓ Copied" : "📋 Copy"}
                        </button>
                        <button
                          onClick={() => {
                            onApply("summary", summary);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-800 border border-black"
                        >
                          Apply to Resume
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-800 leading-relaxed font-medium">{summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: STAR BULLET REWRITER */}
        {activeTab === "star_rewrite" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                Weak / Unquantified Bullet Point <span className="text-black">*</span>
              </label>
              <textarea
                rows={3}
                value={bulletInput}
                onChange={(e) => setBulletInput(e.target.value)}
                placeholder="e.g. Worked on the frontend and fixed bugs to make the app faster..."
                className="w-full p-3 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black leading-relaxed shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                Target Role / Context (Optional)
              </label>
              <input
                type="text"
                value={bulletTargetRole}
                onChange={(e) => setBulletTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                Outcome / Metric Hint (Optional)
              </label>
              <input
                type="text"
                value={bulletMetricHint}
                onChange={(e) => setBulletMetricHint(e.target.value)}
                placeholder="e.g. reduced load time by 40%, supported 500k users..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
              />
            </div>

            <button
              onClick={handleRunAi}
              disabled={loading || !bulletInput.trim()}
              className="w-full py-3 px-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-black"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Rewriting with STAR Framework...</span>
                </>
              ) : (
                "⚡ Transform into STAR Metric"
              )}
            </button>

            {/* STAR Rewrite Variations */}
            {starResults.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-zinc-200">
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  3 High-Impact STAR Variations:
                </h3>
                {starResults.map((opt, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5 hover:border-black transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                        {opt.title || `Option #${idx + 1}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(opt.bullet, idx)}
                          className="text-[11px] font-bold text-zinc-600 hover:text-black"
                        >
                          {copiedIndex === idx ? "✓ Copied" : "📋 Copy"}
                        </button>
                        <button
                          onClick={() => {
                            onApply("bullet", opt.bullet, initialContext);
                            onClose();
                          }}
                          className="px-2.5 py-1 rounded-lg bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-800 border border-black"
                        >
                          Apply to Bullet
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-800 leading-relaxed font-medium">
                      ● {opt.bullet}
                    </p>

                    {opt.starBreakdown && (
                      <div className="p-3 rounded-xl bg-white border border-zinc-200 text-[11px] space-y-1 shadow-sm">
                        <p className="text-zinc-700">
                          <strong className="text-black">Situation/Task:</strong>{" "}
                          {opt.starBreakdown.situationTask}
                        </p>
                        <p className="text-zinc-700">
                          <strong className="text-black">Action:</strong>{" "}
                          {opt.starBreakdown.action}
                        </p>
                        <p className="text-zinc-700">
                          <strong className="text-black">Result Metric:</strong>{" "}
                          {opt.starBreakdown.resultMetrics}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUGGEST SKILLS */}
        {activeTab === "suggest_skills" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-900 mb-1">
                Target Role / Domain <span className="text-black">*</span>
              </label>
              <input
                type="text"
                value={skillTargetRole}
                onChange={(e) => setSkillTargetRole(e.target.value)}
                placeholder="e.g. Lead Staff Cloud Architect, AI Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs text-black focus:outline-none focus:border-black shadow-sm"
              />
            </div>

            <button
              onClick={handleRunAi}
              disabled={loading || !skillTargetRole.trim()}
              className="w-full py-3 px-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-black"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analyzing ATS Keyword Gaps...</span>
                </>
              ) : (
                "🎯 Find High-Value Missing Skills"
              )}
            </button>

            {suggestedSkills.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Recommended Keywords:
                  </h3>
                  <button
                    onClick={() => {
                      onApply("skills", {
                        categories: suggestedSkills,
                        selected: selectedSkillsToAdd,
                      });
                      onClose();
                    }}
                    disabled={selectedSkillsToAdd.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-zinc-800 disabled:opacity-40 border border-black shadow-sm"
                  >
                    Add {selectedSkillsToAdd.length} Skills to Resume
                  </button>
                </div>

                {suggestedSkills.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2"
                  >
                    <span className="text-xs font-bold text-black uppercase tracking-wider">
                      {cat.category}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.skills.map((skill) => {
                        const isSelected = selectedSkillsToAdd.includes(skill);
                        return (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => toggleSkillSelect(skill)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected
                                ? "bg-black text-white border-black font-bold"
                                : "bg-white text-zinc-800 border-zinc-300 hover:border-black shadow-sm"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {skill}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ATS PRE-FLIGHT CHECK */}
        {activeTab === "preflight_check" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-center space-y-2">
              <span className="text-2xl">🛡️</span>
              <h3 className="text-sm font-bold text-black">
                Comprehensive ATS Pre-Flight Diagnostic
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Validates bullet point quantification, contact formatting, section completeness, and keyword density.
              </p>
              <button
                onClick={handleRunAi}
                disabled={loading}
                className="mt-2 py-2.5 px-6 bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all disabled:opacity-50 inline-flex items-center gap-2 border border-black"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Running Scan...</span>
                  </>
                ) : (
                  "🔍 Run Instant ATS Pre-Flight Scan"
                )}
              </button>
            </div>

            {preflightResult && (
              <div className="space-y-4 pt-2">
                {/* Score Banner */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                      Overall ATS Readiness
                    </span>
                    <h4 className="text-2xl font-black text-black mt-0.5">
                      {preflightResult.atsScore} / 100
                    </h4>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Grade: <span className="font-bold text-black">{preflightResult.grade}</span> — {preflightResult.summary}
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-full border-4 border-black flex items-center justify-center font-black text-sm text-black bg-white shadow-sm">
                    {preflightResult.atsScore}%
                  </div>
                </div>

                {/* Sub-metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-sm">
                    <span className="text-[10px] text-zinc-500 block">Bullet Metrics</span>
                    <span className="font-black text-black text-sm">
                      {preflightResult.metrics.bulletQuantificationPct}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-sm">
                    <span className="text-[10px] text-zinc-500 block">Action Verbs</span>
                    <span className="font-black text-black text-sm">
                      {preflightResult.metrics.actionVerbDiversity}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-sm">
                    <span className="text-[10px] text-zinc-500 block">Contact Integrity</span>
                    <span className="font-black text-black text-sm">
                      {preflightResult.metrics.contactCompleteness}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 shadow-sm">
                    <span className="text-[10px] text-zinc-500 block">Keyword Density</span>
                    <span className="font-black text-black text-sm">
                      {preflightResult.metrics.skillsDensity}%
                    </span>
                  </div>
                </div>

                {/* Diagnostic Itemized Checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                    Diagnostic Items:
                  </h4>
                  {preflightResult.checks.map((check) => (
                    <div
                      key={check.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        check.status === "pass"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                          : check.status === "warn"
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-rose-50 border-rose-200 text-rose-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        <span>{check.status === "pass" ? "✅" : check.status === "warn" ? "⚠️" : "❌"}</span>
                        <span>{check.title}</span>
                      </div>
                      <p className="text-zinc-700 text-[11px] leading-relaxed">
                        {check.message}
                      </p>
                      {check.recommendation && (
                        <p className="text-black text-[11px] font-bold pt-1 border-t border-zinc-200">
                          💡 Fix: {check.recommendation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
