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
    label: "View Score",
    emoji: "📊",
    href: "/dashboard",
  },
  {
    label: "View Jobs",
    emoji: "💼",
    href: "/dashboard/jds",
  },
  {
    label: "Scan Resume",
    emoji: "📸",
    href: "/dashboard",
  },
];

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

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
      {/* Semi-transparent backdrop overlay when expanded */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
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
                className={`bg-[#14161D]/90 backdrop-blur-2xl border border-amber-500/30 text-white font-medium shadow-2xl hover:bg-[#1E222D] hover:border-amber-400/60 hover:text-amber-300 flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm whitespace-nowrap active:scale-95 transition-all duration-300 ease-out group ${
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
                <span className="font-semibold text-slate-100 group-hover:text-amber-300">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Main Floating Action Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close quick actions menu" : "Open quick actions menu"}
          className={`w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-2xl flex items-center justify-center border border-amber-400/50 text-2xl pointer-events-auto active:scale-95 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-[#090A0C] ${
            isOpen ? "rotate-90 shadow-amber-500/30" : "rotate-0 shadow-amber-500/20"
          }`}
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
