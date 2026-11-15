"use client";

import { useProfile } from "@/hooks/useProfile";
import { ProfileSectionSkeleton, Skeleton } from "@/components/ui/Skeleton";
import Toast from "@/components/ui/Toast";
import ResumeSection from "@/components/profile/ResumeSection";
import PersonalInfoSection from "@/components/profile/PersonalInfoSection";
import PreferencesSection from "@/components/profile/PreferencesSection";
import ApiTokenSection from "@/components/profile/ApiTokenSection";
import SkillsSection from "@/components/profile/SkillsSection";
import ExperienceSection from "@/components/profile/ExperienceSection";
import EducationSection from "@/components/profile/EducationSection";

export default function ProfilePage() {
  const {
    profile,
    loading,
    saving,
    uploadingResume,
    analyzingAts,
    message,
    setMessage,
    fieldErrors,
    fileInputRef,
    // Fields
    name,
    setName,
    email,
    phone,
    setPhone,
    location,
    setLocation,
    targetRoles,
    setTargetRoles,
    jobType,
    setJobType,
    linkedinUrl,
    setLinkedinUrl,
    portfolioUrl,
    setPortfolioUrl,
    githubUrl,
    setGithubUrl,
    summary,
    setSummary,
    skills,
    newSkill,
    setNewSkill,
    addSkill,
    removeSkill,
    experience,
    addExperience,
    updateExperience,
    removeExperience,
    education,
    addEducation,
    updateEducation,
    removeEducation,
    // Preferences
    prefPlatforms,
    togglePlatform,
    prefLocations,
    newPrefLocation,
    setNewPrefLocation,
    addPrefLocation,
    removePrefLocation,
    prefWorkModes,
    toggleWorkMode,
    prefMinSalary,
    setPrefMinSalary,
    prefExpLevel,
    setPrefExpLevel,
    // Handlers
    handleFieldBlur,
    handleFieldChange,
    handleSave,
    handleUploadResume,
    handleReanalyzeAts,
  } = useProfile();

  if (loading) {
    return (
      <div
        className="space-y-4 sm:space-y-6"
        aria-busy="true"
        aria-label="Loading candidate profile"
      >
        {/* Banner Skeleton */}
        <div className="nordic-card rounded-2xl sm:rounded-[4px] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28 rounded-[2px]" />
              <Skeleton className="h-7 w-48 rounded-[3px]" />
              <Skeleton className="h-4 w-64 rounded-[2px]" />
            </div>
          </div>
          <Skeleton className="h-11 w-36 rounded-[4px]" />
        </div>

        {/* Section Cards Skeleton */}
        <ProfileSectionSkeleton />
        <ProfileSectionSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 font-sans">
      {/* Resume Banner & ATS Status */}
      <ResumeSection
        name={name}
        email={email}
        targetRoles={targetRoles}
        atsScore={profile?.atsScore}
        resumeFileName={profile?.resumeFileName}
        uploadingResume={uploadingResume}
        analyzingAts={analyzingAts}
        fileInputRef={fileInputRef}
        handleUploadResume={handleUploadResume}
        handleReanalyzeAts={handleReanalyzeAts}
      />

      {/* Main Form Card */}
      <div className="nordic-card rounded-2xl sm:rounded-[4px] p-4.5 sm:p-8">
        <form onSubmit={handleSave} className="space-y-6" noValidate>
          {/* Identity, Target Roles, Links, and Summary */}
          <PersonalInfoSection
            name={name}
            setName={setName}
            email={email}
            phone={phone}
            setPhone={setPhone}
            location={location}
            setLocation={setLocation}
            targetRoles={targetRoles}
            setTargetRoles={setTargetRoles}
            jobType={jobType}
            setJobType={setJobType}
            linkedinUrl={linkedinUrl}
            setLinkedinUrl={setLinkedinUrl}
            githubUrl={githubUrl}
            setGithubUrl={setGithubUrl}
            portfolioUrl={portfolioUrl}
            setPortfolioUrl={setPortfolioUrl}
            summary={summary}
            setSummary={setSummary}
            fieldErrors={fieldErrors}
            handleFieldChange={handleFieldChange}
            handleFieldBlur={handleFieldBlur}
          />

          {/* Job Search Preferences */}
          <PreferencesSection
            prefPlatforms={prefPlatforms}
            togglePlatform={togglePlatform}
            prefLocations={prefLocations}
            newPrefLocation={newPrefLocation}
            setNewPrefLocation={setNewPrefLocation}
            addPrefLocation={addPrefLocation}
            removePrefLocation={removePrefLocation}
            prefWorkModes={prefWorkModes}
            toggleWorkMode={toggleWorkMode}
            prefMinSalary={prefMinSalary}
            setPrefMinSalary={setPrefMinSalary}
            prefExpLevel={prefExpLevel}
            setPrefExpLevel={setPrefExpLevel}
          />

          {/* 1-Click Job Clipper Extension & API Token */}
          <ApiTokenSection />

          {/* Skills Management */}
          <SkillsSection
            skills={skills}
            newSkill={newSkill}
            setNewSkill={setNewSkill}
            addSkill={addSkill}
            removeSkill={removeSkill}
          />

          {/* Work Experience */}
          <ExperienceSection
            experience={experience}
            addExperience={addExperience}
            updateExperience={updateExperience}
            removeExperience={removeExperience}
          />

          {/* Education & Credentials */}
          <EducationSection
            education={education}
            addEducation={addEducation}
            updateEducation={updateEducation}
            removeEducation={removeEducation}
          />

          {/* Desktop Save Button */}
          <div className="hidden md:flex justify-end pt-4 border-t border-nordic-border">
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className="nordic-btn-primary h-11 px-8 text-sm font-bold tracking-wide disabled:opacity-50 cursor-pointer tap-active"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Mobile Sticky Save Bar */}
          <div className="md:hidden fixed bottom-15 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-nordic-border z-40 shadow-lg">
            <button
              type="submit"
              disabled={saving}
              aria-busy={saving}
              className="nordic-btn-primary w-full h-12 text-xs font-bold uppercase tracking-wider disabled:opacity-50 shadow-md tap-active cursor-pointer"
            >
              {saving ? "Saving Changes..." : "✓ Save Profile & Preferences"}
            </button>
          </div>
        </form>
      </div>

      {/* Accessible Toast Notification System */}
      <Toast
        message={message?.text || null}
        type={message?.type}
        onClose={() => setMessage(null)}
      />
    </div>
  );
}
