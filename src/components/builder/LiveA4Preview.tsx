"use client";

import React, { useState, useRef, useEffect } from "react";
import { ResumeData } from "@/types/builder";
import { getTemplateById } from "@/lib/templates/definitions";

interface LiveA4PreviewProps {
  data: ResumeData;
  templateId: string;
}

export default function LiveA4Preview({ data, templateId }: LiveA4PreviewProps) {
  const [zoom, setZoom] = useState<number>(0.85);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

  const template = getTemplateById(templateId);

  // Auto-fit to width on initial mount / resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && !isFullscreen) {
        const containerWidth = containerRef.current.clientWidth - 48; // padding
        const a4Width = 794; // standard 96dpi A4 width in px
        const calculatedScale = Math.min(1.0, Math.max(0.45, containerWidth / a4Width));
        setZoom(Number(calculatedScale.toFixed(2)));
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isFullscreen]);

  const handleZoomIn = () => setZoom((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
  const handleResetZoom = () => setZoom(1.0);
  const handleFitWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 48;
      const a4Width = 794;
      setZoom(Number(Math.min(1.2, Math.max(0.45, containerWidth / a4Width)).toFixed(2)));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col h-full space-y-3">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-white border border-zinc-200 text-xs shadow-sm">
        {/* Left: Template badge */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-black" />
          <span className="text-zinc-500 font-medium">Layout:</span>
          <span className="font-bold text-black bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">
            {template.name}
          </span>
          <span className="text-[11px] text-zinc-600 font-mono hidden sm:inline">
            ({template.atsScore}% ATS)
          </span>
        </div>

        {/* Right: Zoom & Preview actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-0.5 shadow-sm">
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="px-2.5 py-1 text-zinc-600 hover:text-black font-bold transition-colors touch-target"
            >
              −
            </button>
            <span className="px-2 font-mono text-[11px] text-black font-bold min-w-[44px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="px-2.5 py-1 text-zinc-600 hover:text-black font-bold transition-colors touch-target"
            >
              +
            </button>
          </div>

          <button
            onClick={handleFitWidth}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:text-black hover:border-black text-[11px] font-bold transition-colors shadow-sm"
          >
            Fit
          </button>

          <button
            onClick={handleResetZoom}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-zinc-200 text-zinc-700 hover:text-black hover:border-black text-[11px] font-bold transition-colors shadow-sm"
          >
            100%
          </button>

          <button
            onClick={() => setIsFullscreen(true)}
            className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-black border border-zinc-200 text-[11px] font-bold transition-colors flex items-center gap-1"
          >
            <span>⛶ Fullscreen</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white border border-black text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
          >
            <span>🖨️ Print</span>
          </button>
        </div>
      </div>

      {/* A4 Canvas Container */}
      <div
        ref={containerRef}
        className="w-full flex-1 overflow-auto bg-zinc-100 rounded-2xl border border-zinc-200 p-4 sm:p-6 flex justify-center items-start min-h-[600px] shadow-inner relative"
      >
        {/* Scaled A4 Sheet Wrapper */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top center",
            width: "794px",
            minHeight: "1123px",
          }}
          className="transition-transform duration-150 ease-out shrink-0"
        >
          <div
            ref={resumeRef}
            id="ats-resume-print-document"
            className="w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-xl border border-zinc-200 overflow-hidden print:shadow-none print:m-0 print:w-full print:min-h-0"
          >
            <RenderTemplateEngine data={data} templateId={templateId} />
          </div>
        </div>
      </div>

      {/* Fullscreen Modal Preview */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col p-4 sm:p-6 overflow-hidden">
          {/* Modal Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 bg-white p-4 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-black text-black">
                Live A4 Preview — {template.name}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-black border border-zinc-200 text-xs font-bold">
                {template.atsScore}% ATS Rating
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs uppercase tracking-wider transition-all border border-black"
              >
                🖨️ Print / Save to PDF
              </button>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-2 rounded-xl bg-white text-black hover:bg-zinc-100 border border-zinc-300 text-xs font-bold"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-auto flex justify-center items-start p-6 bg-zinc-100 rounded-b-2xl">
            <div
              style={{
                width: "794px",
                minHeight: "1123px",
              }}
              className="bg-white text-slate-900 shadow-2xl rounded-sm my-auto shrink-0"
            >
              <RenderTemplateEngine data={data} templateId={templateId} />
            </div>
          </div>
        </div>
      )}

      {/* Global Print Stylesheet */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ats-resume-print-document,
          #ats-resume-print-document * {
            visibility: visible;
          }
          #ats-resume-print-document {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * High-precision ATS Template Rendering Engine for all 6 template architectures
 */
function RenderTemplateEngine({
  data,
  templateId,
}: {
  data: ResumeData;
  templateId: string;
}) {
  const { personalInfo, experience, education, skills, projects, certifications } = data;

  // 1. CLASSIC CORPORATE
  if (templateId === "classic-corporate") {
    return (
      <div className="p-10 text-[#1E293B] font-serif leading-relaxed text-[13px]">
        {/* Header */}
        <div className="text-center border-b-2 border-[#1E293B] pb-4 mb-5">
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] uppercase">
            {personalInfo.fullName || "Candidate Name"}
          </h1>
          {personalInfo.jobTitle && (
            <p className="text-sm font-semibold text-[#334155] mt-0.5 tracking-wide">
              {personalInfo.jobTitle}
            </p>
          )}
          <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-xs text-[#475569] mt-2 font-sans">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>• {personalInfo.phone}</span>}
            {personalInfo.location && <span>• {personalInfo.location}</span>}
            {personalInfo.linkedin && (
              <span>• {personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>
            )}
            {personalInfo.github && (
              <span>• {personalInfo.github.replace(/^https?:\/\//, "")}</span>
            )}
            {personalInfo.website && (
              <span>• {personalInfo.website.replace(/^https?:\/\//, "")}</span>
            )}
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#CBD5E1] pb-1 mb-2 font-sans">
              Professional Summary
            </h2>
            <p className="text-justify text-[#334155] leading-normal">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#CBD5E1] pb-1 mb-3 font-sans">
              Work Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-sans">
                    <span className="font-bold text-sm text-[#0F172A]">
                      {exp.title}
                    </span>
                    <span className="text-xs text-[#64748B] font-medium">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-[#475569] italic mb-1.5 font-sans">
                    <span>{exp.company}</span>
                    {exp.location && <span>{exp.location}</span>}
                  </div>
                  <ul className="list-disc list-outside pl-4 space-y-1 text-[#334155]">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="leading-snug">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mb-5 font-sans">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#CBD5E1] pb-1 mb-2">
              Technical & Professional Skills
            </h2>
            <div className="space-y-1.5 text-xs">
              {skills.map((cat) => (
                <div key={cat.id} className="flex items-baseline">
                  <span className="font-bold text-[#0F172A] w-48 shrink-0">
                    {cat.category}:
                  </span>
                  <span className="text-[#334155]">{cat.skills.join(", ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-5 font-sans">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#CBD5E1] pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-[#0F172A]">{edu.degree}</span>
                    <span className="text-[#475569]"> — {edu.institution}</span>
                    {edu.gpa && <span className="text-[#64748B]"> (GPA: {edu.gpa})</span>}
                  </div>
                  <span className="text-[#64748B]">{edu.graduationYear}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-5 font-sans">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#CBD5E1] pb-1 mb-2">
              Selected Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#0F172A]">{proj.name}</span>
                    {proj.link && (
                      <span className="text-blue-700 underline text-[11px]">
                        {proj.link.replace(/^https?:\/\//, "")}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-[#334155] mt-0.5">{proj.description}</p>
                  )}
                  {proj.technologies.length > 0 && (
                    <p className="text-[#64748B] text-[11px] mt-0.5">
                      <span className="font-semibold">Tech:</span>{" "}
                      {proj.technologies.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="font-sans">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1E293B] border-b border-[#CBD5E1] pb-1 mb-2">
              Certifications & Credentials
            </h2>
            <div className="space-y-1 text-xs">
              {certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-baseline">
                  <span className="font-semibold text-[#0F172A]">
                    {cert.name} {cert.issuer ? `— ${cert.issuer}` : ""}
                  </span>
                  <span className="text-[#64748B]">{cert.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. SILICON VALLEY TECH
  if (templateId === "modern-tech") {
    return (
      <div className="p-9 text-[#0F172A] font-sans leading-relaxed text-[12.5px]">
        {/* Header */}
        <div className="border-b-2 border-amber-500 pb-4 mb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
              {personalInfo.fullName || "Candidate Name"}
            </h1>
            <p className="text-sm font-bold text-amber-600 mt-0.5">
              {personalInfo.jobTitle || "Software Engineer"}
            </p>
          </div>
          <div className="text-right text-[11px] text-[#475569] space-y-0.5">
            {personalInfo.email && <p className="font-medium">{personalInfo.email}</p>}
            {personalInfo.phone && <p>{personalInfo.phone}</p>}
            {personalInfo.location && <p>{personalInfo.location}</p>}
            {personalInfo.github && (
              <p className="text-amber-700 font-mono text-[10px]">
                {personalInfo.github.replace(/^https?:\/\//, "")}
              </p>
            )}
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-4 bg-amber-50/50 p-3 rounded-lg border-l-3 border-amber-500">
            <p className="text-xs text-[#334155] leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Skills Tag Grid */}
        {skills.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#0F172A] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-amber-500" />
              Technical Stack & Competencies
            </h2>
            <div className="space-y-2">
              {skills.map((cat) => (
                <div key={cat.id} className="flex items-start gap-2 text-xs">
                  <span className="font-bold text-[#1E293B] w-36 shrink-0 pt-0.5">
                    {cat.category}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cat.skills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#0F172A] font-medium text-[11px]"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#0F172A] mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-amber-500" />
              Professional Experience
            </h2>
            <div className="space-y-3.5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm text-[#0F172A]">
                      {exp.title} <span className="text-amber-600 font-semibold">@ {exp.company}</span>
                    </span>
                    <span className="text-xs font-mono text-[#64748B]">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-[11px] text-[#64748B] mb-1">{exp.location}</p>
                  )}
                  <ul className="list-disc list-outside pl-4 space-y-1 text-[#334155] text-xs">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="leading-snug">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#0F172A] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-amber-500" />
              Engineering Projects & Open Source
            </h2>
            <div className="space-y-2.5">
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-[#0F172A]">
                      {proj.name} {proj.role && <span className="font-normal text-[#64748B]">({proj.role})</span>}
                    </span>
                    {proj.link && (
                      <span className="text-amber-700 font-mono text-[11px]">
                        {proj.link.replace(/^https?:\/\//, "")}
                      </span>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-[#334155] mt-0.5">{proj.description}</p>
                  )}
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.technologies.map((t) => (
                        <span
                          key={t}
                          className="px-1.5 py-0.2 bg-amber-100/70 border border-amber-300 text-amber-900 rounded text-[10px] font-mono"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Certs Split */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-[#0F172A] mb-1.5">
              Education
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="text-xs">
                <p className="font-bold text-[#0F172A]">{edu.degree}</p>
                <p className="text-[#475569]">{edu.institution} ({edu.graduationYear})</p>
                {edu.gpa && <p className="text-[#64748B] text-[11px]">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>

          {certifications.length > 0 && (
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#0F172A] mb-1.5">
                Certifications
              </h2>
              {certifications.map((cert) => (
                <div key={cert.id} className="text-xs">
                  <p className="font-bold text-[#0F172A]">{cert.name}</p>
                  <p className="text-[#64748B] text-[11px]">{cert.issuer} • {cert.date}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. EXECUTIVE LEADER
  if (templateId === "executive-leader") {
    return (
      <div className="p-10 text-[#111827] font-serif leading-relaxed text-[13px]">
        {/* Executive Header Banner */}
        <div className="border-t-4 border-b border-[#B45309] py-4 text-center mb-5">
          <h1 className="text-2xl font-bold tracking-widest text-[#111827] uppercase">
            {personalInfo.fullName || "Candidate Name"}
          </h1>
          <p className="text-xs font-sans font-bold text-[#B45309] tracking-wider uppercase mt-1">
            {personalInfo.jobTitle || "Executive Leader"}
          </p>
          <div className="flex justify-center items-center gap-3 text-[11px] font-sans text-[#6B7280] mt-2">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>| {personalInfo.phone}</span>}
            {personalInfo.location && <span>| {personalInfo.location}</span>}
            {personalInfo.linkedin && <span>| {personalInfo.linkedin.replace(/^https?:\/\//, "")}</span>}
          </div>
        </div>

        {/* Executive Narrative */}
        {personalInfo.summary && (
          <div className="mb-5">
            <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-[#111827] border-b border-[#E5E7EB] pb-1 mb-2">
              Executive Profile & Value Proposition
            </h2>
            <p className="text-justify text-[#374151] leading-relaxed font-sans text-xs">
              {personalInfo.summary}
            </p>
          </div>
        )}

        {/* Core Competencies Box */}
        {skills.length > 0 && (
          <div className="mb-5 p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-lg">
            <h3 className="text-xs font-sans font-bold text-[#B45309] uppercase tracking-wider mb-2 text-center">
              Core Leadership Competencies & Strategic Capabilities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-3 gap-y-1 text-xs font-sans text-[#1F2937]">
              {skills.flatMap((c) => c.skills).map((skill) => (
                <div key={skill} className="flex items-center gap-1.5">
                  <span className="text-[#B45309] text-[10px]">■</span>
                  <span className="font-semibold">{skill}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Executive Experience */}
        {experience.length > 0 && (
          <div className="mb-5">
            <h2 className="text-xs font-sans font-bold uppercase tracking-wider text-[#111827] border-b border-[#E5E7EB] pb-1 mb-3">
              Executive & Professional Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline font-sans">
                    <span className="font-bold text-sm text-[#111827]">
                      {exp.title}
                    </span>
                    <span className="text-xs text-[#6B7280]">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <div className="text-xs font-sans text-[#B45309] font-semibold mb-1.5">
                    {exp.company} {exp.location ? `| ${exp.location}` : ""}
                  </div>
                  <ul className="list-disc list-outside pl-4 space-y-1 text-[#374151] font-sans text-xs">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="leading-snug">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Credentials */}
        {education.length > 0 && (
          <div className="font-sans">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#111827] border-b border-[#E5E7EB] pb-1 mb-2">
              Education & Board Qualifications
            </h2>
            <div className="space-y-1.5 text-xs">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-baseline">
                  <span className="font-bold text-[#111827]">
                    {edu.degree} — {edu.institution}
                  </span>
                  <span className="text-[#6B7280]">{edu.graduationYear}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. MINIMAL CREATIVE
  if (templateId === "minimal-creative") {
    return (
      <div className="p-10 text-[#18181B] font-sans leading-relaxed text-[12.5px]">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-light tracking-tight text-[#18181B]">
            {personalInfo.fullName || "Candidate Name"}
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#D97706] mt-1">
            {personalInfo.jobTitle || "Product Designer & Engineer"}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#71717A] mt-2 font-mono">
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.location && <span>{personalInfo.location}</span>}
            {personalInfo.website && <span>{personalInfo.website}</span>}
          </div>
        </div>

        {/* Summary */}
        {personalInfo.summary && (
          <div className="mb-6">
            <p className="text-xs text-[#52525B] leading-relaxed">
              {personalInfo.summary}
            </p>
          </div>
        )}

        <hr className="border-zinc-200 mb-6" />

        {/* Experience */}
        {experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-[11px] font-mono uppercase tracking-widest text-[#71717A] mb-3">
              Experience
            </h2>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-sm text-[#18181B]">
                      {exp.title}
                    </span>
                    <span className="text-xs font-mono text-[#A1A1AA]">
                      {exp.startDate} — {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  <p className="text-xs text-[#D97706] font-medium mb-1">{exp.company}</p>
                  <ul className="space-y-1 text-xs text-[#52525B]">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className="leading-snug">
                        — {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects & Skills 2-col */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-zinc-200">
          {projects.length > 0 && (
            <div>
              <h2 className="text-[11px] font-mono uppercase tracking-widest text-[#71717A] mb-2">
                Projects
              </h2>
              {projects.map((proj) => (
                <div key={proj.id} className="text-xs mb-2">
                  <p className="font-bold text-[#18181B]">{proj.name}</p>
                  <p className="text-[#71717A] text-[11px]">{proj.description}</p>
                </div>
              ))}
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <h2 className="text-[11px] font-mono uppercase tracking-widest text-[#71717A] mb-2">
                Capabilities
              </h2>
              <div className="flex flex-wrap gap-1">
                {skills.flatMap((c) => c.skills).map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[11px]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 5. ACADEMIC RESEARCH
  if (templateId === "academic-research") {
    return (
      <div className="p-10 text-[#0F172A] font-serif leading-relaxed text-[12.5px]">
        <div className="text-center pb-4 mb-4 border-b border-zinc-300">
          <h1 className="text-2xl font-bold text-[#0F172A]">
            {personalInfo.fullName || "Candidate Name"}
          </h1>
          <p className="text-xs text-zinc-600 mt-1 italic">
            Curriculum Vitae • {personalInfo.jobTitle || "Researcher"}
          </p>
          <div className="text-xs text-zinc-500 mt-1">
            {personalInfo.email} • {personalInfo.phone} • {personalInfo.location}
          </div>
        </div>

        {/* Education first in Academic CV */}
        {education.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-zinc-300 pb-0.5 mb-2 font-sans">
              Higher Education
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs mb-1.5">
                <div>
                  <span className="font-bold text-[#0F172A]">{edu.degree}</span>
                  <span>, {edu.institution}</span>
                  {edu.honors && <span className="italic text-zinc-600"> — {edu.honors}</span>}
                </div>
                <span className="text-zinc-600">{edu.graduationYear}</span>
              </div>
            ))}
          </div>
        )}

        {/* Academic / Work Experience */}
        {experience.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-zinc-300 pb-0.5 mb-2 font-sans">
              Research & Appointments
            </h2>
            {experience.map((exp) => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between items-baseline text-xs">
                  <span className="font-bold text-[#0F172A]">{exp.title}</span>
                  <span className="text-zinc-600">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <p className="text-xs italic text-zinc-700 mb-1">{exp.company}</p>
                <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-zinc-800">
                  {exp.bullets.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Publications & Research Projects */}
        {projects.length > 0 && (
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-zinc-300 pb-0.5 mb-2 font-sans">
              Publications & Research Output
            </h2>
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs mb-2">
                <p className="font-bold text-[#0F172A]">{proj.name}</p>
                <p className="text-zinc-700">{proj.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Skills & Methods */}
        {skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] border-b border-zinc-300 pb-0.5 mb-2 font-sans">
              Methodologies & Technical Competencies
            </h2>
            {skills.map((c) => (
              <p key={c.id} className="text-xs mb-1">
                <strong className="text-zinc-900">{c.category}:</strong> {c.skills.join(", ")}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 6. FEDERAL COMPLIANCE (USAJOBS)
  return (
    <div className="p-8 text-[#090A0C] font-sans leading-relaxed text-[12px]">
      <div className="bg-zinc-100 p-3.5 rounded border border-zinc-300 mb-4">
        <h1 className="text-xl font-black uppercase text-[#090A0C]">
          {personalInfo.fullName || "Candidate Name"}
        </h1>
        <p className="text-xs font-bold text-zinc-700">
          FEDERAL RESUME • GS-EQUIVALENT: GS-14/15 • CITIZENSHIP: US CITIZEN
        </p>
        <div className="flex flex-wrap gap-x-3 text-[11px] text-zinc-600 mt-1 font-mono">
          {personalInfo.email && <span>Email: {personalInfo.email}</span>}
          {personalInfo.phone && <span>Phone: {personalInfo.phone}</span>}
          {personalInfo.location && <span>Location: {personalInfo.location}</span>}
        </div>
      </div>

      {/* Federal Experience */}
      {experience.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#090A0C] border-b-2 border-zinc-800 pb-1 mb-2">
            Relevant Federal & Commercial Work History
          </h2>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="p-3 bg-zinc-50 border-l-3 border-zinc-700">
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-xs text-[#090A0C] uppercase">
                    {exp.title}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-600">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate} (40 hrs/wk)
                  </span>
                </div>
                <p className="text-xs font-semibold text-zinc-700">
                  Employer: {exp.company} | Location: {exp.location || "USA"}
                </p>
                <div className="mt-1.5 space-y-1 text-xs text-zinc-800">
                  <p className="font-semibold text-[11px] text-zinc-900 uppercase">
                    Duties, Responsibilities & Quantified Achievements:
                  </p>
                  <ul className="list-disc list-outside pl-4 space-y-1">
                    {exp.bullets.map((b, bi) => (
                      <li key={bi}>{b}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Federal Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#090A0C] border-b-2 border-zinc-800 pb-1 mb-2">
            Knowledge, Skills & Abilities (KSAs)
          </h2>
          <div className="space-y-1 text-xs">
            {skills.map((c) => (
              <p key={c.id}>
                <strong>{c.category}:</strong> {c.skills.join("; ")}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-[#090A0C] border-b-2 border-zinc-800 pb-1 mb-2">
            Accredited Education
          </h2>
          {education.map((edu) => (
            <div key={edu.id} className="text-xs">
              <span className="font-bold">{edu.degree}</span>, {edu.institution} ({edu.graduationYear})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
