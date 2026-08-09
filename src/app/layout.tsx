import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ResuMatch — Multi-Agent AI ATS Resume Optimizer & Career Coach",
  description:
    "Beat Applicant Tracking Systems (ATS) with 6 Multi-Agent AI models, RAG semantic matching, and ML score prediction. Optimize your resume for 75-80%+ ATS score on every job application to land 4x more interviews.",
  keywords: [
    "ATS resume optimizer",
    "resume score predictor",
    "beat applicant tracking system",
    "multi-agent AI resume rewriter",
    "career roadmap generator",
    "ATS keyword matcher",
    "job search AI coach",
  ],
  authors: [{ name: "ResuMatch Team" }],
  openGraph: {
    title: "ResuMatch — Multi-Agent AI ATS Resume Optimizer",
    description:
      "Stop getting auto-rejected by ATS bots. Analyze & optimize your resume for 75-80%+ ATS score for every job application.",
    url: "https://ats-resume-optimizer.vercel.app",
    siteName: "ResuMatch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResuMatch — Multi-Agent AI ATS Resume Optimizer",
    description:
      "Stop getting auto-rejected by ATS bots. Optimize your resume for 75-80%+ ATS score every application.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || ""}`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || ""}');
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <ThemeProvider>
          <SessionProvider>
            <Navbar />
            <main className="flex-1 pb-safe">{children}</main>
            <MobileNav />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
