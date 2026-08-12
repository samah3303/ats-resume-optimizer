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
 * with genuine words and standard alphanumeric ratio (eliminating custom font encoding garble).
 */
export function isHumanReadableText(str: string): boolean {
  if (!str || str.trim().length < 5) return false;
  const clean = str.trim();
  let normalCount = 0;
  let symbolNoiseCount = 0;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const code = clean.charCodeAt(i);

    if (
      (code >= 48 && code <= 57) ||   // 0-9
      (code >= 65 && code <= 90) ||   // A-Z
      (code >= 97 && code <= 122) ||  // a-z
      code === 32 || code === 10 || code === 13 || code === 9 || // spaces/newlines
      (code >= 160 && code <= 383) || // extended latin
      (code >= 1536 && code <= 1791)  // Arabic characters
    ) {
      normalCount++;
    } else if (/[.,\-_@:\/()+|]/.test(char)) {
      normalCount++;
    } else if (/[%*;!&$\"#^~`<>=?\\{}[\]]/.test(char)) {
      symbolNoiseCount++;
    }
  }

  const normalRatio = normalCount / clean.length;
  const noiseRatio = symbolNoiseCount / clean.length;

  // Real human text must be at least 70% normal letters/digits/spaces AND less than 15% symbol noise!
  return normalRatio >= 0.70 && noiseRatio < 0.15;
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
    if (isHumanReadableText(result)) {
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

    if (text && text.length > 15 && isHumanReadableText(text)) {
      return text;
    }
  } catch (v2Err) {
    console.warn("PDFParse v2 primary failed:", v2Err);
  }

  // 2. Fallback: Decompress FlateDecode streams and parse text
  const flateText = parsePdfFlateStreams(buffer);
  if (flateText && flateText.length > 10 && isHumanReadableText(flateText)) {
    return flateText;
  }

  throw new Error(
    "Unable to extract readable text from PDF due to custom font encodings or image-based formatting. Please export your resume using standard 'Save as PDF' (with standard system fonts) or upload as DOCX."
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
