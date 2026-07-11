import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseResumeFile } from "@/lib/resume-parser";
import { saveOriginalFile, renameOriginalFile } from "@/lib/storage";

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
      const parsedText = await parseResumeFile(buffer, file.type);

      // Save original file to disk so we can modify it later (e.g., DOCX in-place editing)
      const filePath = await saveOriginalFile(
        "temp", // placeholder, will update after we have the id
        buffer,
        file.type
      );

      const resume = await prisma.resume.create({
        data: {
          userId,
          name: file.name.replace(/\.[^.]+$/, ""),
          parsedText: parsedText.slice(0, 50000),
          filePath,
        },
      });

      // Rename the file to use the actual resume ID
      const finalPath = await renameOriginalFile(filePath, resume.id, file.type);
      await prisma.resume.update({
        where: { id: resume.id },
        data: { filePath: finalPath },
      });
      resume.filePath = finalPath;

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
        filePath: body.filePath || null,
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
