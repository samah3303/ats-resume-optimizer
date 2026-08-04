/**
 * Seed Embeddings Script (ESM)
 * Backfills pgvector embeddings for all existing resumes and job descriptions.
 * Uses Neon HTTP driver (bypasses TCP port 5432 blocks).
 * First run: downloads 80MB model (~30s). Subsequent: instant.
 * Usage: node scripts/seed-embeddings.mjs
 */

import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { pipeline } from "@xenova/transformers";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from .env
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m) process.env[m[1]] = m[2];
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error("DATABASE_URL not found"); process.exit(1); }

const sql = neon(DATABASE_URL);

// ─── Embedding helpers ──────────────────────────────────────────────────────

let _extractor = null;
async function getEmbedder() {
  if (!_extractor) {
    console.log("[embed] Loading all-MiniLM-L6-v2 (~30s first time)...");
    _extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("[embed] Model loaded.");
  }
  return _extractor;
}

async function embed(extractor, text) {
  const result = await extractor(text.slice(0, 8000), { pooling: "mean", normalize: true });
  return Array.from(result.data);
}

function toVector(arr) { return `[${arr.map(v => v.toFixed(6)).join(",")}]`; }

function chunkText(text, size = 500, overlap = 100) {
  const words = text.split(/\s+/);
  const wpc = Math.floor(size / 5), wov = Math.floor(overlap / 5);
  const chunks = [];
  for (let i = 0; i < words.length; i += wpc - wov) {
    const c = words.slice(i, i + wpc).join(" ");
    if (c.length > 20) chunks.push(c);
  }
  return chunks;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== ResuMatch Embedding Seeder ===\n");

  // Check vector
  const ext = await sql`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
  if (!ext.length) { console.error("vector extension missing"); process.exit(1); }
  console.log("✓ pgvector OK");

  // Check tables
  const tbls = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('resume_chunks','jd_chunks')`;
  const names = new Set(tbls.map(t => t.table_name));
  if (!names.has("resume_chunks")) { console.error("resume_chunks table missing"); process.exit(1); }
  console.log("✓ Tables OK");

  const extractor = await getEmbedder();

  // Embed resumes
  console.log("\n📄 Embedding resumes...");
  const resumes = await sql`SELECT id, name, parsed_text FROM resumes WHERE parsed_text IS NOT NULL AND parsed_text != ''`;
  let rc = 0;
  for (const r of resumes) {
    const ex = await sql`SELECT COUNT(*) c FROM resume_chunks WHERE resume_id=${r.id}`;
    if (ex[0].c > 0) { console.log(`  ⏭ ${r.name}`); continue; }
    const chunks = chunkText(r.parsed_text);
    for (let i = 0; i < chunks.length; i++) {
      const vec = toVector(await embed(extractor, chunks[i]));
      await sql`INSERT INTO resume_chunks (id,resume_id,chunk_text,chunk_index,embedding) VALUES (gen_random_uuid()::text,${r.id},${chunks[i]},${i},${vec}::vector)`;
    }
    rc += chunks.length;
    console.log(`  ✓ ${r.name}: ${chunks.length} chunks`);
  }

  // Embed JDs
  console.log("\n📋 Embedding JDs...");
  const jds = await sql`SELECT id, title, raw_text FROM job_descriptions WHERE raw_text IS NOT NULL AND raw_text != ''`;
  let jc = 0;
  for (const jd of jds) {
    const ex = await sql`SELECT COUNT(*) c FROM jd_chunks WHERE jd_id=${jd.id}`;
    if (ex[0].c > 0) { console.log(`  ⏭ ${jd.title}`); continue; }
    const chunks = chunkText(jd.raw_text);
    for (let i = 0; i < chunks.length; i++) {
      const vec = toVector(await embed(extractor, chunks[i]));
      await sql`INSERT INTO jd_chunks (id,jd_id,chunk_text,chunk_index,embedding) VALUES (gen_random_uuid()::text,${jd.id},${chunks[i]},${i},${vec}::vector)`;
    }
    jc += chunks.length;
    console.log(`  ✓ ${jd.title}: ${chunks.length} chunks`);
  }

  console.log(`\n✅ Done! ${rc} resume chunks + ${jc} JD chunks embedded.`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
