"use client";

import { useState } from "react";

interface StarOption {
  title: string;
  bullet: string;
  starBreakdown: {
    situationTask: string;
    action: string;
    resultMetrics: string;
  };
}

export default function StarBulletRewriter() {
  const [rawBullet, setRawBullet] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<StarOption[] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleRewrite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawBullet.trim()) return;

    setLoading(true);
    setError("");
    setOptions(null);

    try {
      const res = await fetch("/api/star-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawBullet, targetRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to rewrite bullet point");
      }

      const data = await res.json();
      setOptions(data.options);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rewrite bullet point");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-[#14161D]/80 backdrop-blur-2xl rounded-3xl border border-amber-500/20 p-6 shadow-2xl space-y-5 text-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-lg shrink-0">
          ⭐
        </div>
        <div>
          <h2 className="text-base font-black text-white">STAR Method Bullet Rewriter</h2>
          <p className="text-xs text-zinc-400">
            Convert weak resume lines into quantified, high-impact STAR achievement statements.
          </p>
        </div>
      </div>

      <form onSubmit={handleRewrite} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-amber-300 mb-1.5">
            Raw Resume Bullet / Task
          </label>
          <textarea
            value={rawBullet}
            onChange={(e) => setRawBullet(e.target.value)}
            placeholder="e.g. Responsible for customer support, updating website content, and managing team schedules..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-xs font-medium text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-amber-300 mb-1.5">
            Target Job Role (Optional)
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Frontend Developer / Project Manager"
            className="w-full px-4 py-3 rounded-xl bg-[#090A0C] border border-[#242834] text-xs font-medium text-white placeholder-zinc-500 outline-none focus:border-amber-500 transition-all"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-300 font-bold">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !rawBullet.trim()}
          className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              Transforming into STAR Impact...
            </>
          ) : (
            "✨ Generate 3 STAR Options"
          )}
        </button>
      </form>

      {options && options.length > 0 && (
        <div className="mt-6 space-y-4 pt-4 border-t border-[#242834]">
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
            Recommended STAR Achievement Options
          </h3>

          <div className="space-y-3">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#090A0C] border border-[#242834] hover:border-amber-500/40 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {opt.title}
                  </span>
                  <button
                    onClick={() => handleCopy(opt.bullet, idx)}
                    className="text-xs text-amber-400 hover:underline font-bold flex items-center gap-1"
                  >
                    {copiedIndex === idx ? "✓ Copied!" : "📋 Copy Bullet"}
                  </button>
                </div>

                <p className="text-xs font-medium text-white leading-relaxed bg-[#14161D] p-3 rounded-xl border border-[#242834] font-mono">
                  &bull; {opt.bullet}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="bg-[#14161D] p-2.5 rounded-xl border border-[#242834]">
                    <span className="font-bold text-amber-300 block mb-0.5">S / T (Situation/Task):</span>
                    <span className="text-zinc-300">{opt.starBreakdown.situationTask}</span>
                  </div>
                  <div className="bg-[#14161D] p-2.5 rounded-xl border border-[#242834]">
                    <span className="font-bold text-blue-300 block mb-0.5">A (Action):</span>
                    <span className="text-zinc-300">{opt.starBreakdown.action}</span>
                  </div>
                  <div className="bg-[#14161D] p-2.5 rounded-xl border border-[#242834]">
                    <span className="font-bold text-emerald-300 block mb-0.5">R (Result/Metrics):</span>
                    <span className="text-zinc-300">{opt.starBreakdown.resultMetrics}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
