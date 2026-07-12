import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SessionProvider from "@/components/SessionProvider";
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
  title: "ATS Resume Optimizer",
  description:
    "Make your resume ATS-proof. Analyze and optimize your resume for Applicant Tracking Systems using AI.",
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
      <body className="min-h-full flex flex-col text-slate-900">
        <SessionProvider>
          <Navbar />
          <main className="flex-1 pb-safe">{children}</main>
          <MobileNav />
        </SessionProvider>
      </body>
    </html>
  );
}
