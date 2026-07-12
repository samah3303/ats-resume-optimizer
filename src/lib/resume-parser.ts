import mammoth from "mammoth";
import { PDFParse as pdfParse } from "pdf-parse";

async function parsePdf(buffer: Buffer): Promise<string> {
  const parser = new pdfParse(new Uint8Array(buffer));
  const result = await parser.getText();
  // pdf-parse getText() returns { text: string, pages: ... }
  const extractedText = typeof result === "string" ? result : (result as { text: string }).text;
  return extractedText.trim();
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    if (mimeType === "application/pdf") {
      return await parsePdf(buffer);
    }

    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    if (mimeType === "text/plain") {
      return buffer.toString("utf-8");
    }

    throw new Error(
      `Unsupported file type: ${mimeType}. Please upload a PDF, DOC, DOCX, or TXT file.`
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
    throw new Error("Failed to parse resume file.");
  }
}
