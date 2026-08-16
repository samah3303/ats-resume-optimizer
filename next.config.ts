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
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
