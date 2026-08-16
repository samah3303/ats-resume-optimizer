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
      "bg-white text-zinc-900 border-black shadow-xl",
    error:
      "bg-white text-zinc-900 border-black shadow-xl",
    info:
      "bg-white text-zinc-900 border-black shadow-xl",
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
            className={`px-4 py-3.5 rounded-2xl shadow-xl border text-xs font-bold flex items-center justify-between gap-3 animate-in slide-in-from-right transition-all ${styleMap[t.type]}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{iconMap[t.type]}</span>
              <span className="leading-snug text-zinc-900">{t.message}</span>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 transition-colors"
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
