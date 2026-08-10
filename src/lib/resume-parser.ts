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

/**
 * Fallback parser that extracts text blocks directly from raw PDF streams
 * when standard PDF rendering libraries fail on custom fonts or scanned streams.
 */
function extractRawPdfText(buffer: Buffer): string {
  try {
    const raw = buffer.toString("binary");
    const extractedChunks: string[] = [];

    // Match text literal parenthesis: (Text here) Tj or (Text) TJ
    const textLiteralRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*(?:Tj|TJ|'|")/g;
    let match: RegExpExecArray | null;

    while ((match = textLiteralRegex.exec(raw)) !== null) {
      const text = match[1]
        .replace(/\\([()\\])/g, "$1")
        .replace(/\\n/g, "\n")
        .replace(/\\r/g, "\r")
        .replace(/\\t/g, "\t");

      const cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim();
      if (cleaned.length > 0) {
        extractedChunks.push(cleaned);
      }
    }

    // Match hex encoded text strings: <48656c6c6f> Tj
    if (extractedChunks.length === 0) {
      const hexRegex = /<([0-9a-fA-F]+)>\s*(?:Tj|TJ)/g;
      while ((match = hexRegex.exec(raw)) !== null) {
        const hex = match[1];
        let str = "";
        for (let i = 0; i < hex.length; i += 2) {
          const code = parseInt(hex.substring(i, i + 2), 16);
          if (code >= 32 && code <= 126) {
            str += String.fromCharCode(code);
          }
        }
        if (str.trim()) {
          extractedChunks.push(str.trim());
        }
      }
    }

    return extractedChunks.join(" ").replace(/\s+/g, " ").trim();
  } catch (err) {
    console.warn("Raw PDF fallback extraction error:", err);
    return "";
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  // 1. Primary Attempt: pdf-parse v2 with standalone Uint8Array allocation
  try {
    const { PDFParse } = await import("pdf-parse");
    
    // Copy buffer to fresh standalone Uint8Array to avoid Node Buffer pool offset bugs
    const uint8 = new Uint8Array(buffer.length);
    uint8.set(buffer);

    const parser = new PDFParse({ data: uint8 });
    const result = await parser.getText();
    await parser.destroy().catch(() => null);

    let text = typeof result === "string" ? result : result?.text || "";
    
    // Clean up page markers like "-- 1 of 2 --"
    text = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();

    if (text && text.length > 20) {
      return text;
    }
  } catch (v2Err) {
    console.warn("PDFParse v2 primary failed, running raw stream extractor fallback:", v2Err);
  }

  // 2. Fallback: Raw PDF binary text stream extractor
  const fallbackText = extractRawPdfText(buffer);
  if (fallbackText && fallbackText.length > 10) {
    return fallbackText;
  }

  throw new Error(
    "Unable to extract text from PDF. The PDF may be a scanned image or encrypted. Please save your resume as a standard text-based PDF or DOCX file."
  );
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string,
  fileName?: string
): Promise<string> {
  try {
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
