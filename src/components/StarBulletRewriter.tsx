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
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg border border-amber-200">
          ⭐
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">STAR Method Bullet Rewriter</h2>
          <p className="text-xs text-slate-500">
            Convert weak resume lines into quantified, high-impact STAR achievement statements.
          </p>
        </div>
      </div>

      <form onSubmit={handleRewrite} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Raw Resume Bullet / Task
          </label>
          <textarea
            value={rawBullet}
            onChange={(e) => setRawBullet(e.target.value)}
            placeholder="e.g. Responsible for customer support, updating website content, and managing team schedules..."
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm outline-none resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Target Job Role (Optional)
          </label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Frontend Developer / Project Manager"
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs outline-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !rawBullet.trim()}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Transforming into STAR Impact...
            </>
          ) : (
            "✨ Generate 3 STAR Options"
          )}
        </button>
      </form>

      {options && options.length > 0 && (
        <div className="mt-6 space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recommended STAR Achievement Options
          </h3>

          <div className="space-y-3">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-indigo-200 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    {opt.title}
                  </span>
                  <button
                    onClick={() => handleCopy(opt.bullet, idx)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    {copiedIndex === idx ? "✓ Copied!" : "📋 Copy Bullet"}
                  </button>
                </div>

                <p className="text-xs font-medium text-slate-800 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/60 font-mono">
                  &bull; {opt.bullet}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                  <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    <span className="font-bold text-amber-900 block mb-0.5">S / T (Situation/Task):</span>
                    {opt.starBreakdown.situationTask}
                  </div>
                  <div className="bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                    <span className="font-bold text-blue-900 block mb-0.5">A (Action):</span>
                    {opt.starBreakdown.action}
                  </div>
                  <div className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                    <span className="font-bold text-emerald-900 block mb-0.5">R (Result/Metrics):</span>
                    {opt.starBreakdown.resultMetrics}
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
