"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
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
  const [customInput, setCustomInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const selectedList = positions
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTogglePosition = (pos: string) => {
    const trimmed = pos.trim();
    if (!trimmed) return;
    if (selectedList.includes(trimmed)) {
      setPositions(selectedList.filter((p) => p !== trimmed).join(", "));
    } else {
      setPositions([...selectedList, trimmed].join(", "));
    }
    setCustomInput("");
  };

  const handleRemovePosition = (posToRemove: string) => {
    setPositions(selectedList.filter((p) => p !== posToRemove).join(", "));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (customInput.trim()) {
        handleTogglePosition(customInput.trim());
      }
    } else if (e.key === "Backspace" && !customInput && selectedList.length > 0) {
      e.preventDefault();
      handleRemovePosition(selectedList[selectedList.length - 1]);
    }
  };

  // Filter suggested positions if user is typing
  const filteredSuggestions = suggestedPositions.filter((pos) =>
    pos.toLowerCase().includes(customInput.toLowerCase())
  );

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
        {/* Target Positions with Removable Badges inside Input Box + Dropdown Multiselect */}
        <div className="space-y-1.5 relative" ref={containerRef}>
          <div className="flex items-center justify-between">
            <label
              htmlFor="positions-input"
              className="block text-xs font-bold text-zinc-300 uppercase tracking-wide"
            >
              Target Job Positions <span className="text-rose-400">*</span>
            </label>
            <span className="text-[10px] text-zinc-500 font-mono">
              Click box to select / type custom roles
            </span>
          </div>

          {/* Badge Input Container Box */}
          <div
            onClick={() => {
              textInputRef.current?.focus();
              setShowDropdown(true);
            }}
            className="w-full min-h-[48px] px-3 py-2 bg-[#09090B] border border-[#27272A] focus-within:border-[#FAFAFA] rounded-2xl flex flex-wrap items-center gap-2 cursor-text transition-all shadow-inner"
          >
            {/* Removable Badges Inside Input Box */}
            {selectedList.map((pos) => (
              <span
                key={pos}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#18181B] border border-[#27272A] hover:border-zinc-400 text-xs font-bold text-[#FAFAFA] rounded-xl animate-in fade-in transition-all select-none"
              >
                <span>{pos}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePosition(pos);
                  }}
                  className="text-zinc-400 hover:text-rose-400 font-bold text-xs cursor-pointer ml-0.5 leading-none"
                  title={`Remove ${pos}`}
                >
                  &times;
                </button>
              </span>
            ))}

            {/* Inline Input for typing custom positions */}
            <input
              ref={textInputRef}
              id="positions-input"
              type="text"
              value={customInput}
              onChange={(e) => {
                setCustomInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder={selectedList.length === 0 ? "Select from dropdown or type custom role..." : "Type more..."}
              className="flex-1 min-w-[140px] bg-transparent text-[#FAFAFA] text-xs sm:text-sm focus:outline-none placeholder-zinc-500 font-medium py-1"
            />

            {/* Toggle Arrow */}
            {suggestedPositions.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="text-xs text-zinc-400 hover:text-[#FAFAFA] px-1 py-1"
              >
                {showDropdown ? "▲" : "▼"}
              </button>
            )}
          </div>

          {/* Interactive Multi-Select Dropdown */}
          {showDropdown && (suggestedPositions.length > 0 || customInput.trim()) && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[#18181B] border border-[#27272A] rounded-2xl shadow-2xl p-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#27272A] text-[10px] font-mono text-zinc-400">
                <span>🤖 AI SUGGESTED ROLES FROM RESUME</span>
                <span>Click to Select / Toggle</span>
              </div>

              {/* If user typed a custom role not in list */}
              {customInput.trim() && !suggestedPositions.some((p) => p.toLowerCase() === customInput.trim().toLowerCase()) && (
                <div
                  onClick={() => handleTogglePosition(customInput.trim())}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-[#09090B] border border-[#27272A] text-emerald-400 hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>+ Add &ldquo;{customInput.trim()}&rdquo;</span>
                  <span className="text-[10px] font-mono opacity-80">Press Enter ↵</span>
                </div>
              )}

              {/* Suggestions List */}
              <div className="space-y-1 max-h-52 overflow-y-auto">
                {filteredSuggestions.length > 0 ? (
                  filteredSuggestions.map((pos) => {
                    const isSelected = selectedList.includes(pos);
                    return (
                      <div
                        key={pos}
                        onClick={() => handleTogglePosition(pos)}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-between select-none ${
                          isSelected
                            ? "bg-[#FAFAFA] text-[#09090B] shadow-xs"
                            : "text-zinc-300 hover:bg-[#09090B] hover:text-[#FAFAFA]"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-md border flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? "border-[#09090B] bg-[#09090B] text-[#FAFAFA]" : "border-zinc-500 text-transparent"
                          }`}>
                            ✓
                          </span>
                          <span>{pos}</span>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">
                          {isSelected ? "Selected ✓" : "+ Add"}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-zinc-500 p-2 italic">
                    No matching AI suggested roles. Press Enter to add custom role.
                  </p>
                )}
              </div>
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
      <div className="flex items-center justify-end pt-5 mt-3 border-t border-[#27272A]">
        <button
          type="button"
          onClick={onNext}
          disabled={!positions || !country}
          className="w-full sm:w-auto touch-target px-8 py-3.5 bg-[#FAFAFA] hover:bg-zinc-200 text-[#09090B] font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95 border border-[#FAFAFA] shadow-md flex items-center justify-center gap-2"
        >
          <span>Continue to Analysis</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  );
}
