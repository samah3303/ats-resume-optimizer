"use client";

import React from "react";

interface ResumeSectionProps {
  name: string;
  email: string;
  targetRoles: string;
  atsScore?: number | null;
  resumeFileName?: string | null;
  uploadingResume: boolean;
  analyzingAts: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleUploadResume: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReanalyzeAts: () => void;
}

export default function ResumeSection({
  name,
  email,
  targetRoles,
  atsScore,
  resumeFileName,
  uploadingResume,
  analyzingAts,
  fileInputRef,
  handleUploadResume,
  handleReanalyzeAts,
}: ResumeSectionProps) {
  return (
    <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
      <div className="flex items-center gap-3.5 sm:gap-4">
        <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-nordic-primary text-nordic-secondary font-bold text-xl sm:text-2xl flex items-center justify-center shrink-0 shadow-sm border-2 border-nordic-secondary">
          {(name || email || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-nordic-secondary text-nordic-text text-[10px] font-bold rounded-[2px] uppercase tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-nordic-primary" />
              Candidate Profile
            </div>
            {typeof atsScore === "number" && (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-nordic-primary/10 border border-nordic-primary/30 text-nordic-primary text-[10px] font-bold rounded-[2px] font-mono">
                <span>ATS Score:</span>
                <span className="font-extrabold">{atsScore}/100</span>
              </div>
            )}
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-nordic-text tracking-tight">
            {name || "Your Profile"}
          </h1>
          <p className="text-xs sm:text-sm text-nordic-text-secondary mt-0.5 line-clamp-1">
            {targetRoles || "Keep your preferences updated for the AI Job Finder."}
          </p>
          {resumeFileName && (
            <p className="text-[11px] text-nordic-neutral mt-1 flex items-center gap-1 font-mono">
              <span>📎</span> Current: {resumeFileName}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleUploadResume}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingResume}
          className="nordic-btn-secondary text-xs h-10 sm:h-11 px-3 sm:px-4 cursor-pointer disabled:opacity-50 tap-active font-bold"
        >
          {uploadingResume ? "Uploading..." : "📄 New Resume"}
        </button>

        <button
          onClick={handleReanalyzeAts}
          disabled={analyzingAts}
          className="nordic-btn-primary text-xs h-10 sm:h-11 px-3 sm:px-4 cursor-pointer disabled:opacity-50 tap-active font-bold"
        >
          {analyzingAts ? "Scanning..." : "⚡ Scan Resume"}
        </button>
      </div>
    </div>
  );
}
