"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import UnauthenticatedHero from "@/components/home/UnauthenticatedHero";
import OnboardingStepper from "@/components/home/OnboardingStepper";
import StepResumeUpload from "@/components/home/StepResumeUpload";
import StepTargetPreferences from "@/components/home/StepTargetPreferences";
import StepAnalyzingProgress from "@/components/home/StepAnalyzingProgress";
import { COUNTRIES, INDUSTRIES } from "@/components/home/constants";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string | null>(null);
  const [resumeFormat, setResumeFormat] = useState<"pdf" | "doc" | "docx" | null>(null);
  const [positions, setPositions] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [jobType, setJobType] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);
  const [suggestedPositions, setSuggestedPositions] = useState<string[]>([]);

  // Check onboarding status when authenticated
  const checkOnboarding = useCallback(async () => {
    setCheckingOnboarding(true);
    try {
      const res = await fetch("/api/onboarding");
      if (res.ok) {
        const data = await res.json();
        setOnboardingDone(data.completed);
        if (data.completed) {
          router.replace("/dashboard");
        }
      }
    } catch {
      setOnboardingDone(false);
    } finally {
      setCheckingOnboarding(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === "authenticated") {
      checkOnboarding();
    }
  }, [status, checkOnboarding]);

  const togglePosition = (pos: string) => {
    const current = positions
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (current.includes(pos)) {
      setPositions(current.filter((p) => p !== pos).join(", "));
    } else {
      setPositions([...current, pos].join(", "));
    }
  };

  const handleResumeUploaded = useCallback(
    (resume: { id: string; name: string }) => {
      setResumeId(resume.id);
      setResumeName(resume.name);
      setError(null);
      localStorage.setItem("onboarding_resumeId", resume.id);
      localStorage.setItem("onboarding_resumeName", resume.name);
      setAutoFilling(true);
      fetch("/api/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resume.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.suggestedPositions?.length > 0) {
            setSuggestedPositions(data.suggestedPositions);
            setPositions(data.suggestedPositions.join(", "));
          }
          if (data.suggestedIndustry) {
            const match =
              INDUSTRIES.find(
                (i) =>
                  i.toLowerCase().includes(data.suggestedIndustry.toLowerCase()) ||
                  data.suggestedIndustry.toLowerCase().includes(i.toLowerCase())
              ) || data.suggestedIndustry;
            setIndustry(match);
          }
          if (data.suggestedCountry) {
            const match =
              COUNTRIES.find(
                (c) => c.toLowerCase() === data.suggestedCountry.toLowerCase()
              ) ||
              COUNTRIES.find((c) =>
                data.suggestedCountry.toLowerCase().includes(c.toLowerCase())
              );
            if (match) setCountry(match);
          }
          if (data.linkedinUrl) {
            setLinkedin(data.linkedinUrl);
          }
          if (data.githubUrl) {
            setGithubUrl(data.githubUrl);
          }
          if (data.portfolioUrl) {
            setPortfolioUrl(data.portfolioUrl);
          }
          if (data.suggestedJobTypes?.length > 0) {
            setJobType(data.suggestedJobTypes.join(", "));
          }
          localStorage.setItem("onboarding_step", "2");
        })
        .catch(() => {})
        .finally(() => setAutoFilling(false));

      setTimeout(() => setStep(2), 600);
    },
    []
  );

  const handleFormatDetected = useCallback((format: "pdf" | "doc" | "docx") => {
    setResumeFormat(format);
  }, []);

  const handleSubmit = async () => {
    if (!resumeId || !positions.trim() || !country) {
      setError("Please complete all required fields.");
      return;
    }
    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          targetPositions: positions
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean),
          targetCountry: country,
          linkedinUrl: linkedin.trim() || undefined,
          portfolioUrl: portfolioUrl.trim() || undefined,
          githubUrl: githubUrl.trim() || undefined,
          industry: industry || undefined,
          jobType: jobType || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      localStorage.removeItem("onboarding_resumeId");
      localStorage.removeItem("onboarding_resumeName");
      localStorage.removeItem("onboarding_step");
      router.push("/dashboard#roadmap");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setAnalyzing(false);
    }
  };

  if (status === "loading" || checkingOnboarding) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] bg-white">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <UnauthenticatedHero />;
  }

  if (onboardingDone) return null;

  return (
    <div className="min-h-[85vh] bg-white py-8 md:py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <OnboardingStepper step={step} />

        <div className="bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-sm">
          {step === 1 && (
            <StepResumeUpload
              resumeFormat={resumeFormat}
              onUploaded={handleResumeUploaded}
              onFormatDetected={handleFormatDetected}
            />
          )}

          {step === 2 && (
            <StepTargetPreferences
              autoFilling={autoFilling}
              resumeName={resumeName}
              positions={positions}
              setPositions={setPositions}
              suggestedPositions={suggestedPositions}
              togglePosition={togglePosition}
              industry={industry}
              setIndustry={setIndustry}
              country={country}
              setCountry={setCountry}
              jobType={jobType}
              setJobType={setJobType}
              linkedin={linkedin}
              setLinkedin={setLinkedin}
              portfolioUrl={portfolioUrl}
              setPortfolioUrl={setPortfolioUrl}
              githubUrl={githubUrl}
              setGithubUrl={setGithubUrl}
              onBack={() => setStep(1)}
              onSkip={() => router.push("/dashboard")}
              onNext={() => setStep(3)}
              onChangeResume={() => {
                setResumeId(null);
                setResumeName(null);
                setResumeFormat(null);
                setStep(1);
              }}
            />
          )}

          {step === 3 && (
            <StepAnalyzingProgress
              analyzing={analyzing}
              resumeName={resumeName}
              positions={positions}
              country={country}
              linkedin={linkedin}
              error={error}
              onBack={() => setStep(2)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
