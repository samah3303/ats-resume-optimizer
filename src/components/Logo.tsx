import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function Logo({ size = "md" }: LogoProps) {
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl";

  return (
    <Link
      href="/"
      className="inline-flex items-center group select-none transition-opacity hover:opacity-80"
      aria-label="paniund home"
    >
      <span className={`${textSize} font-bold tracking-tight lowercase text-[#FAFAFA] font-sans`}>
        paniund
      </span>
    </Link>
  );
}
