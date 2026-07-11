import fs from "fs/promises";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), ".storage", "resumes");

async function ensureDir() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
}

export async function saveOriginalFile(
  resumeId: string,
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  await ensureDir();
  const ext = mimeTypeToExt(mimeType);
  const filename = `${resumeId}${ext}`;
  const filePath = path.join(STORAGE_DIR, filename);
  await fs.writeFile(filePath, buffer);
  return filePath;
}

export async function loadOriginalFile(filePath: string): Promise<Buffer> {
  return fs.readFile(filePath);
}

export async function deleteOriginalFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // file may not exist — ignore
  }
}

export async function renameOriginalFile(
  oldPath: string,
  newResumeId: string,
  mimeType: string
): Promise<string> {
  await ensureDir();
  const ext = mimeTypeToExt(mimeType);
  const newPath = path.join(STORAGE_DIR, `${newResumeId}${ext}`);
  try {
    await fs.rename(oldPath, newPath);
  } catch {
    // If rename fails (e.g., cross-device), copy and delete
    const buf = await fs.readFile(oldPath);
    await fs.writeFile(newPath, buf);
    await fs.unlink(oldPath).catch(() => {});
  }
  return newPath;
}

export function getOriginalFormat(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".doc":
      return "application/msword";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
}

function mimeTypeToExt(mimeType: string): string {
  switch (mimeType) {
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";
    case "application/msword":
      return ".doc";
    case "application/pdf":
      return ".pdf";
    case "text/plain":
      return ".txt";
    default:
      return ".bin";
  }
}
