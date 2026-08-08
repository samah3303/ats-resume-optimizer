import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return NextResponse.json({ error: "Valid HTTP URL is required" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: HTTP ${res.status}` }, { status: 400 });
    }

    const html = await res.text();

    // Extract title from <title> or og:title
    let title = "";
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (ogTitleMatch) {
      title = ogTitleMatch[1];
    } else if (titleTagMatch) {
      title = titleTagMatch[1];
    }

    // Clean title string
    title = title
      .replace(/\s*\|\s*.*$/i, "")
      .replace(/\s*-\s*LinkedIn.*$/i, "")
      .replace(/\s*-\s*Indeed.*$/i, "")
      .trim() || "Target Role";

    // Extract company if present
    let company = "";
    const ogSiteName = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i);
    if (ogSiteName) {
      company = ogSiteName[1];
    }

    // Strip scripts, styles, and HTML tags to get raw text
    const cleanText = html
      .replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, " ")
      .replace(/<style\b[^<]*>([\s\S]*?)<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();

    // Truncate to reasonable length
    const rawText = cleanText.slice(0, 15000);

    return NextResponse.json({
      title,
      company: company || null,
      rawText,
      sourceUrl: url,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Scraping failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
