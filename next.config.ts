import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdfjs-dist", "pdfkit"],
};

export default nextConfig;
