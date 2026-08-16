"use client";

import { useState } from "react";
import { LinkedInOptimizationResult, LinkedInHeadline, LinkedInAbout } from "@/lib/ai/linkedin";

interface LinkedInOptimizerProps {
  initialData?: LinkedInOptimizationResult | null;
  resumes?: { id: string; name: string }[];
  defaultRole?: string;
}

export function LinkedInOptimizer({
  initialData = null,
  resumes = [],
  defaultRole = "Lead Full-Stack Engineer",
}: LinkedInOptimizerProps) {
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [industry, setIndustry] = useState("Technology & Software");
  const [tone, setTone] = useState<"bold" | "executive" | "technical" | "founder">("executive");
  const [selectedResumeId, setSelectedResumeId] = useState(resumes[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LinkedInOptimizationResult | null>(initialData);
  const [activeTab, setActiveTab] = useState<"headlines" | "about" | "skills" | "experience" | "tips">("headlines");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/linkedin/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: selectedResumeId,
          targetRole,
          industry,
          tone,
        }),
      });

      if (!res.ok) throw new Error("Failed to optimize profile");
      const json = await res.json();
      if (json.data) {
        setData(json.data);
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

  return (
    <div className="space-y-6">
      {/* Configuration & Trigger Card */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm mb-2">
              <span>⚡</span> LinkedIn Algorithm Optimizer
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight">
              Profile Brand & Recruiter Magnet
            </h2>
            <p className="text-xs text-zinc-600 mt-1">
              Generate keyword-indexed headlines, high-engagement storytelling bios, and the top 50 skills for recruiter search engines.
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
                <span>Optimizing Profile...</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>{data ? "Regenerate Optimization" : "Generate LinkedIn Profile"}</span>
              </>
            )}
          </button>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-zinc-200">
          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Target Role / Headline Goal
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Staff Frontend Engineer"
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Target Industry
            </label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Fintech / AI / SaaS"
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1.5">
              Brand Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full bg-white border border-zinc-300 focus:border-black text-xs font-semibold text-zinc-900 rounded-xl px-3.5 py-2.5 outline-none shadow-sm transition-all cursor-pointer"
            >
              <option value="executive">Executive & Authoritative</option>
              <option value="technical">Technical & Deep Systems</option>
              <option value="bold">High-Growth / Scale Metrics</option>
              <option value="founder">0→1 Builder / Founder</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      {data && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {[
              { id: "headlines", label: "🎯 4 Headlines", count: data.headlines.length },
              { id: "about", label: "📖 About Story", count: data.aboutStories.length },
              { id: "skills", label: "🏷️ Top 50 Skills", count: data.skillsTaxonomy.reduce((acc, c) => acc + c.skills.length, 0) },
              { id: "experience", label: "💼 Experience Bullets", count: data.experienceHighlights.length },
              { id: "tips", label: "💡 Profile Strategy", count: data.strategicTips.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`touch-target px-4 py-2 text-xs font-bold rounded-xl border transition-all whitespace-nowrap shadow-sm ${
                  activeTab === tab.id
                    ? "bg-black text-white border-black font-black"
                    : "bg-white text-zinc-700 border-zinc-200 hover:border-black"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Headlines */}
          {activeTab === "headlines" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.headlines.map((hl, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-zinc-200 hover:border-black rounded-3xl p-6 transition-all shadow-sm flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {hl.style.toUpperCase()} STYLE
                      </span>
                      <span
                        className={`text-[11px] font-mono font-bold ${
                          hl.charCount > 220 ? "text-rose-600" : "text-zinc-500"
                        }`}
                      >
                        {hl.charCount}/220 chars
                      </span>
                    </div>

                    <p className="text-sm font-bold text-black leading-relaxed font-sans select-all">
                      {hl.headline}
                    </p>

                    <p className="text-[11px] text-zinc-500 italic">
                      💡 {hl.explanation}
                    </p>
                  </div>

                  <button
                    onClick={() => copyToClipboard(hl.headline, `hl-${idx}`)}
                    className="touch-target w-full py-2.5 bg-zinc-50 hover:bg-black hover:text-white text-zinc-900 border border-zinc-300 hover:border-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>{copiedKey === `hl-${idx}` ? "✓ Copied to Clipboard" : "📋 Copy Headline"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: About / Summary */}
          {activeTab === "about" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {data.aboutStories.map((about, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                          Variation {idx + 1}
                        </span>
                        <h4 className="text-sm font-black text-black">{about.title}</h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-zinc-500">
                        ~{about.wordCount} words
                      </span>
                    </div>

                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 text-xs text-zinc-900 leading-relaxed whitespace-pre-line font-sans select-all">
                      {about.content}
                    </div>

                    {about.keyHighlights && about.keyHighlights.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
                          Story Highlights Encoded:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {about.keyHighlights.map((h, hIdx) => (
                            <span
                              key={hIdx}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-800"
                            >
                              ✓ {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => copyToClipboard(about.content, `about-${idx}`)}
                    className="touch-target w-full py-3 bg-black hover:bg-zinc-800 text-white border border-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>{copiedKey === `about-${idx}` ? "✓ Copied to Clipboard" : "📋 Copy About Section"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Top 50 Skills Taxonomy */}
          {activeTab === "skills" && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
                <div>
                  <h4 className="text-base font-black text-black">
                    Top Ranked Skills for LinkedIn SEO
                  </h4>
                  <p className="text-xs text-zinc-600">
                    Add these exact skills to your LinkedIn profile to appear in recruiter keyword filters.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allSkills = data.skillsTaxonomy.flatMap((c) => c.skills).join(", ");
                    copyToClipboard(allSkills, "all-skills");
                  }}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-xs font-black text-black rounded-xl transition-all shadow-sm"
                >
                  {copiedKey === "all-skills" ? "✓ All Copied" : "Copy All Skills List"}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.skillsTaxonomy.map((cat, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                        <span>🏷️</span> {cat.category}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500 font-bold">
                        {cat.skills.length} skills
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {cat.skills.map((skill, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => copyToClipboard(skill, `skill-${idx}-${sIdx}`)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 hover:bg-black hover:text-white border border-zinc-200 hover:border-black text-zinc-900 transition-all active:scale-95 shadow-sm"
                          title="Click to copy single skill"
                        >
                          {copiedKey === `skill-${idx}-${sIdx}` ? "✓ Copied" : skill}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Experience Bullets */}
          {activeTab === "experience" && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="pb-3 border-b border-zinc-200">
                <h4 className="text-base font-black text-black">
                  LinkedIn-Optimized Experience Bullets
                </h4>
                <p className="text-xs text-zinc-600">
                  Concise, high-velocity achievement statements optimized for recruiter mobile skimming.
                </p>
              </div>

              <div className="space-y-3">
                {data.experienceHighlights.map((bullet, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-zinc-50 border border-zinc-200 hover:border-black rounded-2xl flex items-center justify-between gap-4 transition-all shadow-sm group"
                  >
                    <p className="text-xs text-zinc-900 font-medium leading-relaxed flex-1 select-all">
                      • {bullet}
                    </p>
                    <button
                      onClick={() => copyToClipboard(bullet, `exp-${idx}`)}
                      className="px-3 py-1.5 bg-white hover:bg-black hover:text-white border border-zinc-300 text-[11px] font-black text-zinc-900 rounded-xl transition-all shrink-0 shadow-sm"
                    >
                      {copiedKey === `exp-${idx}` ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Profile Strategy */}
          {activeTab === "tips" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.strategicTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-zinc-200 rounded-3xl p-6 space-y-3 shadow-sm"
                >
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-lg">
                    💡
                  </div>
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">
                    {tip.title}
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
