import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const iconBox = size === "sm" ? "w-7 h-7 rounded-lg" : size === "lg" ? "w-11 h-11 rounded-2xl" : "w-8 h-8 rounded-xl";
  const iconSvg = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-4.5 h-4.5";
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
      {/* KYRO Geometric Monogram Icon */}
      <div
        className={`${iconBox} bg-black border border-black flex items-center justify-center shadow-sm group-hover:bg-zinc-800 transition-all duration-200 shrink-0`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSvg} transition-transform duration-200 group-hover:scale-105`}
        >
          {/* Vertical Monolith Pillar */}
          <rect x="6" y="6" width="4.5" height="20" rx="1" fill="#FFFFFF" />
          
          {/* Upper Kinetic Vector Arm */}
          <path
            d="M24.5 7.5L12.5 17.5H16.5L26 9.5V7.5H24.5Z"
            fill="#FFFFFF"
          />
          <polygon points="12.5,15.5 24,6 26,6 26,8 14.5,17.5" fill="#FFFFFF" />

          {/* Lower Kinetic Vector Arm */}
          <polygon points="13.5,15.5 24,26 26,26 26,24 16,14" fill="#FFFFFF" />

          {/* Kinetic Diamond Spark */}
          <polygon points="21,5 23,3 25,5 23,7" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-center gap-1.5">
          <span className={`${textSize} font-black tracking-tight text-black flex items-center`}>
            KYRO
          </span>
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-300 text-black leading-none shadow-xs">
            AI
          </span>
        </div>
      )}
    </Link>
  );
}
