import mammoth from "mammoth";

// Ensure DOMMatrix polyfill in Node runtime for pdfjs-dist / pdf-parse
if (typeof globalThis.DOMMatrix === "undefined") {
  // @ts-ignore
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor(init?: number[]) {
      if (Array.isArray(init) && init.length >= 6) {
        this.a = init[0]; this.b = init[1];
        this.c = init[2]; this.d = init[3];
        this.e = init[4]; this.f = init[5];
      }
    }
    transformPoint(p?: unknown) { return p || { x: 0, y: 0 }; }
    translate() { return this; }
    scale() { return this; }
    multiply() { return this; }
    inverse() { return this; }
  };
}

async function parsePdf(buffer: Buffer): Promise<string> {
  // 1. Try legacy pdf-parse function interface first if available
  try {
    // @ts-ignore
    const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js").catch(() => null);
    const pdfParse = pdfParseModule?.default || pdfParseModule;
    if (typeof pdfParse === "function") {
      const data = await pdfParse(buffer);
      if (data?.text) {
        return data.text.trim();
      }
    }
  } catch (legacyErr) {
    console.warn("Legacy pdf-parse fallback skipped:", legacyErr);
  }

  // 2. Fallback to pdf-parse v2 class API
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse(new Uint8Array(buffer));
    const result = await parser.getText();
    const extractedText = typeof result === "string" ? result : (result as { text: string }).text;
    return extractedText.trim() || "[No extractable text found in PDF]";
  } catch (v2Err) {
    console.error("PDF v2 parsing error:", v2Err);
    throw new Error("Unable to extract text from PDF. The PDF may be scanned/image-based or corrupted.");
  }
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
