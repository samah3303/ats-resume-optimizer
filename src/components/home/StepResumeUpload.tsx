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
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Upload Your Resume
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        We&apos;ll analyze your resume to identify strengths, gaps, and
        opportunities for your target roles.
      </p>

      <ResumeUploader
        onUploaded={onUploaded}
        onFormatDetected={onFormatDetected}
      />

      {/* PDF Disclaimer */}
      {resumeFormat === "pdf" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <span className="text-yellow-600 text-lg shrink-0">⚠️</span>
          <p className="text-sm text-yellow-800">
            <strong>PDF uploaded:</strong> Generated optimizations will use a
            standard structural layout. For custom designer-layout generation,
            please upload a{" "}
            <code className="bg-yellow-100 px-1 rounded">.doc</code> or{" "}
            <code className="bg-yellow-100 px-1 rounded">.docx</code> file.
          </p>
        </div>
      )}
    </div>
  );
}
