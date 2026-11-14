import OpenAI from "openai";

let _client: OpenAI | null = null;
let _model = "deepseek-flash";

export function getAI(): OpenAI {
  if (!_client) {
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    const deepseekKey = process.env.DEEPSEEK_API_KEY;

    if (groqKey) {
      _model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
      _client = new OpenAI({
        apiKey: groqKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
    } else if (geminiKey) {
      _model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
      _client = new OpenAI({
        apiKey: geminiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      });
    } else if (openrouterKey) {
      _model =
        process.env.OPENROUTER_MODEL ||
        "deepseek/deepseek-r1-distill-llama-70b";
      _client = new OpenAI({
        apiKey: openrouterKey,
        baseURL: "https://openrouter.ai/api/v1",
      });
    } else if (deepseekKey) {
      _model = process.env.DEEPSEEK_MODEL || "deepseek-flash";
      _client = new OpenAI({
        apiKey: deepseekKey,
        baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
      });
    } else {
      throw new Error("No AI API key configured");
    }
  }
  return _client;
}

export function getModelName(): string {
  getAI();
  return _model;
}

export function extractJson(content: string): string {
  let s = content.trim();
  const m = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) s = m[1].trim();
  return s;
}

export function parseJsonSafely<T = unknown>(content: string, fallback?: T): T {
  const s = extractJson(content);
  try {
    return JSON.parse(s);
  } catch {
    // Try repairing truncated JSON
    let repaired = s.replace(/,\s*([}\]])/g, "$1").replace(/,\s*$/, "");
    let inStr = false,
      escaped = false;
    const stack: string[] = [];
    for (let i = 0; i < repaired.length; i++) {
      const c = repaired[i];
      if (inStr) {
        if (c === "\\" && !escaped) escaped = true;
        else if (c === '"' && !escaped) inStr = false;
        else escaped = false;
      } else {
        if (c === '"') inStr = true;
        else if (c === "{" || c === "[") stack.push(c === "{" ? "}" : "]");
        else if (
          (c === "}" || c === "]") &&
          stack.length &&
          stack[stack.length - 1] === c
        )
          stack.pop();
      }
    }
    if (inStr) repaired += '"';
    while (stack.length) repaired += stack.pop();
    try {
      return JSON.parse(repaired);
    } catch {
      if (fallback !== undefined) return fallback;
      throw new Error("Failed to parse AI JSON response");
    }
  }
}

export async function aiChat(
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const client = getAI();
  const model = getModelName();
  const resp = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 4000,
  });
  return resp.choices[0]?.message?.content || "";
}
