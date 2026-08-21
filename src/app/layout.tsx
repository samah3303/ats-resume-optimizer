import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { UndoToastContainer } from "@/components/ui/UndoToast";
import { WorkspaceModeProvider } from "@/components/WorkspaceModeContext";
import BottomActionDock from "@/components/BottomActionDock";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Paniund — The Talent Operating System",
  description:
    "Universal talent operating system for job seekers and recruiters: Semantic Job Matching, ATS Resume Studio, Monaco Coding Challenges, AI Voice Mock Interviews, and Recruiter Pipelines.",
  metadataBase: new URL("https://paniund.com"),
  keywords: [
    "Paniund",
    "paniund.com",
    "talent operating system",
    "ATS resume studio",
    "AI mock interview voice",
    "in-browser coding challenge",
    "recruiter talent OS",
    "salary negotiation simulator",
    "job search AI",
  ],
  authors: [{ name: "Paniund Team" }],
  openGraph: {
    title: "Paniund — The Talent Operating System",
    description:
      "All-in-one talent operating system for job search, ATS resume building, coding challenges, conversational voice mock interviews, and recruiter talent pipelines.",
    url: "https://paniund.com",
    siteName: "Paniund",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Paniund — The Talent Operating System",
    description:
      "All-in-one talent operating system for job search, ATS resume building, coding challenges, conversational voice mock interviews, and recruiter talent pipelines.",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Paniund",
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
      className={`${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700,800,900&display=swap"
        />
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
        <meta name="theme-color" content="#09090B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-full flex flex-col bg-[#09090B] text-[#FAFAFA] font-sans selection:bg-[#FAFAFA] selection:text-[#09090B]">
        <ThemeProvider>
          <SessionProvider>
            <WorkspaceModeProvider>
              <Navbar />
              <main className="flex-1 pb-24">{children}</main>
              <BottomActionDock />
            </WorkspaceModeProvider>
          </SessionProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
        <UndoToastContainer />
      </body>
    </html>
  );
}
