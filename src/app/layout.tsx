import type { Metadata } from "next";
import { Sora, JetBrains_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { UndoToastContainer } from "@/components/ui/UndoToast";
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
  title: "KYRO — The Complete 1-Stop AI Career & Talent Operating System",
  description:
    "Universal AI platform for job seekers and recruiters: Semantic Job Matching, ATS Resume Studio, In-Browser Coding Sandbox, AI Voice Mock Interviews, LinkedIn Outreach, and Salary Negotiation War Room.",
  keywords: [
    "KYRO AI",
    "career operating system",
    "ATS resume studio",
    "AI mock interview voice",
    "in-browser coding challenge",
    "recruiter talent OS",
    "salary negotiation simulator",
    "job search AI",
  ],
  authors: [{ name: "KYRO Team" }],
  openGraph: {
    title: "KYRO — The Complete 1-Stop AI Career & Talent Operating System",
    description:
      "All-in-one AI platform for job search, ATS resume building, coding challenges, conversational voice mock interviews, and recruiter talent pipelines.",
    url: "https://kyro-ai.vercel.app",
    siteName: "KYRO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KYRO — The Complete 1-Stop AI Career & Talent Operating System",
    description:
      "All-in-one AI platform for job search, ATS resume building, coding challenges, conversational voice mock interviews, and recruiter talent pipelines.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KYRO",
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
        <UndoToastContainer />
      </body>
    </html>
  );
}
