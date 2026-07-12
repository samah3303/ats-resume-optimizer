import { prisma } from "@/lib/prisma";

export async function saveOriginalFile(
  resumeId: string,
  buffer: Buffer,
  mimeType: string
): Promise<void> {
  const data = buffer.toString("base64");
  await prisma.originalFile.upsert({
    where: { resumeId },
    create: { resumeId, data, mimeType },
    update: { data, mimeType },
  });
}

export async function loadOriginalFile(resumeId: string): Promise<Buffer> {
  const record = await prisma.originalFile.findUniqueOrThrow({
    where: { resumeId },
  });
  return Buffer.from(record.data, "base64");
}

export async function deleteOriginalFile(resumeId: string): Promise<void> {
  try {
    await prisma.originalFile.delete({ where: { resumeId } });
  } catch {
    // file may not exist — ignore
  }
}

export async function getOriginalFormat(resumeId: string): Promise<string> {
  const record = await prisma.originalFile.findUniqueOrThrow({
    where: { resumeId },
  });
  return record.mimeType;
}
