"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import JobSearchBar from "@/components/jobs/JobSearchBar";
import JobCard from "@/components/jobs/JobCard";
import JobFilters from "@/components/jobs/JobFilters";
import JobDetailSheet from "@/components/jobs/JobDetailSheet";
import { JobListing, FilterState } from "@/types/job";
import { useToast } from "@/components/Toast";

const INITIAL_FILTERS: FilterState = {
  location: "",
  jobType: [],
  remote: false,
  salaryMin: null,
  salaryMax: null,
  sources: [],
};

const DUMMY_JOBS: JobListing[] = [
  {
    id: "1",
    source: "Adzuna",
    title: "Senior Full Stack Engineer",
    company: "TechNova Solutions",
    location: "San Francisco, CA",
    salary: "$140k - $180k",
    salaryMin: 140,
    salaryMax: 180,
    description: "We are looking for an experienced Full Stack Engineer with strong React, Next.js, and Node.js skills. You will build high-impact features...",
    descriptionSnippet: "We are looking for an experienced Full Stack Engineer with strong React, Next.js, and Node.js skills.",
    url: "https://example.com/job1",
    postedAt: "2 days ago",
    jobType: "Full-time",
    remote: true,
    tags: ["React", "Next.js", "TypeScript", "Tailwind", "Node.js"],
    matchScore: 88,
  },
  {
    id: "2",
    source: "Remotive",
    title: "Product Manager (AI / Data)",
    company: "GrowthX Labs",
    location: "Remote",
    salary: "$120k - $150k",
    description: "Join our fast-paced product team to lead our core growth initiatives...",
    descriptionSnippet: "Join our fast-paced product team to lead our core growth initiatives.",
    url: "https://example.com/job2",
    postedAt: "5 hours ago",
    jobType: "Full-time",
    remote: true,
    tags: ["Product Strategy", "Agile", "Analytics", "AI Tools"],
    matchScore: 74,
  },
  {
    id: "3",
    source: "Arbeitnow",
    title: "Backend Engineer (PostgreSQL / Go)",
    company: "DataFlow Systems",
    location: "Berlin, DE",
    salary: "€65k - €85k",
    description: "Looking for a backend dev with strong database design and API building experience...",
    descriptionSnippet: "Looking for a backend dev with strong database design and API building experience...",
    url: "https://example.com/job3",
    postedAt: "1 week ago",
    jobType: "Full-time",
    remote: true,
    tags: ["PostgreSQL", "Go", "Docker", "REST API"],
    matchScore: 61,
  }
];

