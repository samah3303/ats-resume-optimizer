"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextValue {
  toast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      const id = ++nextId;
      setToasts((prev) => {
        // Prevent stacking duplicate messages
        if (prev.some((t) => t.message === message)) {
          return prev;
        }
        // Limit max 3 visible toasts at a time
        const updated = [...prev, { id, message, type }];
        return updated.slice(-3);
      });

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const styleMap = {
    success:
      "bg-[#14161D]/95 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10",
    error:
      "bg-[#14161D]/95 text-rose-300 border-rose-500/40 shadow-rose-500/10",
    info:
      "bg-[#14161D]/95 text-amber-300 border-amber-500/40 shadow-amber-500/10",
  };

  const iconMap = {
    success: "✅",
    error: "⚠️",
    info: "ℹ️",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-20 md:bottom-6 right-4 z-[100] flex flex-col gap-2.5 max-w-sm w-full px-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className={`px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-2xl border text-xs font-bold flex items-center justify-between gap-3 animate-in slide-in-from-right transition-all ${styleMap[t.type]}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{iconMap[t.type]}</span>
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
