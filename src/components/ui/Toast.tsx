"use client";

import React, { useEffect } from "react";

export interface ToastProps {
  message: string | null;
  type?: "success" | "error" | "info";
  onClose?: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = "info",
  onClose,
  duration = 4000,
}: ToastProps) {
  useEffect(() => {
    if (!message || !onClose || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  const bgStyles = {
    success: "bg-nordic-success text-white border-nordic-success",
    error: "bg-nordic-error text-white border-nordic-error",
    info: "bg-nordic-primary text-white border-nordic-primary",
  }[type];

  const icon = {
    success: "✓",
    error: "⚠",
    info: "ℹ",
  }[type];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[70] max-w-sm sm:max-w-md w-auto"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-[6px] shadow-2xl border text-xs sm:text-sm font-semibold transition-all transform translate-y-0 opacity-100 ${bgStyles}`}
      >
        <span
          className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs shrink-0"
          aria-hidden="true"
        >
          {icon}
        </span>
        <p className="flex-1 leading-snug">{message}</p>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="w-8 h-8 -mr-1 rounded-[4px] hover:bg-white/20 flex items-center justify-center font-bold text-base transition-colors tap-active cursor-pointer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
