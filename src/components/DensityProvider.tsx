"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type DensityMode = "compact" | "standard";

interface DensityContextType {
  density: DensityMode;
  setDensity: (mode: DensityMode) => void;
  toggleDensity: () => void;
}

const DensityContext = createContext<DensityContextType>({
  density: "standard",
  setDensity: () => {},
  toggleDensity: () => {},
});

export function DensityProvider({ children }: { children: React.ReactNode }) {
  const [density, setDensityState] = useState<DensityMode>("standard");

  useEffect(() => {
    const saved = localStorage.getItem("flip7_density") as DensityMode | null;
    if (saved === "standard" || saved === "compact") {
      setDensityState(saved);
      document.documentElement.setAttribute("data-density", saved);
    } else {
      document.documentElement.setAttribute("data-density", "standard");
    }
  }, []);

  const setDensity = (mode: DensityMode) => {
    setDensityState(mode);
    localStorage.setItem("flip7_density", mode);
    document.documentElement.setAttribute("data-density", mode);
  };

  const toggleDensity = () => {
    const next = density === "compact" ? "standard" : "compact";
    setDensity(next);
  };

  return (
    <DensityContext.Provider value={{ density, setDensity, toggleDensity }}>
      <div data-density={density} className="contents">
        {children}
      </div>
    </DensityContext.Provider>
  );
}

export function useDensity() {
  return useContext(DensityContext);
}

export function DensityToggle() {
  const { density, setDensity } = useDensity();

  return (
    <div className="inline-flex items-center rounded-full border border-[#3CC4BD]/40 bg-[#E8F6F5] p-1 shadow-xs">
      <button
        type="button"
        onClick={() => setDensity("compact")}
        title="Compact layout mode"
        className={`rounded-full px-3 py-1 text-xs font-black tracking-wider uppercase transition-all duration-150 ${
          density === "compact"
            ? "bg-[#2BA8A2] text-white shadow-xs"
            : "text-[#1E8C86] hover:text-[#166E69]"
        }`}
      >
        Compact
      </button>
      <button
        type="button"
        onClick={() => setDensity("standard")}
        title="Bouncy layout mode"
        className={`rounded-full px-3 py-1 text-xs font-black tracking-wider uppercase transition-all duration-150 ${
          density === "standard"
            ? "bg-[#FFD23F] text-[#1E8C86] shadow-xs"
            : "text-[#1E8C86] hover:text-[#166E69]"
        }`}
      >
        Bouncy
      </button>
    </div>
  );
}
