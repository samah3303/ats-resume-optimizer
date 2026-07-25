/**
 * Local Deterministic Keyword & Skill Extractor
 * Calculates keyword match %, hard skills present/missing, format score, and impact score
 * 100% locally in TypeScript at ZERO API cost.
 */

const COMMON_TECH_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Express", "Python",
  "Django", "Flask", "Java", "Spring Boot", "C++", "C#", ".NET", "PHP", "Laravel",
  "Ruby", "Rails", "Go", "Golang", "Rust", "SQL", "PostgreSQL", "MySQL", "MongoDB",
  "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "DevOps", "CI/CD",
  "Git", "GitHub", "REST API", "GraphQL", "Microservices", "HTML", "CSS",
  "Tailwind CSS", "Bootstrap", "Redux", "Zustand", "Jest", "Cypress", "PyTest",
  "Figma", "Jira", "Agile", "Scrum", "Linux", "Kafka", "Elasticsearch"
];

const COMMON_SOFT_SKILLS = [
  "Leadership", "Communication", "Problem Solving", "Teamwork", "Project Management",
  "Critical Thinking", "Adaptability", "Time Management", "Collaboration", "Mentorship"
];

export interface LocalKeywordMatchResult {
  keywordsMatchPct: number;
  formatScore: number;
  impactScore: number;
  keywords: {
    matched: string[];
    missing: string[];
  };
  skills: {
    present: string[];
    missing: string[];
  };
}

export function pruneJobDescription(rawJd: string): string {
  if (!rawJd) return "";
  // Remove common non-essential disclaimers to save tokens
  let text = rawJd
    .replace(/Equal Opportunity Employer[\s\S]*$/i, "")
    .replace(/Benefits:[\s\S]*$/i, "")
    .replace(/About Us:[\s\S]*?(?=Responsibilities|Requirements|Qualifications)/i, "")
    .trim();

  // Keep first 2,000 words max
  const words = text.split(/\s+/);
  if (words.length > 2000) {
    text = words.slice(0, 2000).join(" ");
  }
  return text;
}

export function extractLocalKeywordMatch(
  resumeText: string,
  jobDescriptionText: string
): LocalKeywordMatchResult {
  const resumeLower = (resumeText || "").toLowerCase();
  const jdLower = (jobDescriptionText || "").toLowerCase();

  // 1. Extract potential tech skills mentioned in JD
  const jdTechSkills = COMMON_TECH_SKILLS.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(jdLower)
  );

  // 2. Extract potential soft skills mentioned in JD
  const jdSoftSkills = COMMON_SOFT_SKILLS.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(jdLower)
  );

  const allJdKeywords = Array.from(new Set([...jdTechSkills, ...jdSoftSkills]));

  // If JD has few recognized keywords, extract top multi-word nouns/terms (3+ chars)
  if (allJdKeywords.length < 5) {
    const rawTokens = jdLower
      .replace(/[^a-z0-9\s]/gi, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !["with", "from", "that", "this", "have", "will", "your", "their", "about", "work"].includes(w));
    
    const tokenFreq: Record<string, number> = {};
    rawTokens.forEach((t) => (tokenFreq[t] = (tokenFreq[t] || 0) + 1));
    
    const topExtracted = Object.entries(tokenFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
    
    allJdKeywords.push(...topExtracted);
  }

  // 3. Match against Resume
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  allJdKeywords.forEach((kw) => {
    const isPresent = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(resumeLower);
    if (isPresent) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const presentSkills = COMMON_TECH_SKILLS.filter((skill) =>
    new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(resumeLower)
  );

  const missingSkills = jdTechSkills.filter((s) => !presentSkills.includes(s));

  // Calculate Match Percentage
  const matchPct = allJdKeywords.length > 0
    ? Math.round((matchedKeywords.length / allJdKeywords.length) * 100)
    : 70;

  // Format Score (Detect formatting issues locally)
  let formatScore = 85;
  if (!/experience|work history|employment/i.test(resumeLower)) formatScore -= 15;
  if (!/education|university|college|degree/i.test(resumeLower)) formatScore -= 10;
  if (!/skills|technical skills|competencies/i.test(resumeLower)) formatScore -= 10;
  if (resumeText.length < 500) formatScore -= 20;

  // Impact Score (Detect numbers/metrics locally)
  const numbersCount = (resumeText.match(/\d+%/g) || []).length + (resumeText.match(/\$\d+/g) || []).length;
  let impactScore = 50 + Math.min(40, numbersCount * 10);

  return {
    keywordsMatchPct: Math.min(100, Math.max(10, matchPct)),
    formatScore: Math.max(30, Math.min(100, formatScore)),
    impactScore: Math.max(30, Math.min(100, impactScore)),
    keywords: {
      matched: matchedKeywords.slice(0, 15),
      missing: missingKeywords.slice(0, 15),
    },
    skills: {
      present: presentSkills.slice(0, 15),
      missing: missingSkills.slice(0, 15),
    },
  };
}
