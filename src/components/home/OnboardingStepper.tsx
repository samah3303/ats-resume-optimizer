import { STEPS } from "./constants";

interface OnboardingStepperProps {
  step: number;
}

export default function OnboardingStepper({ step }: OnboardingStepperProps) {
  return (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-colors ${
                step >= s.num
                  ? "bg-black text-white"
                  : "bg-zinc-100 text-zinc-400 border border-zinc-200"
              }`}
            >
              {step > s.num ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
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
              className={`text-xs mt-1.5 font-bold ${
                step >= s.num ? "text-black" : "text-zinc-400"
              }`}
            >
              {s.label}
            </span>
          </div>
          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 sm:w-20 h-0.5 mx-1 mt-[-14px] transition-colors ${
                step > s.num ? "bg-black" : "bg-zinc-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
