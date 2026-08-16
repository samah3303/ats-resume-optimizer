import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ResuMatch",
  },
  other: {
    "mobile-web-app-capable": "yes",
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
      className={`${sora.variable} ${jetbrainsMono.variable} h-full antialiased`}
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
        <meta name="theme-color" content="#FFFFFF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-zinc-950 font-sans selection:bg-black selection:text-white">
        <ThemeProvider>
          <SessionProvider>
            <Navbar />
            <main className="flex-1 pb-safe">{children}</main>
            <MobileNav />
          </SessionProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
