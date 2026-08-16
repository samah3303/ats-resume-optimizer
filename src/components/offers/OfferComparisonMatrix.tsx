"use client";

import { useState } from "react";
import { calculateCompBreakdown, CompensationPackage } from "@/lib/ai/negotiation";

interface OfferData {
  companyName: string;
  roleTitle: string;
  baseSalary: number;
  bonusPercent: number;
  signOn: number;
  equityTotal: number;
  remoteRating: number; // 1 to 5
  growthRating: number; // 1 to 5
  cultureRating: number; // 1 to 5
}

export function OfferComparisonMatrix() {
  const [offers, setOffers] = useState<OfferData[]>([
    {
      companyName: "Stripe",
      roleTitle: "Staff Software Engineer",
      baseSalary: 195000,
      bonusPercent: 15,
      signOn: 30000,
      equityTotal: 240000,
      remoteRating: 5,
      growthRating: 5,
      cultureRating: 4,
    },
    {
      companyName: "Series B AI Startup",
      roleTitle: "Lead Systems Architect",
      baseSalary: 175000,
      bonusPercent: 10,
      signOn: 15000,
      equityTotal: 300000,
      remoteRating: 4,
      growthRating: 5,
      cultureRating: 5,
    },
  ]);

  const addOffer = () => {
    if (offers.length >= 3) return;
    setOffers([
      ...offers,
      {
        companyName: `Company ${offers.length + 1}`,
        roleTitle: "Senior Engineer",
        baseSalary: 160000,
        bonusPercent: 10,
        signOn: 10000,
        equityTotal: 120000,
        remoteRating: 4,
        growthRating: 4,
        cultureRating: 4,
      },
    ]);
  };

  const removeOffer = (index: number) => {
    if (offers.length <= 1) return;
    setOffers(offers.filter((_, i) => i !== index));
  };

  const updateOffer = (index: number, key: keyof OfferData, value: any) => {
    const next = [...offers];
    next[index] = { ...next[index], [key]: value };
    setOffers(next);
  };

  // Calculate scores
  const analyzedOffers = offers.map((off) => {
    const comp: CompensationPackage = calculateCompBreakdown({
      companyName: off.companyName,
      roleTitle: off.roleTitle,
      baseSalary: off.baseSalary,
      annualBonusPercent: off.bonusPercent,
      signOnBonus: off.signOn,
      equityTotalGrant: off.equityTotal,
    });

    const compScore = Math.min(100, Math.round((comp.year1TotalComp / 350000) * 100));
    const nonCompScore = Math.round(
      ((off.remoteRating + off.growthRating + off.cultureRating) / 15) * 100
    );
    const overallScore = Math.round(compScore * 0.6 + nonCompScore * 0.4);

    return {
      ...off,
      comp,
      compScore,
      nonCompScore,
      overallScore,
    };
  });

  const bestOffer = [...analyzedOffers].sort((a, b) => b.overallScore - a.overallScore)[0];

  return (
    <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <span className="px-3 py-1 bg-zinc-100 border border-zinc-300 text-zinc-900 text-xs font-black rounded-xl uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm mb-2">
            <span>⚖️</span> Multi-Offer Decision Matrix
          </span>
          <h3 className="text-xl font-black text-black">Side-by-Side Offer Evaluator</h3>
          <p className="text-xs text-zinc-600">
            Compare base compensation, equity valuation, remote flexibility, and career upside.
          </p>
        </div>

        {offers.length < 3 && (
          <button
            onClick={addOffer}
            className="touch-target px-4 py-2.5 bg-black hover:bg-zinc-800 text-white font-black text-xs rounded-xl border border-black transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Add Competing Offer
          </button>
        )}
      </div>

      {/* Grid Comparison */}
      <div className={`grid grid-cols-1 ${offers.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"} gap-6`}>
        {analyzedOffers.map((off, idx) => {
          const isWinner = bestOffer?.companyName === off.companyName;
          return (
            <div
              key={idx}
              className={`p-6 rounded-3xl border transition-all space-y-5 flex flex-col justify-between shadow-sm relative ${
                isWinner
                  ? "bg-zinc-50 border-black ring-2 ring-black"
                  : "bg-white border-zinc-200"
              }`}
            >
              {isWinner && (
                <div className="absolute -top-3 left-6 px-3 py-0.5 bg-black text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-sm">
                  ⭐ Top Overall Score
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={off.companyName}
                    onChange={(e) => updateOffer(idx, "companyName", e.target.value)}
                    className="font-black text-base text-black bg-transparent border-b border-transparent focus:border-black outline-none"
                  />
                  {offers.length > 1 && (
                    <button
                      onClick={() => removeOffer(idx)}
                      className="text-xs text-zinc-400 hover:text-rose-600 p-1"
                      title="Remove offer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={off.roleTitle}
                  onChange={(e) => updateOffer(idx, "roleTitle", e.target.value)}
                  className="text-xs font-semibold text-zinc-600 bg-transparent border-b border-transparent focus:border-black outline-none w-full"
                />

                {/* Score Banner */}
                <div className="p-4 bg-white border border-zinc-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-zinc-500 block">
                      Year 1 Total Comp
                    </span>
                    <span className="text-xl font-black text-black font-mono">
                      ${off.comp.year1TotalComp.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-black font-mono">
                      {off.overallScore}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Index Score</span>
                  </div>
                </div>

                {/* Offer Levers */}
                <div className="space-y-3 text-xs pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-zinc-600">Base Salary:</span>
                    <input
                      type="number"
                      value={off.baseSalary}
                      onChange={(e) => updateOffer(idx, "baseSalary", Number(e.target.value))}
                      className="w-24 text-right bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 font-mono font-bold text-black"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-zinc-600">Sign-on Bonus:</span>
                    <input
                      type="number"
                      value={off.signOn}
                      onChange={(e) => updateOffer(idx, "signOn", Number(e.target.value))}
                      className="w-24 text-right bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 font-mono font-bold text-black"
                    />
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-zinc-600">4-Yr Equity ($):</span>
                    <input
                      type="number"
                      value={off.equityTotal}
                      onChange={(e) => updateOffer(idx, "equityTotal", Number(e.target.value))}
                      className="w-24 text-right bg-zinc-50 border border-zinc-300 rounded-lg px-2 py-1 font-mono font-bold text-black"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                    <span className="font-medium text-zinc-600">Remote Flexibility:</span>
                    <span className="font-bold text-black">{"⭐".repeat(off.remoteRating)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium text-zinc-600">Career Growth:</span>
                    <span className="font-bold text-black">{"⭐".repeat(off.growthRating)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 text-center">
                <span className="text-[11px] font-bold text-zinc-600">
                  4-Year Total: <strong className="text-black font-mono">${off.comp.total4YearComp.toLocaleString()}</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
