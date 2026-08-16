import { ResumeTemplateInfo } from "@/types/builder";

export const RESUME_TEMPLATES: ResumeTemplateInfo[] = [
  {
    id: "classic-corporate",
    name: "Classic Corporate",
    description: "Recruiter-standard single-column layout optimized for Fortune 500 ATS filters with traditional serif headers and clear division.",
    category: "Corporate",
    atsScore: 99,
    tags: ["High-Density", "Finance / Consulting", "Conservative", "Single-Column"],
    isPopular: true,
    colorScheme: {
      primary: "#1E293B",
      accent: "#334155",
      background: "#FFFFFF",
    },
    fontRecommendation: "Georgia / Times New Roman / Garamond",
  },
  {
    id: "modern-tech",
    name: "Silicon Valley Tech",
    description: "Modern engineering layout with Amber & Emerald accents, interactive link formatting, categorized tech tags, and STAR-quantified bullet styling.",
    category: "Tech",
    atsScore: 98,
    tags: ["Developer / DevOps", "Skill Tags", "STAR Metrics", "GitHub Links"],
    isPopular: true,
    colorScheme: {
      primary: "#0F172A",
      accent: "#F59E0B",
      background: "#FFFFFF",
    },
    fontRecommendation: "Inter / Sora / Helvetica Neue",
  },
  {
    id: "executive-leader",
    name: "Executive Leader",
    description: "High-impact layout engineered for Directors, VPs, and C-Suite executives featuring a prominent Core Competencies grid and Board impact section.",
    category: "Executive",
    atsScore: 99,
    tags: ["C-Suite / VP", "Competencies Grid", "High Impact", "Leadership"],
    colorScheme: {
      primary: "#111827",
      accent: "#B45309",
      background: "#FFFFFF",
    },
    fontRecommendation: "Merriweather / Calibri / Charter",
  },
  {
    id: "minimal-creative",
    name: "Minimal Creative",
    description: "Clean contemporary design with generous whitespace, subtle hairline dividers, and highlighted portfolio showcases tailored for Designers and Product Managers.",
    category: "Creative",
    atsScore: 97,
    tags: ["Product / Design", "Portfolio Focused", "Clean Space", "Modern Sans"],
    colorScheme: {
      primary: "#18181B",
      accent: "#D97706",
      background: "#FFFFFF",
    },
    fontRecommendation: "Geist / Inter / Lato",
  },
  {
    id: "academic-research",
    name: "Academic & Research",
    description: "Formal CV layout structured for PhD candidates, researchers, and higher-ed faculty with designated sections for Publications, Grants, and Teaching.",
    category: "Academic",
    atsScore: 100,
    tags: ["PhD / Postdoc", "Publications", "Grant History", "Formal"],
    colorScheme: {
      primary: "#0F172A",
      accent: "#475569",
      background: "#FFFFFF",
    },
    fontRecommendation: "Times New Roman / Latin Modern Roman / Garamond",
  },
  {
    id: "federal-compliance",
    name: "Federal & Gov Compliance",
    description: "Rigorous USAJOBS-compatible federal resume template with strict GS-ranking criteria, hours per week, citizenship status, and compliance fields.",
    category: "Federal",
    atsScore: 100,
    tags: ["USAJOBS / Gov", "GS Hierarchy", "Clearance Safe", "Strict Compliance"],
    colorScheme: {
      primary: "#090A0C",
      accent: "#1E293B",
      background: "#FFFFFF",
    },
    fontRecommendation: "Arial / Calibri / Helvetica",
  },
];

export function getTemplateById(id: string): ResumeTemplateInfo {
  return RESUME_TEMPLATES.find((t) => t.id === id) || RESUME_TEMPLATES[0];
}
