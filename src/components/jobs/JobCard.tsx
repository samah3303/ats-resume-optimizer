"use client";

import React from "react";
import { JobListing } from "@/types/job";

interface JobCardProps {
  job: JobListing;
  onSave: (job: JobListing) => void;
  onAnalyze: (job: JobListing) => void;
  onClick: () => void;
}

export default function JobCard({ job, onSave, onAnalyze, onClick }: JobCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-5 flex flex-col gap-3 cursor-pointer tap-feedback relative shadow-sm transition-all"
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">{job.company}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
              {job.source}
            </span>
          </div>
          <h3 className="text-base font-bold text-black leading-tight">{job.title}</h3>
        </div>
        {job.matchScore !== undefined && (
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs border border-black bg-zinc-50 text-black shadow-sm"
          >
            {job.matchScore}%
          </div>
        )}
      </div>

      {/* Details Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-zinc-600">
        <div className="flex items-center gap-1">
          <span aria-hidden="true">📍</span> {job.location}
        </div>
        {job.jobType && (
          <div className="flex items-center gap-1">
            <span aria-hidden="true">💼</span> {job.jobType}
          </div>
        )}
        {job.remote && (
          <div className="flex items-center gap-1">
            <span aria-hidden="true">🏠</span> Remote
          </div>
        )}
        {job.salary && (
          <div className="flex items-center gap-1 text-black font-semibold">
            <span aria-hidden="true">💰</span> {job.salary}
          </div>
        )}
      </div>

      {/* Snippet */}
      <p className="text-xs text-zinc-600 line-clamp-2 mt-1 leading-relaxed">{job.descriptionSnippet}</p>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 mt-1 no-scrollbar">
          {job.tags.slice(0, 5).map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-md bg-zinc-100 text-xs text-zinc-700 font-medium whitespace-nowrap border border-zinc-200"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100">
        <div className="text-xs text-zinc-400">
          {job.postedAt || "Recently"}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave(job);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-zinc-300 text-zinc-800 hover:text-black hover:border-black transition-colors touch-target shadow-sm"
          >
            💾 Save
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAnalyze(job);
            }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-black text-white hover:bg-zinc-800 transition-colors flex items-center gap-1 touch-target shadow-sm border border-black"
          >
            <span>⚡</span> Analyze
          </button>
        </div>
      </div>
    </div>
  );
}
