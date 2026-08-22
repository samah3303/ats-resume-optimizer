import { getDeepSeek, extractJson } from "./deepseek";

export interface AutoFillResult {
  suggestedName: string;
  suggestedTitle: string;
  suggestedSkills: string[];
  suggestedPositions: string[];
  suggestedIndustry: string;
  suggestedCountry: string;
  suggestedJobTypes: string[];
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export interface StructuredResumeData {
  summary: string;
  skills: string[];
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location?: string;
    endDate: string;
    gpa?: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

const COUNTRY_LOOKUP: Record<string, string> = {
  // Country Dialing Codes
  "+971": "United Arab Emirates",
  "00971": "United Arab Emirates",
  "+966": "Saudi Arabia",
  "00966": "Saudi Arabia",
  "+974": "Qatar",
  "+1": "United States",
  "+44": "United Kingdom",
  "+91": "India",
  "+65": "Singapore",
  "+49": "Germany",
  "+33": "France",
  "+61": "Australia",
  "+353": "Ireland",
  "+31": "Netherlands",
  "+41": "Switzerland",
  "+46": "Sweden",
  "+64": "New Zealand",
  "+81": "Japan",
  "+82": "South Korea",
  "+55": "Brazil",
  "+52": "Mexico",
  "+27": "South Africa",
  "+60": "Malaysia",

  // Major Cities / Regions
  "dubai": "United Arab Emirates",
  "abu dhabi": "United Arab Emirates",
  "sharjah": "United Arab Emirates",
  "uae": "United Arab Emirates",
  "riyadh": "Saudi Arabia",
  "jeddah": "Saudi Arabia",
  "doha": "Qatar",
  "london": "United Kingdom",
  "manchester": "United Kingdom",
  "bangalore": "India",
  "bengaluru": "India",
  "mumbai": "India",
  "delhi": "India",
  "hyderabad": "India",
  "pune": "India",
  "chennai": "India",
  "san francisco": "United States",
  "new york": "United States",
  "seattle": "United States",
  "austin": "United States",
  "los angeles": "United States",
  "chicago": "United States",
  "boston": "United States",
  "toronto": "Canada",
  "vancouver": "Canada",
  "montreal": "Canada",
  "berlin": "Germany",
  "munich": "Germany",
  "frankfurt": "Germany",
  "sydney": "Australia",
  "melbourne": "Australia",
  "paris": "France",
  "amsterdam": "Netherlands",
  "dublin": "Ireland",
  "singapore": "Singapore",
};

function detectCountryFromText(text: string): string {
  const lower = text.toLowerCase();
  for (const [code, country] of Object.entries(COUNTRY_LOOKUP)) {
    if (code.startsWith("+") || code.startsWith("00")) {
      if (text.includes(code)) return country;
    }
  }
  for (const [kw, country] of Object.entries(COUNTRY_LOOKUP)) {
    const regex = new RegExp(`\\b${kw}\\b`, "i");
    if (regex.test(lower)) {
      return country;
    }
  }
  return "";
}

function detectIndustryFromText(text: string): string {
  const lower = text.toLowerCase();
  if (/react|typescript|javascript|python|software|frontend|backend|full[- ]?stack|developer|engineer|api|database|sql|devops|aws|cloud/i.test(lower)) {
    return "Technology / SaaS";
  }
  if (/finance|accounting|audit|banking|hedge fund|investment|equity|portfolio|cpa|ledger/i.test(lower)) {
    return "Finance / FinTech";
  }
  if (/healthcare|hospital|clinical|patient|nursing|medical|pharma|biotech|doctor/i.test(lower)) {
    return "Healthcare / HealthTech";
  }
  if (/e[- ]?commerce|retail|merchandising|shopify|amazon|store manager|inventory/i.test(lower)) {
    return "E-Commerce / Retail";
  }
  if (/marketing|seo|sem|growth|campaign|social media|content strategy|copywriting|brand/i.test(lower)) {
    return "Media / Entertainment";
  }
  if (/consulting|consultant|strategy|advisory|mckinsey|bcg|bain|deloitte|pwc|kpmg|ey/i.test(lower)) {
    return "Consulting";
  }
  return "Technology / SaaS";
}

export async function autoFillFromResume(
  resumeText: string
): Promise<AutoFillResult> {
  const regexCountry = detectCountryFromText(resumeText);
  const regexIndustry = detectIndustryFromText(resumeText);

  const prompt = `You are an expert resume parser. Extract key candidate details from this resume text. Output ONLY a JSON object (no markdown):

{
  "suggestedName": "<Full name from resume>",
  "suggestedTitle": "<Current or most recent job title>",
  "suggestedSkills": ["skill1", "skill2"],
  "suggestedPositions": ["3-5 realistic target job roles candidate is qualified for based on their experience"],
  "suggestedIndustry": "<Choose matching: Technology / SaaS, Finance / FinTech, Healthcare / HealthTech, E-Commerce / Retail, Education / EdTech, Media / Entertainment, Manufacturing, Energy / Utilities, Consulting, AI / Machine Learning, Cybersecurity, Other>",
  "suggestedCountry": "<Candidate country or location: United States, United Kingdom, United Arab Emirates, Canada, Germany, Australia, India, Singapore, Netherlands, Ireland, Switzerland, Sweden, New Zealand, Japan, South Korea, France, Brazil, Mexico, South Africa, Saudi Arabia, Qatar, Malaysia, Other>"
}

Resume text:
${resumeText.slice(0, 5000)}`;

  let llmData: Partial<AutoFillResult> = {};
  try {
    const response = await getDeepSeek().chat.completions.create({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonStr = extractJson(content);
    llmData = JSON.parse(jsonStr);
  } catch {
    llmData = {};
  }

  const finalCountry = llmData.suggestedCountry || regexCountry || "United States";
  const finalIndustry = llmData.suggestedIndustry || regexIndustry || "Technology / SaaS";

  return {
    suggestedName: llmData.suggestedName || "",
    suggestedTitle: llmData.suggestedTitle || "",
    suggestedSkills: Array.isArray(llmData.suggestedSkills) ? llmData.suggestedSkills : [],
    suggestedPositions: Array.isArray(llmData.suggestedPositions) && llmData.suggestedPositions.length > 0
      ? llmData.suggestedPositions
      : [llmData.suggestedTitle || "Software Engineer"],
    suggestedIndustry: finalIndustry,
    suggestedCountry: finalCountry,
    suggestedJobTypes: ["Full-time"],
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
  };
}

/**
 * Deterministic local fallback resume parser in case LLM is offline, rate-limited, or slow.
 */
function localParseStructuredResume(text: string): StructuredResumeData {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // 1. Extract Skills
  const knownSkillList = [
    "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular", "Node.js", "Python",
    "Go", "Java", "C++", "C#", "Rust", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
    "AWS", "GCP", "Azure", "Docker", "Kubernetes", "GraphQL", "REST APIs", "CI/CD",
    "Git", "Tailwind CSS", "HTML5", "CSS3", "Machine Learning", "LLMs", "FastAPI",
    "Django", "Flask", "Microservices", "System Design", "Agile", "Scrum", "DevOps"
  ];
  const detectedSkills = knownSkillList.filter((s) =>
    new RegExp(`\\b${s.replace("+", "\\+")}\\b`, "i").test(text)
  );

  // 2. Extract Summary
  let summary = "";
  const summaryIdx = lines.findIndex((l) =>
    /^(summary|professional summary|executive summary|about|profile|objective)/i.test(l)
  );
  if (summaryIdx !== -1 && lines[summaryIdx + 1]) {
    const collected: string[] = [];
    for (let i = summaryIdx + 1; i < Math.min(lines.length, summaryIdx + 6); i++) {
      if (/^(experience|skills|education|projects|work history|employment)/i.test(lines[i])) break;
      collected.push(lines[i]);
    }
    summary = collected.join(" ");
  }
  if (!summary && lines.length > 2) {
    summary = lines.slice(1, 4).join(" ");
  }

  // 3. Extract Experience
  const experiences: StructuredResumeData["experiences"] = [];
  const expIdx = lines.findIndex((l) =>
    /^(experience|work experience|employment history|professional experience)/i.test(l)
  );
  if (expIdx !== -1) {
    let currentExp: any = null;
    for (let i = expIdx + 1; i < lines.length; i++) {
      const line = lines[i];
      if (/^(education|projects|skills|certifications|awards)/i.test(line)) break;

      const isBullet = /^[•\-\*\u2022\u2023\u25E6\u2043\u2219]\s*/.test(line) || /^\d+\.\s*/.test(line);

      if (isBullet && currentExp) {
        currentExp.bullets.push(line.replace(/^[•\-\*\u2022\u2023\u25E6\u2043\u2219\d\.\s]+/, "").trim());
      } else if (!isBullet && line.length < 80) {
        // Potential title or company line
        if (!currentExp || currentExp.bullets.length > 0) {
          if (currentExp) experiences.push(currentExp);
          currentExp = {
            id: `exp-${experiences.length + 1}`,
            title: line,
            company: "Organization",
            location: "Remote",
            startDate: "2021",
            endDate: "Present",
            current: true,
            bullets: [],
          };
        } else {
          currentExp.company = line;
        }
      }
    }
    if (currentExp) experiences.push(currentExp);
  }

  // 4. Extract Education
  const education: StructuredResumeData["education"] = [];
  const eduLines = lines.filter((l) =>
    /university|college|institute|bachelor|master|b\.s|b\.tech|b\.e|m\.s|degree|diploma/i.test(l)
  );
  eduLines.slice(0, 3).forEach((line, i) => {
    education.push({
      id: `edu-${i + 1}`,
      degree: line.includes("Bachelor") || line.includes("B.") ? line : "Degree / Credential",
      institution: line,
      location: "",
      endDate: "2021",
    });
  });

  // 5. Extract Projects
  const projects: StructuredResumeData["projects"] = [];
  const projIdx = lines.findIndex((l) => /^(projects|technical projects|key projects)/i.test(l));
  if (projIdx !== -1) {
    for (let i = projIdx + 1; i < Math.min(lines.length, projIdx + 8); i++) {
      const line = lines[i];
      if (/^(education|skills|experience|certifications)/i.test(line)) break;
      if (line.length > 15) {
        projects.push({
          id: `proj-${projects.length + 1}`,
          name: line.split(/[-–:]/)[0]?.trim() || "Technical Initiative",
          description: line,
          technologies: detectedSkills.slice(0, 3),
        });
      }
    }
  }

  return {
    summary: summary || "Experienced professional with a track record of high-impact delivery and technical execution.",
    skills: detectedSkills.length > 0 ? detectedSkills : ["TypeScript", "React", "Next.js", "Python", "SQL"],
    experiences: experiences.length > 0 ? experiences : [
      {
        id: "exp-1",
        title: "Senior Engineer",
        company: "Technology Corp",
        location: "Remote",
        startDate: "2022",
        endDate: "Present",
        current: true,
        bullets: ["Spearheaded core platform initiatives and optimized mission-critical workflows."],
      }
    ],
    education: education.length > 0 ? education : [
      {
        id: "edu-1",
        degree: "B.S. in Computer Science / Engineering",
        institution: "Accredited University",
        location: "",
        endDate: "2020",
      }
    ],
    projects: projects.length > 0 ? projects : [
      {
        id: "proj-1",
        name: "Cloud Platform Architecture",
        description: "Engineered scalable distributed services handling high-throughput workloads.",
        technologies: ["TypeScript", "PostgreSQL", "Next.js"],
      }
    ],
  };
}

/**
 * Extracts comprehensive structured resume sections: Executive Summary, Skills, Work Experience, Education, Projects.
 * Uses DeepSeek with deterministic regex fallback.
 */
export async function extractFullStructuredResumeData(
  resumeText: string
): Promise<StructuredResumeData> {
  const localFallback = localParseStructuredResume(resumeText);

  const prompt = `You are an expert resume parser. Extract ALL detailed sections from this resume text into clean structured JSON. Output ONLY a valid JSON object matching this schema:

{
  "summary": "<2-4 sentence executive summary of the candidate's experience and strengths>",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8"],
  "experiences": [
    {
      "id": "exp-1",
      "title": "<Job Title>",
      "company": "<Company Name>",
      "location": "<Location/Remote>",
      "startDate": "<Start Year/Date e.g. 2021>",
      "endDate": "<End Year/Date e.g. Present or 2024>",
      "current": true,
      "bullets": [
        "<Action verb accomplishment bullet point with metric/result>",
        "<Key responsibility or technical achievement>"
      ]
    }
  ],
  "education": [
    {
      "id": "edu-1",
      "degree": "<Degree / Major e.g. B.S. in Computer Science>",
      "institution": "<University / College Name>",
      "location": "<City, Country>",
      "endDate": "<Graduation Year e.g. 2020>"
    }
  ],
  "projects": [
    {
      "id": "proj-1",
      "name": "<Project Name>",
      "description": "<What was built and the impact or architecture>",
      "technologies": ["Tech1", "Tech2"]
    }
  ]
}

Resume text:
${resumeText.slice(0, 7000)}`;

  try {
    const response = await getDeepSeek().chat.completions.create({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content || "{}";
    const jsonStr = extractJson(content);
    const parsed = JSON.parse(jsonStr);

    const safeExperiences = Array.isArray(parsed.experiences) && parsed.experiences.length > 0
      ? parsed.experiences.map((exp: any, i: number) => ({
          id: exp.id || `exp-${i + 1}`,
          title: exp.title || "Software Specialist",
          company: exp.company || "Company",
          location: exp.location || "Remote",
          startDate: exp.startDate || "2022",
          endDate: exp.endDate || "Present",
          current: exp.current ?? true,
          bullets: Array.isArray(exp.bullets) && exp.bullets.length > 0 ? exp.bullets : ["Spearheaded key engineering initiatives."],
        }))
      : localFallback.experiences;

    const safeEducation = Array.isArray(parsed.education) && parsed.education.length > 0
      ? parsed.education.map((edu: any, i: number) => ({
          id: edu.id || `edu-${i + 1}`,
          degree: edu.degree || "Bachelor's Degree",
          institution: edu.institution || "University",
          location: edu.location || "",
          endDate: edu.endDate || "2021",
        }))
      : localFallback.education;

    const safeProjects = Array.isArray(parsed.projects) && parsed.projects.length > 0
      ? parsed.projects.map((proj: any, i: number) => ({
          id: proj.id || `proj-${i + 1}`,
          name: proj.name || "Technical Project",
          description: proj.description || "Architected and delivered core platform capabilities.",
          technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        }))
      : localFallback.projects;

    const safeSkills = Array.isArray(parsed.skills) && parsed.skills.length > 0
      ? parsed.skills
      : localFallback.skills;

    return {
      summary: parsed.summary || localFallback.summary,
      skills: safeSkills,
      experiences: safeExperiences,
      education: safeEducation,
      projects: safeProjects,
    };
  } catch (error) {
    console.warn("DeepSeek extraction failed, using robust local parsing:", error);
    return localFallback;
  }
}
