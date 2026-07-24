import HowToUseSection from "@/components/HowToUseSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Use - ResuMatch ATS Optimizer",
  description:
    "Learn how to use ResuMatch to parse resumes, match against job descriptions, optimize ATS scores, and track your job applications.",
};

export default function HowToUsePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <HowToUseSection />
    </div>
  );
}
