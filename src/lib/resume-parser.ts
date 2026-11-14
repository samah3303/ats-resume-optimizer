import mammoth from "mammoth";
import zlib from "zlib";
import type { ResumeParseResult } from "@/types";
import { aiChat, parseJsonSafely } from "@/lib/ai";

function isHumanReadableText(str: string): boolean {
  if (!str || str.trim().length < 5) return false;
  const clean = str.trim();
  let normalCount = 0;
  let noiseCount = 0;
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    if (
      (code >= 48 && code <= 57) ||
      (code >= 65 && code <= 90) ||
      (code >= 97 && code <= 122) ||
      code === 32 ||
      code === 10 ||
      code === 13 ||
      code === 9 ||
      (code >= 160 && code <= 383)
    )
      normalCount++;
    else if (/[%*;!&$"#^~`<>=?\\{}[\]]/.test(clean[i])) noiseCount++;
  }
  return normalCount / clean.length >= 0.65 && noiseCount / clean.length < 0.2;
}

function parsePdfFlateStreams(buffer: Buffer): string {
  try {
    const chunks: string[] = [];
    const str = buffer.toString("binary");
    const regex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = regex.exec(str)) !== null) {
      const raw = Buffer.from(match[1], "binary");
      let text = "";
      try {
        text = zlib.inflateSync(raw).toString("utf-8");
      } catch {
        try {
          text = zlib.unzipSync(raw).toString("utf-8");
        } catch {
          text = raw.toString("utf-8");
        }
      }
      if (text) {
        const tReg = /\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*(?:Tj|TJ|'|")/g;
        let tm;
        while ((tm = tReg.exec(text)) !== null) {
          const cleaned = tm[1]
            .replace(/\\([()\\])/g, "$1")
            .replace(/\\n/g, "\n")
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
            .trim();
          if (cleaned.length > 0) chunks.push(cleaned);
        }
      }
    }
    const result = chunks.join(" ").replace(/\s+/g, " ").trim();
    return isHumanReadableText(result) ? result : "";
  } catch {
    return "";
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const uint8 = new Uint8Array(buffer.length);
    uint8.set(buffer);
    const parser = new PDFParse({ data: uint8 });
    const result = await parser.getText();
    await parser.destroy().catch(() => null);
    let text = typeof result === "string" ? result : result?.text || "";
    text = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();
    if (text && text.length > 15 && isHumanReadableText(text)) return text;
  } catch {}
  const flate = parsePdfFlateStreams(buffer);
  if (flate && flate.length > 10) return flate;
  throw new Error("Unable to extract readable text from PDF. Try DOCX format.");
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string,
  fileName?: string,
): Promise<string> {
  let effectiveType = mimeType;
  if (!effectiveType || effectiveType === "application/octet-stream") {
    const ext = fileName?.toLowerCase().split(".").pop() || "";
    if (ext === "pdf") effectiveType = "application/pdf";
    else if (ext === "docx")
      effectiveType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    else if (ext === "doc") effectiveType = "application/msword";
    else if (ext === "txt") effectiveType = "text/plain";
  }
  if (effectiveType === "application/pdf") return parsePdf(buffer);
  if (
    effectiveType.includes("wordprocessingml") ||
    effectiveType === "application/msword"
  ) {
    const r = await mammoth.extractRawText({ buffer });
    return r.value;
  }
  if (effectiveType === "text/plain") return buffer.toString("utf-8");
  throw new Error(
    `Unsupported file type: ${effectiveType}. Please upload PDF, DOC, DOCX, or TXT.`,
  );
}

export async function extractProfileFromResume(
  rawText: string,
): Promise<ResumeParseResult> {
  const prompt = `Extract structured information from this resume text. Return JSON:
{
  "name": "Full Name or null",
  "email": "email@example.com or null",
  "phone": "phone number or null",
  "location": "city, country or null",
  "summary": "professional summary in 2-3 sentences or null",
  "skills": ["skill1", "skill2"],
  "experience": [{"title":"Job Title","company":"Company","location":"Location","startDate":"YYYY-MM","endDate":"YYYY-MM or Present","description":"brief","highlights":["achievement1"]}],
  "education": [{"degree":"Degree","institution":"University","location":"Location","year":"YYYY","gpa":"GPA or null"}]
}

Be thorough. Extract ALL skills, ALL experience entries, ALL education entries.`;

  const response = await aiChat(prompt, rawText.slice(0, 6000), {
    temperature: 0.1,
  });
  const parsed = parseJsonSafely<Partial<ResumeParseResult>>(response, {});

  return {
    name: parsed.name || null,
    email: parsed.email || null,
    phone: parsed.phone || null,
    location: parsed.location || null,
    summary: parsed.summary || null,
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    rawText,
  };
}
