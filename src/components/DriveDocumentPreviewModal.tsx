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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#14161D] border border-[#242834] rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col text-white shadow-2xl overflow-hidden">
        {/* Top Drive Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#090A0C] border-b border-[#242834] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl">📄</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base truncate">
                  {resumeName}
                </h3>
                {isPrimary && (
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black rounded-full">
                    PRIMARY
                  </span>
                )}
              </div>
              <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                Google Drive Viewer • Uploaded {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCopyText}
              className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <span>{copied ? "✓ Copied!" : "📋 Copy Text"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-[#14161D] rounded-xl transition-colors text-sm font-bold"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Drive Document Viewer Canvas Area */}
        <div className="flex-1 bg-[#090A0C] p-4 sm:p-8 overflow-y-auto flex justify-center">
          {/* Simulated A4 Paper Document Sheet */}
          <div className="w-full max-w-3xl bg-[#0F1117] border border-[#242834] rounded-2xl p-6 sm:p-10 shadow-2xl text-zinc-200 font-sans space-y-6 text-xs sm:text-sm leading-relaxed">
            {/* Simulated Header Line */}
            <div className="border-b border-[#242834] pb-4 flex items-center justify-between">
              <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-black">
                Parsed Document View (Original PDF/DOCX Stream)
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                Format: {docType?.toUpperCase() || "DOCUMENT"}
              </span>
            </div>

            {/* Document Content */}
            {parsedText && isHumanReadableText(parsedText) ? (
              paragraphs.map((para, idx) => (
                <p key={idx} className="whitespace-pre-wrap leading-relaxed text-zinc-300 font-normal">
                  {para}
                </p>
              ))
            ) : (
              <div className="p-6 bg-rose-950/40 border border-rose-800/50 rounded-2xl text-center space-y-3 my-8">
                <span className="text-3xl">⚠️</span>
                <h4 className="text-sm font-black text-rose-300">
                  Unreadable Custom Font Subset PDF
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed max-w-lg mx-auto">
                  This PDF was saved using custom font subset encodings (common in Canva/Figma design exports), causing character byte mapping to display as random symbols (<code className="text-rose-400 font-mono">9%*;!&8, & $3/"O#</code>).
                </p>
                <p className="text-xs font-bold text-amber-300">
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
