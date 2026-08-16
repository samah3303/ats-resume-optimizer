"use client";

import React, { useState, useEffect } from "react";
import { FilterState } from "@/types/job";

interface JobFiltersProps {
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobFilters({
  filters,
  onApply,
  onClear,
  isOpen,
  onClose,
}: JobFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleToggleJobType = (type: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      jobType: prev.jobType.includes(type)
        ? prev.jobType.filter((t) => t !== type)
        : [...prev.jobType, type],
    }));
  };

  const handleToggleSource = (source: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      sources: prev.sources.includes(source)
        ? prev.sources.filter((s) => s !== source)
        : [...prev.sources, source],
    }));
  };

  const panelContent = (
    <div className="flex flex-col h-full bg-white text-black">
      <div className="p-5 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10 md:border-none md:p-0 md:mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-black">Filters</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={onClear}
            className="text-xs text-zinc-500 hover:text-black font-semibold"
          >
            Clear All
          </button>
          <button onClick={onClose} className="md:hidden text-zinc-400 p-2 touch-target">
            ✕
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-0 space-y-6">
        {/* Location */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-black uppercase tracking-wider">Location</label>
          <input
            type="text"
            value={localFilters.location}
            onChange={(e) =>
              setLocalFilters((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="City, state, or country"
            className="w-full p-2.5 rounded-xl bg-white border border-zinc-300 text-black placeholder:text-zinc-400 focus:outline-none focus:border-black text-xs"
          />
        </div>

        {/* Remote Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-black uppercase tracking-wider">Remote Only</label>
          <button
            onClick={() =>
              setLocalFilters((prev) => ({ ...prev, remote: !prev.remote }))
            }
            className={`w-12 h-6 rounded-full p-1 transition-colors ${
              localFilters.remote ? "bg-black" : "bg-zinc-200"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                localFilters.remote ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Job Type */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-black uppercase tracking-wider">Job Type</label>
          <div className="space-y-2">
            {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer touch-target">
                <input
                  type="checkbox"
                  checked={localFilters.jobType.includes(type)}
                  onChange={() => handleToggleJobType(type)}
                  className="w-4 h-4 rounded border-zinc-300 text-black accent-black focus:ring-0"
                />
                <span className="text-xs font-medium text-zinc-700">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Salary Range */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-black uppercase tracking-wider">Salary Range (K)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={localFilters.salaryMin || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  salaryMin: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="w-full p-2.5 rounded-xl bg-white border border-zinc-300 text-black placeholder:text-zinc-400 focus:outline-none focus:border-black text-xs"
            />
            <span className="text-zinc-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={localFilters.salaryMax || ""}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  salaryMax: e.target.value ? Number(e.target.value) : null,
                }))
              }
              className="w-full p-2.5 rounded-xl bg-white border border-zinc-300 text-black placeholder:text-zinc-400 focus:outline-none focus:border-black text-xs"
            />
          </div>
        </div>

        {/* Sources */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-black uppercase tracking-wider">Sources</label>
          <div className="space-y-2">
            {["Adzuna", "Remotive", "Arbeitnow"].map((source) => (
              <label key={source} className="flex items-center gap-3 cursor-pointer touch-target">
                <input
                  type="checkbox"
                  checked={localFilters.sources.includes(source)}
                  onChange={() => handleToggleSource(source)}
                  className="w-4 h-4 rounded border-zinc-300 text-black accent-black focus:ring-0"
                />
                <span className="text-xs font-medium text-zinc-700">{source}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-zinc-100 md:border-none md:p-0 md:mt-6 bg-white sticky bottom-0 z-10 pb-safe md:pb-0">
        <button
          onClick={handleApply}
          className="w-full py-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm border border-black touch-target"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop & Bottom Sheet */}
      {isOpen && (
        <div className="md:hidden">
          <div className="bottom-sheet-backdrop" onClick={onClose}></div>
          <div className="bottom-sheet bg-white text-black h-[85vh] rounded-t-3xl border-t border-zinc-200">
            {panelContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-72 shrink-0">
        <div className="sticky top-6 p-6 bg-white rounded-3xl border border-zinc-200 shadow-sm">
          {panelContent}
        </div>
      </div>
    </>
  );
}
