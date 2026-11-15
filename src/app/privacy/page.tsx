import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Privacy Policy — paniund",
  description: "How paniund protects, encrypts, and handles your resume and job application data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-nordic-bg text-nordic-text font-sans antialiased selection:bg-nordic-secondary selection:text-nordic-text">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-nordic-primary text-white shadow-xs">
        <div className="mx-auto flex h-[60px] max-w-[1000px] items-center justify-between px-4 sm:px-6">
          <Logo theme="on-blue" size="md" href="/" />

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <Link href="/" className="hover:text-nordic-secondary transition-colors">
              &larr; Back to Home
            </Link>
            <Link
              href="/login"
              className="nordic-btn-yellow h-8 px-3.5 inline-flex items-center text-xs font-bold"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Privacy Document Content */}
      <main className="mx-auto max-w-[1000px] px-4 sm:px-6 py-10 sm:py-14">
        {/* Document Header Card */}
        <div className="bg-white border border-nordic-border rounded-[6px] shadow-sm overflow-hidden mb-8">
          <div className="h-1.5 bg-nordic-primary w-full" />
          <div className="p-6 sm:p-10 border-b border-nordic-border bg-[#FAFAFA]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-nordic-primary/10 border border-nordic-primary/20 rounded-full text-[11px] font-bold text-nordic-primary mb-3">
              <span>🔒</span> Privacy & Data Stewardship
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-nordic-text">
              Privacy Policy
            </h1>
            <p className="text-xs sm:text-sm text-nordic-neutral mt-2 font-mono">
              Last updated: November 2026 • Plain language commitment
            </p>
          </div>

          {/* Quick Summary Box */}
          <div className="p-6 sm:p-8 bg-[#FFF9E6] border-b border-nordic-border text-xs sm:text-sm text-[#735100] leading-relaxed">
            <p className="font-bold text-sm text-nordic-text mb-2 flex items-center gap-2">
              <span>🛡️</span> Our core privacy pledge in 3 sentences:
            </p>
            <p>
              We built <strong>paniund</strong> because career searches are personal and sensitive.
              We only use your resume and job postings to provide you with ATS scores, tailored application materials, and tracking tools.
              <strong> We never sell your data, never share it with recruiters or employers, and never use your resume to train public AI models.</strong>
            </p>
          </div>

          {/* Document Body */}
          <div className="p-6 sm:p-10 space-y-10 text-xs sm:text-sm text-[#333333] leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">1.</span> What Data We Collect
              </h2>
              <p>
                We only collect data that you deliberately provide to make the application and optimization features work:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-nordic-text-secondary">
                <li>
                  <strong className="text-nordic-text">Resume Data:</strong> When you upload a resume (PDF, DOCX, TXT), we extract text content including your contact details, career history, education, skills, and achievements to compute ATS compatibility scores.
                </li>
                <li>
                  <strong className="text-nordic-text">Account Information:</strong> Your name, email address, and an encrypted password hash (salted using bcrypt). If you sign in via Google OAuth, we receive your email and basic public profile avatar.
                </li>
                <li>
                  <strong className="text-nordic-text">Job Application Records:</strong> Vacancies you clip via the 1-Click Browser Extension or add manually, including job titles, descriptions, requirements, company names, compensation notes, and interview dates.
                </li>
                <li>
                  <strong className="text-nordic-text">Analytics & Diagnostics:</strong> Minimal, privacy-friendly telemetry powered by Umami. We do not track you across other websites, do not build advertising profiles, and do not log keystrokes.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">2.</span> How We Use Your Data
              </h2>
              <p>Your data is processed strictly for the following purposes:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="p-4 rounded-[4px] bg-nordic-bg border border-nordic-border">
                  <h3 className="font-bold text-nordic-text mb-1">ATS Optimization & Scoring</h3>
                  <p className="text-[12px] text-nordic-text-secondary">
                    Comparing your resume against modern ATS parser heuristics (layout checks, keyword frequency, impact metrics).
                  </p>
                </div>
                <div className="p-4 rounded-[4px] bg-nordic-bg border border-nordic-border">
                  <h3 className="font-bold text-nordic-text mb-1">Tailored AI Generation</h3>
                  <p className="text-[12px] text-nordic-text-secondary">
                    When you click to generate a cover letter or bullet point rewrite, your resume excerpt and the target job description are sent to secure LLM APIs.
                  </p>
                </div>
                <div className="p-4 rounded-[4px] bg-nordic-bg border border-nordic-border">
                  <h3 className="font-bold text-nordic-text mb-1">Personalized Job Matching</h3>
                  <p className="text-[12px] text-nordic-text-secondary">
                    Finding open positions in your target geography (e.g. UAE, Saudi Arabia, Remote) matching your career preferences.
                  </p>
                </div>
                <div className="p-4 rounded-[4px] bg-nordic-bg border border-nordic-border">
                  <h3 className="font-bold text-nordic-text mb-1">Account & Security Alerts</h3>
                  <p className="text-[12px] text-nordic-text-secondary">
                    Dispatching password reset instructions and authenticating your 1-Click Job Clipper browser extension token.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-error">3.</span> What We Absolutely DO NOT Do
              </h2>
              <div className="space-y-2.5">
                <div className="flex items-start gap-3 p-3 bg-white border border-nordic-border rounded-[4px]">
                  <span className="text-nordic-error font-bold text-base leading-none">✕</span>
                  <div>
                    <strong className="text-nordic-text block">We NEVER sell your data</strong>
                    <span className="text-[12px] text-nordic-text-secondary">We do not sell resume data, contact lists, or job hunt activity to recruiters, data brokers, or advertisers.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-nordic-border rounded-[4px]">
                  <span className="text-nordic-error font-bold text-base leading-none">✕</span>
                  <div>
                    <strong className="text-nordic-text block">We NEVER share with employers</strong>
                    <span className="text-[12px] text-nordic-text-secondary">Your current employer, target companies, and colleagues cannot see your paniund activity or pipeline.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-white border border-nordic-border rounded-[4px]">
                  <span className="text-nordic-error font-bold text-base leading-none">✕</span>
                  <div>
                    <strong className="text-nordic-text block">We NEVER train public AI models on your resume</strong>
                    <span className="text-[12px] text-nordic-text-secondary">Our AI integrations with LLM providers operate on zero-data-retention terms where prompts and resumes are not used to train future foundation models.</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">4.</span> Data Deletion (Your Right to Be Forgotten)
              </h2>
              <p>
                You maintain complete ownership and control over your records:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-nordic-text-secondary">
                <li>You can delete individual tracked jobs, resumes, or cover letters at any time in your dashboard.</li>
                <li>
                  <strong className="text-nordic-text">Full Account Purge:</strong> You can request immediate, permanent deletion of your account and all associated database records (profile, resumes, applications, API tokens, activity logs) directly from your Profile Settings or by emailing <a href="mailto:privacy@paniund.com" className="text-nordic-primary font-bold underline">privacy@paniund.com</a>.
                </li>
                <li>Once requested, your data is permanently deleted from our primary PostgreSQL databases without lingering retention periods.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">5.</span> Cookies & Local Storage
              </h2>
              <p>
                We keep cookie usage to the bare minimum required for secure operation:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-nordic-text-secondary">
                <li><strong className="text-nordic-text">Essential Authentication Cookies:</strong> Encrypted NextAuth session cookies to keep you signed in securely across requests.</li>
                <li><strong className="text-nordic-text">Local Browser Storage:</strong> Remembering UI preferences like table density and your personal extension access token.</li>
                <li><strong className="text-nordic-text">No Third-Party Advertising Cookies:</strong> We do not load advertising beacons, Facebook pixels, or cross-site tracking scripts.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">6.</span> Security & Infrastructure
              </h2>
              <p className="text-nordic-text-secondary">
                All data transmission between your browser, our servers, and our databases is encrypted using modern TLS 1.3 / HTTPS protocols. Sensitive secrets and password hashes are never stored in plain text.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3 pt-2 border-t border-nordic-border">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text">
                7. Contact & Questions
              </h2>
              <p className="text-nordic-text-secondary">
                If you have any questions about how your data is handled or wish to submit an export or deletion request, please reach out to our team:
              </p>
              <div className="p-4 bg-nordic-bg border border-nordic-border rounded-[4px] font-mono text-xs text-nordic-text space-y-1">
                <div>Email: <a href="mailto:privacy@paniund.com" className="text-nordic-primary font-bold underline">privacy@paniund.com</a></div>
                <div>Workspace: paniund Career Optimization Platform</div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-nordic-border py-8 text-nordic-text-secondary text-xs">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>&copy; {new Date().getFullYear()} paniund. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-nordic-primary font-semibold">Home</Link>
            <Link href="/login" className="hover:text-nordic-primary font-semibold">Sign In</Link>
            <Link href="/privacy" className="text-nordic-primary font-bold">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-nordic-primary font-semibold">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
