/**
 * ResuMatch MCP Server
 *
 * Model Context Protocol server that exposes user data (resumes, profiles,
 * analyses, applications) as resources and tools for any MCP-compatible client.
 *
 * Uses Neon HTTP driver (no TCP 5432 required).
 * Run: npx tsx mcp/server.ts
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load DATABASE_URL from .env
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
for (const line of envContent.split("\n")) {
  const m = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
  if (m) process.env[m[1]] = m[2];
}

const sql = neon(process.env.DATABASE_URL!);

// ─── Tool Definitions ───────────────────────────────────────────────────────

const tools = {
  get_user_profile: {
    description: "Get the user's onboarding profile",
    inputSchema: {
      type: "object",
      properties: { userId: { type: "string" } },
      required: ["userId"],
    },
  },
  get_resumes: {
    description: "Get all resumes for a user",
    inputSchema: {
      type: "object",
      properties: { userId: { type: "string" }, limit: { type: "number", default: 10 } },
      required: ["userId"],
    },
  },
  get_analysis_history: {
    description: "Get recent ATS analyses with scores",
    inputSchema: {
      type: "object",
      properties: { userId: { type: "string" }, limit: { type: "number", default: 20 } },
      required: ["userId"],
    },
  },
  get_job_descriptions: {
    description: "Get saved job descriptions",
    inputSchema: {
      type: "object",
      properties: { userId: { type: "string" }, limit: { type: "number", default: 20 } },
      required: ["userId"],
    },
  },
  get_applications: {
    description: "Get job application tracker status",
    inputSchema: {
      type: "object",
      properties: { userId: { type: "string" } },
      required: ["userId"],
    },
  },
  search_similar_resumes: {
    description: "Semantic search across resume chunks using pgvector",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string" }, userId: { type: "string" }, limit: { type: "number", default: 5 } },
      required: ["query", "userId"],
    },
  },
  get_skill_gaps: {
    description: "Get aggregated skill gaps across all analyses",
    inputSchema: {
      type: "object",
      properties: { userId: { type: "string" } },
      required: ["userId"],
    },
  },
};

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handleTool(name: string, args: any) {
  switch (name) {
    case "get_user_profile": {
      const rows = await sql`SELECT * FROM onboarding_profiles WHERE user_id = ${args.userId}`;
      return { content: [{ type: "text", text: JSON.stringify(rows[0] || { error: "No profile" }, null, 2) }] };
    }
    case "get_resumes": {
      const rows = await sql`SELECT id, name, doc_type, created_at FROM resumes WHERE user_id = ${args.userId} ORDER BY created_at DESC LIMIT ${args.limit || 10}`;
      return { content: [{ type: "text", text: JSON.stringify({ resumes: rows }, null, 2) }] };
    }
    case "get_analysis_history": {
      const rows = await sql`
        SELECT a.id, a.overall_score, a.keywords_match_pct, a.format_score, a.impact_score,
               a.summary_text, a.created_at, r.name as resume_name, jd.title as jd_title
        FROM analyses a
        LEFT JOIN resumes r ON a.resume_id = r.id
        LEFT JOIN job_descriptions jd ON a.job_description_id = jd.id
        WHERE a.user_id = ${args.userId}
        ORDER BY a.created_at DESC LIMIT ${args.limit || 20}
      `;
      return { content: [{ type: "text", text: JSON.stringify({ analyses: rows }, null, 2) }] };
    }
    case "get_job_descriptions": {
      const rows = await sql`SELECT id, title, company, source_url, created_at FROM job_descriptions WHERE user_id = ${args.userId} ORDER BY created_at DESC LIMIT ${args.limit || 20}`;
      return { content: [{ type: "text", text: JSON.stringify({ jds: rows }, null, 2) }] };
    }
    case "get_applications": {
      const rows = await sql`
        SELECT app.id, app.status, app.notes, app.applied_at, app.updated_at,
               jd.title as jd_title, jd.company as jd_company
        FROM applications app
        JOIN job_descriptions jd ON app.jd_id = jd.id
        WHERE app.user_id = ${args.userId}
        ORDER BY app.updated_at DESC
      `;
      return { content: [{ type: "text", text: JSON.stringify({ applications: rows }, null, 2) }] };
    }
    case "search_similar_resumes": {
      try {
        const { embedText, toPgVector } = await import("../src/lib/embeddings");
        const embedding = await embedText(args.query);
        const vec = toPgVector(embedding);
        const rows = await sql`
          SELECT rc.chunk_text, rc.resume_id, 1 - (rc.embedding <=> ${vec}::vector) AS similarity
          FROM resume_chunks rc
          JOIN resumes r ON rc.resume_id = r.id
          WHERE r.user_id = ${args.userId}
          ORDER BY rc.embedding <=> ${vec}::vector
          LIMIT ${args.limit || 5}
        `;
        return { content: [{ type: "text", text: JSON.stringify({ results: rows }, null, 2) }] };
      } catch (e) {
        return { content: [{ type: "text", text: JSON.stringify({ error: "Vector search unavailable", detail: e.message }) }], isError: true };
      }
    }
    case "get_skill_gaps": {
      const rows = await sql`SELECT skills_gap_json FROM analyses WHERE user_id = ${args.userId} AND skills_gap_json IS NOT NULL ORDER BY created_at DESC LIMIT 50`;
      const counts: Record<string, number> = {};
      for (const r of rows) {
        try {
          const gaps = JSON.parse(r.skills_gap_json);
          const missing = gaps.skills?.missing || gaps.skillGaps?.filter((g: any) => g.status === "missing").map((g: any) => g.skill) || [];
          missing.forEach((s: string) => { counts[s] = (counts[s] || 0) + 1; });
        } catch {}
      }
      const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a).map(([skill, count]) => ({ skill, missingCount: count }));
      return { content: [{ type: "text", text: JSON.stringify({ skillGaps: sorted }, null, 2) }] };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ─── Server ─────────────────────────────────────────────────────────────────

const server = new Server({ name: "resumatch-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: Object.entries(tools).map(([name, def]) => ({ name, description: def.description, inputSchema: def.inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    return await handleTool(request.params.name, request.params.arguments || {});
  } catch (error) {
    return { content: [{ type: "text", text: JSON.stringify({ error: "Tool failed", detail: error.message }) }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[mcp] ResuMatch MCP server running on stdio");
