"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type WorkspaceMode = "candidate" | "recruiter";

interface WorkspaceModeContextType {
  mode: WorkspaceMode;
  setMode: (mode: WorkspaceMode) => void;
  toggleMode: () => void;
}

const WorkspaceModeContext = createContext<WorkspaceModeContextType | undefined>(undefined);

export function WorkspaceModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<WorkspaceMode>("candidate");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check localStorage
    const saved = localStorage.getItem("kyro_workspace_mode") as WorkspaceMode | null;
    if (saved === "candidate" || saved === "recruiter") {
      setModeState(saved);
    } else if (pathname.startsWith("/dashboard/recruiter")) {
      setModeState("recruiter");
    }
  }, [pathname]);

  const setMode = (newMode: WorkspaceMode) => {
    setModeState(newMode);
    localStorage.setItem("kyro_workspace_mode", newMode);
    if (newMode === "recruiter") {
      router.push("/dashboard/recruiter");
    } else {
      router.push("/dashboard");
    }
  };

  const toggleMode = () => {
    const nextMode = mode === "candidate" ? "recruiter" : "candidate";
    setMode(nextMode);
  };

  return (
    <WorkspaceModeContext.Provider value={{ mode, setMode, toggleMode }}>
      {children}
    </WorkspaceModeContext.Provider>
  );
}

export function useWorkspaceMode() {
  const context = useContext(WorkspaceModeContext);
  if (!context) {
    throw new Error("useWorkspaceMode must be used within a WorkspaceModeProvider");
  }
  return context;
}
