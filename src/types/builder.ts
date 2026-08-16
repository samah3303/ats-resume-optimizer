export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  graduationYear: string;
  gpa?: string;
  honors?: string;
}

export interface SkillCategory {
  id: string;
  category: string;
  skills: string[];
}

export interface Project {
  id: string;
  name: string;
  role?: string;
  description: string;
  technologies: string[];
  link?: string;
  githubLink?: string;
  bullets?: string[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
  credentialId?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: SkillCategory[];
  projects: Project[];
  certifications: Certification[];
}

export type TemplateCategory =
  | "Corporate"
  | "Tech"
  | "Executive"
  | "Creative"
  | "Academic"
  | "Federal";

export interface ResumeTemplateInfo {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  atsScore: number;
  tags: string[];
  isPopular?: boolean;
  colorScheme: {
    primary: string;
    accent: string;
    background: string;
  };
  fontRecommendation: string;
}

export interface DraftRecord {
  id: string;
  title: string;
  templateId: string;
  data: ResumeData;
  updatedAt: string;
}

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: "Alex Rivera",
    jobTitle: "Senior Full-Stack Software Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA (Open to Remote)",
    linkedin: "https://linkedin.com/in/alex-rivera-tech",
    github: "https://github.com/alexrivera-dev",
    website: "https://alexrivera.dev",
    summary:
      "Results-driven Senior Full-Stack Engineer with 6+ years of experience architecting high-throughput distributed systems and responsive web applications. Proven track record reducing API latency by 42% and scaling microservices to 1.2M+ MAU. Passionate about Next.js, TypeScript, cloud-native architectures, and developer tooling.",
  },
  experience: [
    {
      id: "exp-1",
      title: "Senior Full-Stack Engineer",
      company: "Apex Cloud Technologies",
      location: "San Francisco, CA",
      startDate: "2022-03",
      endDate: "Present",
      current: true,
      bullets: [
        "Architected scalable Next.js and TypeScript micro-frontends serving 1.2M monthly active users with 99.98% uptime.",
        "Refactored mission-critical GraphQL & Node.js payment gateways, decreasing p99 latency from 450ms to 120ms (73% improvement).",
        "Spearheaded adoption of automated CI/CD pipeline using GitHub Actions & Docker, reducing deployment cycle time from 40 min to 6 min.",
        "Mentored team of 5 junior and mid-level engineers through structured bi-weekly code reviews and architecture design sessions.",
      ],
    },
    {
      id: "exp-2",
      title: "Software Engineer",
      company: "HyperScale Media Labs",
      location: "Austin, TX",
      startDate: "2019-06",
      endDate: "2022-02",
      current: false,
      bullets: [
        "Developed real-time collaborative analytics dashboard using React, Tailwind CSS, PostgreSQL, and WebSockets.",
        "Designed and implemented Redis caching layer that decreased database query load by 60% during traffic surges.",
        "Collaborated closely with product and UX design teams to ship 14 core features on tight quarterly roadmaps.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      degree: "B.S. in Computer Science",
      institution: "University of California, Berkeley",
      location: "Berkeley, CA",
      graduationYear: "2019",
      gpa: "3.85 / 4.0",
      honors: "Dean's Honor List, Cum Laude",
    },
  ],
  skills: [
    {
      id: "skill-1",
      category: "Languages & Frameworks",
      skills: ["TypeScript", "JavaScript (ESNext)", "React 19", "Next.js 16", "Node.js", "Python", "Go"],
    },
    {
      id: "skill-2",
      category: "Cloud, DevOps & Databases",
      skills: ["AWS (ECS, Lambda, S3)", "Docker", "PostgreSQL", "Prisma ORM", "Redis", "GraphQL", "Tailwind CSS", "Git"],
    },
    {
      id: "skill-3",
      category: "Architecture & Practices",
      skills: ["Microservices", "RESTful APIs", "CI/CD Pipelines", "System Design", "Agile / Scrum", "Unit & E2E Testing"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "OmniMetrics AI Analytics Engine",
      role: "Creator & Lead Developer",
      description: "Open-source distributed telemetry pipeline and dashboard processing 50k events/sec with sub-second querying.",
      technologies: ["Next.js", "TypeScript", "ClickHouse", "Tailwind CSS", "Docker"],
      link: "https://omnimetrics.io",
      githubLink: "https://github.com/alexrivera-dev/omnimetrics",
      bullets: [
        "Authored custom time-series aggregation query engine handling 50M+ rows with 15ms response latency.",
        "Attracted 2.4k+ GitHub stars and active contributions from 18 developers worldwide.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2023-08",
      credentialId: "AWS-PSA-90821",
      credentialUrl: "https://aws.amazon.com/verification",
    },
  ],
};
