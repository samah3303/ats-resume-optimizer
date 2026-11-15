"use client";

import { use } from "react";
import { useJobDetail } from "@/hooks/useJobDetail";
import { JobDetailSkeleton } from "@/components/ui/Skeleton";
import Toast from "@/components/ui/Toast";
import JobHeader from "@/components/jobs/JobHeader";
import JobDescription from "@/components/jobs/JobDescription";
import MatchAnalysis from "@/components/jobs/MatchAnalysis";
import CoverLetterTab from "@/components/jobs/CoverLetterTab";
import ResumeUpdatesTab from "@/components/jobs/ResumeUpdatesTab";
import FollowUpTab from "@/components/jobs/FollowUpTab";
import LinkedInTab from "@/components/jobs/LinkedInTab";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const {
    job,
    loading,
    activeTab,
    setActiveTab,
    generating,
    selectedTone,
    copiedKey,
    coverLetter,
    setCoverLetter,
    resumeUpdates,
    setResumeUpdates,
    followupEmail,
    setFollowupEmail,
    followupContext,
    setFollowupContext,
    linkedinMessage,
    setLinkedinMessage,
    linkedinType,
    setLinkedinType,
    toastMessage,
    setToastMessage,
    isApplied,
    markingApplied,
    addedSkills,
    handleToneChange,
    handleMarkApplied,
    handleAddSkillToProfile,
    handleDownloadCoverLetterDoc,
    copyToClipboard,
    handleGenerateCoverLetter,
    handleGenerateResumeUpdates,
    handleCopyAllRecommendations,
    handleGenerateFollowup,
    handleGenerateLinkedin,
  } = useJobDetail(id);

  if (loading) {
    return <JobDetailSkeleton />;
  }

  if (!job) return null;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Breadcrumb & Job Header */}
      <JobHeader
        job={job}
        isApplied={isApplied}
        markingApplied={markingApplied}
        handleMarkApplied={handleMarkApplied}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Tab Panels */}
      <div className="nordic-card p-6 sm:p-8">
        {/* TAB 1: DETAILS */}
        {activeTab === "details" && (
          <div
            role="tabpanel"
            id="panel-details"
            aria-labelledby="tab-details"
            className="space-y-6"
          >
            <JobDescription job={job} />
            <MatchAnalysis
              job={job}
              onNavigateToResumeUpdates={() => setActiveTab("resume_updates")}
            />
          </div>
        )}

        {/* TAB 2: RESUME UPDATES & DETAILED DIFF SUGGESTIONS */}
        {activeTab === "resume_updates" && (
          <ResumeUpdatesTab
            resumeUpdates={resumeUpdates}
            setResumeUpdates={setResumeUpdates}
            selectedTone={selectedTone}
            handleToneChange={handleToneChange}
            generating={generating}
            copiedKey={copiedKey}
            copyToClipboard={copyToClipboard}
            handleGenerateResumeUpdates={handleGenerateResumeUpdates}
            handleCopyAllRecommendations={handleCopyAllRecommendations}
            handleAddSkillToProfile={handleAddSkillToProfile}
            addedSkills={addedSkills}
          />
        )}

        {/* TAB 3: COVER LETTER */}
        {activeTab === "cover_letter" && (
          <CoverLetterTab
            coverLetter={coverLetter}
            setCoverLetter={setCoverLetter}
            selectedTone={selectedTone}
            handleToneChange={handleToneChange}
            generating={generating}
            copiedKey={copiedKey}
            copyToClipboard={copyToClipboard}
            handleDownloadCoverLetterDoc={handleDownloadCoverLetterDoc}
            handleGenerateCoverLetter={handleGenerateCoverLetter}
          />
        )}

        {/* TAB 4: FOLLOW-UP EMAIL */}
        {activeTab === "followup" && (
          <FollowUpTab
            followupEmail={followupEmail}
            setFollowupEmail={setFollowupEmail}
            followupContext={followupContext}
            setFollowupContext={setFollowupContext}
            selectedTone={selectedTone}
            handleToneChange={handleToneChange}
            generating={generating}
            copiedKey={copiedKey}
            copyToClipboard={copyToClipboard}
            handleGenerateFollowup={handleGenerateFollowup}
          />
        )}

        {/* TAB 5: LINKEDIN OUTREACH */}
        {activeTab === "linkedin" && (
          <LinkedInTab
            linkedinMessage={linkedinMessage}
            setLinkedinMessage={setLinkedinMessage}
            linkedinType={linkedinType}
            setLinkedinType={setLinkedinType}
            selectedTone={selectedTone}
            handleToneChange={handleToneChange}
            generating={generating}
            copiedKey={copiedKey}
            copyToClipboard={copyToClipboard}
            handleGenerateLinkedin={handleGenerateLinkedin}
          />
        )}
      </div>

      {/* Accessible Toast Notification System */}
      <Toast
        message={toastMessage?.text || null}
        type={toastMessage?.type}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
