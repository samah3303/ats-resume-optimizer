import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
} from 'docx';
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
 * Removes '#' from hex colors for docx library compatibility.
 */
function cleanColor(hex?: string, fallback: string = '000000'): string {
  if (!hex) return fallback;
  return hex.replace('#', '').trim() || fallback;
}

/**
 * Parses inline **bold** markdown into docx TextRun instances.
 */
function parseInlineRuns(
  text: string,
  font: string,
  bodyColor: string,
  primaryColor: string,
  fontSize: number = 20
): TextRun[] {
  if (!text) return [];
  const segments = text.split(/(\*\*.*?\*\*)/g);

  return segments.map((seg) => {
    if (seg.startsWith('**') && seg.endsWith('**') && seg.length >= 4) {
      return new TextRun({
        text: seg.slice(2, -2),
        bold: true,
        size: fontSize,
        font,
        color: primaryColor,
      });
    }
    return new TextRun({
      text: seg,
      size: fontSize,
      font,
      color: bodyColor,
    });
  });
}

/**
 * Generates an ATS-compliant Microsoft Word (.docx) buffer for any resume template.
 */
export async function generateTemplateDocx(
  data: ResumeData,
  templateOrId: ResumeTemplate | string = 'classic-corporate'
): Promise<Buffer> {
  const template = resolveTemplate(templateOrId);

  const isSerif =
    template.category === 'Corporate' ||
    template.category === 'Academic' ||
    template.fontFamily.toLowerCase().includes('times') ||
    template.fontFamily.toLowerCase().includes('garamond') ||
    template.fontFamily.toLowerCase().includes('serif');

  const fontName = isSerif ? 'Times New Roman' : 'Calibri';
  const primaryColor = cleanColor(template.headingColor, '0F172A');
  const accentColor = cleanColor(template.accentColor, '1E3A8A');
  const bodyColor = cleanColor(template.textColor, '1F2937');
  const mutedColor = '64748B';

  const isCompact = template.layout === 'compact' || template.id === 'federal-compliance';
  const isCentered = isSerif && template.category === 'Corporate';

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

  const paragraphs: Paragraph[] = [];

  // Helper for section headings with bottom accent border
  const addSectionHeading = (title: string) => {
    paragraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: isCompact ? 180 : 240, after: isCompact ? 80 : 120 },
        border: {
          bottom: {
            color: accentColor,
            space: 3,
            style: BorderStyle.SINGLE,
            size: 8,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: isCompact ? 21 : 23, // 10.5 - 11.5 pt
            font: fontName,
            color: primaryColor,
          }),
        ],
      })
    );
  };

  // 1. Candidate Full Name
  paragraphs.push(
    new Paragraph({
      alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { before: 0, after: 40 },
      children: [
        new TextRun({
          text:
            template.category === 'Executive' || template.category === 'Federal'
              ? personalInfo.fullName.toUpperCase()
              : personalInfo.fullName,
          bold: true,
          size: isCompact ? 32 : 36, // 16 - 18 pt
          font: fontName,
          color: primaryColor,
        }),
      ],
    })
  );

  // 2. Headline
  if (personalInfo.headline) {
    paragraphs.push(
      new Paragraph({
        alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: personalInfo.headline,
            bold: true,
            size: isCompact ? 21 : 23,
            font: fontName,
            color: accentColor,
          }),
        ],
      })
    );
  }

  // 3. Contact Info
  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.location) contactParts.push(personalInfo.location);
  if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);
  if (personalInfo.github) contactParts.push(personalInfo.github);
  if (personalInfo.website) contactParts.push(personalInfo.website);

  if (contactParts.length > 0) {
    paragraphs.push(
      new Paragraph({
        alignment: isCentered ? AlignmentType.CENTER : AlignmentType.LEFT,
        spacing: { after: isCompact ? 100 : 160 },
        children: [
          new TextRun({
            text: contactParts.join('  •  '),
            size: isCompact ? 17 : 19, // 8.5 - 9.5 pt
            font: fontName,
            color: mutedColor,
          }),
        ],
      })
    );
  }

  // 4. Professional Summary
  if (personalInfo.summary) {
    const summaryTitle =
      template.category === 'Academic' ? 'Research Profile & Summary' : 'Professional Summary';
    addSectionHeading(summaryTitle);

    paragraphs.push(
      new Paragraph({
        spacing: { after: isCompact ? 80 : 120 },
        children: parseInlineRuns(
          personalInfo.summary,
          fontName,
          bodyColor,
          primaryColor,
          isCompact ? 19 : 20
        ),
      })
    );
  }

  // 5. Work Experience
  if (experiences.length > 0) {
    const expTitle =
      template.category === 'Academic'
        ? 'Academic & Professional Appointments'
        : 'Work Experience';
    addSectionHeading(expTitle);

    for (const exp of experiences) {
      // Role & Company + Date
      const dateStr = `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`;

      paragraphs.push(
        new Paragraph({
          spacing: { before: 80, after: 30 },
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: isCompact ? 20 : 21,
              font: fontName,
              color: primaryColor,
            }),
            new TextRun({
              text: `  |  ${exp.company}${exp.location ? ` (${exp.location})` : ''}`,
              bold: false,
              size: isCompact ? 19 : 20,
              font: fontName,
              color: mutedColor,
            }),
            new TextRun({
              text: `\t${dateStr}`,
              bold: exp.current,
              size: isCompact ? 18 : 19,
              font: fontName,
              color: exp.current ? accentColor : mutedColor,
            }),
          ],
        })
      );

      // Bullets
      if (exp.bullets && exp.bullets.length > 0) {
        for (const b of exp.bullets) {
          paragraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: isCompact ? 30 : 50 },
              children: parseInlineRuns(
                b,
                fontName,
                bodyColor,
                primaryColor,
                isCompact ? 18 : 19
              ),
            })
          );
        }
      }
    }
  }

  // 6. Skills & Core Competencies
  if (skills.length > 0) {
    addSectionHeading('Skills & Core Competencies');

    for (const cat of skills) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: isCompact ? 40 : 60 },
          children: [
            new TextRun({
              text: `${cat.category}: `,
              bold: true,
              size: isCompact ? 18 : 19,
              font: fontName,
              color: primaryColor,
            }),
            new TextRun({
              text: cat.skills.join(', '),
              size: isCompact ? 18 : 19,
              font: fontName,
              color: bodyColor,
            }),
          ],
        })
      );
    }
  }

  // 7. Featured Projects
  if (projects.length > 0) {
    const projTitle =
      template.category === 'Academic' ? 'Selected Research & Projects' : 'Featured Projects';
    addSectionHeading(projTitle);

    for (const proj of projects) {
      const projChildren: TextRun[] = [
        new TextRun({
          text: proj.name,
          bold: true,
          size: isCompact ? 19 : 20,
          font: fontName,
          color: primaryColor,
        }),
      ];

      if (proj.technologies && proj.technologies.length > 0) {
        projChildren.push(
          new TextRun({
            text: `  [${proj.technologies.join(', ')}]`,
            italics: true,
            size: isCompact ? 17 : 18,
            font: fontName,
            color: accentColor,
          })
        );
      }

      if (proj.link) {
        projChildren.push(
          new TextRun({
            text: `\t${proj.link}`,
            size: 16,
            font: fontName,
            color: accentColor,
          })
        );
      }

      paragraphs.push(
        new Paragraph({
          spacing: { before: 60, after: 20 },
          children: projChildren,
        })
      );

      paragraphs.push(
        new Paragraph({
          spacing: { after: isCompact ? 60 : 80 },
          children: parseInlineRuns(
            proj.description,
            fontName,
            bodyColor,
            primaryColor,
            isCompact ? 18 : 19
          ),
        })
      );
    }
  }

  // 8. Education
  if (education.length > 0) {
    addSectionHeading('Education & Credentials');

    for (const edu of education) {
      const dateStr = `${edu.startDate ? `${edu.startDate} – ` : ''}${edu.endDate}${
        edu.gpa ? ` | GPA: ${edu.gpa}` : ''
      }`;

      paragraphs.push(
        new Paragraph({
          spacing: { before: 60, after: 20 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: isCompact ? 19 : 20,
              font: fontName,
              color: primaryColor,
            }),
            new TextRun({
              text: `  |  ${edu.institution}${edu.location ? ` (${edu.location})` : ''}`,
              size: isCompact ? 18 : 19,
              font: fontName,
              color: mutedColor,
            }),
            new TextRun({
              text: `\t${dateStr}`,
              size: isCompact ? 17 : 18,
              font: fontName,
              color: mutedColor,
            }),
          ],
        })
      );

      if (edu.highlights && edu.highlights.length > 0) {
        for (const h of edu.highlights) {
          paragraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 30 },
              children: parseInlineRuns(
                h,
                fontName,
                bodyColor,
                primaryColor,
                isCompact ? 17 : 18
              ),
            })
          );
        }
      }
    }
  }

  // 9. Certifications
  if (certifications.length > 0) {
    addSectionHeading('Certifications & Licenses');

    for (const cert of certifications) {
      paragraphs.push(
        new Paragraph({
          spacing: { after: isCompact ? 40 : 60 },
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: isCompact ? 18 : 19,
              font: fontName,
              color: primaryColor,
            }),
            new TextRun({
              text: ` – ${cert.issuer}`,
              size: isCompact ? 18 : 19,
              font: fontName,
              color: mutedColor,
            }),
            new TextRun({
              text: `\t${cert.issueDate}`,
              size: isCompact ? 17 : 18,
              font: fontName,
              color: mutedColor,
            }),
          ],
        })
      );
    }
  }

  // 10. Custom Sections
  if (customSections.length > 0) {
    for (const sec of customSections) {
      addSectionHeading(sec.title);
      for (const item of sec.items) {
        paragraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: parseInlineRuns(
              item,
              fontName,
              bodyColor,
              primaryColor,
              isCompact ? 18 : 19
            ),
          })
        );
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: isCompact ? 576 : 720, // 0.4 - 0.5 inch in dxa
              bottom: isCompact ? 576 : 720,
              left: isCompact ? 576 : 720,
              right: isCompact ? 576 : 720,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
