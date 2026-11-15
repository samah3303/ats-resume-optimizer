"use client";

import { GenerationTone } from "@/types";
import EmptyState from "@/components/ui/EmptyState";

interface CoverLetterTabProps {
  coverLetter: string;
  setCoverLetter: (val: string) => void;
  selectedTone: GenerationTone;
  handleToneChange: (tone: GenerationTone) => void;
  generating: boolean;
  copiedKey: string | null;
  copyToClipboard: (text: string, label: string, key?: string) => void;
  handleDownloadCoverLetterDoc: () => void;
  handleGenerateCoverLetter: () => void;
}

export default function CoverLetterTab({
  coverLetter,
  setCoverLetter,
  selectedTone,
  handleToneChange,
  generating,
  copiedKey,
  copyToClipboard,
  handleDownloadCoverLetterDoc,
  handleGenerateCoverLetter,
}: CoverLetterTabProps) {
  return (
    <div
      role="tabpanel"
      id="panel-cover_letter"
      aria-labelledby="tab-cover_letter"
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nordic-border pb-4">
        <div>
          <h2 className="text-lg font-bold text-nordic-text">
            Cover Letter
          </h2>
          <p className="text-xs text-nordic-text-secondary mt-0.5">
            A tailored cover letter written specifically for this job.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="tone-select-cover"
              className="text-xs font-semibold text-nordic-text-secondary shrink-0"
            >
              Tone:
            </label>
            <select
              id="tone-select-cover"
              value={selectedTone}
              onChange={(e) => handleToneChange(e.target.value as GenerationTone)}
              className="h-10 px-2.5 text-xs bg-white border border-nordic-border rounded-[4px] text-nordic-text font-medium focus:outline-none focus:border-nordic-primary"
              title="Tone for Cover Letter"
            >
              <option value="professional">Professional (Default)</option>
              <option value="conversational">Conversational</option>
              <option value="confident">Confident</option>
              <option value="humble">Humble</option>
            </select>
          </div>

          {coverLetter && (
            <>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(coverLetter, "Cover Letter", "cover_letter")
                }
                className="nordic-btn-yellow text-xs h-10 px-3.5 cursor-pointer font-bold tap-active flex items-center gap-1.5"
              >
                <span>📋</span>
                <span>
                  {copiedKey === "cover_letter" ? "✓ Copied!" : "Copy Letter"}
                </span>
              </button>
              <button
                type="button"
                onClick={handleDownloadCoverLetterDoc}
                className="nordic-btn-secondary text-xs h-10 px-3.5 cursor-pointer font-bold tap-active flex items-center gap-1.5"
                title="Download edited version as Word document"
              >
                📄 Download (.doc)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="nordic-btn-outline text-xs h-10 px-3.5 cursor-pointer font-bold tap-active hidden sm:flex items-center gap-1"
                title="Print or save as PDF"
              >
                🖨️ Print / PDF
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleGenerateCoverLetter}
            disabled={generating}
            aria-busy={generating}
            className="nordic-btn-primary text-xs h-10 px-4 disabled:opacity-50 cursor-pointer font-bold tap-active flex items-center gap-1.5"
          >
            {generating ? (
              "Writing..."
            ) : coverLetter ? (
              <>
                <span className="text-sm font-bold">↻</span>
                <span>Regenerate</span>
              </>
            ) : (
              <>
                <span>✨</span>
                <span>Write Letter</span>
              </>
            )}
          </button>
        </div>
      </div>

      {coverLetter ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-nordic-text-secondary px-1">
            <span className="font-semibold flex items-center gap-1.5 text-nordic-primary">
              <span>✏️</span> Editable Draft — tweak your letter below before copying or downloading
            </span>
            <span className="font-mono text-nordic-neutral">
              {coverLetter.length} chars · {coverLetter.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={16}
            aria-label="Editable cover letter text"
            placeholder="Your generated cover letter will appear here..."
            className="w-full p-4 sm:p-5 bg-white border border-nordic-border rounded-[4px] font-mono text-xs sm:text-sm text-nordic-text leading-relaxed focus:outline-none focus:border-nordic-primary focus:ring-1 focus:ring-nordic-primary transition-all resize-y shadow-inner"
          />
        </div>
      ) : (
        <EmptyState
          title="No Cover Letter Generated"
          description="Tailor a high-impact, ATS-optimized cover letter targeted to this specific position with 1 click."
          action={{
            label: "✨ Write Cover Letter",
            onClick: handleGenerateCoverLetter,
            variant: "yellow",
          }}
        />
      )}
    </div>
  );
}
