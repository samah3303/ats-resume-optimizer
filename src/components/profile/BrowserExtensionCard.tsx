"use client";

import { useState, useEffect } from "react";

export default function BrowserExtensionCard() {
  const [apiToken, setApiToken] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    fetch("/api/user/api-token")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.apiToken) setApiToken(data.apiToken);
      })
      .catch(() => {});
  }, []);

  const handleCopy = () => {
    if (!apiToken) return;
    navigator.clipboard.writeText(apiToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegenerate = async () => {
    if (!confirm("Regenerate your extension API token? Existing browser extensions will need to be reconnected.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user/api-token", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setApiToken(data.apiToken);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#003399]/20 rounded-[6px] p-5 sm:p-7 shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#DFDFDF] gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFDA1A] text-[#111111] text-[10px] font-bold rounded-[2px] uppercase tracking-wide mb-2">
            <span>✨</span>
            <span>Productivity Extension</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#111111] tracking-tight">
            1-Click Job Clipper (Chrome & Edge)
          </h2>
          <p className="text-xs text-[#484848] mt-0.5">
            Save job postings from LinkedIn, Indeed, Naukri Gulf, Greenhouse & Lever with one click directly into your paniund pipeline.
          </p>
        </div>

        <a
          href="/api/extension/download"
          download="paniund-job-clipper.zip"
          className="nordic-btn-primary h-11 px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Download Extension (.zip)</span>
        </a>
      </div>

      {/* 3-Step Setup Instructions */}
      <div>
        <h3 className="text-xs font-bold text-[#111111] uppercase tracking-wide mb-3">
          Quick Setup (Under 30 Seconds)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-[#F9FAFB] border border-[#DFDFDF] rounded-[4px] space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-xs">
              1
            </div>
            <span className="text-xs font-bold text-[#111111] block">
              Download & Unzip
            </span>
            <p className="text-[11px] text-[#767676] leading-relaxed">
              Click the button above to download <code className="bg-white px-1 border border-[#DFDFDF] rounded-[2px]">paniund-job-clipper.zip</code> and extract it anywhere on your computer.
            </p>
          </div>

          <div className="p-3.5 bg-[#F9FAFB] border border-[#DFDFDF] rounded-[4px] space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-[#003399] text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <span className="text-xs font-bold text-[#111111] block">
              Open Extensions
            </span>
            <p className="text-[11px] text-[#767676] leading-relaxed">
              In Chrome or Edge, navigate to <code className="bg-white px-1 border border-[#DFDFDF] rounded-[2px]">chrome://extensions</code> and switch on <strong>Developer mode</strong> (top right).
            </p>
          </div>

          <div className="p-3.5 bg-[#F9FAFB] border border-[#DFDFDF] rounded-[4px] space-y-1.5">
            <div className="w-6 h-6 rounded-full bg-[#0A8A00] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <span className="text-xs font-bold text-[#111111] block">
              Load Unpacked & Clip
            </span>
            <p className="text-[11px] text-[#767676] leading-relaxed">
              Click <strong>&quot;Load unpacked&quot;</strong> and choose the unzipped folder. That&apos;s it! The extension connects automatically to your account.
            </p>
          </div>
        </div>
      </div>

      {/* Personal API Access Token */}
      <div className="pt-4 border-t border-[#DFDFDF] space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="block text-xs font-bold text-[#111111] uppercase tracking-wide">
              Personal Access API Token
            </label>
            <p className="text-[11px] text-[#767676]">
              Used if you use the extension in an isolated or guest browser profile.
            </p>
          </div>
          <button
            type="button"
            onClick={handleRegenerate}
            disabled={loading}
            className="text-[11px] font-bold text-[#767676] hover:text-[#111111] underline cursor-pointer self-start sm:self-auto"
          >
            {loading ? "Regenerating..." : "Regenerate Token"}
          </button>
        </div>

        <div className="flex items-center gap-2 max-w-xl">
          <input
            type={showToken ? "text" : "password"}
            readOnly
            value={apiToken || "Loading..."}
            className="w-full h-10 px-3 bg-[#F9FAFB] border border-[#DFDFDF] rounded-[4px] font-mono text-xs text-[#111111] select-all focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="nordic-btn-secondary h-10 px-3 text-xs font-bold shrink-0 cursor-pointer"
          >
            {showToken ? "Hide" : "Show"}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="nordic-btn-yellow h-10 px-4 text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <span>✓</span>
                <span>Copied!</span>
              </>
            ) : (
              <span>Copy Token</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
