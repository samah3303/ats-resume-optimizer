"use client";

import { GenerationTone } from "@/types";
import EmptyState from "@/components/ui/EmptyState";

interface FollowUpTabProps {
  followupEmail: string;
  setFollowupEmail: (val: string) => void;
  followupContext: string;
  setFollowupContext: (val: string) => void;
  selectedTone: GenerationTone;
  handleToneChange: (tone: GenerationTone) => void;
  generating: boolean;
  copiedKey: string | null;
  copyToClipboard: (text: string, label: string, key?: string) => void;
  handleGenerateFollowup: () => void;
}

export default function FollowUpTab({
  followupEmail,
  setFollowupEmail,
  followupContext,
  setFollowupContext,
  selectedTone,
  handleToneChange,
  generating,
  copiedKey,
  copyToClipboard,
  handleGenerateFollowup,
}: FollowUpTabProps) {
  return (
    <div
      role="tabpanel"
      id="panel-followup"
      aria-labelledby="tab-followup"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nordic-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-nordic-text">
            Follow-Up Email
          </h2>
          <p className="text-xs text-nordic-text-secondary mt-0.5">
            Send a polite message after applying or interviewing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={followupContext}
            aria-label="Follow-up email context"
            onChange={(e) => setFollowupContext(e.target.value)}
            className="h-10 px-3 text-xs bg-white border border-nordic-border rounded-[4px] text-nordic-text focus:outline-none focus:border-nordic-primary"
          >
            <option value="post_interview">Thank You (After Interview)</option>
            <option value="status_check">Status Check (1-2 Weeks Later)</option>
            <option value="offer_negotiation">Job Offer Response</option>
          </select>

          <div className="flex items-center gap-1.5">
            <label
              htmlFor="tone-select-followup"
              className="text-xs font-semibold text-nordic-text-secondary shrink-0"
            >
              Tone:
            </label>
            <select
              id="tone-select-followup"
              value={selectedTone}
              onChange={(e) => handleToneChange(e.target.value as GenerationTone)}
              className="h-10 px-2.5 text-xs bg-white border border-nordic-border rounded-[4px] text-nordic-text font-medium focus:outline-none focus:border-nordic-primary"
              title="Tone for Follow-up Email"
            >
              <option value="professional">Professional (Default)</option>
              <option value="conversational">Conversational</option>
              <option value="confident">Confident</option>
              <option value="humble">Humble</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateFollowup}
            disabled={generating}
            aria-busy={generating}
            className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer font-bold flex items-center gap-1.5"
          >
            {generating ? (
              "Writing..."
            ) : followupEmail ? (
              <>
                <span className="text-sm font-bold">↻</span>
                <span>Regenerate</span>
              </>
            ) : (
              <>
                <span>✉️</span>
                <span>Write Email</span>
              </>
            )}
          </button>
        </div>
      </div>

      {followupEmail ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-nordic-text-secondary px-1">
            <span className="font-semibold flex items-center gap-1.5 text-nordic-primary">
              <span>✏️</span> Editable Draft — adjust your follow-up email before copying
            </span>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(followupEmail, "Follow-up email", "followup")
              }
              className="nordic-btn-yellow text-xs h-8 px-3.5 cursor-pointer font-bold flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>{copiedKey === "followup" ? "✓ Copied!" : "Copy Email"}</span>
            </button>
          </div>
          <textarea
            value={followupEmail}
            onChange={(e) => setFollowupEmail(e.target.value)}
            rows={12}
            aria-label="Editable follow-up email"
            placeholder="Your follow-up email draft will appear here..."
            className="w-full p-4 sm:p-5 bg-white border border-nordic-border rounded-[4px] font-mono text-xs sm:text-sm text-nordic-text leading-relaxed focus:outline-none focus:border-nordic-primary focus:ring-1 focus:ring-nordic-primary transition-all resize-y shadow-inner"
          />
        </div>
      ) : (
        <EmptyState
          title="No Follow-Up Email Drafted"
          description="Draft a professional post-interview thank you or polite status check email."
          action={{
            label: "✉️ Write Email",
            onClick: handleGenerateFollowup,
            variant: "primary",
          }}
        />
      )}
    </div>
  );
}
