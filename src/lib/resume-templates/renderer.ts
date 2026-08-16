import {
  ResumeData,
  ResumeTemplate,
  SkillCategory,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificationItem,
  CustomSectionItem,
} from './types';
import { classicCorporateTemplate } from './templates/classic-corporate';
import { techModernTemplate } from './templates/tech-modern';
import { executiveMinimalTemplate } from './templates/executive-minimal';
import { creativePortfolioTemplate } from './templates/creative-portfolio';
import { academicScholarTemplate } from './templates/academic-scholar';
import { federalComplianceTemplate } from './templates/federal-compliance';

const TEMPLATES_RECORD: Record<string, ResumeTemplate> = {
  'classic-corporate': classicCorporateTemplate,
  'tech-modern': techModernTemplate,
  'executive-minimal': executiveMinimalTemplate,
  'creative-portfolio': creativePortfolioTemplate,
  'academic-scholar': academicScholarTemplate,
  'federal-compliance': federalComplianceTemplate,
};

function resolveTemplate(templateOrId?: ResumeTemplate | string | null): ResumeTemplate {
  if (!templateOrId) return classicCorporateTemplate;
  if (typeof templateOrId === 'object' && templateOrId.id) return templateOrId;
  return TEMPLATES_RECORD[String(templateOrId)] || classicCorporateTemplate;
}

/**
 * Escapes HTML entities to prevent XSS injection.
 */
function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Parses markdown inline bold (**text**) into <strong>text</strong> tags.
 */
