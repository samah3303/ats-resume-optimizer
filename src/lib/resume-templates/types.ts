export interface PersonalInfo {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate?: string;
  endDate: string;
  gpa?: string;
  highlights?: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  items: string[];
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  customSections?: CustomSectionItem[];
}

export type TemplateCategory =
  | 'Corporate'
  | 'Tech'
  | 'Executive'
  | 'Creative'
  | 'Academic'
  | 'Federal';

export type TemplateLayout =
  | 'single-column'
  | 'two-column'
  | 'header-accent'
  | 'compact';

export interface ResumeTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  atsScore: number;
  description: string;
  fontFamily: string;
  headingColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  layout: TemplateLayout;
}
