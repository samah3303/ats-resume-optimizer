import OpenAI from "openai";

let _deepseek: OpenAI | null = null;
let _aiModel = "deepseek-v4-flash";

export function getDeepSeek(): OpenAI {
  if (!_deepseek) {
    // Strategy 1: Flexible Multi-Provider LLM Client (Groq, Gemini, OpenRouter, DeepSeek)
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
