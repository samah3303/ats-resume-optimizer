import { NextRequest, NextResponse } from "next/server";
import { CHALLENGES } from "@/lib/challenges/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const difficulty = searchParams.get("difficulty");
  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase();

  let list = [...CHALLENGES];

  if (difficulty && difficulty !== "all") {
    list = list.filter((c) => c.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (category && category !== "all") {
    list = list.filter((c) => c.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    list = list.filter(
      (c) =>
        c.title.toLowerCase().includes(search) ||
        c.category.toLowerCase().includes(search) ||
        c.slug.includes(search)
    );
  }

  return NextResponse.json({
    challenges: list.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      difficulty: c.difficulty,
      category: c.category,
      acceptanceRate: c.acceptanceRate,
      testCasesCount: c.testCases.length,
    })),
  });
}
