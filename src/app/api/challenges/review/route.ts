import { NextRequest, NextResponse } from "next/server";
import { CHALLENGES } from "@/lib/challenges/data";
import { analyzeCodeSubmission } from "@/lib/ai/code-reviewer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, code, language = "javascript" } = body;

    if (!code) {
      return NextResponse.json({ error: "Code submission is required." }, { status: 400 });
    }

    const challenge = CHALLENGES.find((c) => c.slug === slug || c.id === slug);
    const problemTitle = challenge ? challenge.title : "Algorithmic Challenge";
    const problemDescription = challenge ? challenge.description : "Problem description";

    const review = await analyzeCodeSubmission({
      code,
      language,
      problemTitle,
      problemDescription,
    });

    return NextResponse.json({ review });
  } catch (err: any) {
    console.error("Code review error:", err);
    return NextResponse.json(
      { error: "Review failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
