"use client";

import { useState } from "react";
import { InterviewSetupModal } from "./InterviewSetupModal";
import { VoiceInterviewRoom } from "./VoiceInterviewRoom";
import { InterviewPersonaType, PersonaMetadata } from "@/lib/ai/voice-interview";

interface MockInterviewCockpitProps {
  resumes?: { id: string; name: string }[];
}

export function MockInterviewCockpit({ resumes = [] }: MockInterviewCockpitProps) {
  const [sessionActive, setSessionActive] = useState(false);
  const [initialGreeting, setInitialGreeting] = useState("");
  const [interviewer, setInterviewer] = useState<PersonaMetadata | null>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [loading, setLoading] = useState(false);

  const handleStartSession = async (config: {
    persona: InterviewPersonaType;
    targetRole: string;
    companyTarget: string;
    resumeId?: string;
    difficulty: "junior" | "mid" | "senior" | "staff" | "executive";
  }) => {
    setLoading(true);
    setTargetRole(config.targetRole);
    try {
      const res = await fetch("/api/voice-interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error("Failed to start session");
      const json = await res.json();
      if (json.data) {
        setInitialGreeting(json.data.openingSpeech);
        setInterviewer(json.data.interviewerDetails);
        setSessionActive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = () => {
    setSessionActive(false);
    setInterviewer(null);
    setInitialGreeting("");
  };

  if (sessionActive && interviewer) {
    return (
      <VoiceInterviewRoom
        initialGreeting={initialGreeting}
        interviewer={interviewer}
        targetRole={targetRole}
        onExit={handleExit}
      />
    );
  }

  return (
    <InterviewSetupModal
      resumes={resumes}
      onStartSession={handleStartSession}
      isLoading={loading}
    />
  );
}
