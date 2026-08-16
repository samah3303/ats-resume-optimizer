"use client";

import React, { useEffect } from "react";
import { JobListing } from "@/types/job";

interface JobDetailSheetProps {
  job: JobListing | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobListing) => void;
  onAnalyze: (job: JobListing) => void;
}

export default function JobDetailSheet({
  job,
  isOpen,
  onClose,
  onSave,
  onAnalyze,
}: JobDetailSheetProps) {
  // Prevent body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !job) return null;

  const content = (
    <div className="flex flex-col h-full bg-white text-black overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-zinc-200 p-5 flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-zinc-500">{job.company}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
              {job.source}
            </span>
          </div>
          <h2 className="text-xl font-black text-black leading-tight">{job.title}</h2>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-600 hover:text-black hover:bg-zinc-200 transition-colors touch-target shrink-0 font-bold text-sm"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Quick Info */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Location</span>
            <span className="text-xs font-bold text-black">{job.location}</span>
          </div>
          {job.jobType && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Type</span>
              <span className="text-xs font-bold text-black">{job.jobType}</span>
            </div>
          )}
          {job.salary && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Salary</span>
              <span className="text-xs font-black text-black">{job.salary}</span>
            </div>
          )}
          {job.remote && (
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Workplace</span>
              <span className="text-xs font-bold text-black">Remote</span>
            </div>
          )}
        </div>

        {/* Match Score */}
        {job.matchScore !== undefined && (
          <div className="space-y-2 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black uppercase tracking-wide">Resume Match Score</span>
              <span className="text-sm font-black text-black">{job.matchScore}%</span>
            </div>
            <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-black h-full transition-all duration-500"
                style={{ width: `${job.matchScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-black uppercase tracking-wider">Job Description</h3>
          <div className="text-xs text-zinc-700 leading-relaxed whitespace-pre-wrap font-normal">
            {job.description}
          </div>
        </div>

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-black uppercase tracking-wider">Skills & Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {job.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 text-xs text-zinc-800 font-medium border border-zinc-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-zinc-200 p-5 pb-safe space-y-3 shadow-lg">
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center py-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm border border-black touch-target text-center"
        >
          Apply on {job.source} ↗
        </a>
        <div className="flex gap-3">
          <button
            onClick={() => onSave(job)}
            className="flex-1 py-2.5 rounded-xl bg-white text-black border border-zinc-300 font-bold text-xs hover:bg-zinc-100 hover:border-black transition-colors touch-target shadow-sm"
          >
            💾 Save to Library
          </button>
          <button
            onClick={() => onAnalyze(job)}
            className="flex-1 py-2.5 rounded-xl bg-zinc-100 text-black border border-zinc-200 hover:border-black font-bold text-xs transition-colors touch-target"
          >
            ⚡ Analyze Against Resume
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        <div className="bottom-sheet-backdrop" onClick={onClose} />
        <div
          className="bottom-sheet h-[95vh] fixed bottom-0 left-0 right-0 z-60 rounded-t-3xl overflow-hidden bg-white shadow-2xl border-t border-zinc-200"
          style={{ animation: "slideUpSheet 0.3s cubic-bezier(0.32, 0.72, 0, 1)" }}
        >
          {content}
        </div>
      </div>

      {/* Desktop Slide-over */}
      <div className="hidden md:block">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={onClose} />
        <div className="fixed top-0 right-0 bottom-0 w-[480px] z-50 transform transition-transform duration-300 ease-in-out shadow-2xl bg-white border-l border-zinc-200">
          {content}
        </div>
      </div>
    </>
  );
}
