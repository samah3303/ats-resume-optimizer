"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { ResumeData, INITIAL_RESUME_DATA } from "@/types/builder";
import { getTemplateById } from "@/lib/templates/definitions";
import { parseRawTextToResumeData } from "@/lib/templates/parser";
import SectionEditor from "@/components/builder/SectionEditor";
import LiveA4Preview from "@/components/builder/LiveA4Preview";
import TemplateGallery from "@/components/builder/TemplateGallery";
import AiResumeWriterPanel from "@/components/builder/AiResumeWriterPanel";
import { useToast } from "@/components/Toast";

interface ParsedResumeOption {
  id: string;
  name: string;
  parsedText: string;
}

export default function ResumeStudioPage() {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  // Core Document State
  const [draftId, setDraftId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState("Alex Rivera - ATS Resume");
  const [selectedTemplateId, setSelectedTemplateId] = useState("classic-corporate");
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);

  // Status & Loaders
  const [loading, setLoading] = useState(true);
  const [autosaveStatus, setAutosaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string>("Saved just now");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

  // Modals & Panels
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [aiAction, setAiAction] = useState<
    "generate_summary" | "star_rewrite" | "suggest_skills" | "preflight_check"
  >("generate_summary");
  const [aiInitialContent, setAiInitialContent] = useState("");
  const [aiInitialContext, setAiInitialContext] = useState<any>({});

  // Mobile layout state
  const [mobileTab, setMobileTab] = useState<"editor" | "preview" | "ai">("editor");

  // Existing resumes for pre-populating
  const [existingResumes, setExistingResumes] = useState<ParsedResumeOption[]>([]);
  const [selectedExistingId, setSelectedExistingId] = useState("");

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // 1. Initial Load: Fetch Drafts & Existing Resumes
  const initializeStudio = useCallback(async () => {
    try {
      // Fetch latest draft
      const draftRes = await fetch("/api/builder/drafts");
      if (draftRes.ok) {
        const draftJson = await draftRes.json();
        if (draftJson.latestDraft) {
          const d = draftJson.latestDraft;
          setDraftId(d.id);
          setDocumentTitle(d.title || "Untitled ATS Resume");
          setSelectedTemplateId(d.templateId || "classic-corporate");
          try {
            const parsed = typeof d.dataJson === "string" ? JSON.parse(d.dataJson) : d.dataJson;
            if (parsed && parsed.personalInfo) {
              setResumeData(parsed);
            }
          } catch (e) {
            console.error("Draft json parse error:", e);
          }
        }
      }

      // Fetch parsed uploaded resumes for quick load
      const resRes = await fetch("/api/resumes");
      if (resRes.ok) {
        const data = await resRes.json();
        setExistingResumes(data.resumes || []);
      }
    } catch (err) {
      console.error("Initialize error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      initializeStudio();
    }
  }, [status, router, initializeStudio]);

  // 2. Debounced Autosave to Backend
  const saveDraft = useCallback(
    async (dataToSave: ResumeData, titleToSave: string, templateToSave: string) => {
      setAutosaveStatus("saving");
      try {
        const res = await fetch("/api/builder/drafts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: draftId,
            title: titleToSave,
            templateId: templateToSave,
            dataJson: JSON.stringify(dataToSave),
          }),
        });

        if (res.ok) {
          const resJson = await res.json();
          if (resJson.draft?.id && !draftId) {
            setDraftId(resJson.draft.id);
          }
          setAutosaveStatus("saved");
          const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastSavedAt(`Saved at ${timeStr}`);
        } else {
          setAutosaveStatus("unsaved");
        }
      } catch {
        setAutosaveStatus("unsaved");
      }
    },
    [draftId]
  );

  // Trigger autosave on change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setAutosaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      saveDraft(resumeData, documentTitle, selectedTemplateId);
    }, 1500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [resumeData, documentTitle, selectedTemplateId, saveDraft]);

  // 3. Quick Load from Parsed Resume
  const handleLoadParsedResume = (resumeId: string) => {
    setSelectedExistingId(resumeId);
    if (!resumeId) return;

    const found = existingResumes.find((r) => r.id === resumeId);
    if (found && found.parsedText) {
      const parsedData = parseRawTextToResumeData(found.parsedText, found.name);
      setResumeData(parsedData);
      setDocumentTitle(`${found.name.replace(/\.[^/.]+$/, "")} - ATS Studio`);
      toast(`Loaded and parsed "${found.name}" into Studio!`, "success");
    }
  };

  // 4. Load Sample Preset
  const handleLoadSamplePreset = () => {
    setResumeData(INITIAL_RESUME_DATA);
    setDocumentTitle("Alex Rivera - Senior Full-Stack Engineer");
    toast("Loaded Senior Software Engineer template sample!", "info");
  };

  // 5. AI Assistant Launch Handler
  const handleOpenAiAssist = (action: string, content: string = "", context: any = {}) => {
    setAiAction(action as any);
    setAiInitialContent(content);
    setAiInitialContext(context);
    setIsAiPanelOpen(true);
    if (window.innerWidth < 768) {
      setMobileTab("ai");
    }
  };

  // 6. AI Apply Callback
  const handleAiApply = (type: string, data: any, context?: any) => {
    if (type === "summary") {
      setResumeData((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          summary: data,
        },
      }));
      toast("Applied executive summary to resume!", "success");
    } else if (type === "bullet") {
      const expIdx = context?.expIndex ?? 0;
      const bulletIdx = context?.bulletIndex ?? 0;

      setResumeData((prev) => {
        const updatedExp = [...prev.experience];
        if (updatedExp[expIdx]) {
          const newBullets = [...updatedExp[expIdx].bullets];
          newBullets[bulletIdx] = data;
          updatedExp[expIdx] = { ...updatedExp[expIdx], bullets: newBullets };
        }
        return { ...prev, experience: updatedExp };
      });
      toast("Applied STAR bullet to work experience!", "success");
    } else if (type === "skills") {
      const { selected } = data;
      if (Array.isArray(selected) && selected.length > 0) {
        setResumeData((prev) => {
          const updatedSkills = [...prev.skills];
          if (updatedSkills.length > 0) {
            // Add to first category or matching
            const existingInFirst = updatedSkills[0].skills;
            const toAdd = selected.filter((s) => !existingInFirst.includes(s));
            updatedSkills[0] = {
              ...updatedSkills[0],
              skills: [...existingInFirst, ...toAdd],
            };
          } else {
            updatedSkills.push({
              id: `skill-${Date.now()}`,
              category: "Core Technologies",
              skills: selected,
            });
          }
          return { ...prev, skills: updatedSkills };
        });
        toast(`Added ${selected.length} high-impact skills to resume!`, "success");
      }
    }
  };

  // 7. Export Handlers
  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      const res = await fetch("/api/builder/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: "pdf",
          resumeData,
          templateId: selectedTemplateId,
          title: documentTitle,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast("100% ATS-Compliant PDF exported successfully!", "success");
    } catch (err: any) {
      toast(err.message || "Failed to export PDF", "error");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setExportingDocx(true);
    try {
      const res = await fetch("/api/builder/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          format: "docx",
          resumeData,
          templateId: selectedTemplateId,
          title: documentTitle,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate Word document");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${documentTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast("ATS-Formatted Microsoft Word (.docx) exported!", "success");
    } catch (err: any) {
      toast(err.message || "Failed to export DOCX", "error");
    } finally {
      setExportingDocx(false);
    }
  };

  const currentTemplate = getTemplateById(selectedTemplateId);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
            Loading ATS Resume Studio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col pb-20 md:pb-6">
      {/* 1. TOP STUDIO CONTROL BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-zinc-200 px-4 sm:px-6 py-3">
        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Left: Document Title & Autosave */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black" />
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="Resume Title..."
                className="bg-transparent text-sm sm:text-base font-black text-black focus:outline-none focus:bg-zinc-50 px-2 py-1 rounded-lg border border-transparent focus:border-zinc-300 max-w-[260px] sm:max-w-xs transition-colors"
              />
            </div>

            {/* Autosave Pill */}
            <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-mono pl-2 border-l border-zinc-200">
              {autosaveStatus === "saving" ? (
                <span className="text-zinc-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                  Saving...
                </span>
              ) : autosaveStatus === "saved" ? (
                <span className="text-emerald-700 flex items-center gap-1 font-bold">
                  <span>✓</span> {lastSavedAt}
                </span>
              ) : (
                <span className="text-zinc-400">Unsaved</span>
              )}
            </div>
          </div>

          {/* Center / Right: Template Picker, Preset Loader, AI Copilot, Exports */}
          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            {/* Template Selector Button */}
            <button
              type="button"
              onClick={() => setIsGalleryOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 hover:border-black text-xs font-bold text-black flex items-center gap-2 transition-all touch-target shadow-sm"
            >
              <span className="text-xs">🎨</span>
              <span>Layout: <strong className="text-black">{currentTemplate.name}</strong></span>
              <span className="text-[10px] text-zinc-600 font-mono">({currentTemplate.atsScore}% ATS)</span>
              <span className="text-zinc-400 text-[10px]">▾</span>
            </button>

            {/* Load From Parsed Dropdown */}
            {existingResumes.length > 0 && (
              <select
                value={selectedExistingId}
                onChange={(e) => handleLoadParsedResume(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white border border-zinc-300 text-[11px] font-semibold text-zinc-800 focus:outline-none focus:border-black max-w-[150px] truncate shadow-sm"
              >
                <option value="">Load Existing...</option>
                {existingResumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}

            {/* AI Copilot Trigger */}
            <button
              type="button"
              onClick={() => handleOpenAiAssist("generate_summary")}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 hover:border-black text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all touch-target"
            >
              <span>⚡</span>
              <span>AI Copilot</span>
            </button>

            {/* Export DOCX */}
            <button
              type="button"
              onClick={handleExportDocx}
              disabled={exportingDocx}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 hover:border-black text-black text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 touch-target shadow-sm"
            >
              {exportingDocx ? (
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                "DOCX"
              )}
            </button>

            {/* Export PDF (Primary Action) */}
            <button
              type="button"
              onClick={handleExportPdf}
              disabled={exportingPdf}
              className="px-4 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 touch-target border border-black"
            >
              {exportingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <span>📥 Export ATS PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MOBILE SEGMENTED TABS (Visible only on < md screens) */}
      <div className="md:hidden sticky top-[57px] z-30 bg-white border-b border-zinc-200 px-4 py-2 flex items-center justify-around gap-2">
        <button
          onClick={() => setMobileTab("editor")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "editor"
              ? "bg-black text-white font-bold"
              : "bg-zinc-100 text-zinc-700 border border-zinc-200"
          }`}
        >
          <span>✏️</span>
          <span>Editor</span>
        </button>

        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "preview"
              ? "bg-black text-white font-bold"
              : "bg-zinc-100 text-zinc-700 border border-zinc-200"
          }`}
        >
          <span>👁️</span>
          <span>Live A4</span>
        </button>

        <button
          onClick={() => {
            setMobileTab("ai");
            setIsAiPanelOpen(true);
          }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === "ai"
              ? "bg-black text-white font-bold"
              : "bg-zinc-100 text-zinc-700 border border-zinc-200"
          }`}
        >
          <span>⚡</span>
          <span>AI Assist</span>
        </button>
      </div>

      {/* 3. MAIN WORKSPACE: RESPONSIVE SPLIT-VIEW */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Section Editor (6 Cols on desktop) */}
        <div
          className={`lg:col-span-6 xl:col-span-6 space-y-4 ${
            mobileTab !== "editor" ? "hidden md:block" : "block"
          }`}
        >
          {/* Quick Header Bar */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-xs font-bold text-black uppercase tracking-wider">
                Resume Content Architect
              </h2>
              <p className="text-[11px] text-zinc-500">
                All sections auto-format into ATS-compliant bullet density and keywords
              </p>
            </div>

            <button
              onClick={handleLoadSamplePreset}
              className="text-[11px] text-black hover:underline font-bold"
            >
              Reset to Sample
            </button>
          </div>

          {/* Accordion Editor */}
          <SectionEditor
            data={resumeData}
            onChange={(updated) => setResumeData(updated)}
            onAiAssist={handleOpenAiAssist}
          />
        </div>

        {/* Right Column: Live A4 Preview (6 Cols on desktop, sticky) */}
        <div
          className={`lg:col-span-6 xl:col-span-6 lg:sticky lg:top-20 space-y-4 ${
            mobileTab !== "preview" ? "hidden md:block" : "block"
          }`}
        >
          <LiveA4Preview data={resumeData} templateId={selectedTemplateId} />
        </div>
      </main>

      {/* 4. TEMPLATE GALLERY MODAL */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-5xl bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[90vh] overflow-y-auto text-black">
            <TemplateGallery
              selectedTemplateId={selectedTemplateId}
              onSelectTemplate={(templateId) => {
                setSelectedTemplateId(templateId);
                setIsGalleryOpen(false);
                const t = getTemplateById(templateId);
                toast(`Switched resume layout to "${t.name}"!`, "success");
              }}
              onClose={() => setIsGalleryOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 5. SLIDE-OUT AI RESUME COPILOT DOCK */}
      <AiResumeWriterPanel
        isOpen={isAiPanelOpen}
        onClose={() => {
          setIsAiPanelOpen(false);
          if (mobileTab === "ai") setMobileTab("editor");
        }}
        initialAction={aiAction}
        initialContent={aiInitialContent}
        initialContext={aiInitialContext}
        currentResumeData={resumeData}
        onApply={handleAiApply}
      />
    </div>
  );
}
