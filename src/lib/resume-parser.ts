import mammoth from "mammoth";

async function parsePdf(buffer: Buffer): Promise<string> {
  // Dynamic import to avoid issues if pdf-parse's native deps aren't available
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse(new Uint8Array(buffer));
  const result = await parser.getText();
  const extractedText = typeof result === "string" ? result : (result as { text: string }).text;
  return extractedText.trim() || "[No extractable text found in PDF]";
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  try {
    // Normalize: some browsers send empty or generic MIME types
    let effectiveType = mimeType;
    if (!effectiveType || effectiveType === "application/octet-stream") {
      const ext = fileName?.toLowerCase().split(".").pop() || "";
      if (ext === "pdf") effectiveType = "application/pdf";
      else if (ext === "docx") effectiveType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      else if (ext === "doc") effectiveType = "application/msword";
      else if (ext === "txt") effectiveType = "text/plain";
    }

    if (effectiveType === "application/pdf") {
      return await parsePdf(buffer);
    }

    if (
      effectiveType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      effectiveType === "application/msword"
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    }

    if (effectiveType === "text/plain") {
      return buffer.toString("utf-8");
    }

    throw new Error(
      `Unsupported file type: ${effectiveType || mimeType}. Please upload a PDF, DOC, DOCX, or TXT file.`
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
    throw new Error("Failed to parse resume file.");
  }
}
