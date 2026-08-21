import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { UndoToastContainer } from "@/components/ui/UndoToast";
import { WorkspaceModeProvider } from "@/components/WorkspaceModeContext";
import BottomDock from "@/components/BottomDock";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://paniund.com"),
  title: {
    default: "Paniund — The Talent Operating System",
    template: "%s | Paniund",
  },
  description:
    "The complete 1-stop AI talent operating system for job seekers and recruiters. Build ATS-verified resumes with 6 templates, solve in-browser Monaco coding challenges, practice conversational voice mock interviews, screen applicants in bulk, and negotiate 4-year compensation.",
  applicationName: "Paniund",
  authors: [{ name: "Paniund Engineering", url: "https://paniund.com" }],
  generator: "Next.js",
  keywords: [
    "Paniund",
    "paniund.com",
    "talent operating system",
    "ATS resume builder",
    "ATS resume studio",
    "AI resume optimizer",
    "STAR metric rewriter",
    "resume keyword scanner",
    "ATS score checker",
    "Monaco coding sandbox",
    "algorithmic coding interview",
    "Python coding challenges",
    "system design whiteboard",
    "Mermaid.js system design",
    "AI mock interview voice",
    "spoken interview practice",
    "webcam video composure HUD",
    "autonomous job hunter agent",
    "semantic job discovery",
    "pgvector job matching",
    "salary negotiation simulator",
    "4-year equity vesting",
    "recruiter talent OS",
    "AI job description generator",
    "bulk ATS resume screener",
    "8-stage hiring pipeline kanban",
    "WebRTC video interview rooms",
    "objective hiring scorecards",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Paniund",
  publisher: "Paniund",
  category: "productivity",
  classification: "Career & Recruitment Technology",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://paniund.com",
    languages: {
      "en-US": "https://paniund.com",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://paniund.com",
    siteName: "Paniund",
    title: "Paniund — The Talent Operating System",
    description:
      "All-in-one talent operating system: 6 ATS Resume Templates, Monaco Coding Sandboxes, Spoken Voice Mock Interviews, Recruiter Talent OS, and 4-Year Salary Negotiation.",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        type: "image/svg+xml",
        alt: "Paniund — The Talent Operating System",
      },
      {
        url: "/icons/icon-512.svg",
        width: 512,
        height: 512,
        type: "image/svg+xml",
        alt: "Paniund App Icon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paniund — The Talent Operating System",
    description:
      "The complete 1-stop AI talent operating system uniting job search, technical coding mocks, and recruiter workflows in a distraction-free monochrome OS.",
    creator: "@paniund",
    site: "@paniund",
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Paniund",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://paniund.com/#website",
        url: "https://paniund.com",
        name: "Paniund",
        description: "The Universal AI Talent & Career Operating System",
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        "@id": "https://paniund.com/#software",
        name: "Paniund",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android, macOS, Windows",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "ATS Resume Studio with 6 Pro Templates",
          "Inline STAR Metric Diff Rewriter",
          "In-Browser Monaco Coding IDE in JS, TS, and Python",
          "System Design Vector Whiteboard Arena",
          "Conversational Voice Mock Interview Coach",
          "Webcam Video Presence & Composure HUD",
          "Autonomous 24/7 Job Hunter Swarm",
          "Recruiter AI Job Architect & Bulk ATS Screener",
          "8-Stage Visual Kanban Applicant Pipeline",
          "WebRTC Live Video Interview Rooms",
        ],
      },
      {
        "@type": "Organization",
        "@id": "https://paniund.com/#organization",
        name: "Paniund",
        url: "https://paniund.com",
        logo: "https://paniund.com/icon.svg",
        sameAs: ["https://x.com/paniund"],
      },
    ],
  };

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
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdSchema).replace(/</g, "\\u003c"),
          }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="h-[100dvh] w-full flex flex-col bg-[#09090B] text-[#FAFAFA] font-sans overflow-hidden selection:bg-[#FAFAFA] selection:text-[#09090B]">
        <ThemeProvider>
          <SessionProvider>
            <WorkspaceModeProvider>
              {/* Pure Tile OS Container — Clean Full-Bleed Viewport */}
              <main className="flex-1 w-full overflow-y-auto overflow-x-hidden">
                {children}
              </main>
              {/* Floating Bottom OS Navigation Dock */}
              <BottomDock />
            </WorkspaceModeProvider>
          </SessionProvider>
        </ThemeProvider>
        <ServiceWorkerRegistration />
        <UndoToastContainer />
      </body>
    </html>
  );
}
