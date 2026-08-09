"use client";

import { useState, useEffect } from "react";

export interface IndustryDomain {
  id: string;
  name: string;
  emoji: string;
  sampleJobTitle: string;
  sampleCompany: string;
  sampleJdText: string;
}

export const INDUSTRY_DOMAINS: IndustryDomain[] = [
  {
    id: "software",
    name: "Software & Technology",
    emoji: "💻",
    sampleJobTitle: "Senior Full Stack Software Engineer",
    sampleCompany: "TechCorp Global",
    sampleJdText: "We are looking for a Senior Full Stack Engineer proficient in React, TypeScript, Node.js, PostgreSQL, Docker, AWS microservices, RESTful API design, and CI/CD pipelines. Experience in agile development and high-concurrency systems is required.",
  },
  {
    id: "healthcare",
    name: "Healthcare & Nursing",
    emoji: "🏥",
    sampleJobTitle: "Registered Nurse (RN) / Clinical Coordinator",
    sampleCompany: "City General Hospital",
    sampleJdText: "Seeking a Registered Nurse (RN) with BSN certification, BLS/ACLS credentials, EHR/Epic software proficiency, patient triage expertise, medication administration, ICU/Emergency care experience, and HIPAA compliance compliance.",
  },
  {
    id: "finance",
    name: "Finance & Accounting",
    emoji: "📊",
    sampleJobTitle: "Senior Financial Analyst / Accountant",
    sampleCompany: "Apex Capital Partners",
    sampleJdText: "Looking for a Financial Analyst / Accountant with CPA/CFA credentials, financial modeling expertise, Excel Advanced VBA, P&L reporting, audit compliance, SAP/Oracle ERP experience, and variance analysis.",
  },
  {
    id: "marketing",
    name: "Marketing & Sales",
    emoji: "📣",
    sampleJobTitle: "Digital Marketing Specialist & SEO Lead",
    sampleCompany: "GrowthMedia Agency",
    sampleJdText: "Seeking a Performance Marketing Lead experienced in Google Ads, Meta Ads, SEO optimization, Google Analytics 4, HubSpot CRM, content strategy, email campaign automation, and ROI conversion tracking.",
  },
  {
    id: "operations",
    name: "Operations & Logistics",
    emoji: "📦",
    sampleJobTitle: "Operations Manager / Supply Chain Lead",
    sampleCompany: "LogiTrans International",
    sampleJdText: "Looking for an Operations Manager with Supply Chain optimization skills, Lean Six Sigma certification, inventory management, warehouse logistics, vendor negotiation, and ERP tracking systems.",
  },
  {
    id: "education",
    name: "Education & Administration",
    emoji: "🎓",
    sampleJobTitle: "Academic Coordinator / Senior Teacher",
    sampleCompany: "Horizon International Academy",
    sampleJdText: "Seeking an Academic Coordinator with Curriculum Development expertise, Classroom Management, Educational Technology integration, Student Performance Assessment, and Parent Relations.",
  },
];

interface IndustrySelectorProps {
  onSelectDomain?: (domain: IndustryDomain) => void;
}

export default function IndustrySelector({ onSelectDomain }: IndustrySelectorProps) {
  const [selectedDomainId, setSelectedDomainId] = useState<string>("software");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("resumatch_industry_domain") : null;
    if (saved) {
      setSelectedDomainId(saved);
    }
  }, []);

  const handleSelect = (domain: IndustryDomain) => {
    setSelectedDomainId(domain.id);
    if (typeof window !== "undefined") {
      localStorage.setItem("resumatch_industry_domain", domain.id);
    }
    if (onSelectDomain) {
      onSelectDomain(domain);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
          <span>🌐 Choose Your Industry Domain:</span>
        </label>
        <span className="text-[10px] text-zinc-500 font-mono">Tailors AI Terminology</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {INDUSTRY_DOMAINS.map((domain) => {
          const isSelected = selectedDomainId === domain.id;
          return (
            <button
              key={domain.id}
              type="button"
              onClick={() => handleSelect(domain)}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col items-center justify-center gap-1 text-center ${
                isSelected
                  ? "bg-amber-500 text-slate-950 border-amber-500 font-black shadow-md shadow-amber-500/20"
                  : "bg-[#14161D] border-[#242834] text-zinc-300 hover:border-amber-500/40 hover:text-white"
              }`}
            >
              <span className="text-2xl">{domain.emoji}</span>
              <span className="text-[11px] leading-tight font-bold line-clamp-1">{domain.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
