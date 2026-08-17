"use client";

import { useState } from "react";
import { calculateCompBreakdown, CompensationPackage } from "@/lib/ai/negotiation";

export function TotalCompCalculator() {
  const [companyName, setCompanyName] = useState("Acme Corp");
  const [roleTitle, setRoleTitle] = useState("Senior Full-Stack Engineer");
  const [location, setLocation] = useState("San Francisco / Remote");
  const [baseSalary, setBaseSalary] = useState(175000);
  const [annualBonusPercent, setAnnualBonusPercent] = useState(15);
  const [signOnBonus, setSignOnBonus] = useState(25000);
  const [equityTotalGrant, setEquityTotalGrant] = useState(160000);
  const [equityVestingType, setEquityVestingType] = useState<"standard_4yr_cliff" | "backloaded_amazon" | "equal_monthly" | "none">("standard_4yr_cliff");
  const [relocationBonus, setRelocationBonus] = useState(5000);
  const [employer401kMatch, setEmployer401kMatch] = useState(6000);

  const comp: CompensationPackage = calculateCompBreakdown({
    companyName,
    roleTitle,
    location,
    baseSalary,
    annualBonusPercent,
    signOnBonus,
    equityTotalGrant,
    equityVestingType,
    relocationBonus,
    employer401kMatch,
  });

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Year 1 Total Comp
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono mt-2">
            {formatCurrency(comp.year1TotalComp)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1">Includes Sign-on & Y1 Equity</span>
        </div>

        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            Annual Base Salary
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono mt-2">
            {formatCurrency(comp.baseSalary)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1">Guaranteed annual cash</span>
        </div>

        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            4-Year Equity Value
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono mt-2">
            {formatCurrency(comp.equityTotalGrant)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1">
            {equityVestingType === "standard_4yr_cliff" ? "25%/yr (1-yr cliff)" : "Amazon 5/15/40/40"}
          </span>
        </div>

        <div className="bg-white border border-zinc-200 hover:border-black rounded-2xl p-4 sm:p-5 transition-all shadow-sm flex flex-col justify-between">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
            4-Year Total Package
          </span>
          <div className="text-2xl sm:text-3xl font-black text-black tracking-tight font-mono mt-2">
            {formatCurrency(comp.total4YearComp)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1">Avg {formatCurrency(comp.averageAnnualComp)}/yr</span>
        </div>
      </div>

      {/* Input Sliders & 4-Year Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Inputs & Sliders (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="pb-4 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-black">
                Compensation Variables
              </h3>
              <p className="text-xs text-zinc-600">
                Adjust offer levers or load instant industry benchmark packages.
              </p>
            </div>

            {/* 1-Click Industry Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setCompanyName("Meta");
                  setRoleTitle("E5 Senior Software Engineer");
                  setBaseSalary(205000);
                  setAnnualBonusPercent(15);
                  setSignOnBonus(35000);
                  setEquityTotalGrant(320000);
                  setEquityVestingType("standard_4yr_cliff");
                }}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white border border-zinc-300 rounded-lg text-[10px] font-bold text-black transition-all"
              >
                ⚡ Load Meta E5
              </button>
              <button
                type="button"
                onClick={() => {
                  setCompanyName("Stripe");
                  setRoleTitle("Staff Infrastructure Lead");
                  setBaseSalary(240000);
                  setAnnualBonusPercent(20);
                  setSignOnBonus(50000);
                  setEquityTotalGrant(450000);
                  setEquityVestingType("standard_4yr_cliff");
                }}
                className="px-2.5 py-1 bg-zinc-100 hover:bg-black hover:text-white border border-zinc-300 rounded-lg text-[10px] font-bold text-black transition-all"
              >
                ⚡ Load Stripe Staff
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block mb-1">
                Role Title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full bg-white border border-zinc-300 focus:border-black text-xs text-black rounded-xl px-3.5 py-2.5 outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Base Salary Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-zinc-700">Base Salary ($ / year)</span>
              <span className="font-mono font-black text-black">{formatCurrency(baseSalary)}</span>
            </div>
            <input
              type="range"
              min={60000}
              max={400000}
              step={5000}
              value={baseSalary}
              onChange={(e) => setBaseSalary(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Annual Target Bonus % */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-zinc-700">
                Annual Target Bonus ({annualBonusPercent}%)
              </span>
              <span className="font-mono font-black text-black">
                {formatCurrency(comp.annualBonusAmount)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={annualBonusPercent}
              onChange={(e) => setAnnualBonusPercent(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Sign-On Bonus */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-zinc-700">Sign-On Bonus (Year 1)</span>
              <span className="font-mono font-black text-black">{formatCurrency(signOnBonus)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={150000}
              step={2500}
              value={signOnBonus}
              onChange={(e) => setSignOnBonus(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Equity Grant */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-zinc-700">4-Year Equity Value ($ Grant)</span>
              <span className="font-mono font-black text-black">{formatCurrency(equityTotalGrant)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={1000000}
              step={10000}
              value={equityTotalGrant}
              onChange={(e) => setEquityTotalGrant(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>

          {/* Vesting Schedule */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
              Vesting Schedule Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEquityVestingType("standard_4yr_cliff")}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                  equityVestingType === "standard_4yr_cliff"
                    ? "bg-black text-white border-black"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-black"
                }`}
              >
                Standard 4-Yr (25%/yr)
              </button>
              <button
                type="button"
                onClick={() => setEquityVestingType("backloaded_amazon")}
                className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all ${
                  equityVestingType === "backloaded_amazon"
                    ? "bg-black text-white border-black"
                    : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-black"
                }`}
              >
                Amazon (5/15/40/40)
              </button>
            </div>
          </div>
        </div>

        {/* Right Form: 4-Year Timeline Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-zinc-200">
              <h3 className="text-base sm:text-lg font-black text-black">
                4-Year Compensation Timeline
              </h3>
              <p className="text-xs text-zinc-600">
                Annual projected earnings factoring cliff and bonus decay.
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {[
                { year: "Year 1", total: comp.year1TotalComp, note: "Peak with Sign-on" },
                { year: "Year 2", total: comp.year2TotalComp, note: "Base + Bonus + Equity" },
                { year: "Year 3", total: comp.year3TotalComp, note: "Base + Bonus + Equity" },
                { year: "Year 4", total: comp.year4TotalComp, note: "Final Grant Year" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-black text-black block">{item.year}</span>
                    <span className="text-[10px] text-zinc-500">{item.note}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-black font-mono">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-zinc-100 border border-zinc-300 rounded-2xl text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">
              Effective Hourly Rate (2,000 hrs/yr)
            </span>
            <div className="text-2xl font-black text-black font-mono">
              ${Math.round(comp.year1TotalComp / 2000)} / hr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
