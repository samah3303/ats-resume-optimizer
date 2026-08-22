import { STEPS } from "./constants";

interface OnboardingStepperProps {
  step: number;
}

export default function OnboardingStepper({ step }: OnboardingStepperProps) {
  return (
    <div className="flex items-center justify-center mb-8 sm:mb-10">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-mono font-bold transition-all ${
                step === s.num
                  ? "bg-[#FAFAFA] text-[#09090B] shadow-[0_0_12px_rgba(250,250,250,0.35)] ring-2 ring-[#FAFAFA]/30"
                  : step > s.num
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-700/60"
                  : "bg-[#18181B] text-zinc-500 border border-[#27272A]"
              }`}
            >
              {step > s.num ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                s.num
              )}
            </div>
            <span
              className={`text-xs mt-1.5 font-bold tracking-tight transition-colors ${
                step === s.num
                  ? "text-[#FAFAFA]"
                  : step > s.num
                  ? "text-emerald-400"
                  : "text-zinc-500"
              }`}
            >
              {s.label}
            </span>
          </div>
          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-0.5 mx-2 mt-[-18px] transition-colors ${
                step > s.num ? "bg-emerald-500/50" : "bg-[#27272A]"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
