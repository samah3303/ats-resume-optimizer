"use client";

import React from "react";

export interface FilterCounts {
  total: number;
  applied: number;
  bookmarked: number;
  naukri: number;
  indeed: number;
  linkedin: number;
}

export type FilterKey =
  | "all"
  | "bookmarked"
  | "applied"
  | "naukrigulf"
  | "indeed"
  | "linkedin";

export type SortKey = "match" | "newest";

interface JobFilterBarProps {
  filter: FilterKey;
  onFilterChange: (f: FilterKey) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: SortKey;
  onSortChange: (s: SortKey) => void;
  counts: FilterCounts;
}

export const JobFilterBar = React.memo(function JobFilterBar({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  counts,
}: JobFilterBarProps) {
  const tabs = [
    { id: "all", label: `All Jobs (${counts.total})` },
    { id: "applied", label: `✓ Applied (${counts.applied})` },
    { id: "bookmarked", label: `★ Saved (${counts.bookmarked})` },
    ...(counts.naukri > 0
      ? [{ id: "naukrigulf", label: `Naukri Gulf (${counts.naukri})` }]
      : []),
    ...(counts.indeed > 0
      ? [{ id: "indeed", label: `Indeed (${counts.indeed})` }]
      : []),
    ...(counts.linkedin > 0
      ? [{ id: "linkedin", label: `LinkedIn (${counts.linkedin})` }]
      : []),
  ];

  return (
    <div className="space-y-3">
      {/* Horizontal filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onFilterChange(tab.id as FilterKey)}
            className={`h-9 px-3.5 rounded-xl sm:rounded-[4px] text-xs font-bold transition-colors cursor-pointer tap-active whitespace-nowrap shrink-0 ${
              filter === tab.id
                ? "bg-[#003399] text-white shadow-xs"
                : "bg-white text-[#484848] border border-[#DFDFDF] hover:bg-[#F5F5F5]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search title, company, location..."
            className="w-full h-10 px-3.5 bg-white border border-[#DFDFDF] rounded-xl sm:rounded-[4px] text-sm text-[#111111] placeholder-[#767676] focus:outline-none focus:border-[#003399] focus:ring-2 focus:ring-[#003399]/15 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="sort-by-select" className="text-xs text-[#767676] font-medium hidden sm:inline">
            Sort by:
          </label>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="h-10 px-3 bg-white border border-[#DFDFDF] rounded-xl sm:rounded-[4px] text-xs font-bold text-[#111111] focus:outline-none focus:border-[#003399] cursor-pointer"
          >
            <option value="match">Highest Match %</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>
    </div>
  );
});
