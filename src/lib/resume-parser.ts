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
  // 1. Primary: pdf-parse v2 API (options object with data property)
  try {
    const { PDFParse } = await import("pdf-parse");
    const uint8 = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const parser = new PDFParse({ data: uint8 });
    const result = await parser.getText();
    await parser.destroy().catch(() => null);

    const extractedText = typeof result === "string" ? result : result?.text || "";
    if (extractedText && extractedText.trim()) {
      return extractedText.trim();
    }
  } catch (v2Err) {
    console.warn("PDF v2 parsing warning:", v2Err);
  }

  // 2. Fallback: try pdf-parse legacy CJS default function
  try {
    // @ts-ignore
    const pdfParseCjs: any = await import("pdf-parse/node").catch(() => null);
    const pdfParse = pdfParseCjs?.default || pdfParseCjs;
    if (typeof pdfParse === "function") {
      const data = await pdfParse(buffer);
      if (data?.text?.trim()) {
        return data.text.trim();
      }
    }
  } catch (legacyErr) {
    console.warn("PDF legacy parser warning:", legacyErr);
  }

  throw new Error(
    "Unable to extract text from PDF. The PDF may be scanned/image-based or encrypted. Please try another PDF or a DOCX file."
  );
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
