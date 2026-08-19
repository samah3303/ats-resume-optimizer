"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeFile } from "@/lib/resume-parser";
import { saveOriginalFile } from "@/lib/storage";

function detectDocType(mimeType: string, fileName: string): string | null {
  const mimeMap: Record<string, string> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
  };
  if (mimeMap[mimeType]) return mimeMap[mimeType];

  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "docx" || ext === "doc") return ext;

  return null;
}

export type UploadState = {
  error?: string;
  success?: boolean;
  resume?: any;
};

export async function uploadResumeAction(prevState: UploadState, formData: FormData): Promise<UploadState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const userId = (session.user as { id: string }).id;

  try {
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { error: "No file provided." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { error: "File must be under 5MB." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawText = await parseResumeFile(buffer, file.type, file.name);

    const docType = detectDocType(file.type, file.name);
    const parsedText = rawText
      .replace(/\x00/g, "")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
      .replace(/\uFFFD/g, "")
      .replace(/\u200B/g, "")
      .replace(/\uFEFF/g, "")
      .trim();

    const resume = await prisma.resume.create({
      data: {
        userId,
        name: file.name.replace(/\.[^.]+$/, ""),
        parsedText: parsedText.slice(0, 50000),
        filePath: null,
        docType,
      },
    });

    try {
      await saveOriginalFile(resume.id, buffer, file.type);
    } catch {
      console.warn("Failed to save original file, continuing without it");
    }

    return { success: true, resume: JSON.parse(JSON.stringify(resume)) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Resume upload error:", err);
    return { error: `Failed to process resume: ${message}` };
  }
}
