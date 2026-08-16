import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ResumeData } from "@/types/builder";
import { generateOptimizedResumePdf } from "@/lib/pdf-generator";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
} from "docx";

function resumeDataToFormattedText(data: ResumeData): string {
  const { personalInfo, experience, education, skills, projects, certifications } = data;
  const parts: string[] = [];

  // Header
  parts.push(personalInfo.fullName || "Candidate Name");
  if (personalInfo.jobTitle) parts.push(personalInfo.jobTitle);

  const contactItems = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.website,
  ].filter(Boolean);

  if (contactItems.length > 0) {
    parts.push(contactItems.join(" | "));
  }
  parts.push("");

  // Summary
  if (personalInfo.summary?.trim()) {
    parts.push("PROFESSIONAL SUMMARY");
    parts.push(personalInfo.summary.trim());
    parts.push("");
  }

  // Work Experience
  if (experience?.length > 0) {
    parts.push("WORK EXPERIENCE");
    experience.forEach((exp) => {
      const dates = `${exp.startDate || ""} - ${exp.current ? "Present" : exp.endDate || ""}`;
      parts.push(`**${exp.title}** | ${exp.company} | ${exp.location || ""} | ${dates}`);
      (exp.bullets || []).forEach((bullet) => {
        if (bullet.trim()) parts.push(`● ${bullet.trim()}`);
      });
      parts.push("");
    });
  }

  // Skills
  if (skills?.length > 0) {
    parts.push("TECHNICAL SKILLS");
    skills.forEach((cat) => {
      if (cat.skills?.length > 0) {
        parts.push(`**${cat.category}:** ${cat.skills.join(", ")}`);
      }
    });
    parts.push("");
  }

  // Education
  if (education?.length > 0) {
    parts.push("EDUCATION");
    education.forEach((edu) => {
      const details = [
        edu.institution,
        edu.location,
        edu.graduationYear,
        edu.gpa ? `GPA: ${edu.gpa}` : "",
        edu.honors,
      ]
        .filter(Boolean)
        .join(" | ");
      parts.push(`**${edu.degree}** | ${details}`);
    });
    parts.push("");
  }

  // Projects
  if (projects?.length > 0) {
    parts.push("PROJECTS");
    projects.forEach((proj) => {
      const links = [proj.link, proj.githubLink].filter(Boolean).join(" | ");
      parts.push(`**${proj.name}** ${proj.role ? `(${proj.role})` : ""} ${links ? `| ${links}` : ""}`);
      if (proj.description) parts.push(proj.description);
      if (proj.technologies?.length > 0) {
        parts.push(`*Technologies:* ${proj.technologies.join(", ")}`);
      }
      parts.push("");
    });
  }

  // Certifications
  if (certifications?.length > 0) {
    parts.push("CERTIFICATIONS");
    certifications.forEach((cert) => {
      const info = [cert.issuer, cert.date, cert.credentialId || cert.credentialUrl]
        .filter(Boolean)
        .join(" | ");
      parts.push(`**${cert.name}** ${info ? `| ${info}` : ""}`);
    });
    parts.push("");
  }

  return parts.join("\n");
}

/**
 * Generate high-quality ATS Word (.docx) document
 */
