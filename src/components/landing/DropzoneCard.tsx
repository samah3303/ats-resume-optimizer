"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DropzoneCard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [loginRequiredEmail, setLoginRequiredEmail] = useState<string | null>(null);
  const [needsEmail, setNeedsEmail] = useState(false);
  const [manualEmail, setManualEmail] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFile = useCallback(
    async (selectedFile: File, userEmail?: string) => {
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
        if (userEmail) {
          formData.append("email", userEmail);
        }

        const res = await fetch("/api/resume/upload", {
          method: "POST",
          body: formData,
        });

        clearInterval(progressInterval);

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const errMsg = data.error || "Resume processing failed";
          const errCode = data.code || (data.details && data.details.code);
          const errEmail =
            data.details?.email || (typeof data.email === "string" ? data.email : null);

          if (errCode === "EMAIL_REQUIRED") {
            setPendingFile(selectedFile);
            setNeedsEmail(true);
            setUploading(false);
            setProgress(0);
            return;
          }

          if (errCode === "LOGIN_REQUIRED" || res.status === 409) {
            setLoginRequiredEmail(errEmail || "");
          }
          throw new Error(errMsg);
        }

        setProgress(100);
        const data = await res.json();
        setNeedsEmail(false);

        if (data.isNewUser) {
          router.push(
            `/setup-password?email=${encodeURIComponent(data.email)}&userId=${encodeURIComponent(data.userId)}`
          );
        } else if (data.requiresLogin) {
          router.push(
            `/login?email=${encodeURIComponent(data.email)}&resumeUploaded=true`
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
    <div id="dropzone" className="max-w-2xl mx-auto scroll-mt-24">
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
              ? "border-nordic-primary bg-nordic-primary/5"
              : "border-nordic-border bg-nordic-bg hover:border-nordic-primary hover:bg-white"
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
            <div className="w-11 h-11 rounded-full bg-nordic-secondary text-nordic-primary flex items-center justify-center shadow-xs">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div>
              <p className="text-sm sm:text-base font-bold text-nordic-text">
                {file ? file.name : "Drop your resume here or click to browse"}
              </p>
              <p className="text-[11px] sm:text-xs text-nordic-neutral mt-0.5 font-medium">
                Supports PDF & DOCX • Instant analysis • No credit card required
              </p>
            </div>

            {uploading && (
              <div className="w-full max-w-xs mt-3">
                <div className="h-2 w-full bg-nordic-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-nordic-primary rounded-full transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-nordic-primary mt-1.5 block">
                  Analyzing resume... {progress}%
                </span>
              </div>
            )}

            {needsEmail && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 p-4 bg-nordic-bg border-2 border-nordic-primary rounded-[4px] text-left w-full max-w-md mx-auto"
              >
                <div className="flex items-center gap-2 mb-2 text-nordic-text font-bold text-xs">
                  <span className="text-sm">📧</span>
                  <span>Almost done! Enter your email to view your score:</span>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (pendingFile && manualEmail.trim()) {
                      handleFile(pendingFile, manualEmail.trim());
                    }
                  }}
                  className="space-y-2.5"
                >
                  <input
                    type="email"
                    required
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full h-10 px-3 bg-white border border-nordic-border rounded-[4px] text-xs text-nordic-text focus:outline-none focus:border-nordic-primary"
                  />
                  <button
                    type="submit"
                    disabled={uploading}
                    className="nordic-btn-yellow w-full h-10 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {uploading ? "Analyzing..." : "Continue & View ATS Score →"}
                  </button>
                </form>
              </div>
            )}

            {error && !needsEmail && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-2.5 p-3 bg-nordic-error/10 text-nordic-error border border-nordic-error rounded-[4px] text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-left"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" />
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
        <div className="mt-4 pt-3.5 border-t border-nordic-border flex flex-wrap items-center justify-between gap-2.5 text-xs text-nordic-text-secondary">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-nordic-success font-bold">✓</span> Free resume evaluation
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-nordic-success font-bold">✓</span> 1-click job match score
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span className="text-nordic-success font-bold">✓</span> Visual application pipeline
          </div>
        </div>

        {/* Trust & Privacy Signals */}
        <div className="mt-2.5 pt-2.5 border-t border-nordic-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-nordic-neutral">
          <div className="flex items-center gap-1.5 font-medium">
            <span>🔒</span> Your data is encrypted and never shared
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span>🗑️</span> Delete your account anytime
          </div>
          <div>
            <Link
              href="/privacy"
              className="text-nordic-primary font-bold hover:underline"
            >
              Read our privacy policy &rarr;
            </Link>
          </div>
        </div>

        {/* Option A Pricing Statement Banner */}
        <div className="mt-3 p-3 bg-nordic-primary/5 border border-nordic-primary/20 rounded-[4px] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm">✨</span>
            <span className="text-xs font-bold text-nordic-primary">
              Completely free — no hidden costs, no premium tier
            </span>
          </div>
          <span className="text-[11px] text-nordic-text-secondary">
            Powered by open-source AI models to keep costs sustainable.
          </span>
        </div>

        {/* Alternative: Create Profile directly without resume */}
        <div className="mt-3 pt-3 border-t border-nordic-border/70 text-center">
          <p className="text-xs text-nordic-text-secondary">
            Don&apos;t have your resume file right now?{" "}
            <Link
              href="/register"
              className="text-nordic-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Create profile & explore workspace</span>
              <span>&rarr;</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
