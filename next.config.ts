import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdfkit", "pdf-parse", "mammoth", "jszip", "@xenova/transformers", "ws", "ai", "@ai-sdk/openai", "@ai-sdk/provider-utils"],
};

export default nextConfig;
