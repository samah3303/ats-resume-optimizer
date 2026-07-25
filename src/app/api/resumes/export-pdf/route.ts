import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateOptimizedResumePdf } from "@/lib/pdf-generator";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { resumeName, content } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Resume content is required." },
        { status: 400 }
      );
    }

    const pdfBuffer = await generateOptimizedResumePdf(
      content,
      resumeName || "ATS_Optimized_Resume"
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(resumeName || "ATS_Optimized_Resume").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf"`,
      },
    });
  } catch (err) {
    console.error("PDF export error:", err);
    return NextResponse.json(
      { error: "Failed to generate ATS PDF." },
      { status: 500 }
    );
  }
}
