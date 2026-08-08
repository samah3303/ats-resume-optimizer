/**
 * Fast Lightweight Embedding Utility
 *
 * Provides a zero-dependency 384-dimensional term-frequency feature vector
 * generator. Runs instantly in sub-1ms with zero memory overhead or external model downloads.
 */

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generate a 384-dimensional lightweight vector representation of text.
 */
export async function embedText(text: string): Promise<number[]> {
  const vec = new Array(384).fill(0);
  const words = (text || "").toLowerCase().replace(/[^a-z0-9]/g, " ").split(/\s+/).filter(Boolean);

  if (words.length === 0) return vec;

  for (const word of words) {
    const idx = hashString(word) % 384;
    vec[idx] += 1;
  }

  // Normalize L2 vector
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < 384; i++) {
      vec[i] = vec[i] / norm;
    }
  }

  return vec;
}

/**
 * Batch generate embeddings.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map(embedText));
}

/**
 * Chunk text into overlapping segments of ~500 chars each.
 */
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 100
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  const wordsPerChunk = Math.max(1, Math.floor(chunkSize / 5));
  const wordsOverlap = Math.max(0, Math.floor(overlap / 5));

  while (i < words.length) {
    const chunk = words.slice(i, i + wordsPerChunk).join(" ");
    if (chunk.length > 20) {
      chunks.push(chunk);
    }
    i += wordsPerChunk - wordsOverlap;
  }

  return chunks;
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Convert embedding array to pgvector literal.
 */
export function toPgVector(embedding: number[]): string {
  return `[${embedding.map((v) => v.toFixed(6)).join(",")}]`;
}

/**
 * Convert a pgvector string back to a number array.
 */
export function fromPgVector(pgString: string): number[] {
  const cleaned = pgString.replace(/[\[\]]/g, "");
  return cleaned.split(",").map(Number);
}
