"use client";

import { useEffect, useState } from "react";
import { PublicStatsResponse } from "@/app/api/public/stats/route";

export default function TrustedBySection() {
  const [stats, setStats] = useState<PublicStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Check if preview mode is requested in URL for development / testing
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("preview_stats") === "true") {
        setIsPreview(true);
      }
    }

    async function loadStats() {
      try {
        const res = await fetch("/api/public/stats");
        if (res.ok) {
          const data: PublicStatsResponse = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to load public stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // Avoid layout shift while checking
  if (loading) return null;

  // Requirement: If counts are below 100, don't show the section at all to avoid looking empty.
  // Unless explicitly in preview mode via ?preview_stats=true
  if (!stats) return null;
  const countsBelow100 = stats.resumesAnalyzed < 100 && stats.jobsTracked < 100;
  if (countsBelow100 && !isPreview) {
    return null;
  }

  // Determine whether to display the average improvement card
  const hasImprovement = stats.averageImprovement !== null && stats.averageImprovement > 0;

  return (
    <section id="trusted" className="py-16 sm:py-24 bg-nordic-bg border-y border-nordic-border">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-nordic-primary block mb-2">
            Proven Results
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-nordic-text">
            Trusted by job seekers
          </h2>
          <p className="text-sm sm:text-base text-nordic-text-secondary mt-2">
            Real metrics from candidates using paniund to pass ATS filters and land more interviews.
          </p>
        </div>

        {/* 1. Stat Cards Row */}
        <div
          className={`grid gap-6 mb-16 ${
            hasImprovement
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
          }`}
        >
          {/* Stat Card 1: Resumes Analyzed */}
          <div className="nordic-card p-6 sm:p-8 bg-white border border-nordic-border rounded-[4px] text-center shadow-xs">
            <div className="text-3xl sm:text-4xl font-extrabold text-nordic-primary tracking-tight font-sans">
              {stats.resumesAnalyzed.toLocaleString()}+
            </div>
            <div className="text-sm font-bold text-nordic-text mt-2">
              Resumes analyzed
            </div>
            <p className="text-xs text-nordic-neutral mt-1 leading-relaxed">
              Audited for keyword density, formatting, and parser compatibility.
            </p>
          </div>

          {/* Stat Card 2: Average ATS Improvement (only shown when real data is available) */}
          {hasImprovement && (
            <div className="nordic-card p-6 sm:p-8 bg-white border border-nordic-border rounded-[4px] text-center shadow-xs">
              <div className="text-3xl sm:text-4xl font-extrabold text-nordic-primary tracking-tight font-sans">
                +{stats.averageImprovement} points
              </div>
              <div className="text-sm font-bold text-nordic-text mt-2">
                Average ATS improvement
              </div>
              <p className="text-xs text-nordic-neutral mt-1 leading-relaxed">
                Measured score increase after applying tailored bullet and skill upgrades.
              </p>
            </div>
          )}

          {/* Stat Card 3: Jobs Tracked */}
          <div className="nordic-card p-6 sm:p-8 bg-white border border-nordic-border rounded-[4px] text-center shadow-xs">
            <div className="text-3xl sm:text-4xl font-extrabold text-nordic-primary tracking-tight font-sans">
              {stats.jobsTracked.toLocaleString()}+
            </div>
            <div className="text-sm font-bold text-nordic-text mt-2">
              Jobs tracked
            </div>
            <p className="text-xs text-nordic-neutral mt-1 leading-relaxed">
              Organized seamlessly across Wishlist, Applied, Interview, and Offer stages.
            </p>
          </div>
        </div>

        {/* 2. Testimonials Row */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-lg font-bold text-nordic-text">
              What job seekers are saying
            </h3>
            <p className="text-xs text-nordic-neutral mt-1">
              Feedback from candidates who navigated modern hiring systems with paniund.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TODO: Replace with real candidate testimonial #1 */}
            <div className="nordic-card p-6 sm:p-7 bg-white border border-nordic-border rounded-[4px] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-nordic-secondary mb-3 text-sm" aria-label="5 stars">
                  {"★".repeat(5)}
                </div>
                <blockquote className="text-sm text-[#333333] leading-relaxed italic">
                  &ldquo;I was applying to dozens of software engineering roles with zero responses. paniund revealed my resume was missing key cloud infrastructure terms. Within two weeks of updating, I had three recruiter screen calls.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#F0F0F0]">
                <div className="w-10 h-10 rounded-full bg-nordic-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                  AR
                </div>
                <div>
                  <div className="text-sm font-bold text-nordic-text">Ahmed R.</div>
                  <div className="text-xs text-nordic-neutral">Senior Backend Engineer · Dubai</div>
                </div>
              </div>
            </div>

            {/* TODO: Replace with real candidate testimonial #2 */}
            <div className="nordic-card p-6 sm:p-7 bg-white border border-nordic-border rounded-[4px] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-nordic-secondary mb-3 text-sm" aria-label="5 stars">
                  {"★".repeat(5)}
                </div>
                <blockquote className="text-sm text-[#333333] leading-relaxed italic">
                  &ldquo;The 1-click Chrome extension clipper and tailored cover letters saved me hours every evening. Being able to see my match score before applying helped me prioritize jobs where I had real leverage.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#F0F0F0]">
                <div className="w-10 h-10 rounded-full bg-nordic-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                  SM
                </div>
                <div>
                  <div className="text-sm font-bold text-nordic-text">Sarah M.</div>
                  <div className="text-xs text-nordic-neutral">Product Marketing Manager · Abu Dhabi</div>
                </div>
              </div>
            </div>

            {/* TODO: Replace with real candidate testimonial #3 */}
            <div className="nordic-card p-6 sm:p-7 bg-white border border-nordic-border rounded-[4px] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-nordic-secondary mb-3 text-sm" aria-label="5 stars">
                  {"★".repeat(5)}
                </div>
                <blockquote className="text-sm text-[#333333] leading-relaxed italic">
                  &ldquo;The bullet point upgrades alone are worth it. It transformed my passive job descriptions into metric-driven accomplishment statements that recruiters actually commented on during my interviews.&rdquo;
                </blockquote>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#F0F0F0]">
                <div className="w-10 h-10 rounded-full bg-nordic-primary text-white font-bold text-xs flex items-center justify-center shrink-0">
                  KL
                </div>
                <div>
                  <div className="text-sm font-bold text-nordic-text">Kareem L.</div>
                  <div className="text-xs text-nordic-neutral">Full Stack Developer · Riyadh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
