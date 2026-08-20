import OpenAI from "openai";

let _deepseek: OpenAI | null = null;
let _aiModel = "deepseek-v4-flash";

export function getDeepSeek(): OpenAI {
  if (!_deepseek) {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    if (groqKey) {
      _aiModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
      _deepseek = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
    } else if (geminiKey) {
      _aiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      _deepseek = new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
    } else if (openrouterKey) {
      _aiModel = process.env.OPENROUTER_MODEL || "deepseek/deepseek-r1-distill-llama-70b";
      _deepseek = new OpenAI({
        apiKey: openrouterKey,
        baseURL: "https://openrouter.ai/api/v1",
      });
    } else if (deepseekKey) {
      _aiModel = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
      _deepseek = new OpenAI({
        apiKey: deepseekKey,
        baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      });
    } else {
      throw new Error("No AI API Key found (set GROQ_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY, or DEEPSEEK_API_KEY)");
    }
  }
  return _deepseek;
}

export function getAiModelName(): string {
  getDeepSeek();
  return _aiModel;
}

/**
 * Static frozen system prompt prefix to maximize LLM Prompt Cache hits (75-90% discount).
 */
export const STATIC_SYSTEM_PREFIX = `You are Paniund, the Universal Talent Operating System. Output strict, valid JSON matching requested schemas without markdown wrapper formatting unless requested.`;

/**
 * Builds a prompt array structured to maximize LLM Prompt Caching.
 */
export function buildCachedPrompt(featureInstructions: string, dynamicPayload: string) {
  return [
    { role: "system" as const, content: `${STATIC_SYSTEM_PREFIX}\n${featureInstructions}` },
    { role: "user" as const, content: dynamicPayload },
  ];
}

/**
 * Deterministically prunes conversational history to a sliding window of maxTurns.
 */
export function pruneConversationHistory(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  maxTurns: number = 4
) {
  const nonSystem = messages.filter((m) => m.role !== "system");
  const systemMsg = messages.find((m) => m.role === "system");

  if (nonSystem.length <= maxTurns * 2) {
    return messages;
  }

  const pruned = nonSystem.slice(-maxTurns * 2);
  return systemMsg ? [systemMsg, ...pruned] : pruned;
}

/**
 * Deterministically sanitizes Job Descriptions to remove legal boilerplate, EEO statements,
 * benefits clauses, and duplicate whitespace before LLM input.
 */
export function sanitizeJdPayload(rawJd: string, maxChars: number = 3000): string {
  if (!rawJd) return "";
  return rawJd
    .replace(/Equal Opportunity Employer[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/EEO is the Law[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/We celebrate diversity[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/Benefits package includes[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/Comprehensive health, dental[\s\S]*?(?=\n\n|$)/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxChars);
}

/**
 * Sanitizes raw resume text before sending to LLM (strips excessive spacing & phone/addresses).
 */
export function sanitizeResumePayload(rawResume: string, maxChars: number = 4000): string {
  if (!rawResume) return "";
  return rawResume
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, "[PHONE]")
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL]")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, maxChars);
}

/**
 * Helper: extract JSON from LLM response, handling markdown code blocks.
 */
export function extractJson(content: string): string {
  let jsonStr = content.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }
  return jsonStr;
}

/**
 * Repairs truncated JSON by balancing quotes, removing trailing commas,
 * and auto-closing open arrays and objects.
 */
export function repairTruncatedJson(jsonStr: string): string {
  let str = jsonStr.trim();

  let inString = false;
  let isEscaped = false;
  const stack: string[] = [];

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (inString) {
      if (char === "\\" && !isEscaped) {
        isEscaped = true;
      } else if (char === '"' && !isEscaped) {
        inString = false;
      } else {
        isEscaped = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === "{" || char === "[") {
        stack.push(char === "{" ? "}" : "]");
      } else if (char === "}" || char === "]") {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    }
  }

  if (inString) {
    str += '"';
  }

  str = str.replace(/,\s*([}\]])/g, "$1");
  str = str.replace(/,\s*$/g, "");

  while (stack.length > 0) {
    const closing = stack.pop();
    str += closing;
  }

  return str;
}

/**
 * Safely parse JSON from LLM output, applying extractions and auto-repair.
 */
export function parseJsonSafely<T = any>(content: string, fallback?: T): T {
  const jsonStr = extractJson(content);
  try {
    return JSON.parse(jsonStr);
  } catch {
    try {
      const repaired = repairTruncatedJson(jsonStr);
      return JSON.parse(repaired);
    } catch (err2) {
      if (fallback !== undefined) {
        return fallback;
      }
      throw new Error(`Failed to parse LLM JSON response: ${(err2 as Error).message}\nRaw Content: ${content}`);
    }
  }
}
