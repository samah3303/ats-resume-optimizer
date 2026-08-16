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
      {/* Minimalist Crisp Black Emblem */}
      <div className={`${iconSize} rounded-xl bg-black border border-black flex items-center justify-center shadow-sm group-hover:bg-zinc-800 transition-all`}>
        <svg viewBox="0 0 100 100" className="w-5 h-5 fill-white group-hover:scale-110 transition-transform">
          <path d="M50 10 L61 39 L90 50 L61 61 L50 90 L39 61 L10 50 L39 39 Z" />
          <circle cx="50" cy="50" r="8" fill="#000000" />
          <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
        </svg>
      </div>

      {showText && (
        <span className={`${textSize} font-extrabold tracking-tight text-black flex items-center gap-1`}>
          <span>ResuMatch</span>
          <span className="text-zinc-500 font-black">.ai</span>
        </span>
      )}
    </Link>
  );
}
