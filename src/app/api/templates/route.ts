import { NextResponse } from "next/server";
import { RESUME_TEMPLATES, DEFAULT_RESUME_DATA } from "@/lib/resume-templates";

export async function GET() {
  try {
    return NextResponse.json({
      templates: RESUME_TEMPLATES,
      defaultData: DEFAULT_RESUME_DATA,
    });
  } catch (error) {
    console.error("Failed to fetch resume templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch resume templates" },
      { status: 500 }
    );
  }
}
