import HowToUseSection from "@/components/HowToUseSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to Use - KYRO ATS Optimizer",
  description:
    "Learn how to use KYRO to parse resumes, match against job descriptions, optimize ATS scores, and track your job applications.",
};

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-white text-black py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-6">
        <HowToUseSection />
      </div>
    </div>
  );
}
