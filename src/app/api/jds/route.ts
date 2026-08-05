import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const jds = await prisma.jobDescription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ jds });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const body = await req.json();

    if (!body.title || !body.rawText) {
      return NextResponse.json(
        { error: "Title and rawText are required." },
        { status: 400 }
      );
    }

    const jd = await prisma.jobDescription.create({
      data: {
        userId,
        title: body.title,
        company: body.company || null,
        rawText: body.rawText,
        sourceUrl: body.sourceUrl || null,
        positionProfileId: body.positionProfileId || null,
      },
    });

    // Fire-and-forget: embed this JD for RAG semantic search
    embedJdAsync(jd.id, body.rawText);

    return NextResponse.json({ jd }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create JD." },
      { status: 500 }
    );
  }
}

async function embedJdAsync(jdId: string, rawText: string) {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) return;

    const [{ neon }, { embedText, chunkText, toPgVector }] = await Promise.all([
      import("@neondatabase/serverless"),
      import("@/lib/embeddings"),
    ]);

    const sql = neon(dbUrl);
    await sql`DELETE FROM jd_chunks WHERE jd_id = ${jdId}`;
    const chunks = chunkText(rawText, 500, 100);
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await embedText(chunks[i]);
      await sql`
        INSERT INTO jd_chunks (id, jd_id, chunk_text, chunk_index, embedding)
        VALUES (gen_random_uuid()::text, ${jdId}, ${chunks[i]}, ${i}, ${toPgVector(embedding)}::vector)
      `;
    }
    console.log(`[embeddings] Auto-embedded JD ${jdId}: ${chunks.length} chunks`);
  } catch (err) {
    console.error(`[embeddings] Failed to auto-embed JD ${jdId}:`, (err as Error).message);
  }
}
