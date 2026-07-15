import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  try {
    const { resumeId } = await req.json();
    if (!resumeId) {
      return NextResponse.json({ error: "resumeId required" }, { status: 400 });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const text = resume.parsedText;
    const issues: Array<{ type: string; severity: "high" | "medium" | "low"; detail: string }> = [];

    // Check for missing standard sections
    const sections = ["experience", "education", "skills", "summary", "contact"];
    const lowerText = text.toLowerCase();
    sections.forEach((s) => {
      if (!lowerText.includes(s)) {
        issues.push({ type: "Missing Section", severity: "high", detail: `No "${s}" section found — ATS expects this` });
      }
    });

    // Check for non-standard characters
    const nonStandardChars = text.match(/[^\\x20-\\x7E\\n\\r\\t]/g);
    if (nonStandardChars && nonStandardChars.length > 5) {
      issues.push({ type: "Special Characters", severity: "high", detail: `Found ${nonStandardChars.length} non-ASCII characters that may confuse parsers` });
    }

    // Check for likely multi-column layout damage
    const weirdLineBreaks = text.match(/\\w\\n\\w|\\w  \\n  \\w/g);
    if (weirdLineBreaks && weirdLineBreaks.length > 3) {
      issues.push({ type: "Column Layout", severity: "high", detail: "Text shows signs of multi-column formatting — sections may be merged or scrambled by ATS" });
    }

    // Check for missing contact info
    const hasEmail = /[\\w.-]+@[\\w.-]+\\.\\w+/.test(text);
    const hasPhone = /\\+?\\d{7,15}/.test(text);
    if (!hasEmail) issues.push({ type: "Contact Missing", severity: "high", detail: "No email address detected" });
    if (!hasPhone) issues.push({ type: "Contact Missing", severity: "medium", detail: "No phone number detected" });

    // Check for empty or very short content
    const wordCount = text.split(/\\s+/).length;
    if (wordCount < 100) {
      issues.push({ type: "Content Length", severity: "high", detail: `Only ${wordCount} words — ATS expects 300-700 words` });
    } else if (wordCount < 250) {
      issues.push({ type: "Content Length", severity: "medium", detail: `${wordCount} words — consider expanding to 300+ for better matching` });
    }

    // Check for bullet points (good sign)
    const bulletCount = (text.match(/[•\\-\\*●○◆◇▪▸►]/g) || []).length;
    if (bulletCount < 5) {
      issues.push({ type: "Bullet Points", severity: "low", detail: "Few bullet points found — bulleted achievements improve ATS parsing" });
    }

    // Check for dates (resume recency)
    const datePattern = /(20\\d{2}|19\\d{2})/g;
    const dates = text.match(datePattern) || [];
    if (dates.length < 2) {
      issues.push({ type: "Missing Dates", severity: "medium", detail: "No employment dates found — ATS and recruiters need timeline context" });
    }

    // Check for numbers/metrics (achievement indicators)
    const metrics = text.match(/\\d+%|\\d+\\s*(users|customers|revenue|team|people|million|thousand|\\$|USD)/gi);
    if (!metrics || metrics.length < 2) {
      issues.push({ type: "No Metrics", severity: "medium", detail: "No quantifiable achievements found — add numbers like 'increased sales 30%'" });
    }

    return NextResponse.json({
      rawText: text,
      wordCount,
      issues,
      hasEmail,
      hasPhone,
      sectionsFound: sections.filter((s) => lowerText.includes(s)),
    });
  } catch (err) {
    console.error("X-Ray error:", err);
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 });
  }
}
