import mammoth from "mammoth";
import zlib from "zlib";

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
 * Validates whether an extracted string is readable human text
 * (at least 80% standard printable ASCII or common Unicode characters).
 */
function isReadableText(str: string): boolean {
  if (!str || str.trim().length === 0) return false;
  let printableCount = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // Standard printable ASCII (space to ~), tabs, newlines, carriage returns, or extended latin
    if (
      (code >= 32 && code <= 126) ||
      code === 10 ||
      code === 13 ||
      code === 9 ||
      (code >= 160 && code <= 383)
    ) {
      printableCount++;
    }
  }
  const ratio = printableCount / str.length;
  return ratio > 0.8;
}

/**
 * Extracts plain text from decompressed FlateDecode streams in PDFs
 */
function parsePdfFlateStreams(buffer: Buffer): string {
  try {
    const chunks: string[] = [];
    const str = buffer.toString("binary");

    // Match stream blocks in PDF
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match: RegExpExecArray | null;

    while ((match = streamRegex.exec(str)) !== null) {
      const rawStream = Buffer.from(match[1], "binary");
      let decompressedText = "";

      // Try zlib inflate
      try {
        const inflated = zlib.inflateSync(rawStream);
        decompressedText = inflated.toString("utf-8");
      } catch {
        try {
          const unzipped = zlib.unzipSync(rawStream);
          decompressedText = unzipped.toString("utf-8");
        } catch {
          decompressedText = rawStream.toString("utf-8");
        }
      }

      if (decompressedText) {
        // Match text literal parenthesis: (Text here) Tj or (Text) TJ
        const textLiteralRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*(?:Tj|TJ|'|")/g;
        let textMatch: RegExpExecArray | null;

        while ((textMatch = textLiteralRegex.exec(decompressedText)) !== null) {
          const cleaned = textMatch[1]
            .replace(/\\([()\\])/g, "$1")
            .replace(/\\n/g, "\n")
            .replace(/\\r/g, "\r")
            .replace(/\\t/g, "\t")
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
            .trim();

          if (cleaned.length > 0) {
            chunks.push(cleaned);
          }
        }
      }
    }

    const result = chunks.join(" ").replace(/\s+/g, " ").trim();
    if (isReadableText(result)) {
      return result;
    }
    return "";
  } catch (err) {
    console.warn("Flate stream extraction error:", err);
    return "";
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  // 1. Primary: pdf-parse v2 API
  try {
    const { PDFParse } = await import("pdf-parse");
    
    // Allocate clean standalone Uint8Array
    const uint8 = new Uint8Array(buffer.length);
    uint8.set(buffer);

    const parser = new PDFParse({ data: uint8 });
    const result = await parser.getText();
    await parser.destroy().catch(() => null);

    let text = typeof result === "string" ? result : result?.text || "";
    
    // Clean up page markers like "-- 1 of 2 --"
    text = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();

    if (text && text.length > 20 && isReadableText(text)) {
      return text;
    }
  } catch (v2Err) {
    console.warn("PDFParse v2 primary failed:", v2Err);
  }

  // 2. Fallback: Decompress FlateDecode streams and parse text
  const flateText = parsePdfFlateStreams(buffer);
  if (flateText && flateText.length > 10 && isReadableText(flateText)) {
    return flateText;
  }

  throw new Error(
    "Unable to extract readable text from PDF. The PDF may be a scanned image or encrypted. Please try uploading your resume as a standard text-based PDF or DOCX file."
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
