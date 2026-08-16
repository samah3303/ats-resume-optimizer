import { ResumeData, INITIAL_RESUME_DATA } from "@/types/builder";

/**
 * Parses raw unstructured resume text into a structured ResumeData object
 */
export function parseRawTextToResumeData(rawText: string, fallbackName?: string): ResumeData {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return {
      ...INITIAL_RESUME_DATA,
      personalInfo: {
        ...INITIAL_RESUME_DATA.personalInfo,
        fullName: fallbackName || INITIAL_RESUME_DATA.personalInfo.fullName,
      },
    };
  }

  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  const result: ResumeData = {
    personalInfo: {
      fullName: fallbackName || "Candidate Name",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
      summary: "",
    },
    experience: [],
    education: [],
    skills: [
      { id: "skill-cat-1", category: "Core Technologies", skills: [] },
      { id: "skill-cat-2", category: "Tools & Frameworks", skills: [] },
    ],
    projects: [],
    certifications: [],
  };

  // 1. Extract Name & Contact lines from the top 5 lines
  let headerIndexEnd = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];

    // Name (first line usually)
    if (i === 0 && !line.includes("@") && !line.includes("http")) {
      result.personalInfo.fullName = line.replace(/[#*]/g, "").trim();
      headerIndexEnd = i + 1;
      continue;
    }

    // Title
    if (i === 1 && !line.includes("@") && !line.includes("|") && !line.includes("http")) {
      result.personalInfo.jobTitle = line.replace(/[#*]/g, "").trim();
      headerIndexEnd = i + 1;
      continue;
    }

    // Extract email
    const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch && !result.personalInfo.email) {
      result.personalInfo.email = emailMatch[0];
    }

    // Extract phone
    const phoneMatch = line.match(/(?:\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/);
    if (phoneMatch && !result.personalInfo.phone) {
      result.personalInfo.phone = phoneMatch[0];
    }

    // Extract LinkedIn
    const linkedinMatch = line.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    if (linkedinMatch && !result.personalInfo.linkedin) {
      result.personalInfo.linkedin = linkedinMatch[0].startsWith("http")
        ? linkedinMatch[0]
        : `https://${linkedinMatch[0]}`;
    }

    // Extract GitHub
    const githubMatch = line.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
    if (githubMatch && !result.personalInfo.github) {
      result.personalInfo.github = githubMatch[0].startsWith("http")
        ? githubMatch[0]
        : `https://${githubMatch[0]}`;
    }

    // Extract Location if line contains state / country or comma
    if (line.includes(",") && !line.includes("@") && !result.personalInfo.location) {
      const parts = line.split(/[|•]/).map((p) => p.trim());
      const locCandidate = parts.find((p) => p.includes(",") && !p.includes("http") && !p.includes("@"));
      if (locCandidate) result.personalInfo.location = locCandidate;
    }
  }

  // 2. Parse major sections
  let currentSection = "header";
  let currentExp: any = null;
  let currentEdu: any = null;
  let currentProj: any = null;

  for (let i = headerIndexEnd; i < lines.length; i++) {
    const line = lines[i];
    const cleanLine = line.replace(/^[#*]+/, "").replace(/[*_]/g, "").trim();

    // Section detector
    if (/^(PROFESSIONAL SUMMARY|SUMMARY|PROFILE|ABOUT ME)/i.test(cleanLine)) {
      currentSection = "summary";
      continue;
    } else if (/^(WORK EXPERIENCE|EXPERIENCE|EMPLOYMENT HISTORY|PROFESSIONAL EXPERIENCE)/i.test(cleanLine)) {
      currentSection = "experience";
      continue;
    } else if (/^(TECHNICAL SKILLS|SKILLS|CORE COMPETENCIES|KEY SKILLS)/i.test(cleanLine)) {
      currentSection = "skills";
      continue;
    } else if (/^(EDUCATION|ACADEMIC BACKGROUND)/i.test(cleanLine)) {
      currentSection = "education";
      continue;
    } else if (/^(PROJECTS|KEY PROJECTS|NOTABLE WORK)/i.test(cleanLine)) {
      currentSection = "projects";
      continue;
    } else if (/^(CERTIFICATIONS|LICENSES|CREDENTIALS)/i.test(cleanLine)) {
      currentSection = "certifications";
      continue;
    }

    // Parse according to current section
    if (currentSection === "summary") {
      result.personalInfo.summary = (result.personalInfo.summary + " " + line).trim();
    } else if (currentSection === "experience") {
      const isBullet = /^[●•\-*]|\d+\./.test(line);
      if (isBullet && currentExp) {
        currentExp.bullets.push(line.replace(/^[●•\-*]|\d+\.\s*/, "").trim());
      } else if (line.includes("|") || line.includes("–") || line.includes("-") || line.length < 70) {
        // New experience item
        const parts = line.split(/[|–—]/).map((p) => p.trim());
        currentExp = {
          id: `exp-${Date.now()}-${result.experience.length}`,
          title: parts[0] || "Software Engineer",
          company: parts[1] || "Company",
          location: parts[2] || "",
          startDate: parts[3] || "2021",
          endDate: parts[4] || "Present",
          current: line.toLowerCase().includes("present"),
          bullets: [],
        };
        result.experience.push(currentExp);
      }
    } else if (currentSection === "skills") {
      const skillItems = line
        .replace(/^.*?:/, "")
        .split(/[,|•]/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (skillItems.length > 0) {
        const catName = line.includes(":") ? line.split(":")[0].replace(/[#*]/g, "").trim() : "Technologies";
        result.skills.push({
          id: `skill-cat-${result.skills.length + 1}`,
          category: catName,
          skills: skillItems,
        });
      }
    } else if (currentSection === "education") {
      const parts = line.split(/[|–—,]/).map((p) => p.trim());
      currentEdu = {
        id: `edu-${Date.now()}-${result.education.length}`,
        degree: parts[0] || "Bachelor of Science",
        institution: parts[1] || "University",
        location: "",
        graduationYear: parts[2] || "",
        gpa: "",
        honors: "",
      };
      result.education.push(currentEdu);
    } else if (currentSection === "projects") {
      if (line.includes("|") || line.length < 50) {
        const parts = line.split(/[|–—]/).map((p) => p.trim());
        currentProj = {
          id: `proj-${Date.now()}-${result.projects.length}`,
          name: parts[0] || "Project",
          role: parts[1] || "",
          description: "",
          technologies: [],
          link: "",
          githubLink: "",
          bullets: [],
        };
        result.projects.push(currentProj);
      } else if (currentProj) {
        currentProj.description = (currentProj.description + " " + line).trim();
      }
    } else if (currentSection === "certifications") {
      const parts = line.split(/[|–—,]/).map((p) => p.trim());
      result.certifications.push({
        id: `cert-${Date.now()}-${result.certifications.length}`,
        name: parts[0] || "Certified Professional",
        issuer: parts[1] || "",
        date: parts[2] || "",
        credentialId: "",
        credentialUrl: "",
      });
    }
  }

  // Clean empty skill categories
  result.skills = result.skills.filter((c) => c.skills.length > 0);
  if (result.skills.length === 0) {
    result.skills = INITIAL_RESUME_DATA.skills;
  }
  if (result.experience.length === 0) {
    result.experience = INITIAL_RESUME_DATA.experience;
  }
  if (result.education.length === 0) {
    result.education = INITIAL_RESUME_DATA.education;
  }

  return result;
}
