"use client";

import { useState, useCallback, type DragEvent, type ChangeEvent, useActionState, useEffect, useRef } from "react";
import { uploadResumeAction, UploadState } from "@/app/actions/resume";

interface ResumeUploaderProps {
  onUploaded: (resume: { id: string; name: string }) => void;
  onFormatDetected?: (format: "pdf" | "doc" | "docx") => void;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

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
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-black bg-zinc-100"
            : "border-zinc-300 hover:border-black bg-zinc-50"
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
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-zinc-600">
                {optimisticFileName ? `Uploading ${optimisticFileName}...` : 'Uploading and Parsing...'}
              </p>
            </div>
          ) : state.success ? (
             <div className="flex flex-col items-center gap-2">
               <div className="w-8 h-8 text-green-600 bg-green-100 rounded-full flex items-center justify-center">✓</div>
               <p className="text-sm font-medium text-green-700">Success!</p>
             </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center shadow-sm">
                <svg
                  className="w-6 h-6 text-white"
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
              <p className="text-sm font-bold text-black">
                Drag & drop your resume here
              </p>
              <p className="text-xs text-zinc-500">PDF, DOC, or DOCX, up to 5MB</p>
              <span className="mt-2 px-5 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-colors shadow-sm border border-black">
                Browse Files
              </span>
            </div>
          )}
        </label>
      </div>
      {state.error && (
        <p className="mt-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
          {state.error}
        </p>
      )}
    </form>
  );
}
