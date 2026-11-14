"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminAnalyticsPage() {
  const envShareUrl = process.env.NEXT_PUBLIC_UMAMI_SHARE_URL || "";
  const envWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || "";

  const [shareUrl, setShareUrl] = useState<string>(envShareUrl);
  const [customInput, setCustomInput] = useState<string>("");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [showConfig, setShowConfig] = useState<boolean>(!envShareUrl);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for any quick-tested URL
    const saved = localStorage.getItem("umami_admin_preview_url");
    if (saved && !envShareUrl) {
      setShareUrl(saved);
      setCustomInput(saved);
      setShowConfig(false);
    } else if (envShareUrl) {
      setShareUrl(envShareUrl);
    }
  }, [envShareUrl]);

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    const cleanUrl = customInput.trim();
    setShareUrl(cleanUrl);
    localStorage.setItem("umami_admin_preview_url", cleanUrl);
    setShowConfig(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleReset = () => {
    localStorage.removeItem("umami_admin_preview_url");
    setShareUrl(envShareUrl);
    setCustomInput("");
    if (!envShareUrl) {
      setShowConfig(true);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Header Banner */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#FFDA1A] text-[#111111] text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-[#003399]" />
            Live Visitor Telemetry
          </div>
          <h1 className="text-xl sm:text-3xl font-bold text-[#111111] tracking-tight">
            Website Traffic & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-[#484848] mt-0.5 sm:mt-1">
            Privacy-friendly, real-time website tracking powered by Umami. Monitor visitors, pageviews, referrers, and geography.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {shareUrl && (
            <>
              <button
                onClick={() => setIframeKey((k) => k + 1)}
                title="Reload dashboard frame"
                className="nordic-btn-outline h-9 px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>

              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="nordic-btn-outline h-9 px-3 text-xs font-semibold flex items-center gap-1.5"
              >
                <span>Full Window</span>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </>
          )}

          <button
            onClick={() => setShowConfig(!showConfig)}
            className="nordic-btn-primary h-9 px-3 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{showConfig ? "Hide Setup Guide" : "Configuration & Guide"}</span>
          </button>
        </div>
      </div>

      {/* Setup & Connection Drawer */}
      {showConfig && (
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-5 sm:p-7 border border-[#DFDFDF] bg-white space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#003399]" />
                <h2 className="text-base sm:text-lg font-bold text-[#111111]">
                  Umami Free Tracking Setup (3-Minute Setup)
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#484848] mt-1">
                Follow these simple steps to activate free, cookie-free web tracking on your website and display it directly here.
              </p>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold bg-[#E8F0FE] text-[#003399] rounded-[2px] uppercase">
              100% Free Tier
            </span>
          </div>

          {/* Quick Preview Form */}
          <form onSubmit={handleApplyCustomUrl} className="p-4 bg-[#F5F5F5] border border-[#DFDFDF] rounded-xl sm:rounded-[4px] space-y-3">
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide">
              Live Preview / Test Share URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="https://cloud.umami.is/share/YOUR_TOKEN/yourdomain.com"
                className="flex-1 h-10 px-3.5 bg-white border border-[#DFDFDF] rounded-[4px] text-xs font-mono text-[#111111] placeholder:text-[#999999] focus:outline-none focus:border-[#003399]"
              />
              <button
                type="submit"
                className="nordic-btn-primary h-10 px-4 text-xs font-bold whitespace-nowrap"
              >
                Apply Preview
              </button>
              {shareUrl && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="nordic-btn-outline h-10 px-3 text-xs"
                >
                  Reset
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#767676]">
              Paste your Umami public share URL here to preview instantly, or configure permanent environment variables below.
            </p>
          </form>

          {/* Step by step checklist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="p-4 border border-[#DFDFDF] rounded-xl sm:rounded-[4px] bg-[#FAFAFA] space-y-2">
              <div className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-bold flex items-center justify-center">
                1
              </div>
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Create Free Umami Account
              </h3>
              <p className="text-xs text-[#484848] leading-relaxed">
                Sign up at{" "}
                <a
                  href="https://cloud.umami.is/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#003399] font-semibold underline underline-offset-2"
                >
                  cloud.umami.is
                </a>
                . The free tier gives 10,000 monthly events with zero maintenance.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 border border-[#DFDFDF] rounded-xl sm:rounded-[4px] bg-[#FAFAFA] space-y-2">
              <div className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-bold flex items-center justify-center">
                2
              </div>
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Add Website & Enable Share Link
              </h3>
              <p className="text-xs text-[#484848] leading-relaxed">
                In Umami Dashboard, click <strong>Add Website</strong> (name it e.g. <em>paniund</em>). In <strong>Edit Website</strong> &rarr; <strong>Share URL</strong>, turn on the public share toggle.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 border border-[#DFDFDF] rounded-xl sm:rounded-[4px] bg-[#FAFAFA] space-y-2">
              <div className="w-6 h-6 rounded-full bg-[#111111] text-white text-xs font-bold flex items-center justify-center">
                3
              </div>
              <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                Add to .env.local
              </h3>
              <p className="text-xs text-[#484848] leading-relaxed">
                Put your <strong>Website ID</strong> and <strong>Share URL</strong> into your project’s <code className="text-[11px] font-mono bg-white px-1 py-0.5 border border-[#DFDFDF]">.env.local</code>.
              </p>
            </div>
          </div>

          {/* Env variable snippet */}
          <div className="p-4 bg-[#111111] text-[#F5F5F5] rounded-xl sm:rounded-[4px] space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px] text-[#A0A0A0] font-sans">
              <span>Add these to your <code className="text-[#FFDA1A]">.env.local</code> file:</span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `# Umami Free Analytics\nNEXT_PUBLIC_UMAMI_WEBSITE_ID="YOUR_WEBSITE_ID_HERE"\nNEXT_PUBLIC_UMAMI_SHARE_URL="https://cloud.umami.is/share/YOUR_TOKEN/yourdomain.com"`,
                    "env"
                  )
                }
                className="text-[#FFDA1A] hover:underline font-bold"
              >
                {copied === "env" ? "Copied!" : "Copy Snippet"}
              </button>
            </div>
            <pre className="overflow-x-auto text-[11px] leading-relaxed select-all">
{`# Umami Free Analytics
NEXT_PUBLIC_UMAMI_WEBSITE_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
NEXT_PUBLIC_UMAMI_SHARE_URL="https://cloud.umami.is/share/TOKEN/yourdomain.com"`}
            </pre>
          </div>
        </div>
      )}

      {/* Embedded Dashboard View */}
      {shareUrl ? (
        <div className="nordic-card rounded-2xl sm:rounded-[4px] overflow-hidden border border-[#DFDFDF] bg-white shadow-xs">
          <div className="h-10 bg-[#FAFAFA] border-b border-[#DFDFDF] px-4 flex items-center justify-between text-xs text-[#767676]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[#111111]">Live Tracking Frame</span>
              <span className="text-[11px] text-[#999999] truncate max-w-xs sm:max-w-md">{shareUrl}</span>
            </div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-[#999999]">Umami Cloud</span>
          </div>

          <iframe
            key={iframeKey}
            src={shareUrl}
            className="w-full h-[850px] border-0 bg-white"
            title="Umami Analytics Dashboard"
            allow="fullscreen"
          />
        </div>
      ) : (
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-8 sm:p-12 text-center bg-white border border-dashed border-[#DFDFDF] space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#FFDA1A]/20 text-[#111111] mx-auto flex items-center justify-center">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="text-lg font-bold text-[#111111]">No Analytics Share URL Configured Yet</h2>
            <p className="text-xs sm:text-sm text-[#484848]">
              Connect your free Umami account above or paste a public share link to start viewing live visitors inside this admin panel.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => setShowConfig(true)}
              className="nordic-btn-primary h-10 px-5 text-xs font-bold uppercase tracking-wide"
            >
              Open Setup Instructions
            </button>
            <a
              href="https://cloud.umami.is/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="nordic-btn-outline h-10 px-5 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Get Free Umami Account</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
