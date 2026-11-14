"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SessionProvider from "@/components/SessionProvider";
import Link from "next/link";
import Logo from "@/components/Logo";

function LandingContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [loginRequiredEmail, setLoginRequiredEmail] = useState<string | null>(null);

  if (session?.user) {
    router.replace("/dashboard");
    return null;
  }

  const handleFile = useCallback(
    async (selectedFile: File) => {
      setFile(selectedFile);
      setError("");
      setLoginRequiredEmail(null);
      setUploading(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 150);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch("/api/resume/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const errMsg = data.error || "Resume processing failed";
          const errCode = data.code || (data.details && data.details.code);
          const errEmail = data.details?.email || (typeof data.email === "string" ? data.email : null);

          if (errCode === "LOGIN_REQUIRED" || res.status === 409) {
            setLoginRequiredEmail(errEmail || "");
          }
          throw new Error(errMsg);
        }

        setProgress(100);
        const data = await res.json();

        if (data.isNewUser) {
          router.push(
            `/setup-password?email=${encodeURIComponent(data.email)}&userId=${encodeURIComponent(data.userId)}`
          );
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        clearInterval(progressInterval);
        setProgress(0);
        setUploading(false);
        setFile(null);
        setError(
          err instanceof Error
            ? err.message
            : "Upload failed. Please upload a standard PDF or DOCX file."
        );
      }
    },
    [router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFile(droppedFile);
    },
    [handleFile]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFile(selected);
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#111111] font-sans antialiased selection:bg-[#FFDA1A] selection:text-[#111111]">
      {/* ===================== NAVBAR (60px) ===================== */}
      <header className="sticky top-0 z-50 bg-[#003399] text-white shadow-xs">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-4 sm:px-6">
          {/* Logo Left */}
          <Logo theme="on-blue" size="md" href="/" />

          {/* Simple Navigation Links: Why, What, How */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/90">
            <a href="#why" className="hover:text-[#FFDA1A] transition-colors py-1">
              Why paniund?
            </a>
            <a href="#what" className="hover:text-[#FFDA1A] transition-colors py-1">
              What is it?
            </a>
            <a href="#how" className="hover:text-[#FFDA1A] transition-colors py-1">
              How it works
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-wider text-white hover:text-[#FFDA1A] transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="nordic-btn-yellow h-9 px-4 text-xs font-bold uppercase tracking-wide cursor-pointer"
            >
              Upload Resume
            </button>
          </div>
        </div>
      </header>

      {/* ===================== HERO / INSTANT ACTION SECTION ===================== */}
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-[#DFDFDF] rounded-full text-[11px] font-semibold text-[#003399] mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0A8A00]" />
              Smart Job Search & Application Workspace
            </div>

            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-[#111111] leading-snug mb-2 whitespace-normal sm:whitespace-nowrap">
              Stop rewriting resumes for every job.{" "}
              <span className="text-[#003399]">Land interviews faster.</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#484848] leading-relaxed max-w-2xl mx-auto">
              paniund analyzes your experience, matches it against any job posting in seconds, generates tailored application materials, and keeps your entire search organized in one place.
            </p>
          </div>

          {/* Dropzone Container: Prioritizing Immediate UX */}
          <div className="max-w-2xl mx-auto">
            <div className="nordic-card p-4 sm:p-6 bg-white shadow-sm">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[4px] transition-all p-5 sm:p-7 text-center cursor-pointer ${
                  dragging
                    ? "border-[#003399] bg-[#003399]/5"
                    : "border-[#DFDFDF] bg-[#F5F5F5] hover:border-[#003399] hover:bg-white"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={onFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center gap-2.5">
                  <div className="w-11 h-11 rounded-full bg-[#FFDA1A] text-[#003399] flex items-center justify-center shadow-xs">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm sm:text-base font-bold text-[#111111]">
                      {file ? file.name : "Drop your resume here or click to browse"}
                    </p>
                    <p className="text-[11px] sm:text-xs text-[#767676] mt-0.5 font-medium">
                      Supports PDF & DOCX • Instant analysis • No credit card required
                    </p>
                  </div>

                  {uploading && (
                    <div className="w-full max-w-xs mt-3">
                      <div className="h-2 w-full bg-[#DFDFDF] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#003399] rounded-full transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#003399] mt-1.5 block">
                        Analyzing resume... {progress}%
                      </span>
                    </div>
                  )}

                  {error && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2.5 p-3 bg-[#CC0008]/10 text-[#CC0008] border border-[#CC0008] rounded-[4px] text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{error}</span>
                      </div>
                      {loginRequiredEmail !== null && (
                        <Link
                          href={`/login${loginRequiredEmail ? `?email=${encodeURIComponent(loginRequiredEmail)}` : ""}`}
                          className="nordic-btn-blue text-xs py-1 px-3 whitespace-nowrap self-end sm:self-auto shrink-0"
                        >
                          Sign In Now &rarr;
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Value Signals Below Dropzone */}
              <div className="mt-4 pt-3.5 border-t border-[#DFDFDF] flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#484848]">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-[#0A8A00] font-bold">✓</span> Free resume evaluation
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-[#0A8A00] font-bold">✓</span> 1-click job match score
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-[#0A8A00] font-bold">✓</span> Visual application pipeline
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 1: WHY? ===================== */}
      <section id="why" className="py-16 sm:py-20 bg-white border-y border-[#DFDFDF]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003399] block mb-2">
              The Problem & The Solution
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Why paniund?
            </h2>
            <p className="text-sm sm:text-base text-[#484848] mt-2">
              The modern job search feels like a full-time job. We created paniund to remove the tedious friction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pain Point 1 */}
            <div className="p-6 rounded-[4px] border border-[#DFDFDF] bg-[#F5F5F5] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#CC0008]/10 text-[#CC0008] flex items-center justify-center font-bold text-sm mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#111111] mb-2">
                  Resumes get lost in the dark
                </h3>
                <p className="text-sm text-[#484848] leading-relaxed">
                  Companies use automated filters that reject up to 75% of resumes before a human ever sees them—often just because of layout quirks or missing keyword variations.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-[#DFDFDF] text-xs font-semibold text-[#003399]">
                paniund ensures your resume is clean, compliant, and keyword-aligned.
              </div>
            </div>

            {/* Pain Point 2 */}
            <div className="p-6 rounded-[4px] border border-[#DFDFDF] bg-[#F5F5F5] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#CC0008]/10 text-[#CC0008] flex items-center justify-center font-bold text-sm mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#111111] mb-2">
                  Tailoring takes hours
                </h3>
                <p className="text-sm text-[#484848] leading-relaxed">
                  Rewriting bullet points, tweaking phrasing, and drafting custom cover letters for dozens of jobs is exhausting and eats away your weekends.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-[#DFDFDF] text-xs font-semibold text-[#003399]">
                paniund generates tailored bullets, letters, and outreach in 1 click.
              </div>
            </div>

            {/* Pain Point 3 */}
            <div className="p-6 rounded-[4px] border border-[#DFDFDF] bg-[#F5F5F5] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#CC0008]/10 text-[#CC0008] flex items-center justify-center font-bold text-sm mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#111111] mb-2">
                  Job hunts get chaotic
                </h3>
                <p className="text-sm text-[#484848] leading-relaxed">
                  Tracking links in bookmarks, notes in email drafts, and application dates in spreadsheets makes it too easy to miss follow-ups or forget recruiter details.
                </p>
              </div>
              <div className="pt-4 mt-6 border-t border-[#DFDFDF] text-xs font-semibold text-[#003399]">
                paniund tracks your entire pipeline from saved job to offer on a visual board.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 2: WHAT? ===================== */}
      <section id="what" className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003399] block mb-2">
              Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              What is paniund?
            </h2>
            <p className="text-sm sm:text-base text-[#484848] mt-2">
              An all-in-one job search workspace with four core tools working together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="nordic-card p-6 sm:p-8 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-[4px] bg-[#003399] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111] mb-1.5">
                  1. Comprehensive Resume Audit
                </h3>
                <p className="text-sm text-[#484848] leading-relaxed">
                  Upload your existing resume to identify formatting red flags, evaluate keyword density, and get an objective score on how parsers and recruiters interpret your background.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="nordic-card p-6 sm:p-8 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-[4px] bg-[#FFDA1A] text-[#111111] flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111] mb-1.5">
                  2. Target Job Matching
                </h3>
                <p className="text-sm text-[#484848] leading-relaxed">
                  Paste the URL or description of any opening. We parse the job requirements, cross-reference your experience, and reveal exactly which qualifications you match and what’s missing.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="nordic-card p-6 sm:p-8 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-[4px] bg-[#003399] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111] mb-1.5">
                  3. Application Writer AI
                </h3>
                <p className="text-sm text-[#484848] leading-relaxed">
                  Generate role-specific bullet improvements, custom cover letters, follow-up emails, and LinkedIn outreach scripts—grounded entirely in your actual accomplishments.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="nordic-card p-6 sm:p-8 flex gap-5 items-start">
              <div className="w-12 h-12 rounded-[4px] bg-[#0A8A00] text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="18" rx="1" />
                  <rect x="14" y="3" width="7" height="11" rx="1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#111111] mb-1.5">
                  4. Visual Application Tracker
                </h3>
                <p className="text-sm text-[#484848] leading-relaxed">
                  Manage applications across 5 clear stages: Wishlist, Applied, Screening, Interview, and Offer. Save interview dates, recruiter contacts, and notes in one unified view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 3: HOW? ===================== */}
      <section id="how" className="py-16 sm:py-20 bg-white border-y border-[#DFDFDF]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003399] block mb-2">
              Simple Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              How it works
            </h2>
            <p className="text-sm sm:text-base text-[#484848] mt-2">
              Three straightforward steps to take control of your job search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-[4px] bg-[#003399] text-white flex items-center justify-center font-bold text-lg mb-5 shadow-xs">
                1
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-2">
                Upload your resume
              </h3>
              <p className="text-sm text-[#484848] leading-relaxed">
                Drop your current resume into paniund. Our engine extracts your career timeline, skills, and metrics, then checks for formatting issues and keywords.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-[4px] bg-[#FFDA1A] text-[#111111] flex items-center justify-center font-bold text-lg mb-5 shadow-xs">
                2
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-2">
                Match target jobs
              </h3>
              <p className="text-sm text-[#484848] leading-relaxed">
                Paste any job posting link. In seconds, see your compatibility match score and uncover the exact requirements and keywords needed to stand out.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-[4px] bg-[#0A8A00] text-white flex items-center justify-center font-bold text-lg mb-5 shadow-xs">
                3
              </div>
              <h3 className="text-xl font-bold text-[#111111] mb-2">
                Apply & track
              </h3>
              <p className="text-sm text-[#484848] leading-relaxed">
                Generate tailored bullet points, cover letters, and outreach notes. Move your application from Wishlist to Interview and Offer on your board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="py-16 sm:py-20 bg-[#003399] text-white">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Ready to simplify your job search?
              </h2>
              <p className="text-sm sm:text-base text-white/80 mt-2">
                Upload your resume to see your initial score, or sign in to open your workspace.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="nordic-btn-yellow text-sm h-11 px-8 cursor-pointer font-bold"
              >
                Upload Resume
              </button>
              <Link
                href="/login"
                className="nordic-btn-secondary text-sm h-11 px-8 text-center font-bold"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-white border-t border-[#DFDFDF] py-10 text-[#484848]">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[#DFDFDF]">
            <Logo theme="on-light" size="md" href="/" />
            
            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#484848]">
              <a href="#why" className="hover:text-[#003399] transition-colors">Why paniund?</a>
              <a href="#what" className="hover:text-[#003399] transition-colors">What is it?</a>
              <a href="#how" className="hover:text-[#003399] transition-colors">How it works</a>
              <Link href="/login" className="hover:text-[#003399] transition-colors">Sign In</Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#767676]">
            <div>&copy; {new Date().getFullYear()} paniund. All rights reserved.</div>
            <div className="text-center sm:text-right">
              Intelligent career & application workspace.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <SessionProvider>
      <LandingContent />
    </SessionProvider>
  );
}
