"use client";

import { useState } from "react";

interface ChecklistItem {
  id: string;
  category: "Visual" | "Core SEO" | "Content" | "Network";
  title: string;
  description: string;
  impact: "High" | "Medium" | "Essential";
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "photo",
    category: "Visual",
    title: "High-Contrast Professional Headshot",
    description: "Clear facial lighting, neutral background, looking at the camera. Profiles with photos get 21x more views.",
    impact: "Essential",
  },
  {
    id: "banner",
    category: "Visual",
    title: "Custom Branded Header Banner",
    description: "1584x396px graphic stating your core technical focus (e.g. 'Full-Stack Architecture | Distributed Systems').",
    impact: "High",
  },
  {
    id: "headline",
    category: "Core SEO",
    title: "Keyword & Metrics Optimized Headline",
    description: "Include target role, primary stack keywords, and a scale metric under 220 characters.",
    impact: "Essential",
  },
  {
    id: "about",
    category: "Content",
    title: "1st-Person Storytelling About Section",
    description: "Hook opening line + 3 structured paragraphs covering your journey, philosophy, key wins, and contact email.",
    impact: "High",
  },
  {
    id: "skills",
    category: "Core SEO",
    title: "Top 50 Ranked Skills for Recruiter Search",
    description: "Ensure your primary languages and frameworks are in your top 5 pinned skills for maximum search algorithm weight.",
    impact: "Essential",
  },
  {
    id: "featured",
    category: "Content",
    title: "Featured Section with Live Demos & GitHub",
    description: "Pin 2-3 links to high-impact live projects, technical blog posts, or verified certifications.",
    impact: "High",
  },
  {
    id: "custom_url",
    category: "Network",
    title: "Clean Custom Profile URL",
    description: "Claim linkedin.com/in/yourname instead of the default random numbers.",
    impact: "Medium",
  },
  {
    id: "recommendations",
    category: "Network",
    title: "At Least 2 Recent Peer/Manager Recommendations",
    description: "Social proof directly validates your technical execution and teamwork reliability.",
    impact: "Medium",
  },
];

export function ProfileChecklist() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    photo: true,
    custom_url: true,
  });

  const toggleItem = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const score = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header & Score Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h3 className="text-base sm:text-lg font-black text-black tracking-tight">
            LinkedIn Profile Strength Audit
          </h3>
          <p className="text-xs text-zinc-600">
            Actionable checklist to rank on page 1 of LinkedIn Recruiter searches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-2xl font-black text-black font-mono">{score}%</span>
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Profile Score</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-300 flex items-center justify-center text-xl">
            {score >= 80 ? "⭐" : score >= 50 ? "⚡" : "🎯"}
          </div>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden border border-zinc-200">
        <div
          className="bg-black h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isDone = !!completed[item.id];
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                isDone
                  ? "bg-zinc-50 border-zinc-300"
                  : "bg-white border-zinc-200 hover:border-black hover:bg-zinc-50"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg border mt-0.5 flex items-center justify-center text-xs transition-colors shrink-0 ${
                  isDone
                    ? "bg-black border-black text-white"
                    : "bg-white border-zinc-300"
                }`}
              >
                {isDone && "✓"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold ${
                      isDone ? "text-zinc-500 line-through" : "text-black"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {item.impact}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-1 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
