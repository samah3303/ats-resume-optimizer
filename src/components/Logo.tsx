import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const iconSize = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const textSize = size === "sm" ? "text-base" : size === "lg" ? "text-xl" : "text-lg";

  return (
    <Link href="/" className="inline-flex items-center gap-2.5 group">
      {/* Minimalist Carbon Black & Electric Yellow Emblem */}
      <div className={`${iconSize} rounded-xl bg-slate-950 dark:bg-slate-900 border border-amber-500/40 flex items-center justify-center shadow-sm group-hover:border-amber-400 transition-all`}>
        <svg viewBox="0 0 100 100" className="w-5 h-5 fill-amber-400 group-hover:scale-110 transition-transform">
          <path d="M50 10 L61 39 L90 50 L61 61 L50 90 L39 61 L10 50 L39 39 Z" />
          <circle cx="50" cy="50" r="8" fill="#0D0E11" />
          <circle cx="50" cy="50" r="4" fill="#FDE047" />
        </svg>
      </div>

      {showText && (
        <span className={`${textSize} font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1`}>
          <span>ResuMatch</span>
          <span className="text-amber-500 font-black">.ai</span>
        </span>
      )}
    </Link>
  );
}
