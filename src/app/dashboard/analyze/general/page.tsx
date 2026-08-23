"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ResumeImprovement {
  section: string;
  current: string;
  suggested: string;
  reason: string;
  atsBoost?: string | number;
}

export default function GeneralAtsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<number | null>(null);
  const [recalculating, setRecalculating] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [improvements, setImprovements] = useState<ResumeImprovement[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/account/profile");
      const data = await res.json();
      if (data.profile) {
        setScore(data.profile.generalAtsScore);
        if (data.profile.resumeImprovements) {
          try {
            setImprovements(JSON.parse(data.profile.resumeImprovements));
          } catch (e) {}
        }
      }
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApplySuggestion = async (index: number) => {
    setApplying(index);
    const suggestion = improvements[index];
    
    try {
      const res = await fetch("/api/resumes/primary/update-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestion }),
      });
      
      if (!res.ok) throw new Error("Failed to update resume");
      
      const data = await res.json();
      toast.success("Resume updated successfully!");
      
      // Re-fetch data to get new score and suggestions
      setRecalculating(true);
      await fetchData();
      
      if (data.newScore && data.newScore >= 80) {
        toast.success("LinkedIn Optimization unlocked! 🎉", { duration: 5000 });
      }
      
    } catch (error) {
      toast.error("Failed to apply suggestion");
    } finally {
      setApplying(null);
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <Link
            href="/dashboard"
            className="text-xs font-bold text-zinc-400 hover:text-[#FAFAFA] flex items-center gap-1.5 cursor-pointer mb-1.5 transition-colors"
          >
            <span>&larr;</span>
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#FAFAFA]">
            General ATS Analysis
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review and apply AI suggestions to optimize your baseline resume for your target market.
          </p>
        </div>
        {score !== null && (
          <div className="flex items-center gap-4 bg-[#18181B] border border-[#27272A] p-4 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Current Score</span>
              <span className={`text-2xl font-black ${score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                {score}%
              </span>
            </div>
          </div>
        )}
      </div>

      {recalculating && (
        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold">Recalculating ATS Score and analyzing new resume...</span>
        </div>
      )}

      {improvements.length === 0 ? (
        <div className="p-8 text-center bg-[#18181B] border border-[#27272A] rounded-2xl">
          <p className="text-sm text-zinc-400 font-bold mb-4">No suggestions available.</p>
          <p className="text-xs text-zinc-500">Run the Onboarding Analysis to generate suggestions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#FAFAFA]">Section-by-Section Improvements</h2>
          {improvements.map((imp, idx) => (
            <div key={idx} className="p-6 bg-[#18181B] border border-[#27272A] rounded-2xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#27272A] text-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider">
                    {imp.section}
                  </span>
                </div>
                {imp.atsBoost && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                    +{imp.atsBoost} ATS Score
                  </span>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                  <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Current</div>
                  <p className="text-xs text-zinc-300 whitespace-pre-wrap">{imp.current}</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 space-y-2">
                  <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Suggested</div>
                  <p className="text-xs text-[#FAFAFA] whitespace-pre-wrap font-semibold">{imp.suggested}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#09090B] border border-[#27272A]">
                <p className="text-xs text-zinc-400"><strong className="text-zinc-300">Why: </strong>{imp.reason}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => handleApplySuggestion(idx)}
                  disabled={applying !== null || recalculating}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  {applying === idx ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Applying...
                    </>
                  ) : (
                    "Accept & Update Resume"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
