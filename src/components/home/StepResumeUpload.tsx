import ResumeUploader from "@/components/ResumeUploader";

interface StepResumeUploadProps {
  resumeFormat: "pdf" | "doc" | "docx" | null;
  onUploaded: (resume: { id: string; name: string }) => void;
  onFormatDetected: (format: "pdf" | "doc" | "docx") => void;
}

export default function StepResumeUpload({
  resumeFormat,
  onUploaded,
  onFormatDetected,
}: StepResumeUploadProps) {
  return (
    <div>
      <h2 className="text-xl font-black text-black mb-2">
        Upload Your Resume
      </h2>
      <p className="text-sm text-zinc-600 mb-6">
        We&apos;ll analyze your resume to identify strengths, gaps, and
        opportunities for your target roles.
      </p>

      <ResumeUploader
        onUploaded={onUploaded}
        onFormatDetected={onFormatDetected}
      />

      {/* PDF Disclaimer */}
      {resumeFormat === "pdf" && (
        <div className="mt-4 p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl flex items-start gap-3">
          <span className="text-zinc-900 text-lg shrink-0">ℹ️</span>
          <p className="text-xs text-zinc-700 leading-relaxed">
            <strong className="text-black">PDF uploaded:</strong> Generated optimizations will use a
            standard structural layout. For custom designer-layout generation,
            please upload a{" "}
            <code className="bg-zinc-200 px-1 py-0.5 rounded text-black font-mono text-[11px]">.doc</code> or{" "}
            <code className="bg-zinc-200 px-1 py-0.5 rounded text-black font-mono text-[11px]">.docx</code> file.
          </p>
        </div>
      )}
    </div>
  );
}
