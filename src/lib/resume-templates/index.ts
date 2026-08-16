import { ResumeData, ResumeTemplate } from './types';
import { classicCorporateTemplate } from './templates/classic-corporate';
import { techModernTemplate } from './templates/tech-modern';
import { executiveMinimalTemplate } from './templates/executive-minimal';
import { creativePortfolioTemplate } from './templates/creative-portfolio';
import { academicScholarTemplate } from './templates/academic-scholar';
import { federalComplianceTemplate } from './templates/federal-compliance';

export * from './types';
export * from './renderer';
export * from './pdf-export';
export * from './docx-export';

export {
  classicCorporateTemplate,
  techModernTemplate,
  executiveMinimalTemplate,
  creativePortfolioTemplate,
  academicScholarTemplate,
  federalComplianceTemplate,
};

/**
 * Array of all 6 professionally curated resume templates.
 */
export const ALL_TEMPLATES: ResumeTemplate[] = [
  classicCorporateTemplate,
  techModernTemplate,
  executiveMinimalTemplate,
  creativePortfolioTemplate,
  academicScholarTemplate,
  federalComplianceTemplate,
];

// Alias for convenience
export const RESUME_TEMPLATES = ALL_TEMPLATES;

/**
 * Default fallback template.
 */
export const DEFAULT_TEMPLATE: ResumeTemplate = classicCorporateTemplate;

/**
 * Finds a template by its unique identifier or returns the default.
 */
export function getTemplateById(id?: string | null): ResumeTemplate {
  if (!id) return DEFAULT_TEMPLATE;
  return ALL_TEMPLATES.find((t) => t.id === id) || DEFAULT_TEMPLATE;
}

/**
 * High-quality comprehensive sample resume data for instant preview & starting point.
 */
export const DEFAULT_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Alex Morgan',
    headline: 'Staff AI & Full-Stack Systems Engineer',
    email: 'alex.morgan@example.com',
    phone: '+1 (555) 349-2810',
    location: 'San Francisco, CA',
    website: 'https://alexmorgan.dev',
    linkedin: 'https://linkedin.com/in/alex-morgan-engineer',
    github: 'https://github.com/alexmorgan',
    summary:
      'Results-driven Staff Engineer with 8+ years of experience architecting distributed cloud systems, LLM-powered enterprise workflows, and high-throughput microservices. Proven track record scaling platforms from 0 to 5M+ MAU, cutting API latency by **48%**, and mentoring high-performing engineering teams.',
  },
  experiences: [
    {
      id: 'exp-1',
      title: 'Staff Software Engineer - AI Platforms',
      company: 'Apex Neural Dynamics',
      location: 'San Francisco, CA',
      startDate: '2022',
      endDate: 'Present',
      current: true,
      bullets: [
        'Architected multi-agent AI orchestration pipeline processing **12M+ tokens/day**, reducing inference compute cost by **38%**.',
        'Engineered low-latency semantic search subsystem using pgvector & Next.js 16, dropping P99 retrieval latency from **420ms to 65ms**.',
        'Spearheaded technical roadmap for 14-engineer platform pod, maintaining **99.98% SLA** uptime across multi-region Kubernetes clusters.',
      ],
    },
    {
      id: 'exp-2',
      title: 'Senior Full-Stack Engineer',
      company: 'CloudScale Solutions',
      location: 'Austin, TX',
      startDate: '2019',
      endDate: '2022',
      current: false,
      bullets: [
        'Designed and deployed zero-downtime event-driven microservices architecture using Node.js, Kafka, and PostgreSQL serving **3.5M active users**.',
        'Refactored mission-critical billing integration with Stripe webhooks, preventing **$450K+** in annual involuntary subscription churn.',
        'Established CI/CD deployment pipelines with automated linting, unit tests, and canary releases, cutting release cycles from **2 weeks to 20 minutes**.',
      ],
    },
    {
      id: 'exp-3',
      title: 'Software Engineer',
      company: 'Vanguard Tech Labs',
      location: 'Seattle, WA',
      startDate: '2017',
      endDate: '2019',
      current: false,
      bullets: [
        'Built responsive client dashboard interfaces using React, TypeScript, and Tailwind CSS, increasing user engagement by **32%**.',
        'Optimized database query performance and PostgreSQL index strategies, cutting average query execution time by **60%**.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.S. in Computer Science & Artificial Intelligence',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      startDate: '2013',
      endDate: '2017',
      gpa: '3.88 / 4.0',
      highlights: [
        "Dean's Honor List (4 consecutive years)",
        'Capstone Project: Distributed Consensus & Fault-Tolerant Raft Protocol Implementation in Go',
      ],
    },
  ],
  skills: [
    {
      category: 'Languages & Frameworks',
      skills: [
        'TypeScript',
        'JavaScript',
        'Python',
        'Go',
        'React 19',
        'Next.js 16',
        'Node.js',
        'Tailwind CSS',
      ],
    },
    {
      category: 'AI & Machine Learning',
      skills: [
        'OpenAI SDK',
        'DeepSeek',
        'LangChain',
        'pgvector',
        'RAG Pipelines',
        'Prompt Engineering',
        'Fine-tuning',
      ],
    },
    {
      category: 'Cloud & DevOps',
      skills: [
        'AWS (ECS, Lambda, S3, RDS)',
        'Docker',
        'Kubernetes',
        'PostgreSQL',
        'Redis',
        'Kafka',
        'CI/CD',
        'Terraform',
      ],
    },
    {
      category: 'Engineering Leadership',
      skills: [
        'System Architecture',
        'Agile / Scrum',
        'Technical Roadmapping',
        'Code Reviews',
        'Cross-Functional Mentorship',
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'OmniJob AI - ATS Resume Engine',
      description:
        'High-accuracy ATS resume parsing and optimization engine featuring sub-second keyword matching, deep scoring vectors, and dynamic template compilation.',
      technologies: [
        'Next.js 16',
        'TypeScript',
        'Prisma',
        'pgvector',
        'Tailwind CSS',
        'PDFKit',
        'Docx',
      ],
      link: 'https://github.com/alexmorgan/omnijob-ats',
    },
    {
      id: 'proj-2',
      name: 'HyperVector - Distributed Embedding Cache',
      description:
        'Open-source in-memory vector cache achieving sub-5ms cosine similarity lookups for high-concurrency LLM inference applications.',
      technologies: ['Go', 'gRPC', 'Redis', 'SIMD'],
      link: 'https://github.com/alexmorgan/hypervector',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Professional',
      issuer: 'Amazon Web Services',
      issueDate: '2023',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
    {
      id: 'cert-2',
      name: 'Certified Kubernetes Administrator (CKA)',
      issuer: 'Cloud Native Computing Foundation (CNCF)',
      issueDate: '2022',
      credentialUrl: 'https://www.cncf.io/certification/cka',
    },
  ],
  customSections: [
    {
      id: 'cust-1',
      title: 'Honors & Open Source Contributions',
      items: [
        'Core contributor to open-source TypeScript ATS parser ecosystem with **3,000+ GitHub Stars**.',
        "Keynote speaker at West Coast Cloud Architecture Summit 2024 on 'Cost-Effective AI Agent Systems'.",
      ],
    },
  ],
};
