import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateJobDescription } from "@/lib/ai/recruiter";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { title, department, location, seniority, keySkills } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Job title is required." },
        { status: 400 }
      );
    }

    const draft = await generateJobDescription({
      title: title.trim(),
      department: typeof department === "string" ? department.trim() : undefined,
      location: typeof location === "string" ? location.trim() : undefined,
      seniority: typeof seniority === "string" ? seniority.trim() : undefined,
      keySkills: Array.isArray(keySkills)
        ? keySkills.filter((s) => typeof s === "string" && s.trim())
        : undefined,
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      draft,
      ...draft,
    });
  } catch (error) {
    console.error("Failed to generate job description with AI:", error);
    return NextResponse.json(
      { error: "Failed to generate job description" },
      { status: 500 }
    );
  }
}
