import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/Logo";
import DropzoneCard from "@/components/landing/DropzoneCard";
import ProductPreviewSection from "@/components/landing/ProductPreviewSection";
import TrustedBySection from "@/components/landing/TrustedBySection";

export const metadata = {
  title: "paniund — ATS Resume Optimizer & Job Match Tracker",
  description:
    "Stop rewriting resumes for every job. Land interviews faster with instant ATS scoring, AI tailoring, and application tracking.",
};

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-nordic-bg text-nordic-text font-sans antialiased selection:bg-nordic-secondary selection:text-nordic-text">
      {/* ===================== NAVBAR (60px) ===================== */}
      <header className="sticky top-0 z-50 bg-nordic-primary text-white shadow-xs">
        <div className="mx-auto flex h-[60px] max-w-[1200px] items-center justify-between px-4 sm:px-6">
          {/* Logo Left */}
          <Logo theme="on-blue" size="md" href="/" />

          {/* Simple Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-white/90">
            <a href="#preview" className="hover:text-nordic-secondary transition-colors py-1">
              Preview
            </a>
            <a href="#why" className="hover:text-nordic-secondary transition-colors py-1">
              Why paniund?
            </a>
            <a href="#what" className="hover:text-nordic-secondary transition-colors py-1">
              What is it?
            </a>
            <a href="#how" className="hover:text-nordic-secondary transition-colors py-1">
              How it works
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-wider text-white hover:text-nordic-secondary transition-colors px-2 py-1"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="hidden sm:inline-flex text-xs font-bold uppercase tracking-wider text-white hover:text-nordic-secondary transition-colors px-2 py-1"
            >
              Create Profile
            </Link>
            <a
              href="#dropzone"
              className="nordic-btn-yellow h-9 px-4 text-xs font-bold uppercase tracking-wide flex items-center justify-center cursor-pointer"
            >
              Upload Resume
            </a>
          </div>
        </div>
      </header>

      {/* ===================== HERO / INSTANT ACTION SECTION ===================== */}
      <section className="py-6 sm:py-8 lg:py-10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white border border-nordic-border rounded-full text-[11px] font-semibold text-nordic-primary mb-3 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-nordic-success" />
              Smart Job Search & Application Workspace
            </div>

            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-nordic-text leading-snug mb-2 whitespace-normal sm:whitespace-nowrap">
              Stop rewriting resumes for every job.{" "}
              <span className="text-nordic-primary">Land interviews faster.</span>
            </h1>

            <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed max-w-2xl mx-auto">
              paniund analyzes your experience, matches it against any job posting in seconds, generates tailored application materials, and keeps your entire search organized in one place.
            </p>
          </div>

          {/* Extracted Interactive Dropzone Client Component */}
          <DropzoneCard />
        </div>
      </section>

      {/* ===================== SECTION 1: PRODUCT PREVIEW ===================== */}
      <ProductPreviewSection />

      {/* ===================== SECTION 2: WHY PANIUND ===================== */}
      <section id="why" className="py-16 sm:py-24 bg-white border-y border-nordic-border">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-nordic-primary block mb-2">
              The Problem We Solve
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-nordic-text">
              The modern hiring process is broken for applicants
            </h2>
            <p className="text-sm sm:text-base text-nordic-text-secondary mt-3 leading-relaxed">
              Companies deploy automated Applicant Tracking Systems (ATS) that filter out up to 75% of qualified resumes before a human recruiter even sees them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="nordic-card p-6 sm:p-8 bg-white border border-nordic-border rounded-[4px] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-nordic-error/10 text-nordic-error flex items-center justify-center font-bold text-lg mb-4">
                ✕
              </div>
              <h3 className="text-lg font-bold text-nordic-text mb-2">
                The Keyword Black Hole
              </h3>
              <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
                Even with 10 years of experience, missing a single required keyword in your resume can drop your match score below automated screening cutoffs.
              </p>
            </div>

            <div className="nordic-card p-6 sm:p-8 bg-white border border-nordic-border rounded-[4px] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-nordic-warning/10 text-nordic-warning flex items-center justify-center font-bold text-lg mb-4">
                ⏳
              </div>
              <h3 className="text-lg font-bold text-nordic-text mb-2">
                Hours Wasted Per Application
              </h3>
              <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
                Manually tailoring bullet points, researching keywords, drafting cover letters, and writing recruiter outreach takes 2-3 hours per single job opening.
              </p>
            </div>

            <div className="nordic-card p-6 sm:p-8 bg-white border border-nordic-border rounded-[4px] shadow-xs">
              <div className="w-10 h-10 rounded-full bg-nordic-primary/10 text-nordic-primary flex items-center justify-center font-bold text-lg mb-4">
                📊
              </div>
              <h3 className="text-lg font-bold text-nordic-text mb-2">
                Messy Spreadsheet Chaos
              </h3>
              <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
                Tracking dozens of applications across job boards with disconnected spreadsheets leads to missed interviews, forgotten follow-ups, and lost momentum.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 3: WHAT IS IT ===================== */}
      <section id="what" className="py-16 sm:py-24 bg-nordic-bg">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-nordic-primary block mb-2">
              All-In-One Application System
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-nordic-text">
              Everything you need to land interviews
            </h2>
            <p className="text-sm sm:text-base text-nordic-text-secondary mt-2">
              Four core tools working together so you can apply to twice as many roles in half the time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="nordic-card p-6 sm:p-8 bg-white rounded-[4px] shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-[4px] bg-nordic-primary text-white flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <h3 className="text-lg font-bold text-nordic-text">
                  Instant ATS Resume Evaluation
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
                Upload your resume once. Get a comprehensive ATS score breaking down formatting, keyword density, quantified achievements, and actionable recommendations.
              </p>
            </div>

            <div className="nordic-card p-6 sm:p-8 bg-white rounded-[4px] shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-[4px] bg-nordic-secondary text-nordic-text flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <h3 className="text-lg font-bold text-nordic-text">
                  1-Click Job Match & Optimization Plan
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
                Paste any job posting URL or text. See your exact match percentage, uncover missing target keywords, and get before-and-after bullet rewrites.
              </p>
            </div>

            <div className="nordic-card p-6 sm:p-8 bg-white rounded-[4px] shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-[4px] bg-nordic-primary text-white flex items-center justify-center font-bold text-sm">
                  3
                </span>
                <h3 className="text-lg font-bold text-nordic-text">
                  Tailored AI Cover Letters & Outreach
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
                Generate high-converting cover letters, post-interview follow-up emails, and recruiter connection requests with configurable tone controls.
              </p>
            </div>

            <div className="nordic-card p-6 sm:p-8 bg-white rounded-[4px] shadow-xs">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-[4px] bg-nordic-secondary text-nordic-text flex items-center justify-center font-bold text-sm">
                  4
                </span>
                <h3 className="text-lg font-bold text-nordic-text">
                  Native Drag-and-Drop Application Board
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-nordic-text-secondary leading-relaxed">
                Move applications smoothly across stages: Wishlist, Applied, Screening, Interview, Offer, and Archived with optimistic real-time synchronization.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 4: HOW IT WORKS ===================== */}
      <section id="how" className="py-16 sm:py-24 bg-white border-y border-nordic-border">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-nordic-primary block mb-2">
              Three Simple Steps
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-nordic-text">
              How it works
            </h2>
            <p className="text-sm sm:text-base text-nordic-text-secondary mt-2">
              From raw resume to organized interview pipeline in under 3 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-[4px] bg-nordic-primary text-white flex items-center justify-center font-bold text-lg mb-5 shadow-xs">
                1
              </div>
              <h3 className="text-xl font-bold text-nordic-text mb-2">
                Upload your resume
              </h3>
              <p className="text-sm text-nordic-text-secondary leading-relaxed">
                Drop your existing PDF or Word resume. Our parser automatically extracts your career history, skills, and measures your baseline ATS compatibility.
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-[4px] bg-nordic-secondary text-nordic-text flex items-center justify-center font-bold text-lg mb-5 shadow-xs">
                2
              </div>
              <h3 className="text-xl font-bold text-nordic-text mb-2">
                Match target jobs
              </h3>
              <p className="text-sm text-nordic-text-secondary leading-relaxed">
                Paste any job posting link. In seconds, see your compatibility match score and uncover the exact requirements and keywords needed to stand out.
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <div className="w-12 h-12 rounded-[4px] bg-nordic-success text-white flex items-center justify-center font-bold text-lg mb-5 shadow-xs">
                3
              </div>
              <h3 className="text-xl font-bold text-nordic-text mb-2">
                Apply & track
              </h3>
              <p className="text-sm text-nordic-text-secondary leading-relaxed">
                Generate tailored bullet points, cover letters, and outreach notes. Move your application from Wishlist to Interview and Offer on your board.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECTION 5: TRUSTED BY JOB SEEKERS ===================== */}
      <TrustedBySection />

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="py-16 sm:py-20 bg-nordic-primary text-white">
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
              <a
                href="#dropzone"
                className="nordic-btn-yellow text-sm h-11 px-8 cursor-pointer font-bold flex items-center justify-center"
              >
                Upload Resume
              </a>
              <Link
                href="/register"
                className="nordic-btn-secondary text-sm h-11 px-8 text-center font-bold flex items-center justify-center"
              >
                Create Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-white border-t border-nordic-border py-10 text-nordic-text-secondary">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-nordic-border">
            <Logo theme="on-light" size="md" href="/" />

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-nordic-text-secondary">
              <a href="#why" className="hover:text-nordic-primary transition-colors">
                Why paniund?
              </a>
              <a href="#what" className="hover:text-nordic-primary transition-colors">
                What is it?
              </a>
              <a href="#how" className="hover:text-nordic-primary transition-colors">
                How it works
              </a>
              <Link href="/privacy" className="hover:text-nordic-primary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-nordic-primary transition-colors">
                Terms
              </Link>
              <a href="mailto:support@paniund.com" className="hover:text-nordic-primary transition-colors">
                Contact
              </a>
              <Link href="/register" className="hover:text-nordic-primary transition-colors">
                Create Profile
              </Link>
              <Link href="/login" className="hover:text-nordic-primary transition-colors">
                Sign In
              </Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-nordic-neutral">
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
