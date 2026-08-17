"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  description: string;
  category: "Core" | "Interview & Video" | "Engineering" | "Recruiting & Swarm";
}

const commands: CommandItem[] = [
  {
    id: "resume-studio",
    title: "ATS Resume Studio",
    href: "/dashboard/builder",
    icon: "📄",
    description: "6 curated ATS templates, drag-drop editor & STAR rewriter",
    category: "Core",
  },
  {
    id: "coding-sandbox",
    title: "Coding Challenge Sandbox",
    href: "/dashboard/challenges",
    icon: "💻",
    description: "Monaco IDE, live unit assertions & AI Big-O analyzer",
    category: "Engineering",
  },
  {
    id: "voice-mock",
    title: "Conversational Spoken Mock Interview",
    href: "/dashboard/mock-interview",
    icon: "🎙️",
    description: "8 stage personas, Web Speech audio & real-time STAR coaching",
    category: "Interview & Video",
  },
  {
    id: "video-analytics",
    title: "Video Emotion & Composure Analytics",
    href: "/dashboard/video-analytics",
    icon: "👁️",
    description: "Computer vision HUD, eye contact meter & posture stability",
    category: "Interview & Video",
  },
  {
    id: "interview-rooms",
    title: "WebRTC Video Interview Rooms",
    href: "/dashboard/interview-rooms",
    icon: "📹",
    description: "P2P video rounds, synchronized live coding pad & AI copilot",
    category: "Interview & Video",
  },
  {
    id: "system-design",
    title: "System Design Whiteboard Arena",
    href: "/dashboard/whiteboard",
    icon: "📐",
    description: "Interactive architecture canvas & AI SPOF capacity grader",
    category: "Engineering",
  },
  {
    id: "job-hub",
    title: "Semantic Job Aggregator Hub",
    href: "/dashboard/jobs",
    icon: "🔍",
    description: "Multi-platform listings with 384-d pgvector resume matching",
    category: "Core",
  },
  {
    id: "salary-war-room",
    title: "Salary Negotiation War Room",
    href: "/dashboard/offers",
    icon: "💰",
    description: "4-year equity vesting curves & AI recruiter counter-offer bot",
    category: "Core",
  },
  {
    id: "agent-swarm",
    title: "Autonomous Agent Swarm & Radar",
    href: "/dashboard/agents",
    icon: "🤖",
    description: "Hunter, Radar, Scout & Guardian 24/7 background agents",
    category: "Recruiting & Swarm",
  },
  {
    id: "recruiter-os",
    title: "Recruiter Talent Operating System",
    href: "/dashboard/recruiter",
    icon: "👔",
    description: "AI Job Description Architect & 8-stage applicant Kanban",
    category: "Recruiting & Swarm",
  },
  {
    id: "linkedin-optimizer",
    title: "LinkedIn Brand Optimizer",
    href: "/dashboard/linkedin",
    icon: "⚡",
    description: "Headlines, About stories, SEO skills & cold outreach drips",
    category: "Core",
  },
  {
    id: "app-tracker",
    title: "Job Application Kanban Tracker",
    href: "/dashboard/tracker",
    icon: "📊",
    description: "Visual application pipeline and interview stages",
    category: "Core",
  },
  {
    id: "admin-os",
    title: "Master Admin & Telemetry OS",
    href: "/admin",
    icon: "🛡️",
    description: "Multi-tenant telemetry, user moderation & AI token ledger",
    category: "Recruiting & Swarm",
  },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredCommands = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.href.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      document.body.style.overflow = "hidden";
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!isOpen) return;

    const handleModalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      if (filteredCommands.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          handleExecuteCommand(selected);
        }
      }
    };

    window.addEventListener("keydown", handleModalKeyDown);
    return () => window.removeEventListener("keydown", handleModalKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeElement = listRef.current.children[selectedIndex] as HTMLElement;
    if (activeElement) {
      activeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex, isOpen]);

  const handleExecuteCommand = (command: CommandItem) => {
    setIsOpen(false);
    setQuery("");
    router.push(command.href);
  };

  return (
    <>
      {/* Floating shortcut pill */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-zinc-300 text-zinc-700 hover:text-black hover:border-black shadow-lg transition-all duration-200 text-xs font-mono group cursor-pointer"
        title="Open Command Palette (⌘K / Ctrl+K)"
        aria-label="Open Command Palette"
      >
        <span className="text-black text-sm group-hover:rotate-12 transition-transform" aria-hidden="true">⚡</span>
        <span className="font-sans font-bold text-black text-xs">Omni Search</span>
        <kbd className="bg-zinc-100 border border-zinc-300 px-1.5 py-0.5 rounded-md text-[10px] text-black font-mono font-bold shadow-xs">
          ⌘K
        </kbd>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
        >
          <div
            className="w-full max-w-xl bg-white border border-black rounded-3xl shadow-2xl text-zinc-900 overflow-hidden flex flex-col p-4 sm:p-6 gap-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Search Input */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-zinc-400 text-base pointer-events-none" aria-hidden="true">
                🔍
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to any module or type action..."
                className="w-full bg-zinc-50 border border-zinc-200 text-black focus:border-black focus:bg-white outline-none pl-11 pr-12 py-3 rounded-2xl placeholder-zinc-400 text-sm font-sans transition-colors duration-200 font-medium"
              />
              <kbd className="absolute right-4 px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] text-zinc-500 font-mono pointer-events-none">
                ESC
              </kbd>
            </div>

            {/* Command List */}
            <div
              ref={listRef}
              className="max-h-96 overflow-y-auto space-y-1.5 pr-1 text-sm"
              role="listbox"
            >
              {filteredCommands.length > 0 ? (
                filteredCommands.map((command, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={command.id}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleExecuteCommand(command)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? "bg-black text-white border border-black shadow-sm"
                          : "text-zinc-700 border border-transparent hover:bg-zinc-100 hover:text-black"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 transition-colors ${
                            isSelected
                              ? "bg-zinc-800 text-white"
                              : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                          }`}
                        >
                          {command.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-sm font-black truncate ${isSelected ? "text-white" : "text-black"}`}>
                            {command.title}
                          </span>
                          <span className={`text-xs truncate ${isSelected ? "text-zinc-300" : "text-zinc-500"}`}>
                            {command.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isSelected && (
                          <span className="text-xs font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded-lg border border-zinc-700 hidden sm:inline-block">
                            ↵ Open
                          </span>
                        )}
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                          isSelected ? "bg-zinc-800 text-zinc-300" : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                        }`}>
                          {command.category}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-zinc-400 text-sm">
                  <p className="text-2xl mb-1">🔍</p>
                  <p>No matching modules found for &quot;{query}&quot;</p>
                </div>
              )}
            </div>

            {/* Modal Footer Hints */}
            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">↵</kbd> Select
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-black">KYRO OMNI</span>
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-black font-bold">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
