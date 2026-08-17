"use client";

import { useEffect, useState } from "react";

export interface ToastMessage {
  id: string;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  durationMs?: number;
}

let toastTrigger: ((msg: Omit<ToastMessage, "id">) => void) | null = null;

export function showToast(msg: Omit<ToastMessage, "id">) {
  if (toastTrigger) {
    toastTrigger(msg);
  }
}

export function UndoToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastTrigger = (msg) => {
      const id = `toast-${Date.now()}`;
      const newToast: ToastMessage = { ...msg, id };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, msg.durationMs || 5000);
    };

    return () => {
      toastTrigger = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 pointer-events-none select-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto p-4 bg-black text-white border border-zinc-800 rounded-2xl shadow-2xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-emerald-400 font-bold">✓</span>
            <span className="font-medium truncate">{toast.text}</span>
          </div>

          {toast.actionLabel && toast.onAction && (
            <button
              onClick={() => {
                toast.onAction?.();
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-black text-[11px] border border-zinc-700 transition-colors shrink-0 active:scale-95"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
