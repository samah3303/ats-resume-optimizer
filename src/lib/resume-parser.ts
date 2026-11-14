import mammoth from "mammoth";
import zlib from "zlib";
import type { ResumeParseResult } from "@/types";
import { aiChat, parseJsonSafely } from "@/lib/ai";

function isHumanReadableText(str: string): boolean {
  if (!str || str.trim().length < 15) return false;
  const clean = str.trim();
  let controlChars = 0;
  let wordChars = 0;

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    // Non-printable control characters (excluding tab 9, LF 10, CR 13)
    if (
      (code >= 0 && code <= 8) ||
      code === 11 ||
      code === 12 ||
      (code >= 14 && code <= 31)
    ) {
      controlChars++;
    } else if (
      (code >= 48 && code <= 57) || // 0-9
      (code >= 65 && code <= 90) || // A-Z
      (code >= 97 && code <= 122) || // a-z
      code >= 128 // Unicode characters (accents, bullets, dashes, etc.)
    ) {
      wordChars++;
    }
  }

  // Corrupted binary stream check
  if (controlChars / clean.length > 0.05) return false;

  // Genuine readable resume text has at least 25% alphanumeric / word characters
  return wordChars / clean.length >= 0.25;
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
  // Method 1: Try pdf-parse
  try {
    const { PDFParse } = await import("pdf-parse");
    const uint8 = new Uint8Array(buffer.length);
    uint8.set(buffer);
    const parser = new PDFParse({ data: uint8 });
    const result = await parser.getText();
    await parser.destroy().catch(() => null);

    let text = "";
    if (typeof result === "string") {
      text = result;
    } else if (result && typeof result === "object") {
      if (typeof result.text === "string" && result.text.trim()) {
        text = result.text;
      } else if (Array.isArray(result.pages)) {
        text = result.pages.map((p: { text?: string }) => p.text || "").join("\n");
      }
    }

    text = text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "").trim();
    if (text && text.length > 20 && isHumanReadableText(text)) {
      return text;
    }
  } catch (err) {
    console.warn("pdf-parse extraction warning, falling back to pdfjs-dist:", err);
  }

  // Method 2: Direct pdfjs-dist fallback
  try {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const uint8 = new Uint8Array(buffer.length);
    uint8.set(buffer);

    const loadingTask = pdfjsLib.getDocument({
      data: uint8,
      useSystemFonts: true,
      isEvalSupported: false,
      disableFontFace: true,
    });

    const pdfDoc = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items
        .map((item: any) => ("str" in item ? item.str : ""))
        .filter(Boolean);
      if (strings.length > 0) {
        pageTexts.push(strings.join(" "));
      }
    }

    const text = pageTexts.join("\n\n").trim();
    if (text && text.length > 20 && isHumanReadableText(text)) {
      return text;
    }
  } catch (err) {
    console.warn("pdfjs-dist direct fallback warning:", err);
  }

  // Method 3: Raw Flate streams fallback
  const flate = parsePdfFlateStreams(buffer);
  if (flate && flate.length > 20 && isHumanReadableText(flate)) {
    return flate;
  }

  throw new Error(
    "Unable to extract readable text from this PDF. If this is a scanned document or image-only PDF, please upload a text-based PDF or DOCX file."
  );
}

export async function parseResumeFile(
  buffer: Buffer,
  mimeType: string,
  fileName?: string,
): Promise<string> {
  const ext = fileName?.toLowerCase().split(".").pop() || "";
  const effectiveType = (mimeType || "").toLowerCase();

  // PDF detection: by extension or MIME type containing "pdf"
  if (ext === "pdf" || effectiveType.includes("pdf")) {
    return parsePdf(buffer);
  }

  // Word documents (.docx)
  if (
    ext === "docx" ||
    effectiveType.includes("wordprocessingml") ||
    effectiveType.includes("vnd.openxmlformats")
  ) {
    const r = await mammoth.extractRawText({ buffer });
    return r.value;
  }

  // Word 97-2003 documents (.doc)
  if (ext === "doc" || effectiveType.includes("msword")) {
    try {
      const r = await mammoth.extractRawText({ buffer });
      if (r.value && r.value.trim().length > 20) return r.value;
    } catch {
      // Mammoth may fail on some old binary .doc formats
    }
    const str = buffer.toString("binary");
    const printable = str.replace(/[^\x20-\x7E\n\r\t]/g, " ");
    const cleaned = printable.replace(/\s+/g, " ").trim();
    if (cleaned.length > 50 && isHumanReadableText(cleaned)) return cleaned;
    throw new Error(
      "Unable to parse legacy .doc file. Please save as .docx or .pdf and re-upload."
    );
  }

  // Plain text (.txt)
  if (ext === "txt" || effectiveType.includes("text/plain")) {
    return buffer.toString("utf-8");
  }

  throw new Error(
    `Unsupported file format (${fileName || mimeType || "unknown"}). Please upload a PDF, DOCX, or TXT resume.`
  );
}

