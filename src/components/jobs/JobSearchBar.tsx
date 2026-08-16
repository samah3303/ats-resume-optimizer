"use client";

import React, { useState } from "react";

interface JobSearchBarProps {
  onSearch: (query: string) => void;
  onMatchResume: () => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Designer",
  "DevOps",
  "Marketing",
];

export default function JobSearchBar({
  onSearch,
  onMatchResume,
  isLoading,
}: JobSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="relative flex w-full group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl" aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search jobs by title, skill, or company..."
          className="w-full min-h-[48px] pl-12 pr-28 py-3 bg-white border border-zinc-300 rounded-2xl text-black placeholder:text-zinc-400 focus:outline-none focus:border-black transition-all text-sm shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl disabled:opacity-50 touch-target transition-all shadow-sm border border-black"
        >
          {isLoading ? "Searching..." : "Search"}
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onMatchResume}
          disabled={isLoading}
          className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-zinc-100 text-black border border-zinc-300 hover:border-black transition-colors tap-feedback touch-target"
        >
          🪄 Match My Resume
        </button>
        <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block"></div>
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-zinc-50 text-zinc-700 border border-zinc-200 hover:text-black hover:border-black transition-colors tap-feedback hidden sm:block touch-target"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
