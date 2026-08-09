import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  output: "standalone",
  serverExternalPackages: [
    "pdfkit",
    "pdf-parse",
    "mammoth",
    "jszip",
    "@xenova/transformers",
    "ws",
    "ai",
    "@ai-sdk/openai",
    "@ai-sdk/provider-utils",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
