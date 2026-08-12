import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  AlignmentType,
} from "docx";

export type TemplateType = "emerald_tech" | "classic_corporate";

/**
 * Generates a pixel-perfect, ATS-compliant Microsoft Word (.docx) file
 * using 1 of 2 professionally styled resume templates.
 */
export async function generateDocxResume(
  optimizedText: string,
  template: TemplateType = "emerald_tech"
): Promise<Buffer> {
  const isEmerald = template === "emerald_tech";
  const primaryColor = isEmerald ? "059669" : "1E293B"; // Emerald Green vs Slate Dark
  const secondaryColor = "475569"; // Muted Slate

  const lines = optimizedText.split("\n");
  const paragraphs: Paragraph[] = [];
  let isHeaderSection = true;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      continue;
    }

    const cleanLine = rawLine.replace(/^#+\s*/, "").replace(/\*\*/g, "").trim();

    // Check if section heading (e.g. WORK EXPERIENCE, EDUCATION, SKILLS)
    const isHeading =
      rawLine.startsWith("#") ||
      (cleanLine === cleanLine.toUpperCase() &&
        cleanLine.length > 3 &&
        cleanLine.length < 40 &&
        !cleanLine.includes("●") &&
        !cleanLine.includes("|"));

    if (isHeading) {
      isHeaderSection = false;
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
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
              text: cleanLine.toUpperCase(),
              bold: true,
              size: 22, // 11pt
              font: "Calibri",
              color: primaryColor,
            }),
          ],
        })
      );
      continue;
    }

    // Header candidate name & contact details
    if (isHeaderSection) {
      if (i === 0) {
        paragraphs.push(
          new Paragraph({
            alignment: isEmerald ? AlignmentType.LEFT : AlignmentType.CENTER,
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: cleanLine,
                bold: true,
                size: 32, // 16pt
                font: "Calibri",
                color: "0F172A",
              }),
            ],
          })
        );
      } else {
        paragraphs.push(
          new Paragraph({
            alignment: isEmerald ? AlignmentType.LEFT : AlignmentType.CENTER,
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: cleanLine,
                size: 19, // 9.5pt
                font: "Calibri",
                color: secondaryColor,
              }),
            ],
          })
        );
      }
      continue;
    }

    // Bullet points
    if (rawLine.startsWith("•") || rawLine.startsWith("-") || rawLine.startsWith("●") || rawLine.startsWith("*")) {
      const bulletText = rawLine.replace(/^[•\-●*]\s*/, "").trim();
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: parseInlineFormatting(bulletText),
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          spacing: { after: 80 },
          children: parseInlineFormatting(rawLine),
        })
      );
    }
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

/**
 * Parses inline **bold** text into docx TextRun elements
 */
function parseInlineFormatting(text: string): TextRun[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return new TextRun({
        text: part.slice(2, -2),
        bold: true,
        size: 20,
        font: "Calibri",
        color: "0F172A",
      });
    }
    return new TextRun({
      text: part,
      size: 20,
      font: "Calibri",
      color: "334155",
    });
  });
}
