"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if dismissed previously within the last 7 days
    const dismissedTime = localStorage.getItem("paniund_pwa_dismissed");
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }
    setIsDismissed(false);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If installed already, hide prompt
    window.addEventListener("appinstalled", () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("paniund_pwa_dismissed", Date.now().toString());
  };

  if (!showPrompt || isDismissed) return null;

  return (
    <div
      role="banner"
      aria-label="Install mobile application"
      className="fixed bottom-20 left-4 right-4 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-sm z-50 p-4 bg-[#111111] text-white rounded-2xl sm:rounded-[4px] shadow-2xl border border-white/10 flex items-center gap-3.5 animate-slide-up"
    >
      <div className="w-10 h-10 rounded-xl sm:rounded-[4px] bg-[#FFDA1A] text-[#003399] flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
        ⚡
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold uppercase tracking-wider text-white">
          Install paniund App
        </h4>
        <p className="text-[11px] text-[#A0A0A0] leading-tight truncate">
          Instant access, offline support & mobile experience
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleInstall}
          className="h-8 px-3 rounded-[3px] bg-[#FFDA1A] text-[#111111] text-xs font-bold hover:bg-[#FFE54D] transition-colors cursor-pointer tap-active"
        >
          Install
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close install prompt"
          className="w-8 h-8 rounded-[3px] text-[#A0A0A0] hover:text-white flex items-center justify-center text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