export async function extractProfileFromResume(
  rawText: string,
): Promise<ResumeParseResult> {
  let parsed: Partial<ResumeParseResult> = {};

  try {
    const prompt = `Extract structured information from this resume text. Return JSON:
{
  "name": "Full Name or null",
  "email": "email@example.com or null",
  "phone": "phone number with country code if present or null",
  "location": "City, State/Province, Country (e.g. 'Dubai, UAE', 'London, UK', 'Austin, TX, USA', 'Bengaluru, India') or null",
  "country": "Primary country of residence (e.g. 'United Arab Emirates', 'United States', 'United Kingdom', 'India', 'Canada') or null",
  "targetRole": "Candidate's primary job title or specialization (e.g. 'Senior Frontend Engineer', 'DevOps Architect', 'Marketing Lead', 'Data Analyst') or null",
  "summary": "professional summary in 2-3 sentences or null",
  "skills": ["skill1", "skill2"],
  "experience": [{"title":"Job Title","company":"Company","location":"Location","startDate":"YYYY-MM","endDate":"YYYY-MM or Present","description":"brief","highlights":["achievement1"]}],
  "education": [{"degree":"Degree","institution":"University","location":"Location","year":"YYYY","gpa":"GPA or null"}]
}

Be thorough. Detect candidate's primary location/country and target role accurately based on their latest experience and contact details. Extract ALL skills, ALL experience entries, ALL education entries.`;

    const response = await aiChat(prompt, rawText.slice(0, 6000), {
      temperature: 0.1,
    });
    parsed = parseJsonSafely<Partial<ResumeParseResult>>(response, {});
  } catch (err) {
    console.warn("AI resume profile extraction warning, applying regex fallback:", err);
  }

  // Deterministic email regex fallback if AI missed or placeholder
  let email = parsed.email?.toLowerCase().trim() || null;
  if (!email || email === "email@example.com" || email === "null" || !email.includes("@")) {
    const emailMatch = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = emailMatch[0].toLowerCase().trim();
    } else {
      email = null;
    }
  }

  // Deterministic phone regex fallback
  let phone = parsed.phone || null;
  if (!phone || phone === "null") {
    const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      phone = phoneMatch[0].trim();
    }
  }

  // Country inference from phone prefix if missing
  let country = parsed.country || null;
  if (!country && phone) {
    const cleanedPhone = phone.replace(/[\s()-]/g, "");
    if (cleanedPhone.startsWith("+971")) country = "United Arab Emirates";
    else if (cleanedPhone.startsWith("+1")) country = "United States";
    else if (cleanedPhone.startsWith("+44")) country = "United Kingdom";
    else if (cleanedPhone.startsWith("+91")) country = "India";
    else if (cleanedPhone.startsWith("+49")) country = "Germany";
    else if (cleanedPhone.startsWith("+33")) country = "France";
    else if (cleanedPhone.startsWith("+61")) country = "Australia";
    else if (cleanedPhone.startsWith("+966")) country = "Saudi Arabia";
    else if (cleanedPhone.startsWith("+974")) country = "Qatar";
    else if (cleanedPhone.startsWith("+65")) country = "Singapore";
    else if (cleanedPhone.startsWith("+353")) country = "Ireland";
  }

  // Deterministic location fallback
  let location = parsed.location || null;
  if (!location || location === "null") {
    // Try latest job location or education location
    const firstExpLoc = parsed.experience?.[0]?.location;
    const firstEduLoc = parsed.education?.[0]?.location;
    if (firstExpLoc && firstExpLoc !== "null") {
      location = firstExpLoc;
    } else if (firstEduLoc && firstEduLoc !== "null") {
      location = firstEduLoc;
    } else if (country) {
      location = country;
    }
  }

  // Target role inference
  let targetRole = parsed.targetRole || null;
  if (!targetRole || targetRole === "null") {
    // Fall back to most recent job title
    const latestJobTitle = parsed.experience?.[0]?.title;
    if (latestJobTitle && latestJobTitle !== "null") {
      targetRole = latestJobTitle;
    }
  }

  // Deterministic name fallback from first lines
  let name = parsed.name || null;
  if (!name || name === "null" || name.toLowerCase().includes("full name")) {
    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length >= 2 && l.length <= 40 && !l.includes("@") && !/resume|curriculum|vitae/i.test(l));
    if (lines.length > 0) {
      name = lines[0];
    }
  }

  return {
    name,
    email,
    phone,
    location,
    country,
    targetRole,
    summary: parsed.summary || null,
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    experience: Array.isArray(parsed.experience) ? parsed.experience : [],
    education: Array.isArray(parsed.education) ? parsed.education : [],
    rawText,
  };
}
