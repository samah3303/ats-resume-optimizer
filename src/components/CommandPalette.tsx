"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceMode } from "./WorkspaceModeContext";

interface CommandItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  description: string;
  category: "Core" | "Interview & Video" | "Engineering" | "Recruiting & Swarm" | "Workspace Switcher";
  persona: "candidate" | "recruiter" | "all";
}

const allCommands: CommandItem[] = [
  {
    id: "resume-studio",
    title: "ATS Resume Studio",
    href: "/dashboard/builder",
    icon: "📄",
    description: "6 curated ATS templates, drag-drop editor & STAR rewriter",
    category: "Core",
    persona: "candidate",
  },
  {
    id: "job-hub",
    title: "Semantic Job Aggregator Hub",
    href: "/dashboard/jobs",
    icon: "🔍",
    description: "Multi-platform listings with 384-d pgvector resume matching",
    category: "Core",
    persona: "candidate",
  },
  {
    id: "coding-sandbox",
    title: "Coding Challenge Sandbox",
    href: "/dashboard/challenges",
    icon: "💻",
    description: "Monaco IDE, live unit assertions & AI Big-O analyzer",
    category: "Engineering",
    persona: "candidate",
  },
  {
    id: "system-design",
    title: "System Design Whiteboard Arena",
    href: "/dashboard/whiteboard",
    icon: "📐",
    description: "Interactive architecture canvas & AI SPOF capacity grader",
    category: "Engineering",
    persona: "candidate",
  },
  {
    id: "voice-mock",
    title: "Conversational Spoken Mock Interview",
    href: "/dashboard/mock-interview",
    icon: "🎙️",
    description: "8 stage personas, Web Speech audio & real-time STAR coaching",
    category: "Interview & Video",
    persona: "candidate",
  },
  {
    id: "company-radar",
    title: "Company-Specific Interview Radar",
    href: "/dashboard/interview",
    icon: "🏢",
    description: "Predicted questions for Google, Stripe, Amazon & Meta",
    category: "Interview & Video",
    persona: "candidate",
  },
  {
    id: "video-analytics",
    title: "Video Emotion & Composure Analytics",
    href: "/dashboard/video-analytics",
    icon: "👁️",
    description: "Computer vision HUD, eye contact meter & posture stability",
    category: "Interview & Video",
    persona: "candidate",
  },
  {
    id: "salary-war-room",
    title: "Salary Negotiation War Room",
    href: "/dashboard/offers",
    icon: "💰",
    description: "4-year equity vesting curves & AI recruiter counter-offer bot",
    category: "Core",
    persona: "candidate",
  },
  {
    id: "agent-swarm",
    title: "Autonomous Agent Swarm & Radar",
    href: "/dashboard/agents",
    icon: "🤖",
    description: "Hunter, Radar, Scout & Guardian 24/7 background agents",
    category: "Recruiting & Swarm",
    persona: "candidate",
  },
  {
    id: "app-tracker",
    title: "Kanban Application Tracker",
    href: "/dashboard/tracker",
    icon: "📊",
    description: "Visual application pipeline & 1-click Swarm sync",
    category: "Core",
    persona: "candidate",
  },
  {
    id: "linkedin-optimizer",
    title: "LinkedIn Brand Optimizer",
    href: "/dashboard/linkedin",
    icon: "⚡",
    description: "4 headline variations, summary writer & cold outreach sequences",
    category: "Core",
    persona: "candidate",
  },

  // Recruiter Specific Commands
  {
    id: "recruiter-hq",
    title: "Recruiter Talent Command Center",
    href: "/dashboard/recruiter",
    icon: "👔",
    description: "Active job requisitions, hiring velocity & applicant pipeline",
    category: "Recruiting & Swarm",
    persona: "recruiter",
  },
  {
    id: "job-architect",
    title: "AI Job Description Architect",
    href: "/dashboard/recruiter",
    icon: "📝",
    description: "Generate structured, bias-free job descriptions in 15 seconds",
    category: "Recruiting & Swarm",
    persona: "recruiter",
  },
  {
    id: "recruiter-pipeline",
    title: "8-Stage Candidate Pipeline Kanban",
    href: "/dashboard/recruiter/pipeline/engineering-lead-01",
    icon: "📋",
    description: "Drag-drop candidate tracker from Applied to Hired",
    category: "Recruiting & Swarm",
    persona: "recruiter",
  },
  {
    id: "interview-rooms",
    title: "WebRTC Video Interview Rooms",
    href: "/dashboard/interview-rooms",
    icon: "📹",
    description: "P2P video rounds, synchronized live coding pad & AI copilot",
    category: "Interview & Video",
    persona: "all",
  },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { mode, setMode } = useWorkspaceMode();

  // Keyboard shortcut listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [open]);

  // Persona-Aware Filtered Commands
  const currentPersonaCommands = allCommands.filter(
    (c) => c.persona === "all" || c.persona === mode
  );

  const filteredCommands = currentPersonaCommands.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  // Arrow Key Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      router.push(filteredCommands[selectedIndex].href);
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open command palette"
        className="touch-target fixed bottom-20 right-6 md:bottom-8 md:right-8 z-40 bg-black text-white hover:bg-zinc-800 p-3.5 rounded-2xl shadow-xl border border-black transition-all flex items-center gap-2.5 active:scale-95 group"
      >
        <span className="text-base" aria-hidden="true">⌘</span>
        <span className="hidden sm:inline text-xs font-black">
          {mode === "candidate" ? "Candidate Menu" : "Recruiter Menu"}
        </span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-zinc-800 text-[10px] font-mono text-zinc-300 rounded border border-zinc-700">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={() => setOpen(false)}
      />

      {/* Palette Modal */}
      <div className="bg-[#18181B] border border-[#27272A] rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-[#FAFAFA]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#27272A] flex items-center gap-3">
          <span className="text-zinc-400 text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              mode === "candidate"
                ? "Search candidate tools, resumes, mocks, coding... (or type > to switch)"
                : "Search recruiter tools, jobs, pipelines, candidates..."
            }
            className="w-full bg-transparent text-sm font-semibold text-[#FAFAFA] placeholder-zinc-500 outline-none"
          />
          <kbd className="px-2 py-0.5 bg-[#09090B] border border-[#27272A] text-[10px] font-mono text-zinc-400 rounded">
            ESC
          </kbd>
        </div>

        {/* Mode Switcher Shortcut Bar */}
        <div className="px-4 py-2 bg-[#09090B] border-b border-[#27272A] flex items-center justify-between text-xs">
          <span className="text-[11px] font-bold text-zinc-400">
            Active Workspace: <strong className="text-[#FAFAFA] uppercase">{mode}</strong>
          </span>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "candidate" ? "recruiter" : "candidate");
              setOpen(false);
            }}
            className="text-[11px] font-bold text-[#FAFAFA] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>⇄ Switch to {mode === "candidate" ? "Recruiter OS" : "Candidate Suite"}</span>
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-[#27272A]">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    router.push(item.href);
                    setOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all ${
                    isSelected
                      ? "bg-[#FAFAFA] text-[#09090B]"
                      : "hover:bg-[#222226] text-[#FAFAFA]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black ${isSelected ? "text-[#09090B]" : "text-[#FAFAFA]"}`}>
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isSelected
                              ? "bg-zinc-200 text-zinc-800"
                              : "bg-[#27272A] text-zinc-300 border border-[#3F3F46]"
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p
                        className={`text-[11px] line-clamp-1 mt-0.5 ${
                          isSelected ? "text-zinc-700" : "text-zinc-400"
                        }`}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-mono shrink-0 ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                    &rarr;
                  </span>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2">
              <span className="text-2xl">🔎</span>
              <p className="text-xs font-bold text-black">No matching commands found</p>
              <p className="text-[11px] text-zinc-500">
                Try searching for &quot;Resume&quot;, &quot;Code&quot;, &quot;Mock&quot;, or &quot;Recruiter&quot;
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-[#09090B] border-t border-[#27272A] flex items-center justify-between text-[10px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span><kbd className="font-bold text-zinc-300">↑↓</kbd> to navigate</span>
            <span><kbd className="font-bold text-zinc-300">↵</kbd> to select</span>
          </div>
          <span className="font-bold lowercase">paniund omni-search</span>
        </div>
      </div>
    </div>
  );
}
