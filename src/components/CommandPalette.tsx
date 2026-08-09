"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  title: string;
  href: string;
  icon: string;
  description: string;
}

const commands: CommandItem[] = [
  {
    id: "run-ats-scan",
    title: "Run ATS Scan",
    href: "/dashboard/studio",
    icon: "⚡",
    description: "Scan & optimize resume against job description",
  },
  {
    id: "upload-resume",
    title: "Upload Resume",
    href: "/dashboard/resumes",
    icon: "📄",
    description: "Manage resume versions and documents",
  },
  {
    id: "view-roadmap",
    title: "View Roadmap",
    href: "/dashboard/roadmap",
    icon: "🗺️",
    description: "Career progression and skill milestone roadmap",
  },
  {
    id: "open-tracker",
    title: "Open Tracker",
    href: "/dashboard/tracker",
    icon: "📊",
    description: "Track job applications and interview status",
  },
  {
    id: "all-tools",
    title: "All Tools",
    href: "/dashboard/tools",
    icon: "🧩",
    description: "Explore AI utilities and career features",
  },
  {
    id: "job-descriptions",
    title: "Job Descriptions",
    href: "/dashboard/jds",
    icon: "💼",
    description: "Saved job descriptions and key requisites",
  },
  {
    id: "interview-prep",
    title: "Interview Prep",
    href: "/dashboard/interview",
    icon: "🎙️",
    description: "AI interview practice questions & feedback",
  },
  {
    id: "cover-letter",
    title: "Cover Letter",
    href: "/dashboard/outreach",
    icon: "✉️",
    description: "Generate tailored outreach & cover letters",
  },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter commands based on user query
  const filteredCommands = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.href.toLowerCase().includes(q)
    );
  });

  // Global shortcut listener for Cmd+K / Ctrl+K
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

  // Handle focus, index reset, and body overflow when modal state changes
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

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Modal keyboard navigation: Arrow Up/Down, Enter, Escape
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

  // Scroll active item into view
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
      {/* Subtle floating shortcut hint button in bottom-right corner of the page */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14161D]/80 backdrop-blur-xl border border-amber-500/20 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 shadow-xl transition-all duration-200 text-xs font-mono group cursor-pointer"
        title="Open Command Palette (⌘K / Ctrl+K)"
        aria-label="Open Command Palette"
      >
        <span className="text-amber-400 text-sm group-hover:rotate-12 transition-transform">⚡</span>
        <span className="font-sans font-medium text-slate-300 text-xs">Commands</span>
        <kbd className="bg-[#090A0C] border border-[#242834] px-1.5 py-0.5 rounded text-[10px] text-amber-300/90 font-mono shadow-inner">
          ⌘K
        </kbd>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
        >
          {/* Centered Modal Content Card */}
          <div
            className="w-full max-w-xl bg-[#14161D] border border-amber-500/30 rounded-3xl shadow-2xl backdrop-blur-2xl text-white overflow-hidden flex flex-col p-4 sm:p-6 gap-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Search Input */}
            <div className="relative flex items-center">
              <span className="absolute left-4 text-amber-400 text-lg pointer-events-none">
                🔍
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                className="w-full bg-[#090A0C] border border-[#242834] text-white focus:border-amber-500 outline-none pl-11 pr-12 py-3.5 rounded-2xl placeholder-slate-500 text-sm font-sans transition-colors duration-200 shadow-inner"
              />
              <kbd className="absolute right-4 px-2 py-0.5 rounded bg-[#14161D] border border-[#242834] text-[11px] text-slate-400 font-mono pointer-events-none">
                ESC
              </kbd>
            </div>

            {/* Command List */}
            <div
              ref={listRef}
              className="max-h-80 overflow-y-auto space-y-1.5 pr-1 text-sm scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
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
                          ? "bg-amber-500/20 border-amber-500/30 text-amber-300 font-semibold border"
                          : "text-slate-300 border border-transparent hover:bg-[#1A1D26] hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-colors ${
                            isSelected
                              ? "bg-amber-500/30 text-amber-300"
                              : "bg-[#090A0C] text-slate-300 border border-[#242834]"
                          }`}
                        >
                          {command.icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {command.title}
                          </span>
                          <span className="text-xs text-slate-400 truncate">
                            {command.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {isSelected && (
                          <span className="text-xs font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 hidden sm:inline-block">
                            ↵ Select
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-slate-500 group-hover:text-slate-400">
                          {command.href}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  <p className="text-2xl mb-1">🔍</p>
                  <p>No matching commands found for &quot;{query}&quot;</p>
                </div>
              )}
            </div>

            {/* Modal Footer Hints */}
            <div className="pt-2 border-t border-[#242834]/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-[#090A0C] border border-[#242834]">↑</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-[#090A0C] border border-[#242834]">↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-[#090A0C] border border-[#242834]">↵</kbd> Open
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>ResuMatch Palette</span>
                <kbd className="px-1.5 py-0.5 rounded bg-[#090A0C] border border-[#242834] text-amber-400">⌘K</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
