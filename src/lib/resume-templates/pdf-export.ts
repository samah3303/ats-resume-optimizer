import PDFDocument from 'pdfkit';
import { ResumeData, ResumeTemplate } from './types';
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
 * Generates a high-fidelity, ATS-compliant PDF buffer for any resume template.
 */
export async function generateTemplatePdf(
  data: ResumeData,
  templateOrId: ResumeTemplate | string = 'classic-corporate'
): Promise<Buffer> {
  const template = resolveTemplate(templateOrId);

  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const isCompact = template.layout === 'compact' || template.id === 'federal-compliance';
      const isSerif =
        template.category === 'Corporate' ||
        template.category === 'Academic' ||
        template.fontFamily.toLowerCase().includes('times') ||
        template.fontFamily.toLowerCase().includes('garamond') ||
        template.fontFamily.toLowerCase().includes('serif');

      const fontRegular = isSerif ? 'Times-Roman' : 'Helvetica';
      const fontBold = isSerif ? 'Times-Bold' : 'Helvetica-Bold';
      const fontItalic = isSerif ? 'Times-Italic' : 'Helvetica-Oblique';

      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: isCompact ? 30 : 36,
          bottom: isCompact ? 30 : 36,
          left: isCompact ? 35 : 40,
          right: isCompact ? 35 : 40,
        },
        autoFirstPage: true,
        bufferPages: true,
      });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      const primaryColor = template.headingColor || '#0F172A';
      const accentColor = template.accentColor || '#1E3A8A';
      const bodyColor = template.textColor || '#1F2937';
      const mutedColor = '#64748B';

      const leftMargin = isCompact ? 35 : 40;
      const rightMargin = isCompact ? 35 : 40;
      const pageWidth = doc.page.width;
      const contentWidth = pageWidth - leftMargin - rightMargin;

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

      // 1. Header Top Accent Bar if header-accent layout
      if (template.layout === 'header-accent') {
        doc.rect(0, 0, pageWidth, 5).fill(accentColor);
        doc.moveDown(0.4);
      }

      // 2. Candidate Header (Name, Title, Contact)
      const isCentered = isSerif && template.category === 'Corporate';

      doc
        .font(fontBold)
        .fontSize(isCompact ? 20 : 22)
        .fillColor(primaryColor)
        .text(
          template.category === 'Executive' || template.category === 'Federal'
            ? personalInfo.fullName.toUpperCase()
            : personalInfo.fullName,
          leftMargin,
          doc.y,
          {
            align: isCentered ? 'center' : 'left',
            width: contentWidth,
          }
        );

      if (personalInfo.headline) {
        doc.moveDown(0.2);
        doc
          .font(fontBold)
          .fontSize(isCompact ? 10.5 : 11.5)
          .fillColor(accentColor)
          .text(personalInfo.headline, leftMargin, doc.y, {
            align: isCentered ? 'center' : 'left',
            width: contentWidth,
          });
      }

      // Contact details
      const contactParts: string[] = [];
      if (personalInfo.email) contactParts.push(personalInfo.email);
      if (personalInfo.phone) contactParts.push(personalInfo.phone);
      if (personalInfo.location) contactParts.push(personalInfo.location);
      if (personalInfo.linkedin)
        contactParts.push(
          personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, 'linkedin: ')
        );
      if (personalInfo.github)
        contactParts.push(
          personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//i, 'github: ')
        );
      if (personalInfo.website)
        contactParts.push(personalInfo.website.replace(/^https?:\/\/(www\.)?/i, ''));

      if (contactParts.length > 0) {
        doc.moveDown(0.25);
        doc
          .font(fontRegular)
          .fontSize(isCompact ? 8.5 : 9)
          .fillColor(mutedColor)
          .text(contactParts.join('  •  '), leftMargin, doc.y, {
            align: isCentered ? 'center' : 'left',
            width: contentWidth,
          });
      }

      doc.moveDown(0.4);
      // Header divider line
      const headerLineY = doc.y;
      doc
        .moveTo(leftMargin, headerLineY)
        .lineTo(pageWidth - rightMargin, headerLineY)
        .strokeColor(accentColor)
        .lineWidth(1.2)
        .stroke();
      doc.moveDown(0.4);

      // Section Header Helper
      const drawSectionHeader = (title: string) => {
        doc.moveDown(0.4);
        doc
          .font(fontBold)
          .fontSize(isCompact ? 10.5 : 11.5)
          .fillColor(primaryColor)
          .text(title.toUpperCase(), leftMargin, doc.y, { width: contentWidth });

        const lineY = doc.y + 1;
        doc
          .moveTo(leftMargin, lineY)
          .lineTo(pageWidth - rightMargin, lineY)
          .strokeColor(accentColor)
          .lineWidth(0.8)
          .stroke();

        doc.moveDown(0.3);
      };

      // Inline Bold Markdown Helper
      const renderFormattedText = (
        rawText: string,
        fontSize: number = 9.5,
        isBullet: boolean = false,
        bulletIndent: number = 12
      ) => {
        const textX = isBullet ? leftMargin + bulletIndent : leftMargin;
        const availWidth = isBullet ? contentWidth - bulletIndent : contentWidth;

        if (isBullet) {
          doc
            .font(fontBold)
            .fontSize(fontSize)
            .fillColor(accentColor)
            .text('• ', leftMargin + 2, doc.y, {
              continued: true,
            });
        }

        const segments = rawText.split(/(\*\*.*?\*\*)/g);
        let continued = false;

        for (let i = 0; i < segments.length; i++) {
          const seg = segments[i];
          if (!seg) continue;

          const isBold = seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4;
          const clean = isBold ? seg.slice(2, -2) : seg;
          const isLast = i === segments.length - 1;

          doc
            .font(isBold ? fontBold : fontRegular)
            .fontSize(fontSize)
            .fillColor(isBold ? primaryColor : bodyColor)
            .text(clean, {
              continued: !isLast,
              lineGap: 1.5,
              width: availWidth,
            });

          continued = !isLast;
        }

        if (continued) {
          doc.text('');
        }
        doc.moveDown(0.15);
      };

      // 3. Professional Summary
      if (personalInfo.summary) {
        const summaryTitle =
          template.category === 'Academic' ? 'Research Profile & Summary' : 'Professional Summary';
        drawSectionHeader(summaryTitle);
        renderFormattedText(personalInfo.summary, isCompact ? 9 : 9.5);
      }

      // 4. Work Experience
      if (experiences.length > 0) {
        const expTitle =
          template.category === 'Academic'
            ? 'Academic & Professional Appointments'
            : 'Work Experience';
        drawSectionHeader(expTitle);

        for (const exp of experiences) {
          const startY = doc.y;

          // Job Title & Company (Left)
          doc
            .font(fontBold)
            .fontSize(isCompact ? 9.5 : 10.5)
            .fillColor(primaryColor)
            .text(exp.title, leftMargin, startY, {
              continued: true,
            })
            .font(fontRegular)
            .fillColor(mutedColor)
            .text(`  |  ${exp.company}${exp.location ? ` (${exp.location})` : ''}`, {
              continued: false,
              width: contentWidth - 120,
            });

          // Dates (Right Aligned on same row)
          const dateStr = `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`;
          doc
            .font(fontBold)
            .fontSize(isCompact ? 8.5 : 9)
            .fillColor(exp.current ? accentColor : mutedColor)
            .text(dateStr, leftMargin, startY, {
              align: 'right',
              width: contentWidth,
            });

          doc.moveDown(0.1);

          // Bullets
          if (exp.bullets && exp.bullets.length > 0) {
            for (const bullet of exp.bullets) {
              renderFormattedText(bullet, isCompact ? 8.5 : 9.2, true, 12);
            }
          }
          doc.moveDown(0.25);
        }
      }

      // 5. Skills & Core Competencies
      if (skills.length > 0) {
        drawSectionHeader('Skills & Core Competencies');

        for (const cat of skills) {
          doc
            .font(fontBold)
            .fontSize(isCompact ? 8.5 : 9.2)
            .fillColor(primaryColor)
            .text(`${cat.category}: `, leftMargin, doc.y, {
              continued: true,
            })
            .font(fontRegular)
            .fillColor(bodyColor)
            .text(cat.skills.join(', '), {
              continued: false,
              lineGap: 1.5,
              width: contentWidth,
            });

          doc.moveDown(0.12);
        }
      }

      // 6. Featured Projects
      if (projects.length > 0) {
        const projTitle =
          template.category === 'Academic' ? 'Selected Research & Projects' : 'Featured Projects';
        drawSectionHeader(projTitle);

        for (const proj of projects) {
          const startY = doc.y;

          doc
            .font(fontBold)
            .fontSize(isCompact ? 9.5 : 10)
            .fillColor(primaryColor)
            .text(proj.name, leftMargin, startY, {
              continued: proj.technologies && proj.technologies.length > 0,
            });

          if (proj.technologies && proj.technologies.length > 0) {
            doc
              .font(fontItalic)
              .fontSize(isCompact ? 8 : 8.5)
              .fillColor(accentColor)
              .text(`  [${proj.technologies.join(', ')}]`, {
                continued: false,
              });
          }

          if (proj.link) {
            doc
              .font(fontRegular)
              .fontSize(8)
              .fillColor(accentColor)
              .text(proj.link, leftMargin, startY, {
                align: 'right',
                width: contentWidth,
              });
          }

          doc.moveDown(0.1);
          renderFormattedText(proj.description, isCompact ? 8.5 : 9);
          doc.moveDown(0.2);
        }
      }

      // 7. Education
      if (education.length > 0) {
        drawSectionHeader('Education & Credentials');

        for (const edu of education) {
          const startY = doc.y;

          doc
            .font(fontBold)
            .fontSize(isCompact ? 9.5 : 10)
            .fillColor(primaryColor)
            .text(edu.degree, leftMargin, startY, {
              continued: true,
            })
            .font(fontRegular)
            .fillColor(mutedColor)
            .text(`  |  ${edu.institution}${edu.location ? ` (${edu.location})` : ''}`, {
              continued: false,
              width: contentWidth - 110,
            });

          const dateStr = `${edu.startDate ? `${edu.startDate} – ` : ''}${edu.endDate}${
            edu.gpa ? ` | GPA: ${edu.gpa}` : ''
          }`;
          doc
            .font(fontRegular)
            .fontSize(isCompact ? 8.5 : 9)
            .fillColor(mutedColor)
            .text(dateStr, leftMargin, startY, {
              align: 'right',
              width: contentWidth,
            });

          if (edu.highlights && edu.highlights.length > 0) {
            for (const h of edu.highlights) {
              renderFormattedText(h, isCompact ? 8 : 8.8, true, 10);
            }
          }
          doc.moveDown(0.2);
        }
      }

      // 8. Certifications
      if (certifications.length > 0) {
        drawSectionHeader('Certifications & Licensures');

        for (const cert of certifications) {
          const startY = doc.y;

          doc
            .font(fontBold)
            .fontSize(isCompact ? 8.5 : 9.2)
            .fillColor(primaryColor)
            .text(cert.name, leftMargin, startY, {
              continued: true,
            })
            .font(fontRegular)
            .fillColor(mutedColor)
            .text(` – ${cert.issuer}`, {
              continued: false,
              width: contentWidth - 90,
            });

          doc
            .font(fontRegular)
            .fontSize(isCompact ? 8 : 8.5)
            .fillColor(mutedColor)
            .text(cert.issueDate, leftMargin, startY, {
              align: 'right',
              width: contentWidth,
            });

          doc.moveDown(0.15);
        }
      }

      // 9. Custom Sections
      if (customSections.length > 0) {
        for (const sec of customSections) {
          drawSectionHeader(sec.title);
          for (const item of sec.items) {
            renderFormattedText(item, isCompact ? 8.5 : 9.2, true, 12);
          }
          doc.moveDown(0.2);
        }
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
