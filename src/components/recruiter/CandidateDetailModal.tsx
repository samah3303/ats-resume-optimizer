"use client";

import { useState } from "react";
import { CandidateApplicationData, PIPELINE_STAGES } from "./types";
import { useToast } from "@/components/Toast";

interface CandidateDetailModalProps {
  open: boolean;
  onClose: () => void;
  candidate: CandidateApplicationData | null;
  jobId: string;
  onStageChange: (candidateId: string, newStage: string) => Promise<void>;
  onCandidateUpdated: () => void;
}

export default function CandidateDetailModal({
  open,
  onClose,
  candidate,
  jobId,
  onStageChange,
  onCandidateUpdated,
}: CandidateDetailModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"fit" | "resume" | "scorecard" | "notes">("fit");
  const [movingStage, setMovingStage] = useState(false);
  const [copiedResume, setCopiedResume] = useState(false);

  // Scorecard state
  const [submittingScorecard, setSubmittingScorecard] = useState(false);
  const [overallScore, setOverallScore] = useState(85);
  const [technical, setTechnical] = useState(4);
  const [problemSolving, setProblemSolving] = useState(4);
  const [communication, setCommunication] = useState(4);
  const [culturalFit, setCulturalFit] = useState(4);
  const [recommendation, setRecommendation] = useState<string>("hire");
  const [feedback, setFeedback] = useState("");

  // Notes state
  const [notes, setNotes] = useState(candidate?.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  // Re-screen candidate
  const [rescreening, setRescreening] = useState(false);

  if (!open || !candidate) return null;

  const handleStageSelect = async (newStage: string) => {
    if (newStage === candidate.stage) return;
    setMovingStage(true);
    try {
      await onStageChange(candidate.id, newStage);
      toast(`Candidate advanced to ${PIPELINE_STAGES.find((s) => s.key === newStage)?.label}`, "info");
    } catch {
      toast("Failed to update candidate stage", "error");
    } finally {
      setMovingStage(false);
    }
  };

  const handleCopyResume = async () => {
    await navigator.clipboard.writeText(candidate.resumeText);
    setCopiedResume(true);
    toast("Resume text copied to clipboard!", "success");
    setTimeout(() => setCopiedResume(false), 2000);
  };

  const handleRescreen = async () => {
    setRescreening(true);
    try {
      const res = await fetch(`/api/recruiter/pipeline/${jobId}/screen`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId: candidate.id }),
      });

      if (!res.ok) throw new Error("Screening failed");

      toast("Candidate re-screened with AI successfully!", "success");
      onCandidateUpdated();
    } catch (err: any) {
      toast(err.message || "Failed to re-screen candidate", "error");
    } finally {
      setRescreening(false);
    }
  };

  const handleSaveScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingScorecard(true);
    try {
      const res = await fetch(`/api/recruiter/pipeline/${jobId}/scorecard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: candidate.id,
          stage: candidate.stage,
          overallScore,
          criteria: {
            technical,
            problemSolving,
            communication,
            culturalFit,
          },
          feedback,
          recommendation,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit scorecard");

      toast("Scorecard submitted successfully!", "success");
      setFeedback("");
      onCandidateUpdated();
    } catch (err: any) {
      toast(err.message || "Failed to save scorecard", "error");
    } finally {
      setSubmittingScorecard(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/recruiter/pipeline/${jobId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: candidate.id,
          stage: candidate.stage,
          notes,
        }),
      });

      if (!res.ok) throw new Error("Failed to save notes");
      toast("Recruiter notes saved", "success");
      onCandidateUpdated();
    } catch (err: any) {
      toast(err.message || "Failed to save notes", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return "text-zinc-500 border-zinc-200 bg-zinc-50";
    if (score >= 85) return "text-black border-black bg-black text-white";
    if (score >= 70) return "text-zinc-900 border-zinc-300 bg-zinc-100";
    return "text-zinc-600 border-zinc-200 bg-zinc-50";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-detail-modal-title"
    >
      <div className="bg-white border border-zinc-200 rounded-3xl max-w-3xl w-full text-zinc-900 shadow-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-6 border-b border-zinc-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black text-white border border-black flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
              {candidate.candidateName
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="candidate-detail-modal-title" className="text-lg sm:text-xl font-black text-black">
                  {candidate.candidateName}
                </h2>
                {candidate.fitScore !== null && (
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${getScoreColor(
                      candidate.fitScore
                    )}`}
                  >
                    {candidate.fitScore}% Match
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {candidate.candidateEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stage Selector */}
            <div className="space-y-0.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                Current Stage
              </label>
              <select
                value={candidate.stage}
                disabled={movingStage}
                onChange={(e) => handleStageSelect(e.target.value)}
                className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 text-black font-bold text-xs rounded-xl outline-none cursor-pointer focus:border-black"
              >
                {PIPELINE_STAGES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-colors"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-100 bg-zinc-50 px-6">
          <button
            onClick={() => setActiveTab("fit")}
            className={`py-3 px-4 text-xs font-black transition-all border-b-2 ${
              activeTab === "fit"
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-black"
            }`}
          >
            ⚡ AI Fit & Skills
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`py-3 px-4 text-xs font-black transition-all border-b-2 ${
              activeTab === "resume"
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-black"
            }`}
          >
            📄 Resume View
          </button>
          <button
            onClick={() => setActiveTab("scorecard")}
            className={`py-3 px-4 text-xs font-black transition-all border-b-2 ${
              activeTab === "scorecard"
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-black"
            }`}
          >
            🎯 Interview Scorecards ({candidate.scorecards?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`py-3 px-4 text-xs font-black transition-all border-b-2 ${
              activeTab === "notes"
                ? "border-black text-black"
                : "border-transparent text-zinc-500 hover:text-black"
            }`}
          >
            📝 Notes
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          {/* Tab 1: AI Fit & Skills */}
          {activeTab === "fit" && (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-700">
                    Executive Recruiter Summary
                  </span>
                  <button
                    onClick={handleRescreen}
                    disabled={rescreening}
                    className="text-[10px] font-bold text-black hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <span>⚡ Re-screen with AI</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-medium">
                  {candidate.fitSummary ||
                    "No AI evaluation has been generated yet. Click 'Re-screen with AI' to trigger automated qualification assessment."}
                </p>
              </div>

              {/* Matched & Missing Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Matched Skills */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-black font-bold">✓</span>
                    <span className="text-xs font-bold text-black">
                      Matched Skills & Keywords ({candidate.matchedSkills?.length || 0})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.matchedSkills && candidate.matchedSkills.length > 0 ? (
                      candidate.matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-white border border-zinc-300 text-zinc-900 text-[11px] font-bold rounded-lg shadow-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-500 italic">No skills matched</p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 font-bold">⚠️</span>
                    <span className="text-xs font-bold text-black">
                      Missing / Gaps Identified ({candidate.missingSkills?.length || 0})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {candidate.missingSkills && candidate.missingSkills.length > 0 ? (
                      candidate.missingSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 bg-zinc-100 border border-zinc-300 text-zinc-700 text-[11px] font-bold rounded-lg"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-xs text-zinc-600 italic">No missing skills detected</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Resume View */}
          {activeTab === "resume" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-mono">
                  Parsed Plaintext ({candidate.resumeText.split(/\s+/).filter(Boolean).length} words)
                </span>
                <button
                  onClick={handleCopyResume}
                  className="px-3 py-1.5 bg-white border border-zinc-300 hover:border-black text-black rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>{copiedResume ? "✓ Copied" : "📋 Copy Plain Text"}</span>
                </button>
              </div>

              <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl max-h-96 overflow-y-auto">
                <pre className="text-xs text-zinc-800 font-mono whitespace-pre-wrap leading-relaxed font-normal">
                  {candidate.resumeText}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 3: Scorecards */}
          {activeTab === "scorecard" && (
            <div className="space-y-6">
              {/* Existing Scorecards */}
              {candidate.scorecards && candidate.scorecards.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-black block">
                    Previous Evaluation Scorecards ({candidate.scorecards.length})
                  </span>
                  <div className="space-y-2.5">
                    {candidate.scorecards.map((sc) => (
                      <div
                        key={sc.id}
                        className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-black">
                              {sc.reviewerName}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-mono">
                              • {new Date(sc.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black text-white border border-black shadow-sm">
                            {sc.recommendation.replace("_", " ")} ({sc.overallScore}/100)
                          </span>
                        </div>
                        <p className="text-xs text-zinc-700 leading-relaxed font-normal">
                          {sc.feedback}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit New Scorecard Form */}
              <form onSubmit={handleSaveScorecard} className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <h3 className="text-xs font-black text-black uppercase tracking-wider">
                    Add Interview Scorecard
                  </h3>
                  <span className="text-[10px] text-zinc-500">
                    Evaluating {candidate.candidateName}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 block">Technical ({technical}/5)</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={technical}
                      onChange={(e) => setTechnical(parseInt(e.target.value, 10))}
                      className="w-full accent-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 block">Problem Solving ({problemSolving}/5)</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={problemSolving}
                      onChange={(e) => setProblemSolving(parseInt(e.target.value, 10))}
                      className="w-full accent-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 block">Communication ({communication}/5)</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={communication}
                      onChange={(e) => setCommunication(parseInt(e.target.value, 10))}
                      className="w-full accent-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 block">Culture Fit ({culturalFit}/5)</label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={culturalFit}
                      onChange={(e) => setCulturalFit(parseInt(e.target.value, 10))}
                      className="w-full accent-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 block">Overall Score (1-100)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={overallScore}
                      onChange={(e) => setOverallScore(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 focus:border-black rounded-xl text-xs text-black outline-none shadow-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-600 block">Recommendation</label>
                    <select
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-zinc-300 focus:border-black rounded-xl text-xs text-black outline-none shadow-sm cursor-pointer"
                    >
                      <option value="strong_hire">⭐ Strong Hire</option>
                      <option value="hire">✅ Hire</option>
                      <option value="hold">⏳ Hold</option>
                      <option value="reject">❌ Reject</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-600 block">Interview Feedback & Notes</label>
                  <textarea
                    rows={3}
                    required
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Candidate demonstrated deep knowledge of Next.js architecture and distributed systems..."
                    className="w-full px-3 py-2 bg-white border border-zinc-300 focus:border-black rounded-xl text-xs text-black placeholder-zinc-400 outline-none shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingScorecard}
                  className="w-full py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl transition-all shadow-sm border border-black disabled:opacity-50"
                >
                  {submittingScorecard ? "Saving Scorecard..." : "Submit Scorecard"}
                </button>
              </form>
            </div>
          )}

          {/* Tab 4: Recruiter Notes */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block">
                  Private Recruiter & Interviewer Notes
                </label>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record interview notes, compensation expectations, notice period, team feedback..."
                  className="w-full px-4 py-3 bg-white border border-zinc-300 focus:border-black rounded-2xl text-xs text-black placeholder-zinc-400 outline-none leading-relaxed shadow-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="px-5 py-2 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-black transition-all disabled:opacity-50 shadow-sm"
                >
                  {savingNotes ? "Saving Notes..." : "Save Notes"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Action Stage Buttons */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] font-bold text-zinc-600">
            Quick Stage Transition:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PIPELINE_STAGES.map((s) => (
              <button
                key={s.key}
                disabled={movingStage || candidate.stage === s.key}
                onClick={() => handleStageSelect(s.key)}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                  candidate.stage === s.key
                    ? "bg-black border-black text-white shadow-sm"
                    : "bg-white border-zinc-300 text-zinc-700 hover:text-black hover:border-black shadow-sm"
                }`}
              >
                {s.emoji} {s.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
