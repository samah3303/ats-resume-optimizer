"use client";

import { CareerKnowledgeGraph } from "@/components/graph/CareerKnowledgeGraph";

export default function CareerGraphPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-[#FAFAFA] tracking-tight">
          Career Knowledge Graph
        </h1>
        <p className="text-zinc-400 mt-2">
          A visualization of your entire career footprint—mapping your skills to your target roles, resumes, and active job applications.
        </p>
      </div>

      <CareerKnowledgeGraph />
    </div>
  );
}
