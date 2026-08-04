/**
 * Local Embedding Service
 * Uses Xenova/transformers.js with all-MiniLM-L6-v2 (80MB, ~384-dim vectors)
 * Runs entirely in-process — zero API cost, ~50ms per embedding.
 */

import { pipeline, env } from "@xenova/transformers";

// Prevent downloading models from HuggingFace during build
env.allowLocalModels = false;
env.useBrowserCache = false;

let _embedder: any = null;
let _initPromise: Promise<void> | null = null;

async function getEmbedder() {
  if (_embedder) return _embedder;
  if (_initPromise) {
    await _initPromise;
    return _embedder;
  }

  _initPromise = (async () => {
    console.log("[embeddings] Loading all-MiniLM-L6-v2 model (first call, ~80MB download)...");
    _embedder = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
    console.log("[embeddings] Model loaded successfully.");
  })();

  await _initPromise;
  return _embedder;
}

/**
 * Generate a 384-dimensional embedding vector for a given text.
 * Input is automatically truncated to ~512 tokens (roughly 2000 chars).
 */
export async function embedText(text: string): Promise<number[]> {
  const truncated = text.slice(0, 8000); // ~2048 tokens max
  const extractor = await getEmbedder();
  const result = await extractor(truncated, {
    pooling: "mean",
    normalize: true,
  });
  return Array.from(result.data) as number[];
}

/**
 * Generate embeddings for multiple chunks in batch.
 * Much faster than calling embedText() repeatedly.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const extractor = await getEmbedder();
  const truncated = texts.map((t) => t.slice(0, 8000));
  const results = await Promise.all(
    truncated.map((t) =>
      extractor(t, { pooling: "mean", normalize: true })
    )
  );
  return results.map((r: any) => Array.from(r.data) as number[]);
}

/**
 * Chunk text into overlapping segments of ~500 chars each.
 * Overlap of 100 chars ensures context isn't lost at boundaries.
 */
export function chunkText(
  text: string,
  chunkSize = 500,
  overlap = 100
): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;
  // Approximate: ~4 chars per word
  const wordsPerChunk = Math.floor(chunkSize / 5);
  const wordsOverlap = Math.floor(overlap / 5);

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
 * Convert a float32 embedding array to a PostgreSQL vector literal string.
 * pgvector expects: '[0.1, 0.2, 0.3, ...]'
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
