import JSZip from "jszip";

interface Replacement {
  originalText: string;
  suggestedText: string;
}

/**
 * Modify a DOCX buffer by replacing specific text strings within it.
 * Preserves all formatting, styles, and layout from the original file.
 */
export async function modifyDocxText(
  docxBuffer: Buffer,
  replacements: Replacement[]
): Promise<Buffer> {
  if (replacements.length === 0) return docxBuffer;

  const zip = await JSZip.loadAsync(docxBuffer);

  const docFiles = ["word/document.xml"];
  // Also handle headers and footers if present
  const headerFiles = Object.keys(zip.files).filter(
    (f) => f.startsWith("word/header") && f.endsWith(".xml")
  );
  const footerFiles = Object.keys(zip.files).filter(
    (f) => f.startsWith("word/footer") && f.endsWith(".xml")
  );
  const allXmlFiles = [...docFiles, ...headerFiles, ...footerFiles];

  const sorted = [...replacements].sort(
    (a, b) => b.originalText.length - a.originalText.length
  );

  for (const xmlPath of allXmlFiles) {
    const content = await zip.file(xmlPath)?.async("string");
    if (!content) continue;
    zip.file(xmlPath, applyReplacements(content, sorted));
  }

  return zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
}

// ─── Core replacement logic ───────────────────────────────────────

function applyReplacements(xml: string, replacements: Replacement[]): string {
  for (const { originalText, suggestedText } of replacements) {
    const search = originalText.trim();
    if (search.length < 2) continue;

    xml = replaceInXml(xml, search, suggestedText);
  }
  return xml;
}

function replaceInXml(
  xml: string,
  search: string,
  replacement: string
): string {
  // Find all paragraphs and their <w:t> runs
  const paragraphs = parseParagraphs(xml);

  // Find the paragraph containing the search text
  const fullTexts = paragraphs.map((p) => p.text);
  const paraIdx = fullTexts.findIndex((t) => t.includes(search));
  if (paraIdx === -1) return xml;

  const para = paragraphs[paraIdx];
  const matchStart = para.text.indexOf(search);

  // Rebuild the paragraph with the replacement
  const newParaXml = rebuildParagraph(
    xml.slice(para.start, para.end),
    para.runs,
    matchStart,
    search,
    replacement
  );

  return xml.slice(0, para.start) + newParaXml + xml.slice(para.end);
}

// ─── Paragraph parsing ────────────────────────────────────────────

interface TextRun {
  /** Start of <w:t ...> opening tag, relative to paragraph start */
  openTagStart: number;
  /** Start of text content */
  innerStart: number;
  /** End of text content */
  innerEnd: number;
  /** End of </w:t> closing tag */
  closeTagEnd: number;
  /** Text content */
  text: string;
}

interface ParsedParagraph {
  start: number;
  end: number;
  text: string;
  runs: TextRun[];
}

function parseParagraphs(xml: string): ParsedParagraph[] {
  const result: ParsedParagraph[] = [];
  const regex = /<w:p[\s>][\s\S]*?<\/w:p>/g;
  let m: RegExpExecArray | null;

  while ((m = regex.exec(xml)) !== null) {
    result.push({
      start: m.index,
      end: m.index + m[0].length,
      text: "",
      runs: parseRuns(m[0]),
    });
    result[result.length - 1].text = result[result.length - 1].runs
      .map((r) => r.text)
      .join("");
  }

  return result;
}

function parseRuns(paraXml: string): TextRun[] {
  const runs: TextRun[] = [];
  const openRe = /<w:t(?:\s[^>]*)?>/g;
  const closeStr = "</w:t>";

  let m: RegExpExecArray | null;
  while ((m = openRe.exec(paraXml)) !== null) {
    const openEnd = m.index + m[0].length;
    const closeIdx = paraXml.indexOf(closeStr, openEnd);
    if (closeIdx === -1) continue;

    runs.push({
      openTagStart: m.index,
      innerStart: openEnd,
      innerEnd: closeIdx,
      closeTagEnd: closeIdx + closeStr.length,
      text: paraXml.slice(openEnd, closeIdx),
    });
  }

  return runs;
}

// ─── Paragraph rebuilding ─────────────────────────────────────────

function rebuildParagraph(
  paraXml: string,
  runs: TextRun[],
  matchStart: number,
  search: string,
  replacement: string
): string {
  // Build an array of segments that form the new paragraph
  // Each segment covers: [prevEnd, run.start) + modified run content
  const parts: string[] = [];
  let lastEnd = 0;

  let charPos = 0;
  const matchEnd = matchStart + search.length;

  for (const run of runs) {
    const runLen = run.text.length;
    const runTextStart = charPos;
    const runTextEnd = charPos + runLen;

    // Everything between previous run and this run's open tag
    parts.push(paraXml.slice(lastEnd, run.openTagStart));

    // Opening tag
    parts.push(paraXml.slice(run.openTagStart, run.innerStart));

    // Text content — possibly modified
    const overlapStart = Math.max(runTextStart, matchStart) - runTextStart;
    const overlapEnd = Math.min(runTextEnd, matchEnd) - runTextStart;

    if (overlapStart < overlapEnd) {
      // This run overlaps with the replacement
      const prefix = run.text.slice(0, overlapStart);
      const suffix = run.text.slice(overlapEnd);
      const isFirst = runTextStart <= matchStart;
      const isLast = runTextEnd >= matchEnd;

      if (isFirst && isLast) {
        parts.push(escapeXml(prefix + replacement + suffix));
      } else if (isFirst) {
        parts.push(escapeXml(prefix + replacement));
      } else if (isLast) {
        parts.push(escapeXml(suffix));
      } else {
        parts.push(""); // fully consumed middle run
      }
    } else {
      parts.push(paraXml.slice(run.innerStart, run.innerEnd));
    }

    // Closing tag
    parts.push(paraXml.slice(run.innerEnd, run.closeTagEnd));

    lastEnd = run.closeTagEnd;
    charPos += runLen;
  }

  // Trailing content after last run
  parts.push(paraXml.slice(lastEnd));

  return parts.join("");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
