import PDFDocument from "pdfkit";

/**
 * High-fidelity ATS PDF Generator
 * Renders candidate resumes matching modern executive/tech layouts with Emerald accents,
 * clean typography, bullet points (●), inline bold rendering, and zero markdown clutter.
 */
export async function generateOptimizedResumePdf(
  optimizedText: string,
  _resumeName?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      margins: { top: 40, bottom: 40, left: 45, right: 45 },
      size: "A4",
      autoFirstPage: true,
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const primaryColor = "#059669"; // Emerald green accent
    const textDark = "#111827";     // Charcoal body text
    const textMuted = "#4B5563";    // Subtitle & dates text

    const lines = optimizedText.split("\n");
    let isHeaderSection = true;
    let headerLineCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) {
        doc.moveDown(0.3);
        continue;
      }

      // Strip markdown header syntax like "## " or "**" wrapping heading
      const cleanHeadingCandidate = line
        .replace(/^#+\s*/, "")
        .replace(/^\*\*/, "")
        .replace(/\*\*$/, "")
        .trim();

      // Check if line is a major Section Heading (e.g. PROFESSIONAL SUMMARY, TECHNICAL SKILLS, EXPERIENCE)
      const isKnownSection = /^(PROFESSIONAL SUMMARY|SUMMARY|TECHNICAL SKILLS|SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EXPERIENCE|PROJECTS|EDUCATION|CERTIFICATIONS|LANGUAGES)/i.test(
        cleanHeadingCandidate
      );

      if (isKnownSection) {
        isHeaderSection = false;
        doc.moveDown(0.6);

        // Section Title in Emerald Green
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .fillColor(primaryColor)
          .text(cleanHeadingCandidate.toUpperCase(), { lineGap: 2 });

        // Subtle accent line under section heading
        const lineY = doc.y + 1;
        doc
          .moveTo(45, lineY)
          .lineTo(doc.page.width - 45, lineY)
          .strokeColor("#E5E7EB")
          .lineWidth(0.75)
          .stroke();

        doc.moveDown(0.4);
        continue;
      }

      // If we are in top candidate header section (Name, Title, Contact Info)
      if (isHeaderSection) {
        headerLineCount++;
        if (headerLineCount === 1) {
          // Candidate Name (Line 1)
          const candidateName = cleanHeadingCandidate.replace(/[^a-zA-Z0-9\s.-]/g, "").trim();
          doc
            .fontSize(20)
            .font("Helvetica-Bold")
            .fillColor(textDark)
            .text(candidateName || cleanHeadingCandidate, { align: "left" });
          doc.moveDown(0.2);
        } else if (headerLineCount === 2 && !line.includes("|") && !line.includes("@")) {
          // Candidate Professional Title (Line 2)
          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .fillColor(primaryColor)
            .text(cleanHeadingCandidate, { align: "left" });
          doc.moveDown(0.2);
        } else {
          // Contact info / links line
          doc
            .fontSize(9.5)
            .font("Helvetica")
            .fillColor(textMuted)
            .text(cleanHeadingCandidate, { align: "left" });
          doc.moveDown(0.15);
        }
        continue;
      }

      // Check for bullet point line (- or * or ●)
      const isBullet = /^(?:[-*•●]|(?:\d+\.))\s+/.test(line);
      let contentText = line;

      if (isBullet) {
        contentText = line.replace(/^(?:[-*•●]|(?:\d+\.))\s+/, "").trim();
      }

      // Render bullet or standard paragraph with rich inline bold parsing
      renderFormattedParagraph(doc, contentText, isBullet, textDark, primaryColor);
    }

    doc.end();
  });
}

/**
 * Helper to render inline markdown bold (**text**) cleanly in PDFKit
 * without printing literal ** asterisks onto the output document.
 */
function renderFormattedParagraph(
  doc: PDFKit.PDFDocument,
  text: string,
  isBullet: boolean,
  defaultColor: string,
  accentColor: string
) {
  const leftMargin = isBullet ? 60 : 45;
  const bulletSymbol = "●  ";

  doc.fontSize(10).fillColor(defaultColor);

  if (isBullet) {
    // Draw bullet symbol
    doc.fillColor(accentColor).font("Helvetica-Bold").text(bulletSymbol, leftMargin - 12, doc.y, {
      continued: true,
    });
    doc.fillColor(defaultColor);
  }

  // Split text by ** for bold segments
  const parts = text.split(/(\*\*.*?\*\*)/g);
  let isContinued = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const isBold = part.startsWith("**") && part.endsWith("**") && part.length >= 4;
    const cleanText = isBold ? part.slice(2, -2) : part;

    const fontName = isBold ? "Helvetica-Bold" : "Helvetica";
    doc.font(fontName);

    const isLastPart = i === parts.length - 1;

    doc.text(cleanText, {
      continued: !isLastPart,
      lineGap: 2,
    });

    isContinued = !isLastPart;
  }

  if (isContinued) {
    doc.text(""); // Reset continuation line
  }

  doc.moveDown(0.25);
}
