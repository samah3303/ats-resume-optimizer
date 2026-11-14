import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { aiChat, parseJsonSafely } from "@/lib/ai";
import { parseUrlSchema } from "@/lib/validations";
import { apiSuccess, apiError, handleApiError } from "@/lib/api-response";

/**
 * Validates that a URL does not point to internal, reserved, or loopback IPs (Anti-SSRF)
 */
function isDisallowedHost(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    const hostname = parsed.hostname.toLowerCase();
    
    // Disallow loopback, private ranges, internal AWS/cloud metadata services
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname === "169.254.169.254" || // AWS / GCP metadata
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return apiError("Unauthorized", 401);
    }

    const body = await request.json();
    const { url } = parseUrlSchema.parse(body);

    if (isDisallowedHost(url)) {
      return apiError("Invalid URL target. Requests to private networks or localhost are not permitted.", 400);
    }

    // Use AI to extract or infer structured job details from the listing URL
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

    return apiSuccess({
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
    return handleApiError(error, "Failed to parse job URL");
  }
}
