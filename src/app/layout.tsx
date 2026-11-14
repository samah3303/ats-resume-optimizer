import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "paniund — ATS Resume Optimizer",
    template: "%s | paniund",
  },
  description:
    "paniund is an advanced ATS resume optimization and candidate intelligence platform. Functional, democratic, and clear career telemetry engineered to maximize ATS match rates.",
  keywords: [
    "paniund",
    "ATS resume optimizer",
    "resume parser",
    "job search tracker",
    "career operating system",
    "application tracking",
  ],
  authors: [{ name: "paniund" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "paniund — ATS Resume Optimizer",
    description: "Analyze ATS gaps, optimize resumes with AI, and track applications with functional clarity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || "https://cloud.umami.is/script.js";

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-[100dvh] bg-[#F5F5F5] text-[#111111] antialiased">
        {umamiWebsiteId && (
          <Script
            src={umamiScriptUrl}
            data-website-id={umamiWebsiteId}
            strategy="afterInteractive"
          />
        )}
        {children}
      </body>
    </html>
  );
}
