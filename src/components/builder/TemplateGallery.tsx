"use client";

import React, { useState, useMemo } from "react";
import { RESUME_TEMPLATES } from "@/lib/templates/definitions";
import { TemplateCategory, ResumeTemplateInfo } from "@/types/builder";

interface TemplateGalleryProps {
  selectedTemplateId: string;
  onSelectTemplate: (templateId: string) => void;
  onClose?: () => void;
}

const CATEGORIES: Array<"All" | TemplateCategory> = [
  "All",
  "Corporate",
  "Tech",
  "Executive",
  "Creative",
  "Academic",
  "Federal",
];

export default function TemplateGallery({
  selectedTemplateId,
  onSelectTemplate,
  onClose,
}: TemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<"All" | TemplateCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    return RESUME_TEMPLATES.filter((template) => {
      const matchesCategory =
        selectedCategory === "All" || template.category === selectedCategory;
      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="w-full space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-100 border border-zinc-200 text-black">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              6 ATS-Verified Templates
            </span>
            <span className="text-xs text-zinc-500 hidden sm:inline font-medium">
              100% Parser Compliant
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight mt-1">
            Choose Your Resume Architecture
          </h2>
          <p className="text-xs text-zinc-600 mt-0.5">
            Every template is rigorously engineered to achieve 97%+ ATS pass rates across Workday, Greenhouse, Lever, and Taleo.
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="self-end sm:self-center px-4 py-2 rounded-xl bg-white border border-zinc-300 text-zinc-700 hover:text-black hover:border-black text-xs font-bold transition-all touch-target shadow-sm"
          >
            ✕ Close Gallery
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            const count =
              category === "All"
                ? RESUME_TEMPLATES.length
                : RESUME_TEMPLATES.filter((t) => t.category === category).length;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 min-h-[38px] ${
                  isActive
                    ? "bg-black text-white shadow-sm border border-black font-bold"
                    : "bg-zinc-100 text-zinc-800 hover:text-black border border-zinc-200 hover:border-black"
                }`}
              >
                <span>{category}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "bg-white text-zinc-600 border border-zinc-200"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates or tags..."
            className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white border border-zinc-300 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black transition-colors shadow-sm"
          />
          <span className="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2 text-zinc-400 hover:text-black text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Visual Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <div
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`group relative rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-zinc-50 border-black shadow-md ring-2 ring-black"
                  : "bg-white border-zinc-200 hover:border-black shadow-sm"
              }`}
            >
              {/* Top Row: Category & Badges */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 border border-zinc-200 text-zinc-800">
                    {template.category}
                  </span>
                  {template.isPopular && (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                      ★ Popular
                    </span>
                  )}
                </div>

                {/* ATS Score Badge */}
                <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {template.atsScore}% ATS
                </div>
              </div>

              {/* Template Visual Thumbnail Simulation */}
              <div className="relative aspect-[16/11] w-full rounded-xl bg-zinc-50 border border-zinc-200 p-3.5 mb-3 overflow-hidden shadow-inner flex flex-col justify-between select-none transition-transform group-hover:scale-[1.01]">
                {/* Active check overlay if selected */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-md">
                    ✓
                  </div>
                )}

                {/* Miniature mock rendering based on template style */}
                <TemplateMiniMockup template={template} />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                  <span className="px-3.5 py-2 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-wider shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform border border-black">
                    {isSelected ? "Currently Active" : "Use This Template"}
                  </span>
                </div>
              </div>

              {/* Template Info */}
              <div className="space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-black group-hover:text-zinc-800 transition-colors">
                      {template.name}
                    </h3>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-black uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 line-clamp-2 mt-1 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Tags and Font Recommendation */}
                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-wrap">
                    {template.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-medium border border-zinc-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[120px]">
                    {template.fontRecommendation.split("/")[0]}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-zinc-200 p-8 space-y-3">
          <span className="text-3xl">🔍</span>
          <h3 className="text-base font-bold text-black">No Templates Found</h3>
          <p className="text-xs text-zinc-600 max-w-sm mx-auto">
            We couldn&apos;t find any resume template matching &quot;{searchQuery}&quot;. Try clearing your search query.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-wider"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * High-fidelity visual miniature representation of resume layouts
 */
function TemplateMiniMockup({ template }: { template: ResumeTemplateInfo }) {
  const { id } = template;

  if (id === "classic-corporate") {
    return (
      <div className="w-full h-full flex flex-col justify-between text-[#1E293B] font-serif text-[6px] leading-tight">
        <div className="border-b border-[#334155]/30 pb-1 text-center">
          <div className="w-24 h-2 bg-[#1E293B] rounded-sm mx-auto mb-0.5" />
          <div className="w-36 h-1 bg-zinc-400 rounded-sm mx-auto" />
        </div>
        <div className="space-y-1.5 py-1">
          <div>
            <div className="w-16 h-1.5 bg-[#1E293B] rounded-sm mb-0.5" />
            <div className="w-full h-0.5 bg-zinc-300 rounded-sm mb-0.5" />
            <div className="w-11/12 h-0.5 bg-zinc-300 rounded-sm" />
          </div>
          <div>
            <div className="w-20 h-1.5 bg-[#1E293B] rounded-sm mb-0.5" />
            <div className="w-full h-0.5 bg-zinc-300 rounded-sm mb-0.5" />
            <div className="w-4/5 h-0.5 bg-zinc-300 rounded-sm" />
          </div>
        </div>
        <div className="border-t border-[#334155]/20 pt-1 flex justify-between">
          <div className="w-14 h-1 bg-zinc-400 rounded-sm" />
          <div className="w-14 h-1 bg-zinc-400 rounded-sm" />
        </div>
      </div>
    );
  }

  if (id === "modern-tech") {
    return (
      <div className="w-full h-full flex flex-col justify-between text-[#0F172A] font-sans text-[6px]">
        <div className="flex items-center justify-between border-b-2 border-amber-500 pb-1">
          <div>
            <div className="w-20 h-2.5 bg-[#0F172A] rounded-sm mb-0.5" />
            <div className="w-28 h-1 bg-amber-600 rounded-sm" />
          </div>
          <div className="flex gap-0.5">
            <span className="w-2 h-2 rounded-full bg-amber-500/30" />
            <span className="w-2 h-2 rounded-full bg-emerald-500/30" />
          </div>
        </div>
        <div className="space-y-1 py-1">
          <div className="flex gap-1">
            <span className="w-6 h-1.5 rounded-sm bg-amber-100 border border-amber-300" />
            <span className="w-8 h-1.5 rounded-sm bg-amber-100 border border-amber-300" />
            <span className="w-7 h-1.5 rounded-sm bg-amber-100 border border-amber-300" />
          </div>
          <div className="space-y-0.5">
            <div className="w-14 h-1 bg-emerald-700 rounded-sm" />
            <div className="w-full h-0.5 bg-zinc-300 rounded-sm" />
            <div className="w-10/12 h-0.5 bg-zinc-300 rounded-sm" />
          </div>
        </div>
        <div className="flex justify-between items-center text-[5px] text-zinc-400">
          <div className="w-16 h-1 bg-zinc-300 rounded-sm" />
          <div className="w-8 h-1 bg-amber-500/40 rounded-sm" />
        </div>
      </div>
    );
  }

  if (id === "executive-leader") {
    return (
      <div className="w-full h-full flex flex-col justify-between text-[#111827] font-serif text-[6px]">
        <div className="border-t-2 border-amber-700 pt-1 text-center">
          <div className="w-28 h-2.5 bg-[#111827] rounded-sm mx-auto mb-0.5" />
          <div className="w-32 h-1 bg-amber-800 rounded-sm mx-auto" />
        </div>
        <div className="p-1 bg-amber-50/60 rounded border border-amber-200/80 my-1 grid grid-cols-2 gap-1">
          <div className="w-full h-1 bg-zinc-500 rounded-sm" />
          <div className="w-full h-1 bg-zinc-500 rounded-sm" />
          <div className="w-full h-1 bg-zinc-500 rounded-sm" />
          <div className="w-full h-1 bg-zinc-500 rounded-sm" />
        </div>
        <div className="space-y-0.5">
          <div className="w-16 h-1.5 bg-[#111827] rounded-sm" />
          <div className="w-full h-0.5 bg-zinc-300 rounded-sm" />
          <div className="w-11/12 h-0.5 bg-zinc-300 rounded-sm" />
        </div>
      </div>
    );
  }

  if (id === "minimal-creative") {
    return (
      <div className="w-full h-full flex flex-col justify-between text-[#18181B] font-sans text-[6px]">
        <div className="pt-0.5">
          <div className="w-24 h-2 bg-[#18181B] rounded-sm mb-0.5 tracking-wider" />
          <div className="w-16 h-1 bg-amber-600 rounded-sm mb-1" />
          <div className="w-full h-0.5 bg-zinc-200" />
        </div>
        <div className="space-y-1.5 my-1">
          <div className="space-y-0.5">
            <div className="w-12 h-1 bg-zinc-600 rounded-sm uppercase" />
            <div className="w-full h-0.5 bg-zinc-300 rounded-sm" />
            <div className="w-9/12 h-0.5 bg-zinc-300 rounded-sm" />
          </div>
          <div className="space-y-0.5">
            <div className="w-14 h-1 bg-zinc-600 rounded-sm uppercase" />
            <div className="w-11/12 h-0.5 bg-zinc-300 rounded-sm" />
          </div>
        </div>
        <div className="w-full h-0.5 bg-amber-500/40" />
      </div>
    );
  }

  if (id === "academic-research") {
    return (
      <div className="w-full h-full flex flex-col justify-between text-[#0F172A] font-serif text-[6px]">
        <div className="text-center pb-1">
          <div className="w-24 h-2 bg-[#0F172A] rounded-sm mx-auto mb-0.5" />
          <div className="w-32 h-1 bg-zinc-400 rounded-sm mx-auto mb-0.5" />
          <div className="w-40 h-0.5 bg-zinc-300 rounded-sm mx-auto" />
        </div>
        <div className="space-y-1">
          <div className="border-b border-zinc-300 pb-0.5">
            <div className="w-20 h-1 bg-[#0F172A] rounded-sm mb-0.5 font-bold" />
            <div className="w-full h-0.5 bg-zinc-300 rounded-sm" />
          </div>
          <div className="border-b border-zinc-300 pb-0.5">
            <div className="w-24 h-1 bg-[#0F172A] rounded-sm mb-0.5 font-bold" />
            <div className="w-11/12 h-0.5 bg-zinc-300 rounded-sm" />
          </div>
        </div>
        <div className="w-16 h-1 bg-zinc-400 rounded-sm" />
      </div>
    );
  }

  // federal-compliance
  return (
    <div className="w-full h-full flex flex-col justify-between text-[#090A0C] font-sans text-[6px]">
      <div className="bg-zinc-100 p-1 border border-zinc-300 rounded-sm mb-1">
        <div className="w-28 h-2 bg-[#090A0C] rounded-sm mb-0.5" />
        <div className="w-36 h-1 bg-zinc-500 rounded-sm" />
      </div>
      <div className="space-y-1">
        <div className="p-0.5 bg-zinc-50 border-l-2 border-zinc-800">
          <div className="w-24 h-1 bg-zinc-800 rounded-sm mb-0.5" />
          <div className="w-full h-0.5 bg-zinc-400 rounded-sm" />
          <div className="w-10/12 h-0.5 bg-zinc-400 rounded-sm" />
        </div>
        <div className="p-0.5 bg-zinc-50 border-l-2 border-zinc-800">
          <div className="w-20 h-1 bg-zinc-800 rounded-sm mb-0.5" />
          <div className="w-11/12 h-0.5 bg-zinc-400 rounded-sm" />
        </div>
      </div>
      <div className="text-[5px] text-zinc-500 font-mono">
        USAJOBS COMPLIANT • GS-14/15
      </div>
    </div>
  );
}
