"use client";

import { useState, useCallback, type DragEvent, type ChangeEvent, useActionState, useEffect, useRef } from "react";
import { uploadResumeAction, UploadState } from "@/app/actions/resume";

interface ResumeUploaderProps {
  onUploaded: (resume: { id: string; name: string }) => void;
  onFormatDetected?: (format: "pdf" | "doc" | "docx") => void;
}

function detectFormat(file: File): "pdf" | "doc" | "docx" | null {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    return "pdf";
  }
  if (
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.name.toLowerCase().endsWith(".docx")
  ) {
    return "docx";
  }
  if (file.type === "application/msword" || file.name.toLowerCase().endsWith(".doc")) {
    return "doc";
  }
  return null;
}

export default function ResumeUploader({ onUploaded, onFormatDetected }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [state, formAction, isPending] = useActionState<UploadState, FormData>(uploadResumeAction, {});
  const [optimisticFileName, setOptimisticFileName] = useState<string | null>(null);

  // Effect to handle successful upload callback
  useEffect(() => {
    if (state.success && state.resume) {
      onUploaded(state.resume);
    }
  }, [state, onUploaded]);

  const processFile = (file: File) => {
    setOptimisticFileName(file.name);
    // Use DataTransfer to programmatically set the file input and submit the form
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const fileInput = document.getElementById("resume-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.files = dataTransfer.files;
      const format = detectFormat(file);
      if (format && onFormatDetected) {
        onFormatDetected(format);
      }
      formRef.current?.requestSubmit();
    }
  };

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  
  return (
    <form ref={formRef} action={formAction}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? "border-[#FAFAFA] bg-[#18181B] shadow-[0_0_24px_rgba(250,250,250,0.15)]"
            : "border-[#27272A] hover:border-[#FAFAFA] bg-[#09090B]"
        }`}
      >
        <input
          type="file"
          name="file"
          accept=".pdf,.docx,.doc"
          onChange={handleChange}
          className="hidden"
          id="resume-upload"
          disabled={isPending || state.success}
        />
        <label
          htmlFor="resume-upload"
          className="cursor-pointer block"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('resume-upload')?.click();
            }
          }}
        >
          {isPending ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-9 h-9 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm font-semibold text-[#FAFAFA]">
                {optimisticFileName ? `Uploading and Parsing ${optimisticFileName}...` : 'Analyzing Resume Graph...'}
              </p>
            </div>
          ) : state.success ? (
             <div className="flex flex-col items-center gap-2.5">
               <div className="w-10 h-10 text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 rounded-2xl flex items-center justify-center font-bold text-lg">✓</div>
               <p className="text-xs sm:text-sm font-bold text-emerald-400">Resume Uploaded Successfully!</p>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-[#18181B] border border-[#27272A] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <svg
                  className="w-7 h-7 text-[#FAFAFA]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-bold text-[#FAFAFA]">
                  Drag &amp; drop your resume here
                </p>
                <p className="text-xs text-zinc-400 font-mono">PDF, DOC, or DOCX, up to 5MB</p>
              </div>
              <span className="mt-2 touch-target px-6 py-2.5 bg-[#FAFAFA] text-[#09090B] text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-sm border border-[#FAFAFA] inline-flex items-center gap-1.5 active:scale-95">
                Browse Files
              </span>
            </div>
          )}
        </label>
      </div>
      {state.error && (
        <p className="mt-3 text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-800 px-4 py-2.5 rounded-xl animate-in fade-in">
          ⚠️ {state.error}
        </p>
      )}
    </form>
  );
}
