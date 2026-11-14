import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiChat, parseJsonSafely } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { url } = body as { url: string };

    if (!url || !url.trim()) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Use AI to generate a structured job template from the URL
    const prompt = `Given this job listing URL, extract or infer the job information. If you can determine the company from the domain, use it. Return JSON:
{
  "title": "Job Title (infer from URL path if possible)",
  "company": "Company Name (infer from domain)",
  "location": "Location or Remote",
  "description": "A placeholder description noting the source URL",
  "requirements": "Requirements if inferable, otherwise null",
  "salary": "Salary if available, otherwise null",
  "jobType": "full-time, part-time, contract, or null",
  "sourceUrl": "the original URL"
}

If you cannot determine specific details, use reasonable placeholders and mark them for the user to fill in.`;

    const response = await aiChat(prompt, `Job URL: ${url}`, {
      temperature: 0.3,
    });
    const parsed = parseJsonSafely(response, {
      title: "Job from URL",
      company: null,
      location: null,
      description: `Job listing from: ${url}`,
      requirements: null,
      salary: null,
      jobType: null,
      sourceUrl: url,
    });

    return NextResponse.json({
      title: parsed.title || "Job from URL",
      company: parsed.company || null,
      location: parsed.location || null,
      description: parsed.description || `Job listing from: ${url}`,
      requirements: parsed.requirements || null,
      salary: parsed.salary || null,
      jobType: parsed.jobType || null,
      sourceUrl: url,
    });
  } catch (error) {
    console.error("URL parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse job URL" },
      { status: 500 },
    );
  }
}