async function generateDocxFromResumeData(
  data: ResumeData,
  templateId: string = "classic-corporate"
): Promise<Buffer> {
  const isEmerald = templateId === "modern-tech";
  const primaryColor = isEmerald ? "059669" : "1E293B"; // Emerald vs Slate Dark
  const secondaryColor = "475569";

  const paragraphs: Paragraph[] = [];
  const { personalInfo, experience, education, skills, projects, certifications } = data;

  // Header: Candidate Name
  paragraphs.push(
    new Paragraph({
      alignment: isEmerald ? AlignmentType.LEFT : AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: personalInfo.fullName || "Candidate Name",
          bold: true,
          size: 32, // 16pt
          font: "Calibri",
          color: "0F172A",
        }),
      ],
    })
  );

  // Subtitle: Target Job Title
  if (personalInfo.jobTitle) {
    paragraphs.push(
      new Paragraph({
        alignment: isEmerald ? AlignmentType.LEFT : AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: personalInfo.jobTitle,
            bold: true,
            size: 22,
            font: "Calibri",
            color: primaryColor,
          }),
        ],
      })
    );
  }

  // Contact Info Line
  const contacts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    personalInfo.linkedin,
    personalInfo.github,
    personalInfo.website,
  ]
    .filter(Boolean)
    .join("  |  ");

  if (contacts) {
    paragraphs.push(
      new Paragraph({
        alignment: isEmerald ? AlignmentType.LEFT : AlignmentType.CENTER,
        spacing: { after: 180 },
        children: [
          new TextRun({
            text: contacts,
            size: 19, // 9.5pt
            font: "Calibri",
            color: secondaryColor,
          }),
        ],
      })
    );
  }

  // Helper for Section Heading
  const addSectionHeading = (title: string) => {
    paragraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: primaryColor,
            space: 4,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22,
            font: "Calibri",
            color: primaryColor,
          }),
        ],
      })
    );
  };

  // Summary
  if (personalInfo.summary?.trim()) {
    addSectionHeading("Professional Summary");
    paragraphs.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: personalInfo.summary.trim(),
            size: 20,
            font: "Calibri",
            color: "1E293B",
          }),
        ],
      })
    );
  }

  // Experience
  if (experience?.length > 0) {
    addSectionHeading("Work Experience");
    experience.forEach((exp) => {
      const dates = `${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""}`;
      paragraphs.push(
        new Paragraph({
          spacing: { before: 80, after: 40 },
          children: [
            new TextRun({
              text: exp.title,
              bold: true,
              size: 21,
              font: "Calibri",
              color: "0F172A",
            }),
            new TextRun({
              text: `  |  ${exp.company}${exp.location ? ` (${exp.location})` : ""}`,
              italics: true,
              size: 20,
              font: "Calibri",
              color: secondaryColor,
            }),
            new TextRun({
              text: `\t${dates}`,
              bold: true,
              size: 19,
              font: "Calibri",
              color: secondaryColor,
            }),
          ],
        })
      );

      (exp.bullets || []).forEach((bullet) => {
        if (!bullet.trim()) return;
        paragraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: bullet.trim(),
                size: 20,
                font: "Calibri",
                color: "1E293B",
              }),
            ],
          })
        );
      });
    });
  }

  // Skills
  if (skills?.length > 0) {
    addSectionHeading("Technical & Professional Skills");
    skills.forEach((cat) => {
      if (cat.skills?.length > 0) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: `${cat.category}: `,
                bold: true,
                size: 20,
                font: "Calibri",
                color: "0F172A",
              }),
              new TextRun({
                text: cat.skills.join(", "),
                size: 20,
                font: "Calibri",
                color: "1E293B",
              }),
            ],
          })
        );
      }
    });
  }

  // Education
  if (education?.length > 0) {
    addSectionHeading("Education");
    education.forEach((edu) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 20,
              font: "Calibri",
              color: "0F172A",
            }),
            new TextRun({
              text: ` — ${edu.institution}${edu.graduationYear ? ` (${edu.graduationYear})` : ""}`,
              size: 20,
              font: "Calibri",
              color: secondaryColor,
            }),
            edu.gpa
              ? new TextRun({
                  text: `  [GPA: ${edu.gpa}]`,
                  size: 19,
                  font: "Calibri",
                  color: secondaryColor,
                })
              : new TextRun({ text: "" }),
          ],
        })
      );
    });
  }

  // Projects
  if (projects?.length > 0) {
    addSectionHeading("Selected Projects");
    projects.forEach((proj) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: proj.name,
              bold: true,
              size: 20,
              font: "Calibri",
              color: "0F172A",
            }),
            proj.role
              ? new TextRun({
                  text: ` (${proj.role})`,
                  italics: true,
                  size: 19,
                  font: "Calibri",
                  color: secondaryColor,
                })
              : new TextRun({ text: "" }),
            proj.link
              ? new TextRun({
                  text: `  |  ${proj.link}`,
                  size: 19,
                  font: "Calibri",
                  color: primaryColor,
                })
              : new TextRun({ text: "" }),
          ],
        })
      );
      if (proj.description) {
        paragraphs.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({
                text: proj.description,
                size: 20,
                font: "Calibri",
                color: "334155",
              }),
            ],
          })
        );
      }
    });
  }

  // Certifications
  if (certifications?.length > 0) {
    addSectionHeading("Certifications");
    certifications.forEach((cert) => {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 20,
              font: "Calibri",
              color: "0F172A",
            }),
            new TextRun({
              text: ` — ${cert.issuer || ""} ${cert.date ? `(${cert.date})` : ""}`,
              size: 20,
              font: "Calibri",
              color: secondaryColor,
            }),
          ],
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { format = "pdf", resumeData, templateId, title } = body as {
      format: "pdf" | "docx";
      resumeData: ResumeData;
      templateId?: string;
      title?: string;
    };

    if (!resumeData) {
      return NextResponse.json({ error: "Resume data is required." }, { status: 400 });
    }

    const baseFileName = (title || resumeData.personalInfo?.fullName || "ATS_Resume").replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );

    if (format === "docx") {
      const docxBuffer = await generateDocxFromResumeData(resumeData, templateId);
      return new NextResponse(new Uint8Array(docxBuffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": `attachment; filename="${baseFileName}.docx"`,
        },
      });
    }

    // Default: PDF format
    const formattedText = resumeDataToFormattedText(resumeData);
    const pdfBuffer = await generateOptimizedResumePdf(formattedText, baseFileName);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${baseFileName}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error("Builder export error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate export file." },
      { status: 500 }
    );
  }
}
