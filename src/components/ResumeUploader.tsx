"use client";

import { useState, useCallback, type DragEvent, type ChangeEvent, useRef } from "react";

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File must be under 5MB.");
      return;
    }

    const format = detectFormat(file);
    if (format && onFormatDetected) {
      onFormatDetected(format);
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload and parse resume.");
      }

      if (data.resume) {
        setUploadSuccess(true);
        onUploaded(data.resume);
      } else {
        throw new Error("No resume record returned.");
      }
    } catch (err) {
      console.error("Resume upload error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while processing your resume."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  }, []);

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!isUploading && !uploadSuccess) {
            fileInputRef.current?.click();
          }
        }}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 text-center transition-all cursor-pointer select-none ${
          isDragging
            ? "border-[#FAFAFA] bg-[#18181B] shadow-[0_0_24px_rgba(250,250,250,0.15)]"
            : "border-[#27272A] hover:border-[#FAFAFA] bg-[#09090B]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          name="file"
          accept=".pdf,.docx,.doc"
          onChange={handleChange}
          className="hidden"
          id="resume-upload-input"
          disabled={isUploading || uploadSuccess}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-9 h-9 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm font-semibold text-[#FAFAFA]">
              {fileName ? `Uploading and Parsing ${fileName}...` : "Analyzing Resume Graph..."}
            </p>
          </div>
        ) : uploadSuccess ? (
          <div className="flex flex-col items-center gap-2.5">
            <div className="w-10 h-10 text-emerald-300 bg-emerald-950/60 border border-emerald-700/60 rounded-2xl flex items-center justify-center font-bold text-lg">
              ✓
            </div>
            <p className="text-xs sm:text-sm font-bold text-emerald-400">
              Resume Uploaded Successfully!
            </p>
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
            <button
              type="button"
              className="mt-2 touch-target px-6 py-2.5 bg-[#FAFAFA] text-[#09090B] text-xs font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-sm border border-[#FAFAFA] inline-flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              Browse Files
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="mt-3 text-xs font-bold text-rose-300 bg-rose-950/40 border border-rose-800 px-4 py-2.5 rounded-xl animate-in fade-in">
          ⚠️ {errorMessage}
        </p>
      )}
    </div>
  );
}
