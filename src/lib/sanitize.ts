/**
 * Input sanitization utility for preventing XSS and injection attacks.
 */

export function sanitizeText(val: unknown): string {
  if (typeof val !== "string") return "";
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "") // strip html tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // strip control characters
    .trim();
}

export function sanitizeUrl(val: unknown): string | null {
  if (typeof val !== "string" || !val.trim()) return null;
  const trimmed = val.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

export function sanitizeEmail(val: unknown): string {
  if (typeof val !== "string") return "";
  return val.toLowerCase().trim();
}
