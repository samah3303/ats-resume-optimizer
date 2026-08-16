"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface QuickAction {
  label: string;
  emoji: string;
  href: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Find Jobs",
    emoji: "🔍",
    href: "/dashboard/jobs",
  },
  {
    label: "Scan Resume",
    emoji: "⚡",
    href: "/dashboard/analyze",
  },
  {
    label: "Track App",
    emoji: "📋",
    href: "/dashboard/tracker",
  },
  {
    label: "Mock Interview",
    emoji: "🎤",
    href: "/dashboard/interview",
  },
];

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <style>{`
        @keyframes gentle-pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.25); }
          70% { box-shadow: 0 0 0 10px rgba(0, 0, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0); }
        }
        .animate-gentle-pulse {
          animation: gentle-pulse 2.5s infinite;
        }
      `}</style>

      {/* Semi-transparent backdrop overlay when expanded */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Container for Mini-Buttons + Main FAB */}
      <div className="fixed bottom-24 right-4 z-50 md:hidden flex flex-col items-end gap-3 pointer-events-none">
        {/* Fanning-out Mini Buttons Container */}
        <div
          className="flex flex-col items-end gap-2.5 transition-all duration-300 ease-out"
          role="menu"
          aria-orientation="vertical"
          aria-label="Quick Actions Menu"
        >
          {quickActions.map((action, index) => {
            const reverseIndex = quickActions.length - 1 - index;
            const transitionDelay = isOpen
              ? `${reverseIndex * 50}ms`
              : `${index * 30}ms`;

            return (
              <Link
                key={`${action.label}-${action.href}`}
                href={action.href}
                onClick={() => setIsOpen(false)}
                tabIndex={isOpen ? 0 : -1}
                className={`bg-white border border-zinc-200 text-zinc-900 font-semibold shadow-lg hover:border-black hover:bg-zinc-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm whitespace-nowrap active:scale-95 transition-all duration-300 ease-out group ${
                  isOpen
                    ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
                    : "opacity-0 translate-y-4 scale-90 pointer-events-none"
                }`}
                style={{ transitionDelay }}
              >
                <span
                  className="text-base group-hover:scale-110 transition-transform"
                  aria-hidden="true"
                >
                  {action.emoji}
                </span>
                <span className="font-semibold text-zinc-900 group-hover:text-black">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Main Floating Action Button */}
        <button
          type="button"
          onClick={() => {
            setIsOpen((prev) => !prev);
            setHasInteracted(true);
          }}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close quick actions menu" : "Open quick actions menu"}
          className={`w-14 h-14 rounded-full bg-black text-white hover:bg-zinc-800 font-black shadow-xl flex items-center justify-center border border-black text-2xl pointer-events-auto active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white ${
            isOpen ? "rotate-90" : "rotate-0"
          } ${!hasInteracted && !isOpen ? "animate-gentle-pulse" : ""}`}
        >
          <span
            className={`transition-transform duration-300 inline-block ${
              isOpen ? "scale-110" : "scale-100"
            }`}
          >
            {isOpen ? "✕" : "⚡"}
          </span>
        </button>
      </div>
    </>
  );
}
