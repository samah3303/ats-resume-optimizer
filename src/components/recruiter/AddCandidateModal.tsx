"use client";

import { useState } from "react";
import { PIPELINE_STAGES } from "./types";
import { useToast } from "@/components/Toast";

interface AddCandidateModalProps {
  open: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  onCandidateAdded: () => void;
}

export default function AddCandidateModal({
  open,
  onClose,
  jobId,
  jobTitle,
  onCandidateAdded,
}: AddCandidateModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState("applied");
  const [resumeText, setResumeText] = useState("");
  const [notes, setNotes] = useState("");

  if (!open) return null;

  const handleFillSampleResume = () => {
    setName("Jordan Patel");
    setEmail("jordan.patel@example.com");
    setResumeText(
      `Jordan Patel\nEmail: jordan.patel@example.com | San Francisco, CA\n\nPROFESSIONAL SUMMARY\nFull-Stack Software Engineer with 5+ years building distributed React, Next.js, and TypeScript applications with Node.js and PostgreSQL.\n\nEXPERIENCE\nSenior Software Engineer @ CloudTech (2022 - Present)\n- Architected high-performance Next.js 14 web portals serving 250k daily active users.\n- Optimized PostgreSQL query execution by 40% with database indexing and pgvector semantic search.\n- Led team of 4 engineers building generative AI chatbot tooling with OpenAI API.\n\nSoftware Engineer @ DataStack (2019 - 2022)\n- Developed RESTful & GraphQL microservices in Node.js/TypeScript.\n- Engineered automated CI/CD deployment pipelines on AWS.\n\nTECHNICAL SKILLS\nLanguages: TypeScript, JavaScript, Python, SQL\nFrameworks: Next.js, React, Node.js, Tailwind CSS, Prisma\nDatabases & Cloud: PostgreSQL, pgvector, Docker, AWS`
    );
    toast("Loaded sample candidate profile", "info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast("Candidate name and email are required", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/recruiter/pipeline/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: name,
          candidateEmail: email,
          stage,
          resumeText,
          notes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add candidate");
      }

      toast("Candidate added to pipeline successfully!", "success");
      onCandidateAdded();
      onClose();
    } catch (err: any) {
      toast(err.message || "Failed to add candidate", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-candidate-modal-title"
    >
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-zinc-900 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 text-black text-lg flex items-center justify-center font-bold">
              👤
            </span>
            <div>
              <h2
                id="add-candidate-modal-title"
                className="text-base sm:text-lg font-black text-black"
              >
                Add Candidate to Pipeline
              </h2>
              <p className="text-xs text-zinc-500">
                Target Role: <span className="text-black font-bold">{jobTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleFillSampleResume}
              className="text-[11px] font-bold text-black hover:underline flex items-center gap-1"
            >
              <span>✨ Autofill Sample Candidate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-900 block">
                Candidate Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Patel"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl text-xs sm:text-sm text-black placeholder-zinc-400 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-900 block">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan.patel@example.com"
                className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl text-xs sm:text-sm text-black placeholder-zinc-400 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-900 block">
              Initial Pipeline Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl text-xs sm:text-sm text-black outline-none transition-colors cursor-pointer"
            >
              {PIPELINE_STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.emoji} {s.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-900 block">
              Candidate Resume Plain Text
            </label>
            <textarea
              rows={5}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste candidate resume plain text for automated ATS scoring & keyword analysis..."
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl text-xs text-black placeholder-zinc-400 outline-none transition-colors leading-relaxed font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-900 block">
              Recruiter Initial Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Source, referral context, salary expectations..."
              className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-black rounded-xl text-xs text-black placeholder-zinc-400 outline-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:text-black hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-black hover:bg-zinc-800 text-white transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? "Adding..." : "+ Add Candidate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
