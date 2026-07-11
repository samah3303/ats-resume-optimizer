"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-24 md:py-32 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            ✨ AI-Powered Resume Analysis
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
            Make Your Resume{" "}
            <span className="text-gradient">ATS-Proof</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Most resumes never reach a human because they fail ATS scans. Our
            AI analyzes your resume against real job descriptions, finds keyword
            gaps, and suggests rewrites — so you get past the bots and land
            interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-8 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Get Started Free
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "📄",
                title: "Upload Resume",
                desc: "Upload your resume in PDF or DOCX format. We'll parse and extract all your content.",
              },
              {
                icon: "🔍",
                title: "Analyze vs JD",
                desc: "Paste a job description and our AI compares every section — keywords, skills, format, impact.",
              },
              {
                icon: "✨",
                title: "Get Optimized",
                desc: "Receive a scored report with specific suggestions. Accept them and download an optimized resume.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-gray-200 bg-gray-50 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-sm text-gray-500 border-t border-gray-200">
        &copy; {new Date().getFullYear()} ATS Resume Optimizer. All rights
        reserved.
      </footer>
    </div>
  );
}
