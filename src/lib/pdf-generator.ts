import PDFDocument from "pdfkit";

export async function generateOptimizedResumePdf(
  optimizedText: string,
  resumeName: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      size: "A4",
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Title
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .text(resumeName, { align: "center" });
    doc.moveDown(0.5);

    // Subtitle
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666666")
      .text("ATS-Optimized Resume", { align: "center" });
    doc.moveDown(1);

    // Horizontal rule
    doc
      .moveTo(60, doc.y)
      .lineTo(doc.page.width - 60, doc.y)
      .strokeColor("#cccccc")
      .lineWidth(1)
      .stroke();
    doc.moveDown(1);

    // Content — render each paragraph
    doc.fontSize(11).font("Helvetica").fillColor("#000000");

    const paragraphs = optimizedText.split("\n");
    for (const para of paragraphs) {
      const trimmed = para.trim();
      if (!trimmed) {
        doc.moveDown(0.5);
        continue;
      }

      // Check if it looks like a heading (all caps, or short line without punctuation)
      const looksLikeHeading =
        trimmed === trimmed.toUpperCase() && trimmed.length < 60;

      if (looksLikeHeading) {
        doc.moveDown(0.5);
        doc
          .fontSize(13)
          .font("Helvetica-Bold")
          .text(trimmed, { continued: false });
        doc.moveDown(0.2);
        doc.fontSize(11).font("Helvetica");
      } else {
        doc.text(trimmed, { lineGap: 2 });
      }
    }

    doc.end();
  });
}
