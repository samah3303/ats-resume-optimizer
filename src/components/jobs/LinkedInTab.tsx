"use client";

import { GenerationTone } from "@/types";
import EmptyState from "@/components/ui/EmptyState";

interface LinkedInTabProps {
  linkedinMessage: string;
  setLinkedinMessage: (val: string) => void;
  linkedinType: string;
  setLinkedinType: (val: string) => void;
  selectedTone: GenerationTone;
  handleToneChange: (tone: GenerationTone) => void;
  generating: boolean;
  copiedKey: string | null;
  copyToClipboard: (text: string, label: string, key?: string) => void;
  handleGenerateLinkedin: () => void;
}

export default function LinkedInTab({
  linkedinMessage,
  setLinkedinMessage,
  linkedinType,
  setLinkedinType,
  selectedTone,
  handleToneChange,
  generating,
  copiedKey,
  copyToClipboard,
  handleGenerateLinkedin,
}: LinkedInTabProps) {
  return (
    <div
      role="tabpanel"
      id="panel-linkedin"
      aria-labelledby="tab-linkedin"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nordic-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-nordic-text">
            LinkedIn Message
          </h2>
          <p className="text-xs text-nordic-text-secondary mt-0.5">
            Reach out directly to recruiters or hiring managers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={linkedinType}
            aria-label="LinkedIn message type"
            onChange={(e) => setLinkedinType(e.target.value)}
            className="h-10 px-3 text-xs bg-white border border-nordic-border rounded-[4px] text-nordic-text focus:outline-none focus:border-nordic-primary"
          >
            <option value="connection_request">Connection Request Note</option>
            <option value="inmail_recruiter">Message to Recruiter</option>
            <option value="inmail_manager">Message to Hiring Manager</option>
          </select>

          <div className="flex items-center gap-1.5">
            <label
              htmlFor="tone-select-linkedin"
              className="text-xs font-semibold text-nordic-text-secondary shrink-0"
            >
              Tone:
            </label>
            <select
              id="tone-select-linkedin"
              value={selectedTone}
              onChange={(e) => handleToneChange(e.target.value as GenerationTone)}
              className="h-10 px-2.5 text-xs bg-white border border-nordic-border rounded-[4px] text-nordic-text font-medium focus:outline-none focus:border-nordic-primary"
              title="Tone for LinkedIn Message"
            >
              <option value="professional">Professional (Default)</option>
              <option value="conversational">Conversational</option>
              <option value="confident">Confident</option>
              <option value="humble">Humble</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerateLinkedin}
            disabled={generating}
            aria-busy={generating}
            className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer font-bold flex items-center gap-1.5"
          >
            {generating ? (
              "Writing..."
            ) : linkedinMessage ? (
              <>
                <span className="text-sm font-bold">↻</span>
                <span>Regenerate</span>
              </>
            ) : (
              <>
                <span>💼</span>
                <span>Write Message</span>
              </>
            )}
          </button>
        </div>
      </div>

      {linkedinMessage ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-nordic-text-secondary px-1">
            <span className="font-semibold flex items-center gap-1.5 text-nordic-primary">
              <span>✏️</span> Editable Draft — personalize this outreach message before copying
            </span>
            <button
              type="button"
              onClick={() =>
                copyToClipboard(linkedinMessage, "LinkedIn message", "linkedin")
              }
              className="nordic-btn-yellow text-xs h-8 px-3.5 cursor-pointer font-bold flex items-center gap-1.5"
            >
              <span>📋</span>
              <span>{copiedKey === "linkedin" ? "✓ Copied!" : "Copy Message"}</span>
            </button>
          </div>
          <textarea
            value={linkedinMessage}
            onChange={(e) => setLinkedinMessage(e.target.value)}
            rows={8}
            aria-label="Editable LinkedIn message"
            placeholder="Your LinkedIn outreach message will appear here..."
            className="w-full p-4 sm:p-5 bg-white border border-nordic-border rounded-[4px] font-mono text-xs sm:text-sm text-nordic-text leading-relaxed focus:outline-none focus:border-nordic-primary focus:ring-1 focus:ring-nordic-primary transition-all resize-y shadow-inner"
          />
        </div>
      ) : (
        <EmptyState
          title="No LinkedIn Message Drafted"
          description="Craft a high-converting, personalized LinkedIn message to recruiter or hiring team."
          action={{
            label: "💼 Write Message",
            onClick: handleGenerateLinkedin,
            variant: "primary",
          }}
        />
      )}
    </div>
  );
}
