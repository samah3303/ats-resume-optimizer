"use client";

import { useEffect, useState } from "react";
import Logo from "./Logo";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("INITIALIZING TALENT OS...");

  useEffect(() => {
    // Only show on initial cold start / PWA launch per session
    const hasSeenSplash = sessionStorage.getItem("paniund_pwa_splash_seen");
    if (hasSeenSplash) {
      setVisible(false);
      return;
    }

    // Progression timeline
    const t1 = setTimeout(() => {
      setProgress(55);
      setStatusText("LOADING VECTOR ENGINES...");
    }, 350);

    const t2 = setTimeout(() => {
      setProgress(90);
      setStatusText("STARTING WORKSPACE...");
    }, 700);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText("READY");
      setFading(true);
    }, 1050);

    const t4 = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("paniund_pwa_splash_seen", "true");
    }, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#09090B] text-[#FAFAFA] select-none transition-all duration-500 ease-out ${
        fading ? "opacity-0 pointer-events-none scale-105 blur-xs" : "opacity-100 scale-100"
      }`}
    >
      {/* Ambient Radial Glow */}
      <div className="absolute w-80 h-80 bg-zinc-800/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center space-y-6">
        {/* Animated App Icon Monogram Container */}
        <div className="relative group">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#18181B] border border-[#27272A] flex items-center justify-center shadow-2xl relative overflow-hidden">
            {/* SVG Logo Glyph with Subtle Shimmer */}
            <svg className="w-12 h-12 sm:w-14 sm:h-14" viewBox="0 0 512 512" fill="none">
              <g transform="translate(144, 116)">
                <rect x="24" y="24" width="44" height="240" rx="12" fill="#FAFAFA" />
                <path
                  d="M68 24C122 24 164 66 164 120C164 174 122 216 68 216H48V172H68C98 172 120 148 120 120C120 92 98 68 68 68H48V24H68Z"
                  fill="#FAFAFA"
                />
                <circle cx="196" cy="200" r="16" fill="#FAFAFA" />
              </g>
            </svg>

            {/* Glowing Sweep Beam */}
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Wordmark Title */}
        <div className="text-center space-y-1.5">
          <Logo size="lg" />
          <p className="text-[10px] sm:text-[11px] font-mono tracking-widest uppercase text-zinc-400 font-bold">
            The Talent Operating System
          </p>
        </div>

        {/* Progress Bar & Status Telemetry */}
        <div className="w-48 sm:w-56 space-y-2 pt-2">
          <div className="w-full h-[2px] bg-[#27272A] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#FAFAFA] rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_rgba(250,250,250,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 font-semibold">
            <span>{statusText}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
