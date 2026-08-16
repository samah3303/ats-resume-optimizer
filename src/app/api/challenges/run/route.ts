import { NextRequest, NextResponse } from "next/server";
import { CHALLENGES } from "@/lib/challenges/data";
import { executeJavaScriptCode, executeMultiLanguageWithAI } from "@/lib/code-runner/executor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, code, language = "javascript" } = body;

    if (!code) {
      return NextResponse.json({ error: "Code submission is required." }, { status: 400 });
    }

    const challenge = CHALLENGES.find((c) => c.slug === slug || c.id === slug);
    const testCases = challenge ? challenge.testCases : [
      { id: 1, input: "[2,7,11,15], 9", expectedOutput: "[0,1]" }
    ];

    let result;
    if (language === "javascript" || language === "typescript") {
      result = await executeJavaScriptCode(code, testCases);
    } else {
      result = await executeMultiLanguageWithAI(code, language, testCases);
    }

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error("Code run error:", err);
    return NextResponse.json(
      { error: "Execution failed", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
