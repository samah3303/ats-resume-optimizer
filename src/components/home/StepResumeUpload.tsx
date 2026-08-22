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
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-[#FAFAFA] tracking-tight">
          Upload Your Resume
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          We&apos;ll analyze your resume to identify strengths, ATS keyword coverage, and opportunities for your target roles.
        </p>
      </div>

      <ResumeUploader
        onUploaded={onUploaded}
        onFormatDetected={onFormatDetected}
      />

      {/* PDF Disclaimer */}
      {resumeFormat === "pdf" && (
        <div className="p-4 bg-[#09090B] border border-[#27272A] rounded-2xl flex items-start gap-3 text-xs text-zinc-300">
          <span className="text-lg shrink-0 pt-0.5">ℹ️</span>
          <p className="leading-relaxed">
            <strong className="text-[#FAFAFA]">PDF uploaded:</strong> Generated optimizations will use a
            standard structural layout. For custom designer-layout generation,
            you may also upload a{" "}
            <code className="bg-[#18181B] border border-[#27272A] px-1.5 py-0.5 rounded text-[#FAFAFA] font-mono text-[11px]">.doc</code> or{" "}
            <code className="bg-[#18181B] border border-[#27272A] px-1.5 py-0.5 rounded text-[#FAFAFA] font-mono text-[11px]">.docx</code> file.
          </p>
        </div>
      )}
    </div>
  );
}