function formatMarkdown(text?: string | null): string {
  if (!text) return '';
  const escaped = escapeHtml(text);
  return escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

/**
 * Renders complete, responsive, print-perfect A4 HTML for any resume template.
 */
export function renderResumeToHtml(
  data: ResumeData,
  templateOrId: ResumeTemplate | string = 'classic-corporate'
): string {
  const template = resolveTemplate(templateOrId);

  const {
    personalInfo = {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
    },
    experiences = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    customSections = [],
  } = data || {};

  const {
    fontFamily = "'Inter', sans-serif",
    headingColor = '#0F172A',
    accentColor = '#1E3A8A',
    textColor = '#1F2937',
    backgroundColor = '#FFFFFF',
    layout = 'single-column',
    id: templateId,
  } = template;

  const isSerif = template.category === 'Corporate' || template.category === 'Academic';
  const isCompact = layout === 'compact' || templateId === 'federal-compliance';
  const isTwoColumn = layout === 'two-column';
  const isHeaderAccent = layout === 'header-accent';

  // Contact items helper
  const contactLinks: string[] = [];
  if (personalInfo.email) {
    contactLinks.push(`
      <a href="mailto:${escapeHtml(personalInfo.email)}" class="contact-item">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <span>${escapeHtml(personalInfo.email)}</span>
      </a>
    `);
  }
  if (personalInfo.phone) {
    contactLinks.push(`
      <a href="tel:${escapeHtml(personalInfo.phone)}" class="contact-item">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span>${escapeHtml(personalInfo.phone)}</span>
      </a>
    `);
  }
  if (personalInfo.location) {
    contactLinks.push(`
      <span class="contact-item">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${escapeHtml(personalInfo.location)}</span>
      </span>
    `);
  }
  if (personalInfo.linkedin) {
    const cleanUrl = personalInfo.linkedin.startsWith('http')
      ? personalInfo.linkedin
      : `https://${personalInfo.linkedin}`;
    const displayUrl = personalInfo.linkedin.replace(
      /^https?:\/\/(www\.)?linkedin\.com\/in\//i,
      'linkedin.com/in/'
    );
    contactLinks.push(`
      <a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener noreferrer" class="contact-item">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.4 1.4 0 1 0 0-2.8 1.4 1.4 0 0 0 0 2.8m1.4 9.74V9.94H5.06v8.56z"/></svg>
        <span>${escapeHtml(displayUrl)}</span>
      </a>
    `);
  }
  if (personalInfo.github) {
    const cleanUrl = personalInfo.github.startsWith('http')
      ? personalInfo.github
      : `https://${personalInfo.github}`;
    const displayUrl = personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github.com/');
    contactLinks.push(`
      <a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener noreferrer" class="contact-item">
        <svg class="icon" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
        <span>${escapeHtml(displayUrl)}</span>
      </a>
    `);
  }
  if (personalInfo.website) {
    const cleanUrl = personalInfo.website.startsWith('http')
      ? personalInfo.website
      : `https://${personalInfo.website}`;
    const displayUrl = personalInfo.website.replace(/^https?:\/\/(www\.)?/i, '');
    contactLinks.push(`
      <a href="${escapeHtml(cleanUrl)}" target="_blank" rel="noopener noreferrer" class="contact-item">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        <span>${escapeHtml(displayUrl)}</span>
      </a>
    `);
  }

  // Section renderers
  const renderSummary = () => {
    if (!personalInfo.summary) return '';
    return `
      <section class="resume-section">
        <h2 class="section-title">
          <span>${template.category === 'Academic' ? 'Research Profile & Executive Summary' : 'Professional Summary'}</span>
        </h2>
        <div class="section-content summary-text">
          <p>${formatMarkdown(personalInfo.summary)}</p>
        </div>
      </section>
    `;
  };

  const renderExperience = () => {
    if (!experiences || experiences.length === 0) return '';
    const sectionTitle =
      template.category === 'Academic' ? 'Academic & Professional Appointments' : 'Work Experience';
    return `
      <section class="resume-section">
        <h2 class="section-title">
          <span>${sectionTitle}</span>
        </h2>
        <div class="section-content experience-list">
          ${experiences
            .map(
              (exp: ExperienceItem) => `
            <div class="experience-item">
              <div class="item-header">
                <div class="item-main">
                  <h3 class="item-title">${escapeHtml(exp.title)}</h3>
                  <div class="item-company">${escapeHtml(exp.company)}${
                exp.location
                  ? `<span class="location-sep"> • </span><span class="item-location">${escapeHtml(
                      exp.location
                    )}</span>`
                  : ''
              }</div>
                </div>
                <div class="item-date">
                  <span class="date-badge">${escapeHtml(exp.startDate)} – ${
                exp.current ? '<span class="current-tag">Present</span>' : escapeHtml(exp.endDate)
              }</span>
                </div>
              </div>
              ${
                exp.bullets && exp.bullets.length > 0
                  ? `
                <ul class="bullet-list">
                  ${exp.bullets.map((b) => `<li>${formatMarkdown(b)}</li>`).join('')}
                </ul>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `;
  };

  const renderProjects = () => {
    if (!projects || projects.length === 0) return '';
    const sectionTitle =
      template.category === 'Academic' ? 'Selected Research Projects & Grants' : 'Featured Projects';
    return `
      <section class="resume-section">
        <h2 class="section-title">
          <span>${sectionTitle}</span>
        </h2>
        <div class="section-content projects-grid">
          ${projects
            .map(
              (proj: ProjectItem) => `
            <div class="project-card">
              <div class="item-header">
                <div class="item-main">
                  <h3 class="item-title">
                    ${escapeHtml(proj.name)}
                    ${
                      proj.link
                        ? `<a href="${escapeHtml(
                            proj.link.startsWith('http') ? proj.link : `https://${proj.link}`
                          )}" target="_blank" rel="noopener noreferrer" class="project-link-icon">🔗</a>`
                        : ''
                    }
                  </h3>
                </div>
              </div>
              <p class="project-desc">${formatMarkdown(proj.description)}</p>
              ${
                proj.technologies && proj.technologies.length > 0
                  ? `
                <div class="tech-pills">
                  ${proj.technologies
                    .map((t) => `<span class="tech-pill">${escapeHtml(t)}</span>`)
                    .join('')}
                </div>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `;
  };

  const renderEducation = () => {
    if (!education || education.length === 0) return '';
    return `
      <section class="resume-section">
        <h2 class="section-title">
          <span>Education & Credentials</span>
        </h2>
        <div class="section-content education-list">
          ${education
            .map(
              (edu: EducationItem) => `
            <div class="education-item">
              <div class="item-header">
                <div class="item-main">
                  <h3 class="item-title">${escapeHtml(edu.degree)}</h3>
                  <div class="item-company">${escapeHtml(edu.institution)}${
                edu.location
                  ? `<span class="location-sep"> • </span><span class="item-location">${escapeHtml(
                      edu.location
                    )}</span>`
                  : ''
              }</div>
                </div>
                <div class="item-date">
                  <span class="date-badge">${edu.startDate ? `${escapeHtml(edu.startDate)} – ` : ''}${escapeHtml(
                edu.endDate
              )}</span>
                  ${edu.gpa ? `<div class="gpa-tag">GPA: ${escapeHtml(edu.gpa)}</div>` : ''}
                </div>
              </div>
              ${
                edu.highlights && edu.highlights.length > 0
                  ? `
                <ul class="bullet-list">
                  ${edu.highlights.map((h) => `<li>${formatMarkdown(h)}</li>`).join('')}
                </ul>
              `
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `;
  };

  const renderSkills = (asSidebar = false) => {
    if (!skills || skills.length === 0) return '';
    return `
      <section class="resume-section skills-section ${asSidebar ? 'sidebar-skills' : ''}">
        <h2 class="section-title">
          <span>Skills & Core Competencies</span>
        </h2>
        <div class="section-content skill-categories">
          ${skills
            .map(
              (cat: SkillCategory) => `
            <div class="skill-category-block">
              <span class="skill-cat-title">${escapeHtml(cat.category)}:</span>
              <div class="skill-tags">
                ${cat.skills.map((s) => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `;
  };

  const renderCertifications = () => {
    if (!certifications || certifications.length === 0) return '';
    return `
      <section class="resume-section">
        <h2 class="section-title">
          <span>Certifications & Licensures</span>
        </h2>
        <div class="section-content cert-list">
          ${certifications
            .map(
              (cert: CertificationItem) => `
            <div class="cert-item">
              <div class="cert-info">
                <strong class="cert-name">${escapeHtml(cert.name)}</strong>
                <span class="cert-issuer"> – ${escapeHtml(cert.issuer)}</span>
              </div>
              <div class="cert-meta">
                <span class="cert-date">${escapeHtml(cert.issueDate)}</span>
                ${
                  cert.credentialUrl
                    ? `<a href="${escapeHtml(
                        cert.credentialUrl
                      )}" target="_blank" rel="noopener noreferrer" class="cert-link">Verify</a>`
                    : ''
                }
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </section>
    `;
  };

  const renderCustomSections = () => {
    if (!customSections || customSections.length === 0) return '';
    return customSections
      .map(
        (sec: CustomSectionItem) => `
      <section class="resume-section">
        <h2 class="section-title">
          <span>${escapeHtml(sec.title)}</span>
        </h2>
        <div class="section-content">
          <ul class="bullet-list">
            ${sec.items.map((item) => `<li>${formatMarkdown(item)}</li>`).join('')}
          </ul>
        </div>
      </section>
    `
      )
      .join('');
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(personalInfo.fullName || 'Resume')} - OmniJob AI</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      background-color: #F3F4F6;
      color: ${textColor};
      font-family: ${fontFamily};
      font-size: ${isCompact ? '12px' : '13px'};
      line-height: ${isCompact ? '1.35' : '1.5'};
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      padding: 24px 0;
    }

    .a4-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: ${backgroundColor};
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      padding: ${isCompact ? '16mm 16mm' : '18mm 18mm'};
      position: relative;
      overflow: hidden;
    }

    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
      }
      .a4-page {
        width: 100% !important;
        min-height: 100% !important;
        margin: 0 !important;
        box-shadow: none !important;
        padding: ${isCompact ? '12mm 12mm' : '14mm 14mm'} !important;
      }
      a {
        text-decoration: none !important;
        color: inherit !important;
      }
    }

    /* Links & Icons */
    a {
      color: inherit;
      text-decoration: none;
    }
    .icon {
      width: 13px;
      height: 13px;
      display: inline-block;
      vertical-align: -1.5px;
      margin-right: 4px;
      stroke-width: 2;
      opacity: 0.85;
      flex-shrink: 0;
    }

    /* Header Accent Top Bar */
    ${
      isHeaderAccent
        ? `
      .header-accent-bar {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 6px;
        background: linear-gradient(90deg, ${accentColor}, #F59E0B);
      }
    `
        : ''
    }

    /* Header Section */
    .resume-header {
      margin-bottom: ${isCompact ? '14px' : '18px'};
      border-bottom: 2px solid ${isHeaderAccent ? accentColor : '#E2E8F0'};
      padding-bottom: ${isCompact ? '12px' : '14px'};
    }

    .classic-header {
      text-align: center;
      border-bottom: 1.5px solid ${accentColor};
    }

    .candidate-name {
      font-size: ${isCompact ? '24px' : '28px'};
      font-weight: 800;
      color: ${headingColor};
      letter-spacing: -0.02em;
      line-height: 1.15;
      text-transform: ${
        template.category === 'Executive' || template.category === 'Federal' ? 'uppercase' : 'none'
      };
    }

    .candidate-headline {
      font-size: ${isCompact ? '13px' : '15px'};
      font-weight: 600;
      color: ${accentColor};
      margin-top: 4px;
      letter-spacing: 0.01em;
    }

    .contact-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px 16px;
      margin-top: 8px;
      font-size: 11.5px;
      color: #4B5563;
      ${isSerif || template.category === 'Corporate' ? 'justify-content: center;' : ''}
    }

    .contact-item {
      display: inline-flex;
      align-items: center;
      transition: color 0.15s ease;
    }
    .contact-item:hover {
      color: ${accentColor};
    }

    /* Section Styles */
    .resume-section {
      margin-bottom: ${isCompact ? '12px' : '16px'};
    }

    .section-title {
      font-size: ${isCompact ? '12px' : '13.5px'};
      font-weight: 700;
      color: ${headingColor};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: ${isCompact ? '6px' : '8px'};
      padding-bottom: 3px;
      border-bottom: 1.5px solid ${accentColor};
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .summary-text {
      color: ${textColor};
      line-height: 1.55;
      text-align: justify;
    }

    /* Experience Items */
    .experience-list, .education-list {
      display: flex;
      flex-direction: column;
      gap: ${isCompact ? '10px' : '14px'};
    }

    .experience-item, .education-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 4px 8px;
    }

    .item-main {
      flex: 1;
      min-width: 200px;
    }

    .item-title {
      font-size: ${isCompact ? '12.5px' : '13.5px'};
      font-weight: 700;
      color: ${headingColor};
    }

    .item-company {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      margin-top: 1px;
    }

    .location-sep {
      color: #9CA3AF;
    }

    .item-location {
      font-weight: 400;
      color: #6B7280;
    }

    .item-date {
      text-align: right;
      font-size: 11.5px;
      color: #4B5563;
      font-weight: 500;
    }

    .date-badge {
      font-family: inherit;
    }

    .current-tag {
      color: ${accentColor};
      font-weight: 700;
    }

    .gpa-tag {
      font-size: 11px;
      color: #059669;
      font-weight: 600;
      margin-top: 1px;
    }

    /* Bullet Lists */
    .bullet-list {
      margin-top: 3px;
      padding-left: 18px;
      list-style-type: disc;
      display: flex;
      flex-direction: column;
      gap: 2.5px;
    }

    .bullet-list li {
      color: ${textColor};
      padding-left: 2px;
      line-height: 1.45;
    }

    .bullet-list li strong {
      color: ${headingColor};
    }

    /* Projects Grid */
    .projects-grid {
      display: flex;
      flex-direction: column;
      gap: ${isCompact ? '8px' : '12px'};
    }

    .project-card {
      ${
        isHeaderAccent || template.category === 'Creative'
          ? `
        background: #F8FAFC;
        border-left: 3px solid ${accentColor};
        border-radius: 4px;
        padding: 8px 12px;
      `
          : ''
      }
    }

    .project-desc {
      font-size: 12px;
      color: ${textColor};
      margin-top: 2px;
      line-height: 1.45;
    }

    .project-link-icon {
      font-size: 11px;
      margin-left: 4px;
      opacity: 0.7;
    }

    .tech-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 5px;
    }

    .tech-pill {
      font-size: 10.5px;
      padding: 1px 6px;
      background: #E2E8F0;
      color: #1E293B;
      border-radius: 4px;
      font-weight: 500;
    }

    /* Skills */
    .skill-categories {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .skill-category-block {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 4px 8px;
      font-size: 12px;
    }

    .skill-cat-title {
      font-weight: 700;
      color: ${headingColor};
      min-width: 110px;
    }

    .skill-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      flex: 1;
    }

    .skill-tag {
      background: ${isHeaderAccent ? '#FEF3C7' : '#F1F5F9'};
      color: ${isHeaderAccent ? '#92400E' : '#334155'};
      border: 1px solid ${isHeaderAccent ? '#FDE68A' : '#E2E8F0'};
      font-size: 11px;
      font-weight: 500;
      padding: 1px 7px;
      border-radius: 4px;
    }

    /* Certifications */
    .cert-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .cert-item {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-size: 12px;
    }

    .cert-name {
      color: ${headingColor};
    }

    .cert-issuer {
      color: #64748B;
    }

    .cert-meta {
      font-size: 11px;
      color: #6B7280;
      display: flex;
      gap: 8px;
    }

    .cert-link {
      color: ${accentColor};
      text-decoration: underline;
    }

    /* Two-Column Layout Specifics */
    ${
      isTwoColumn
        ? `
      .two-col-container {
        display: flex;
        gap: 20px;
      }
      .col-main {
        flex: 1.8;
      }
      .col-side {
        flex: 1.2;
        background: #F8FAFC;
        padding: 14px;
        border-radius: 8px;
        border: 1px solid #E2E8F0;
      }
      .col-side .resume-section:last-child {
        margin-bottom: 0;
      }
      .col-side .section-title {
        font-size: 12px;
        border-bottom-color: ${accentColor};
      }
      .sidebar-skills .skill-category-block {
        flex-direction: column;
        gap: 2px;
      }
      .sidebar-skills .skill-cat-title {
        min-width: unset;
      }
    `
        : ''
    }
  </style>
</head>
<body>
  <div class="a4-page">
    ${isHeaderAccent ? '<div class="header-accent-bar"></div>' : ''}

    <!-- Candidate Header -->
    <header class="resume-header ${
      isSerif && template.category === 'Corporate' ? 'classic-header' : ''
    }">
      <h1 class="candidate-name">${escapeHtml(personalInfo.fullName || 'Candidate Name')}</h1>
      ${
        personalInfo.headline
          ? `<div class="candidate-headline">${escapeHtml(personalInfo.headline)}</div>`
          : ''
      }
      ${
        contactLinks.length > 0
          ? `
        <div class="contact-row">
          ${contactLinks.join('')}
        </div>
      `
          : ''
      }
    </header>

    ${
      isTwoColumn
        ? `
      <!-- Two Column Body -->
      <div class="two-col-container">
        <main class="col-main">
          ${renderSummary()}
          ${renderExperience()}
          ${renderProjects()}
          ${renderCustomSections()}
        </main>
        <aside class="col-side">
          ${renderSkills(true)}
          ${renderEducation()}
          ${renderCertifications()}
        </aside>
      </div>
    `
        : `
      <!-- Single Column / Standard Body -->
      <main>
        ${renderSummary()}
        ${renderExperience()}
        ${renderSkills(false)}
        ${renderProjects()}
        ${renderEducation()}
        ${renderCertifications()}
        ${renderCustomSections()}
      </main>
    `
    }
  </div>
</body>
</html>`;
}
