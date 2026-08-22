"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES, INDUSTRIES, JOB_TYPES } from "./constants";

interface StepTargetPreferencesProps {
  autoFilling: boolean;
  resumeName: string | null;
  positions: string;
  setPositions: (val: string) => void;
  suggestedPositions: string[];
  togglePosition: (pos: string) => void;
  industry: string;
  setIndustry: (val: string) => void;
  country: string;
  setCountry: (val: string) => void;
  jobType: string;
  setJobType: (val: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  onChangeResume: () => void;
}

export default function StepTargetPreferences({
  autoFilling,
  resumeName,
  positions,
  setPositions,
  suggestedPositions,
  togglePosition,
  industry,
  setIndustry,
  country,
  setCountry,
  jobType,
  setJobType,
  onBack,
  onSkip,
  onNext,
  onChangeResume,
}: StepTargetPreferencesProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPosition = (pos: string) => {
    const current = positions
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    if (current.includes(pos)) {
      setPositions(current.filter((p) => p !== pos).join(", "));
    } else {
      setPositions([...current, pos].join(", "));
    }
  };

  return (
    <div className="space-y-6 text-[#FAFAFA]">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
          Tell Us About Your Goals
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          This helps us calculate your standalone ATS compatibility score and generate prioritized recommendations to reach 80+.
        </p>
      </div>

      {/* Auto-fill indicator */}
      {autoFilling && (
        <div className="flex items-center gap-2.5 p-3.5 bg-[#09090B] border border-[#27272A] rounded-2xl text-xs font-semibold text-zinc-200 animate-in fade-in">
          <div className="w-4 h-4 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin shrink-0" />
          <span>AI is extracting candidate details &amp; location from your resume...</span>
        </div>
      )}

      {/* Uploaded resume info */}
      {resumeName && (
        <div className="flex items-center gap-3 p-3.5 bg-[#09090B] border border-[#27272A] rounded-2xl">
          <span className="text-base">📄</span>
          <span className="text-xs font-bold text-[#FAFAFA] truncate">
            {resumeName}
          </span>
          <button
            type="button"
            onClick={onChangeResume}
            className="ml-auto text-xs text-zinc-400 hover:text-[#FAFAFA] font-bold underline transition-colors cursor-pointer"
          >
            Change Resume
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Target Positions with Interactive Dropdown on Focus */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <label
              htmlFor="positions"
              className="block text-xs font-bold text-zinc-300 uppercase tracking-wide"
            >
              Target Job Positions <span className="text-rose-400">*</span>
            </label>
            <span className="text-[10px] text-zinc-500 font-mono">
              Click input to see AI suggestions
            </span>
          </div>

          <div className="relative">
            <input
              id="positions"
              type="text"
              value={positions}
              onChange={(e) => setPositions(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onClick={() => setShowDropdown(true)}
              placeholder="e.g. Senior Software Engineer, Product Manager, Financial Analyst"
              className="w-full px-4 py-2.5 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs sm:text-sm focus:border-[#FAFAFA] focus:outline-none transition-colors placeholder-zinc-500 font-medium"
            />
            {suggestedPositions.length > 0 && (
              <button
                type="button"
                onClick={() => setShowDropdown(!showDropdown)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-[#FAFAFA] px-1 py-0.5"
              >
                {showDropdown ? "▲" : "▼"}
              </button>
            )}
          </div>

          {/* Interactive Position Dropdown */}
          {showDropdown && suggestedPositions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#27272A] text-[10px] font-mono text-zinc-400">
                <span>🤖 AI SUGGESTED ROLES FROM RESUME</span>
                <span>Click to Add / Toggle</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {suggestedPositions.map((pos) => {
                  const isSelected = positions
                    .split(",")
                    .map((p) => p.trim())
                    .includes(pos);
                  return (
                    <div
                      key={pos}
                      onClick={() => handleSelectPosition(pos)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-[#FAFAFA] text-[#09090B]"
                          : "text-zinc-300 hover:bg-[#09090B] hover:text-[#FAFAFA]"
                      }`}
                    >
                      <span>{pos}</span>
                      <span className="text-[10px] font-mono opacity-80">
                        {isSelected ? "Selected ✓" : "+ Add"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested position chips for quick glance */}
          {suggestedPositions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {suggestedPositions.map((pos) => {
                const isSelected = positions
                  .split(",")
                  .map((p) => p.trim())
                  .includes(pos);
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => togglePosition(pos)}
                    className={`px-2.5 py-1 text-xs rounded-xl border transition-all font-bold cursor-pointer ${
                      isSelected
                        ? "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA]"
                        : "bg-[#09090B] text-zinc-300 border-[#27272A] hover:border-zinc-500"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {pos}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Industry + Country row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="industry"
              className="block text-xs font-bold text-zinc-300 uppercase tracking-wide"
            >
              Target Industry <span className="text-zinc-500 font-normal lowercase">(optional)</span>
            </label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs sm:text-sm focus:border-[#FAFAFA] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#18181B] text-[#FAFAFA]">Select industry...</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i} className="bg-[#18181B] text-[#FAFAFA]">
                  {i}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="country"
              className="block text-xs font-bold text-zinc-300 uppercase tracking-wide"
            >
              Target Country <span className="text-rose-400">*</span>
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#09090B] text-[#FAFAFA] border border-[#27272A] rounded-xl text-xs sm:text-sm focus:border-[#FAFAFA] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="" className="bg-[#18181B] text-[#FAFAFA]">Select a country...</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c} className="bg-[#18181B] text-[#FAFAFA]">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Type (Full-time default) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wide">
            Job Type Preference <span className="text-zinc-500 font-normal lowercase">(default: Full-time)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {JOB_TYPES.map((jt) => {
              const selected = jobType
                .split(",")
                .map((j) => j.trim())
                .includes(jt);
              return (
                <button
                  key={jt}
                  type="button"
                  onClick={() => {
                    const current = jobType
                      .split(",")
                      .map((j) => j.trim())
                      .filter(Boolean);
                    if (current.includes(jt)) {
                      setJobType(current.filter((j) => j !== jt).join(", ") || "Full-time");
                    } else {
                      setJobType([...current, jt].join(", "));
                    }
                  }}
                  className={`px-3.5 py-1.5 text-xs rounded-xl border transition-all font-bold cursor-pointer ${
                    selected
                      ? "bg-[#FAFAFA] text-[#09090B] border-[#FAFAFA] shadow-xs"
                      : "bg-[#09090B] text-zinc-300 border-[#27272A] hover:border-zinc-500"
                  }`}
                >
                  {selected ? "✓ " : "+ "}
                  {jt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-[#27272A]">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] transition-colors cursor-pointer"
        >
          &larr; Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] transition-colors cursor-pointer"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!positions || !country}
            className="touch-target px-7 py-2.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95 border border-[#FAFAFA]"
          >
            Continue to Analysis &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
