import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  theme?: "on-blue" | "on-light";
  showText?: boolean;
  tagText?: string;
  subtitle?: string;
  href?: string;
  className?: string;
}

export default function Logo({
  size = "md",
  theme = "on-light",
  showText = true,
  tagText,
  subtitle,
  href = "/",
  className = "",
}: LogoProps) {
  const iconDimensions =
    size === "sm"
      ? "w-7 h-7"
      : size === "lg"
      ? "w-11 h-11"
      : "w-9 h-9";

  const svgDimensions =
    size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  const textSize =
    size === "sm" ? "text-lg" : size === "lg" ? "text-2xl sm:text-3xl" : "text-xl";

  const containerBg =
    theme === "on-blue"
      ? "bg-nordic-secondary text-nordic-primary" // Yellow badge with blue 'p' glyph on blue navbar
      : "bg-nordic-primary text-nordic-secondary"; // Blue badge with yellow 'p' glyph on white/light pages

  const textColor = theme === "on-blue" ? "text-white" : "text-nordic-text";
  const tagColor =
    theme === "on-blue"
      ? "bg-white/20 text-nordic-secondary"
      : "bg-nordic-secondary text-nordic-text";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 group select-none transition-opacity hover:opacity-90 ${className}`}
      aria-label="paniund home"
    >
      {/* Paniund 'p' Monogram */}
      <div
        className={`${iconDimensions} rounded-[4px] ${containerBg} flex items-center justify-center shrink-0 shadow-xs transition-transform duration-150 group-hover:scale-105`}
      >
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={svgDimensions}
        >
          <g transform="translate(144, 116)">
            {/* Vertical stem of 'p' */}
            <rect
              x="24"
              y="24"
              width="44"
              height="240"
              rx="12"
              fill="currentColor"
            />
            {/* Bowl of 'p' */}
            <path
              d="M68 24C122 24 164 66 164 120C164 174 122 216 68 216H48V172H68C98 172 120 148 120 120C120 92 98 68 68 68H48V24H68Z"
              fill="currentColor"
            />
            {/* Distinctive accent dot */}
            <circle cx="196" cy="200" r="16" fill="currentColor" />
          </g>
        </svg>
      </div>

      {/* Paniund Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`${textSize} font-bold tracking-tight lowercase font-sans ${textColor}`}
            >
              paniund
            </span>
            {tagText && (
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[2px] leading-none ${tagColor}`}
              >
                {tagText}
              </span>
            )}
          </div>
          {subtitle && (
            <span className="text-[10px] text-nordic-neutral tracking-normal font-medium mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
