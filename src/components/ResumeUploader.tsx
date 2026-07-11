"use client";

import { useState, useCallback, type DragEvent, type ChangeEvent } from "react";

interface ResumeUploaderProps {
  onUploaded: (resume: { id: string; name: string }) => void;
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function ResumeUploader({ onUploaded }: ResumeUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only PDF, DOC, and DOCX files are supported.";
    }
    if (file.size > MAX_SIZE) {
      return "File must be under 5MB.";
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/resumes", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const data = await res.json();
        onUploaded(data.resume);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 bg-gray-50"
        }`}
      >
        <input
          type="file"
          accept=".pdf,.docx,.doc"
          onChange={handleChange}
          className="hidden"
          id="resume-upload"
          disabled={uploading}
        />
        <label htmlFor="resume-upload" className="cursor-pointer block">
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
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
              <p className="text-sm font-medium text-gray-700">
                Drag & drop your resume here
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, or DOCX, up to 5MB</p>
              <span className="mt-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                Browse Files
              </span>
            </div>
          )}
        </label>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
