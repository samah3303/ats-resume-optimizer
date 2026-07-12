import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeFile } from "@/lib/resume-parser";
import { saveOriginalFile } from "@/lib/storage";

function detectDocType(mimeType: string, fileName: string): string | null {
  // Check MIME type first
  const mimeMap: Record<string, string> = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "doc",
  };
  if (mimeMap[mimeType]) return mimeMap[mimeType];

  // Fallback to file extension
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (ext === "pdf" || ext === "docx" || ext === "doc") return ext;

  return null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const resumes = await prisma.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ resumes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { error: "No file provided." },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const rawText = await parseResumeFile(buffer, file.type, file.name);

      // Detect docType from file.type or file.name extension
      const docType = detectDocType(file.type, file.name);
      // Sanitize: remove control chars, null bytes, and non-printable characters
      const parsedText = rawText
        .replace(/\x00/g, "")           // null bytes
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "") // other control chars (keep tab, newline, carriage return)
        .replace(/\uFFFD/g, "")          // replacement chars
        .replace(/\u200B/g, "")          // zero-width space
        .replace(/\uFEFF/g, "")          // BOM
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

      // Save original file to DB so we can modify it later (e.g., DOCX in-place editing)
      try {
        await saveOriginalFile(resume.id, buffer, file.type);
      } catch {
        console.warn("Failed to save original file, continuing without it");
      }

      return NextResponse.json({ resume }, { status: 201 });
    }

    // Handle JSON body for text-based resume creation
    const body = await req.json();
    if (!body.name || !body.parsedText) {
      return NextResponse.json(
        { error: "Name and parsedText are required." },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.create({
      data: {
        userId,
        name: body.name,
        parsedText: body.parsedText,
        filePath: null,
        isPrimary: body.isPrimary || false,
      },
    });

    if (body.isPrimary) {
      await prisma.resume.updateMany({
        where: { userId, id: { not: resume.id } },
        data: { isPrimary: false },
      });
    }

    return NextResponse.json({ resume }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Resume upload error:", err);
    return NextResponse.json(
      { error: `Failed to process resume: ${message}` },
      { status: 500 }
    );
  }
}
