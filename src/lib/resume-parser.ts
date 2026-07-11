import mammoth from "mammoth";

async function parsePdf(buffer: Buffer): Promise<string> {
  // pdfjs-dist sets GlobalWorkerOptions.workerSrc in its static block
  // Don't override it - the dynamic import will resolve the worker from node_modules
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    useWorkerFetch: false,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? (item as { str: string }).str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  return fullText.trim();
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
