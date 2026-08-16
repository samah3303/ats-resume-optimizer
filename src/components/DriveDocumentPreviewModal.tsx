"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { isHumanReadableText } from "@/lib/resume-parser";

interface DriveDocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeName: string;
  parsedText: string;
  docType: string | null;
  createdAt: string;
  isPrimary?: boolean;
}

export default function DriveDocumentPreviewModal({
  isOpen,
  onClose,
  resumeName,
  parsedText,
  docType,
  createdAt,
  isPrimary,
}: DriveDocumentPreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(parsedText);
    setCopied(true);
    toast("Full resume text copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  // Format parsed text into clean paragraphs
  const paragraphs = parsedText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col text-zinc-900 shadow-2xl overflow-hidden">
        {/* Top Drive Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-zinc-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl" aria-hidden="true">📄</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-black text-base truncate">
                  {resumeName}
                </h3>
                {isPrimary && (
                  <span className="px-2.5 py-0.5 bg-black text-white text-[10px] font-black rounded-full">
                    PRIMARY
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                Google Drive Viewer • Uploaded {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyText}
              className="px-4 py-2 bg-black text-white hover:bg-zinc-800 border border-black text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span>{copied ? "✓ Copied!" : "📋 Copy Text"}</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 text-zinc-600 hover:text-black hover:bg-zinc-100 rounded-xl transition-colors text-xs font-bold border border-zinc-200"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Drive Document Viewer Canvas Area */}
        <div className="flex-1 bg-zinc-50 p-4 sm:p-8 overflow-y-auto flex justify-center">
          {/* Simulated A4 Paper Document Sheet */}
          <div className="w-full max-w-3xl bg-white border border-zinc-200 rounded-2xl p-6 sm:p-10 shadow-sm text-zinc-900 font-sans space-y-6 text-xs sm:text-sm leading-relaxed">
            {/* Simulated Header Line */}
            <div className="border-b border-zinc-200 pb-4 flex items-center justify-between">
              <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest font-black">
                Parsed Document View (Original PDF/DOCX Stream)
              </span>
              <span className="text-[10px] font-mono text-zinc-400 font-bold">
                Format: {docType?.toUpperCase() || "DOCUMENT"}
              </span>
            </div>

            {/* Document Content */}
            {parsedText && isHumanReadableText(parsedText) ? (
              paragraphs.map((para, idx) => (
                <p key={idx} className="whitespace-pre-wrap leading-relaxed text-zinc-800 font-normal">
                  {para}
                </p>
              ))
            ) : (
              <div className="p-6 bg-zinc-50 border border-zinc-300 rounded-2xl text-center space-y-3 my-8">
                <span className="text-3xl" aria-hidden="true">⚠️</span>
                <h4 className="text-sm font-black text-black">
                  Unreadable Custom Font Subset PDF
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-lg mx-auto">
                  This PDF was saved using custom font subset encodings (common in Canva/Figma design exports), causing character byte mapping to display as random symbols (<code className="text-zinc-900 bg-zinc-100 px-1 py-0.5 rounded font-mono">9%*;!&8, & $3/&quot;O#</code>).
                </p>
                <p className="text-xs font-bold text-black">
                  💡 Fix: Re-export your resume as a standard text PDF (from Word / Google Docs) or upload as DOCX.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
