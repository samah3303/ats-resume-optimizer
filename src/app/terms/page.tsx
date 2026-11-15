import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export const metadata = {
  title: "Terms of Service — paniund",
  description: "Terms and conditions for using paniund's ATS resume optimization and job tracking platform.",
};

export default function TermsOfServicePage() {
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

      {/* Main Document Content */}
      <main className="mx-auto max-w-[1000px] px-4 sm:px-6 py-10 sm:py-14">
        {/* Document Header Card */}
        <div className="bg-white border border-nordic-border rounded-[6px] shadow-sm overflow-hidden mb-8">
          <div className="h-1.5 bg-nordic-primary w-full" />
          <div className="p-6 sm:p-10 border-b border-nordic-border bg-[#FAFAFA]">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-nordic-primary/10 border border-nordic-primary/20 rounded-full text-[11px] font-bold text-nordic-primary mb-3">
              <span>⚖️</span> Service Agreement & Terms
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-nordic-text">
              Terms of Service
            </h1>
            <p className="text-xs sm:text-sm text-nordic-neutral mt-2 font-mono">
              Last updated: November 2026 • Plain language commitment
            </p>
          </div>

          {/* Quick Summary Box */}
          <div className="p-6 sm:p-8 bg-[#FFF9E6] border-b border-nordic-border text-xs sm:text-sm text-[#735100] leading-relaxed">
            <p className="font-bold text-sm text-nordic-text mb-2 flex items-center gap-2">
              <span>📋</span> Overview in plain language:
            </p>
            <p>
              Welcome to <strong>paniund</strong>. By accessing our platform, you agree to these terms.
              You own your resume and job search materials. Our AI-driven ATS scoring and tailoring tools are designed to assist and enhance your job applications, but final career decisions and application accuracy remain in your hands.
            </p>
          </div>

          {/* Document Body */}
          <div className="p-6 sm:p-10 space-y-10 text-xs sm:text-sm text-[#333333] leading-relaxed">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">1.</span> Acceptance of Terms & Public Beta
              </h2>
              <p>
                By creating an account, uploading a resume, or using the paniund website and browser extensions (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service and our{" "}
                <Link href="/privacy" className="text-nordic-primary font-bold underline">
                  Privacy Policy
                </Link>
                .
              </p>
              <p className="text-nordic-text-secondary">
                The Service is currently operating in public beta. We are continuously improving accuracy, features, and system integrations. We reserve the right to update, modify, or enhance features to improve service reliability and user experience.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">2.</span> Your Content & Intellectual Property
              </h2>
              <p>
                <strong>You retain 100% ownership</strong> of all personal data, resumes, documents, and content you submit to the Service.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-nordic-text-secondary">
                <li>
                  <strong className="text-nordic-text">Limited License:</strong> You grant paniund only the limited, temporary permission necessary to parse, process, analyze, and format your resumes and cover letters solely to deliver the service back to you.
                </li>
                <li>
                  <strong className="text-nordic-text">No Commercial Resale:</strong> We do not sell your resume data, candidate profiles, or personal information to recruitment agencies, advertisers, or third-party brokers.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">3.</span> AI Output & Career Advisory Disclaimer
              </h2>
              <p>
                paniund utilizes artificial intelligence models and heuristic algorithms to simulate Applicant Tracking System (ATS) parsing, generate suggested bullet points, and draft tailored cover letters.
              </p>
              <div className="p-4 bg-nordic-bg border-l-4 border-nordic-primary rounded-r-[4px] space-y-2">
                <p className="font-semibold text-nordic-text">
                  Important hiring and accuracy advisory:
                </p>
                <p className="text-nordic-text-secondary text-xs">
                  While our tools are engineered to align your qualifications with common ATS parsers (Workday, Greenhouse, Taleo, Lever, etc.), hiring decisions are made independently by third-party employers. paniund does not guarantee interview invitations, recruitment offers, or employment placement. You are solely responsible for reviewing and verifying the accuracy and truthfulness of all AI-generated text before submitting applications to employers.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">4.</span> Acceptable Use Policy
              </h2>
              <p>When using paniund, you agree not to:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-nordic-text-secondary">
                <li>Upload documents containing malicious code, viruses, or defamatory materials.</li>
                <li>Attempt to reverse engineer, decompile, or attack the infrastructure of the Service.</li>
                <li>Automate bulk artificial traffic or misuse AI generation endpoints beyond intended fair personal usage.</li>
                <li>Impersonate any person or misrepresent professional credentials unlawfully.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">5.</span> Account Security & Termination
              </h2>
              <p className="text-nordic-text-secondary">
                You are responsible for maintaining the confidentiality of your account password and API tokens. You may delete your account and associated resume data at any time via your profile settings or by contacting our team. We reserve the right to suspend or terminate accounts that violate these terms or abuse system resources.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text flex items-center gap-2 border-b border-nordic-border pb-2">
                <span className="text-nordic-primary">6.</span> Limitation of Liability
              </h2>
              <p className="text-nordic-text-secondary">
                To the maximum extent permitted by applicable law, paniund and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service, including any lost job opportunities or decisions made by hiring managers.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3 pt-2 border-t border-nordic-border">
              <h2 className="text-base sm:text-lg font-bold text-nordic-text">
                7. Contact Us
              </h2>
              <p className="text-nordic-text-secondary">
                If you have questions regarding these Terms of Service, please contact us:
              </p>
              <div className="p-4 bg-nordic-bg border border-nordic-border rounded-[4px] font-mono text-xs text-nordic-text space-y-1">
                <div>Email: <a href="mailto:support@paniund.com" className="text-nordic-primary font-bold underline">support@paniund.com</a></div>
                <div>Legal inquiries: <a href="mailto:legal@paniund.com" className="text-nordic-primary font-bold underline">legal@paniund.com</a></div>
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
            <Link href="/privacy" className="hover:text-nordic-primary font-semibold">Privacy Policy</Link>
            <Link href="/terms" className="text-nordic-primary font-bold">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