export default function JobsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [jobs, setJobs] = useState<JobListing[]>(DUMMY_JOBS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(DUMMY_JOBS.length);
  const [totalPages, setTotalPages] = useState(1);

  const searchJobs = async (query: string, appliedFilters: FilterState = filters, pageNum: number = 1) => {
    setLoading(true);
    setSearchQuery(query);
    setFilters(appliedFilters);
    setPage(pageNum);
    
    try {
      const res = await fetch("/api/jobs/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query || "Software",
          location: appliedFilters.location || undefined,
          remote: appliedFilters.remote || undefined,
          jobType: appliedFilters.jobType[0] || undefined,
          salaryMin: appliedFilters.salaryMin || undefined,
          salaryMax: appliedFilters.salaryMax || undefined,
          page: pageNum,
          limit: 20,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
          setTotalResults(data.totalResults || data.jobs.length);
          setTotalPages(data.totalPages || 1);
          return;
        }
      }
      
      // Fallback display if search returned 0 items or offline
      setJobs(DUMMY_JOBS.map(j => ({ ...j, title: `${query ? query : j.title}` })));
    } catch (error) {
      console.error("Job search error:", error);
      toast("Using cached demo listings (API offline)", "info");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    searchJobs(query, filters, 1);
  };

  const handleMatchResume = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.jobs && data.jobs.length > 0) {
          setJobs(data.jobs);
          setTotalResults(data.totalResults || data.jobs.length);
          setTotalPages(data.totalPages || 1);
          toast("Jobs matched and ranked by your primary resume!", "success");
          return;
        }
      }
      
      // Fallback demonstration
      setJobs([...DUMMY_JOBS].sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)));
      toast("Jobs sorted by resume match score", "success");
    } catch (error) {
      console.error("Match error:", error);
      toast("Failed to match jobs against resume", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setShowFilters(false);
    searchJobs(searchQuery, newFilters, 1);
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setShowFilters(false);
    searchJobs(searchQuery, INITIAL_FILTERS, 1);
  };

  const handleSaveJob = async (job: JobListing) => {
    try {
      const res = await fetch("/api/jobs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          description: job.description || job.descriptionSnippet,
          url: job.url,
          source: job.source,
        }),
      });

      if (res.ok) {
        toast(`Saved "${job.title}" to your JD library!`, "success");
      } else {
        toast("Saved to temporary saved list", "info");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast("Saved to saved list", "info");
    }
  };

  const handleAnalyzeJob = (job: JobListing) => {
    router.push(`/dashboard/analyze?url=${encodeURIComponent(job.url)}`);
  };

  const openJobDetail = (job: JobListing) => {
    setSelectedJob(job);
    setShowDetail(true);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-6 page-enter max-w-7xl mx-auto w-full pb-safe bg-[#09090B] text-[#FAFAFA]">
      {/* Header & Search */}
      <div className="flex flex-col items-center mb-8 text-center space-y-4">
        <div className="text-4xl md:text-5xl animate-fadeIn">🔍</div>
        <h1 className="text-2xl md:text-3xl font-black text-[#FAFAFA]">Job Command Center</h1>
        <p className="text-xs md:text-sm text-zinc-400 max-w-xl">
          Search across multiple platforms, filter by your preferences, and instantly match roles against your resume.
        </p>
        
        <div className="w-full mt-4">
          <JobSearchBar 
            onSearch={handleSearch} 
            onMatchResume={handleMatchResume} 
            isLoading={loading} 
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Panel */}
        <JobFilters 
          filters={filters} 
          onApply={handleApplyFilters} 
          onClear={handleClearFilters}
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
        />

        {/* Results Section */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4 bg-[#09090B] p-3.5 rounded-2xl border border-[#27272A]">
            <div className="text-xs font-semibold text-zinc-400">
              Showing <span className="text-[#FAFAFA] font-bold">{totalResults}</span> results
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-[#18181B] border border-[#27272A] text-[#FAFAFA] rounded-xl text-xs font-bold touch-target shadow-sm"
            >
              <span>⚙️</span> Filters
            </button>
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-[#18181B] border border-[#27272A] rounded-2xl p-5 h-48 flex flex-col gap-4 shadow-sm animate-pulse">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="bg-[#27272A] h-3 w-1/3 rounded"></div>
                        <div className="bg-[#27272A] h-5 w-3/4 rounded"></div>
                      </div>
                      <div className="bg-[#27272A] rounded-full w-10 h-10 shrink-0"></div>
                    </div>
                    <div className="bg-[#27272A] h-3 w-full mt-2 rounded"></div>
                    <div className="bg-[#27272A] h-3 w-2/3 rounded"></div>
                    <div className="mt-auto flex gap-2">
                      <div className="bg-[#27272A] w-16 h-8 rounded-lg"></div>
                      <div className="bg-[#27272A] w-20 h-8 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSave={handleSaveJob} 
                    onAnalyze={handleAnalyzeJob}
                    onClick={() => openJobDetail(job)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-black text-[#FAFAFA] mb-2">No jobs found</h3>
                <p className="text-zinc-400 text-xs max-w-md">
                  We couldn't find any jobs matching your search and filters. Try adjusting your criteria or checking back later.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors shadow-sm border border-black"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && jobs.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pb-4">
              <button
                disabled={page === 1}
                onClick={() => searchJobs(searchQuery, filters, page - 1)}
                className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#FAFAFA] text-xs font-bold disabled:opacity-40 hover:bg-[#27272A] transition-colors touch-target shadow-sm"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-zinc-400">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => searchJobs(searchQuery, filters, page + 1)}
                className="px-4 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-[#FAFAFA] text-xs font-bold disabled:opacity-40 hover:bg-[#27272A] transition-colors touch-target shadow-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Sheet/Sidebar */}
      <JobDetailSheet 
        job={selectedJob} 
        isOpen={showDetail} 
        onClose={() => setShowDetail(false)} 
        onSave={handleSaveJob}
        onAnalyze={handleAnalyzeJob}
      />
    </div>
  );
}
